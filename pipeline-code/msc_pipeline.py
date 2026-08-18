"""
MSC Agent Pipeline - Main Orchestrator
Processes prompts sequentially and stores results in MongoDB
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv
from tqdm import tqdm

from rag_system import MSCDocumentationRAG
from gemini_agent import GeminiMSCAgent
from database_manager import MSCDatabaseManager
from msc_validator import MSCValidator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MSCAgentPipeline:
    """Main pipeline for MSC code generation"""

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the pipeline

        Args:
            config_path: Path to .env config file (optional)
        """
        # Load environment variables
        if config_path:
            load_dotenv(config_path)
        else:
            load_dotenv()

        # Get configuration
        self.config = self._load_config()

        # Initialize components
        logger.info("Initializing MSC Agent Pipeline...")

        # RAG System
        self.rag = MSCDocumentationRAG(
            persist_dir=self.config['chroma_persist_dir'],
            embedding_model=self.config['embedding_model']
        )

        # Gemini Agent
        self.agent = GeminiMSCAgent(
            api_key=self.config['gemini_api_key'],
            api_url=self.config['gemini_api_url'],
            max_retries=self.config['max_retries'],
            timeout=self.config['timeout_seconds']
        )

        # Database Manager
        self.db = MSCDatabaseManager(
            uri=self.config['mongodb_uri'],
            database=self.config['mongodb_database'],
            collection=self.config['mongodb_collection']
        )

        # MSC Validator
        self.validator = MSCValidator(
            validator_script=self.config.get(
                'validator_script', './validator.js')
        )

        # Load syntax
        self.syntax = self._load_syntax()

        logger.info("Pipeline initialized successfully")

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from environment variables"""
        config = {
            # Gemini API
            'gemini_api_key': os.getenv('GEMINI_API_KEY', ''),
            'gemini_api_url': os.getenv(
                'GEMINI_API_URL',
                'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3-pro-preview:streamGenerateContent'
            ),

            # MongoDB
            'mongodb_uri': os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'),
            'mongodb_database': os.getenv('MONGODB_DATABASE', 'msc_agent_db'),
            'mongodb_collection': os.getenv('MONGODB_COLLECTION', 'msc_generations'),

            # RAG
            'chroma_persist_dir': os.getenv('CHROMA_PERSIST_DIR', './chroma_db'),
            'embedding_model': os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2'),

            # Processing
            'batch_size': int(os.getenv('BATCH_SIZE', '1')),
            'max_retries': int(os.getenv('MAX_RETRIES', '3')),
            'timeout_seconds': int(os.getenv('TIMEOUT_SECONDS', '30')),

            # Paths
            'syntax_file': os.getenv('SYNTAX_FILE', './SYNTAX-COMPILED.txt'),
            'msc_book_dir': os.getenv('MSC_BOOK_DIR', './msc-book'),
            'validator_script': os.getenv('VALIDATOR_SCRIPT', './validator.js'),

            # Validation
            'max_validation_retries': int(os.getenv('MAX_VALIDATION_RETRIES', '5')),
        }

        # Validate required config
        if not config['gemini_api_key']:
            raise ValueError("GEMINI_API_KEY not set in environment variables")

        return config

    def _load_syntax(self) -> str:
        """Load MSC syntax file"""
        syntax_path = self.config['syntax_file']

        if not os.path.exists(syntax_path):
            logger.warning(f"Syntax file not found: {syntax_path}")
            return ""

        with open(syntax_path, 'r', encoding='utf-8') as f:
            syntax = f.read()

        logger.info(f"Loaded syntax from {syntax_path}")
        return syntax

    def initialize_rag(self, force_reload: bool = False):
        """
        Initialize RAG system with documentation

        Args:
            force_reload: Force reload of documentation even if already loaded
        """
        # Check if already loaded
        if self.rag.collection.count() > 0 and not force_reload:
            logger.info(
                f"RAG already initialized with {self.rag.collection.count()} documents")
            return

        if force_reload:
            logger.info("Force reloading RAG documentation...")
            self.rag.clear_database()

        # Load documentation
        syntax_file = self.config['syntax_file']
        msc_book_dir = self.config['msc_book_dir']

        if not os.path.exists(syntax_file):
            raise FileNotFoundError(f"Syntax file not found: {syntax_file}")

        if not os.path.exists(msc_book_dir):
            raise FileNotFoundError(
                f"MSC book directory not found: {msc_book_dir}")

        logger.info("Loading documentation into RAG system...")
        self.rag.load_documentation(syntax_file, msc_book_dir)
        logger.info(
            f"RAG initialized with {self.rag.collection.count()} documents")

    def process_single_prompt(
        self,
        prompt: str,
        image_path: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a single prompt and generate MSC code

        Args:
            prompt: User prompt
            image_path: Optional path to reference image
            metadata: Optional metadata to store with result

        Returns:
            Dictionary with result information
        """
        logger.info(f"Processing prompt: {prompt[:100]}...")

        try:
            # Validate image path if provided
            if image_path and not os.path.exists(image_path):
                logger.warning(f"Image path does not exist: {image_path}")
                image_path = None

            # Retrieve context from RAG
            logger.info("Retrieving context from RAG...")
            context = self.rag.retrieve_context(prompt, n_results=5)

            # Validation and retry loop
            max_retries = self.config['max_validation_retries']
            msc_code = None
            normalized_code = None
            validation_result = None

            for attempt in range(max_retries):
                logger.info(f"Generation attempt {attempt + 1}/{max_retries}")

                # Generate MSC code
                logger.info("Generating MSC code with Gemini...")
                msc_code = self.agent.generate_msc(
                    prompt=prompt,
                    syntax=self.syntax,
                    context=context,
                    image_path=image_path
                )

                # Normalize and validate
                logger.info("Normalizing and validating MSC code...")
                is_valid, normalized_code, validation_result = self.validator.validate_and_normalize(
                    msc_code)

                if is_valid:
                    logger.info(
                        f"✓ Validation passed on attempt {attempt + 1}")
                    break
                else:
                    # Get error summary
                    error_summary = self.validator.get_error_summary(
                        validation_result)
                    logger.warning(
                        f"✗ Validation failed on attempt {attempt + 1}:\n{error_summary}")

                    if attempt < max_retries - 1:
                        # Prepare feedback for retry
                        logger.info("Retrying with error feedback...")

                        # Add validation errors to context for next attempt
                        error_feedback = f"\n\nPREVIOUS ATTEMPT HAD ERRORS:\n{error_summary}\n\nPlease fix these errors and generate valid MSC code."
                        context = context + error_feedback
                    else:
                        logger.error(
                            f"Max retries ({max_retries}) reached. Skipping prompt.")

                        # Store failed generation
                        doc_id = self.db.insert_failed_generation(
                            prompt=prompt,
                            error_message=f"Validation failed after {max_retries} attempts: {error_summary}",
                            image_path=image_path,
                            metadata={
                                **(metadata or {}),
                                'validation_attempts': max_retries,
                                'last_validation_result': validation_result,
                                'last_generated_code': msc_code
                            }
                        )

                        result = {
                            'status': 'failed',
                            'doc_id': doc_id,
                            'prompt': prompt,
                            'error': f'Validation failed after {max_retries} attempts',
                            'validation_result': validation_result,
                            'image_path': image_path
                        }

                        return result

            # If we get here, validation passed
            # Store in database with normalized code
            logger.info("Storing validated result in database...")
            doc_id = self.db.insert_generation(
                prompt=prompt,
                msc_code=normalized_code,  # Store normalized version
                image_path=image_path,
                # Store first 1000 chars of context
                context_used=context[:1000],
                metadata={
                    **(metadata or {}),
                    'validation_attempts': attempt + 1,
                    'validation_result': validation_result,
                    'original_code': msc_code if msc_code != normalized_code else None
                }
            )

            result = {
                'status': 'success',
                'doc_id': doc_id,
                'prompt': prompt,
                'msc_code': normalized_code,
                'validation_attempts': attempt + 1,
                'validation_result': validation_result,
                'image_path': image_path
            }

            logger.info(f"Successfully processed prompt (doc_id: {doc_id})")
            return result

        except Exception as e:
            logger.error(f"Failed to process prompt: {e}")

            # Store failed generation
            doc_id = self.db.insert_failed_generation(
                prompt=prompt,
                error_message=str(e),
                image_path=image_path,
                metadata=metadata
            )

            result = {
                'status': 'failed',
                'doc_id': doc_id,
                'prompt': prompt,
                'error': str(e),
                'image_path': image_path
            }

            return result

    def process_prompts_file(self, prompts_file: str, output_report: Optional[str] = None) -> Dict[str, Any]:
        """
        Process prompts from a JSON file

        Args:
            prompts_file: Path to JSON file with prompts
            output_report: Optional path to save processing report

        Returns:
            Dictionary with processing summary
        """
        logger.info(f"Loading prompts from {prompts_file}")

        # Load prompts
        with open(prompts_file, 'r', encoding='utf-8') as f:
            prompts_data = json.load(f)

        # Ensure prompts_data is a list
        if isinstance(prompts_data, dict):
            if 'prompts' in prompts_data:
                prompts_list = prompts_data['prompts']
            else:
                prompts_list = [prompts_data]
        else:
            prompts_list = prompts_data

        total_prompts = len(prompts_list)
        logger.info(f"Found {total_prompts} prompts to process")

        # Process each prompt sequentially
        results = []
        successful = 0
        failed = 0

        for idx, prompt_data in enumerate(tqdm(prompts_list, desc="Processing prompts")):
            # Extract prompt and image path
            if isinstance(prompt_data, str):
                prompt = prompt_data
                image_path = None
                metadata = {'index': idx}
            elif isinstance(prompt_data, dict):
                prompt = prompt_data.get('prompt', '')
                image_path = prompt_data.get(
                    'image_path', prompt_data.get('image', None))
                metadata = {
                    'index': idx,
                    **{k: v for k, v in prompt_data.items() if k not in ['prompt', 'image_path', 'image']}
                }
            else:
                logger.warning(
                    f"Invalid prompt format at index {idx}, skipping")
                continue

            # Process prompt
            result = self.process_single_prompt(prompt, image_path, metadata)
            results.append(result)

            if result['status'] == 'success':
                successful += 1
            else:
                failed += 1

            # Log progress
            logger.info(
                f"Progress: {idx + 1}/{total_prompts} - Success: {successful}, Failed: {failed}")

        # Create summary
        summary = {
            'total_prompts': total_prompts,
            'successful': successful,
            'failed': failed,
            'success_rate': (successful / total_prompts * 100) if total_prompts > 0 else 0,
            'results': results
        }

        # Save report if requested
        if output_report:
            with open(output_report, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2)
            logger.info(f"Processing report saved to {output_report}")

        logger.info(
            f"Processing complete: {successful}/{total_prompts} successful")
        return summary

    def get_statistics(self) -> Dict[str, Any]:
        """Get pipeline statistics"""
        db_stats = self.db.get_statistics()
        rag_stats = {
            'total_documents': self.rag.collection.count()
        }

        return {
            'database': db_stats,
            'rag': rag_stats
        }

    def close(self):
        """Close all connections"""
        self.db.close()
        logger.info("Pipeline closed")


