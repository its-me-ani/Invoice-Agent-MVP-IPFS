"""
MSC Code Validator and Normalizer
Normalizes and validates MSC code using the JavaScript validator
"""

import subprocess
import json
import re
import logging
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class MSCValidator:
    """Validates and normalizes MSC code"""

    def __init__(self, validator_script: str = './validator.js'):
        """
        Initialize validator

        Args:
            validator_script: Path to validator.js
        """
        self.validator_script = validator_script

    def normalize_msc_code(self, msc_code: str) -> str:
        """
        Normalize MSC code to proper SocialCalc save format
        Removes comments, extra spaces, and formats correctly

        Args:
            msc_code: Raw MSC code (potentially with comments/spaces)

        Returns:
            Normalized MSC code
        """
        lines = msc_code.split('\n')
        normalized_lines = []

        for line in lines:
            # Strip whitespace
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Remove inline comments (but preserve # in hex colors)
            # Look for comments that are clearly not part of color definitions
            if '#' in line:
                # Check if it's a color definition (e.g., #RRGGBB or rgb(...))
                if not re.search(r'#[0-9A-Fa-f]{6}', line) and not line.startswith('color:'):
                    # Check for comment marker not in color context
                    comment_match = re.search(r'\s+#[^0-9A-Fa-f]', line)
                    if comment_match:
                        line = line[:comment_match.start()].strip()

            # Skip comment-only lines
            if line.startswith('#'):
                continue

            # Normalize spacing around colons (remove spaces)
            # But be careful with formulas and values
            if line.startswith('cell:'):
                # For cell lines, normalize carefully
                parts = line.split(':', 1)
                if len(parts) == 2:
                    # Keep the cell line structure intact
                    line = f"{parts[0]}:{parts[1]}"
            elif line.startswith(('font:', 'color:', 'border:', 'layout:',
                                 'cellformat:', 'valueformat:', 'name:')):
                # For style definitions, normalize
                parts = line.split(':', 2)
                if len(parts) >= 2:
                    line = ':'.join([p.strip() for p in parts])
            elif line.startswith(('col:', 'row:', 'sheet:')):
                # For structural lines
                parts = line.split(':')
                line = ':'.join([p.strip() for p in parts])

            normalized_lines.append(line)

        return '\n'.join(normalized_lines)

    def validate_with_js(self, msc_code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate MSC code using the JavaScript validator

        Args:
            msc_code: MSC code to validate

        Returns:
            Tuple of (is_valid, validation_result)
        """
        try:
            # Create a temporary validation script
            validation_code = f"""
const SocialCalcValidator = require('{self.validator_script}');

const mscCode = {json.dumps(msc_code)};

const validator = new SocialCalcValidator({{
    enableSyntaxLevel: true,
    enableSemanticLevel: true,
    enableLogicLevel: true,
    verbose: false,
    strictMode: false
}});

const result = validator.validate(mscCode);
console.log(JSON.stringify(result));
"""

            # Run validation via Node.js
            result = subprocess.run(
                ['node', '-e', validation_code],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                logger.error(f"Validator script error: {result.stderr}")
                return False, {
                    'valid': False,
                    'errors': [{'message': f'Validator script error: {result.stderr}'}],
                    'errorCount': 1
                }

            # Parse result
            validation_result = json.loads(result.stdout)
            return validation_result['valid'], validation_result

        except subprocess.TimeoutExpired:
            logger.error("Validation timeout")
            return False, {
                'valid': False,
                'errors': [{'message': 'Validation timeout'}],
                'errorCount': 1
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse validator output: {e}")
            return False, {
                'valid': False,
                'errors': [{'message': f'Failed to parse validator output: {e}'}],
                'errorCount': 1
            }
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return False, {
                'valid': False,
                'errors': [{'message': f'Validation error: {e}'}],
                'errorCount': 1
            }

    def validate_and_normalize(self, msc_code: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Normalize and validate MSC code

        Args:
            msc_code: Raw MSC code

        Returns:
            Tuple of (is_valid, normalized_code, validation_result)
        """
        # Step 1: Normalize
        logger.debug("Normalizing MSC code...")
        normalized_code = self.normalize_msc_code(msc_code)

        # Step 2: Validate
        logger.debug("Validating normalized MSC code...")
        is_valid, validation_result = self.validate_with_js(normalized_code)

        return is_valid, normalized_code, validation_result

    def get_error_summary(self, validation_result: Dict[str, Any]) -> str:
        """
        Get a human-readable error summary

        Args:
            validation_result: Validation result from validator

        Returns:
            Error summary string
        """
        if validation_result.get('valid', False):
            return "No errors"

        errors = validation_result.get('errors', [])
        error_count = len(errors)

        if error_count == 0:
            return "Unknown validation error"

        # Get first few errors
        summary_lines = [f"Found {error_count} error(s):"]
        for i, error in enumerate(errors[:5]):  # Show first 5 errors
            line = error.get('line', '?')
            level = error.get('level', 'UNKNOWN')
            message = error.get('message', 'Unknown error')
            summary_lines.append(f"  [{level}] Line {line}: {message}")

        if error_count > 5:
            summary_lines.append(f"  ... and {error_count - 5} more errors")

        return '\n'.join(summary_lines)
