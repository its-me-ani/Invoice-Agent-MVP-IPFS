"""
RAG Utility for SocialCalc MSC Syntax
DEPRECATED: This module has been moved to sheet_agent.agent.rag_utils

This file is kept for backward compatibility.
Import from sheet_agent.agent instead:
    from sheet_agent.agent import get_rag_instance, SyntaxRAG
"""

# Re-export from new location for backward compatibility
from sheet_agent.agent.rag_utils import (
    SyntaxRAG,
    get_rag_instance,
)

__all__ = [
    'SyntaxRAG',
    'get_rag_instance',
]