def main():
    """Main entry point for the pipeline"""
    import argparse

    parser = argparse.ArgumentParser(description="MSC Agent Pipeline")
    parser.add_argument(
        '--prompts',
        type=str,
        required=True,
        help='Path to JSON file with prompts'
    )
    parser.add_argument(
        '--output-report',
        type=str,
        default='processing_report.json',
        help='Path to save processing report'
    )
    parser.add_argument(
        '--init-rag',
        action='store_true',
        help='Initialize RAG system before processing'
    )
    parser.add_argument(
        '--force-reload-rag',
        action='store_true',
        help='Force reload RAG documentation'
    )
    parser.add_argument(
        '--config',
        type=str,
        help='Path to .env config file'
    )

    args = parser.parse_args()

    try:
        # Initialize pipeline
        pipeline = MSCAgentPipeline(config_path=args.config)

        # Initialize RAG if requested
        if args.init_rag or args.force_reload_rag:
            pipeline.initialize_rag(force_reload=args.force_reload_rag)

        # Process prompts
        summary = pipeline.process_prompts_file(
            prompts_file=args.prompts,
            output_report=args.output_report
        )

        # Print summary
        print("\n" + "="*50)
        print("PROCESSING SUMMARY")
        print("="*50)
        print(f"Total Prompts: {summary['total_prompts']}")
        print(f"Successful: {summary['successful']}")
        print(f"Failed: {summary['failed']}")
        print(f"Success Rate: {summary['success_rate']:.2f}%")
        print("="*50)

        # Get statistics
        stats = pipeline.get_statistics()
        print(f"\nDatabase Statistics:")
        print(f"  Total Generations: {stats['database']['total_generations']}")
        print(f"  Successful: {stats['database']['successful']}")
        print(f"  Failed: {stats['database']['failed']}")
        print(f"  Success Rate: {stats['database']['success_rate']:.2f}%")

        # Close pipeline
        pipeline.close()

    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise


if __name__ == "__main__":
    main()
