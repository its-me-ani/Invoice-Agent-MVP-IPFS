"""
RAG Utility for SocialCalc MSC Syntax
Provides retrieval augmented generation using the SYNTAX-COMPILED.txt and msc-book files
"""

import os
import re
from typing import List, Dict, Optional
from pathlib import Path


class SyntaxRAG:
    """Simple RAG system for MSC syntax retrieval"""

    def __init__(self, syntax_dir: Optional[str] = None):
        """
        Initialize RAG with syntax files

        Args:
            syntax_dir: Directory containing syntax files (defaults to pipeline-code)
        """
        if syntax_dir is None:
            # Default to pipeline-code directory relative to this file
            # sheet-agent/agent/rag_utils.py -> ../../pipeline-code
            base_dir = Path(__file__).parent.parent.parent / "pipeline-code"
            syntax_dir = str(base_dir)

        self.syntax_dir = syntax_dir
        self.compiled_syntax = ""
        self.syntax_chunks = {}
        self.msc_examples = []

        self._load_syntax_files()

    def _load_syntax_files(self):
        """Load all syntax documentation files"""

        # Load main compiled syntax
        compiled_path = os.path.join(self.syntax_dir, "SYNTAX-COMPILED.txt")
        if os.path.exists(compiled_path):
            with open(compiled_path, 'r', encoding='utf-8') as f:
                self.compiled_syntax = f.read()

        # Load msc-book reference files
        msc_book_dir = os.path.join(self.syntax_dir, "msc-book")
        if os.path.exists(msc_book_dir):
            for filename in os.listdir(msc_book_dir):
                if filename.endswith('.txt') or filename.endswith('.md'):
                    filepath = os.path.join(msc_book_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Extract topic from filename
                    topic = filename.replace('.txt', '').replace(
                        '.md', '').replace('-', ' ').lower()
                    self.syntax_chunks[topic] = content

            # Load MSC examples from msc-syntax folder
            msc_syntax_dir = os.path.join(msc_book_dir, "msc-syntax")
            if os.path.exists(msc_syntax_dir):
                for filename in os.listdir(msc_syntax_dir):
                    if filename.endswith('.msc'):
                        filepath = os.path.join(msc_syntax_dir, filename)
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                        self.msc_examples.append({
                            'name': filename,
                            'content': content
                        })

    def get_compiled_syntax(self) -> str:
        """Get the full compiled syntax reference"""
        return self.compiled_syntax

    def get_syntax_summary(self) -> str:
        """Get a summarized version of the syntax for context"""
        # Return first part of compiled syntax (quick reference)
        if self.compiled_syntax:
            # Find the end of the quick reference section
            lines = self.compiled_syntax.split('\n')
            summary_lines = []
            for line in lines:
                summary_lines.append(line)
                if len('\n'.join(summary_lines)) > 8000:  # Limit to ~8k chars
                    break
            return '\n'.join(summary_lines)
        return ""

    def search_syntax(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Search syntax documentation for relevant sections

        Args:
            query: Search query
            max_results: Maximum number of results to return

        Returns:
            List of relevant syntax chunks
        """
        results = []
        query_lower = query.lower()

        # Keywords to look for
        keywords = query_lower.split()

        # Search in syntax chunks
        for topic, content in self.syntax_chunks.items():
            score = 0
            content_lower = content.lower()

            # Score based on keyword matches
            for keyword in keywords:
                if keyword in topic:
                    score += 3  # Topic match is stronger
                if keyword in content_lower:
                    score += content_lower.count(keyword)

            if score > 0:
                results.append({
                    'topic': topic,
                    'content': content[:2000],  # Limit content size
                    'score': score,
                    'type': 'reference'
                })

        # Search in compiled syntax sections
        sections = self._extract_sections(self.compiled_syntax)
        for section_name, section_content in sections.items():
            score = 0
            section_lower = section_content.lower()

            for keyword in keywords:
                if keyword in section_name.lower():
                    score += 3
                if keyword in section_lower:
                    score += section_lower.count(keyword)

            if score > 0:
                results.append({
                    'topic': section_name,
                    'content': section_content[:1500],
                    'score': score,
                    'type': 'syntax'
                })

        # Sort by score and return top results
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:max_results]

    def _extract_sections(self, text: str) -> Dict[str, str]:
        """Extract named sections from syntax text"""
        sections = {}
        current_section = "Introduction"
        current_content = []

        for line in text.split('\n'):
            # Check for section headers (## SECTION NAME)
            if line.startswith('## '):
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = line[3:].strip()
                current_content = []
            else:
                current_content.append(line)

        # Don't forget the last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)

        return sections

    def get_relevant_examples(self, query: str, max_examples: int = 3) -> List[Dict]:
        """
        Get MSC code examples relevant to the query

        Args:
            query: Search query
            max_examples: Maximum number of examples to return

        Returns:
            List of relevant MSC examples
        """
        if not self.msc_examples:
            return []

        results = []
        query_lower = query.lower()

        for example in self.msc_examples:
            score = 0
            content_lower = example['content'].lower()

            # Score based on content features
            if 'border' in query_lower and 'border' in content_lower:
                score += 2
            if 'font' in query_lower and 'font' in content_lower:
                score += 2
            if 'color' in query_lower and ('color' in content_lower or 'rgb' in content_lower):
                score += 2
            if 'merge' in query_lower and ('colspan' in content_lower or 'rowspan' in content_lower):
                score += 2
            if 'formula' in query_lower and ('vtf' in content_lower or 'SUM' in example['content']):
                score += 2
            if 'format' in query_lower and 'valueformat' in content_lower:
                score += 2
            if 'align' in query_lower and ('cellformat' in content_lower or 'layout' in content_lower):
                score += 2

            # General scoring
            if score == 0:
                score = 1  # Include some examples anyway

            results.append({
                'name': example['name'],
                'content': example['content'],
                'score': score
            })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:max_examples]

    def build_context(self, query: str, include_examples: bool = True) -> str:
        """
        Build a context string for the AI model based on the query

        Args:
            query: User query
            include_examples: Whether to include code examples

        Returns:
            Context string for the AI model
        """
        context_parts = []

        # Add syntax summary
        context_parts.append("=== MSC SYNTAX REFERENCE ===")
        context_parts.append(self.get_syntax_summary())

        # Add relevant sections
        relevant = self.search_syntax(query, max_results=3)
        if relevant:
            context_parts.append("\n=== RELEVANT DOCUMENTATION ===")
            for item in relevant:
                context_parts.append(f"\n--- {item['topic']} ---")
                context_parts.append(item['content'])

        # Add examples if requested
        if include_examples:
            examples = self.get_relevant_examples(query, max_examples=2)
            if examples:
                context_parts.append("\n=== EXAMPLE MSC CODE ===")
                for ex in examples:
                    context_parts.append(f"\n--- Example: {ex['name']} ---")
                    context_parts.append(ex['content'])

        return '\n'.join(context_parts)


# Singleton instance
_rag_instance = None


def get_rag_instance() -> SyntaxRAG:
    """Get or create the RAG singleton instance"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = SyntaxRAG()
    return _rag_instance
