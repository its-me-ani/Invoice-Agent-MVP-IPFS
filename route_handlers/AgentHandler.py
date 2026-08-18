"""
AI Agent Handler for SocialCalc MSC Code Generation
DEPRECATED: This module has been moved to sheet_agent.agent.handler

This file is kept for backward compatibility.
Import from sheet_agent.agent instead:
    from sheet_agent.agent import AgentHandler
"""

# Re-export from new location for backward compatibility
from sheet_agent.agent.handler import (
    AgentHandler,
    MSCCodeValidator,
    AIProvider,
    ClaudeAWSProvider,
    GeminiProvider,
    get_provider,
    get_system_prompt,
    wrap_msc_in_workbook_format,
    msc_validator,
    agent_sessions,
    MAX_VALIDATION_RETRIES,
    VALIDATOR_SCRIPT_PATH,
    logger
)

__all__ = [
    'AgentHandler',
    'MSCCodeValidator',
    'AIProvider',
    'ClaudeAWSProvider',
    'GeminiProvider',
    'get_provider',
    'get_system_prompt',
    'wrap_msc_in_workbook_format',
    'msc_validator',
    'agent_sessions',
]
