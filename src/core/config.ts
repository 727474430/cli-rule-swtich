import path from 'path';
import os from 'os';
import { ConfigPaths, ToolType } from '../types';

/**
 * Get configuration paths based on tool type
 */
export function getConfigPaths(toolType: ToolType = 'claude'): ConfigPaths {
  const homeDir = os.homedir();
  const projectRoot = process.cwd();
  const baseProfilesDir = path.join(projectRoot, '.crs-profiles');

  return {
    // Tool-specific profile storage
    profilesDir: path.join(baseProfilesDir, toolType),
    
    // Target directory based on tool type
    targetDir: toolType === 'claude' 
      ? path.join(homeDir, '.claude')
      : path.join(homeDir, '.codex'),
    
    // Tool-specific current file tracking
    currentFile: path.join(baseProfilesDir, `.current-${toolType}`),
    
    // Tool-specific backup directory
    backupDir: path.join(baseProfilesDir, '.backup', toolType),
  };
}

/**
 * Claude Code configuration files and directories
 */
export const CLAUDE_FILES = {
  CLAUDE_MD: 'CLAUDE.md',
  AGENTS_DIR: 'agents',
  WORKFLOWS_DIR: 'workflows',
  COMMANDS_DIR: 'commands',
} as const;

/**
 * Codex configuration files
 */
export const CODEX_FILES = {
  AGENTS_MD: 'AGENTS.md',
} as const;

/**
 * Profile configuration
 */
export const PROFILE_CONFIG = {
  METADATA_FILE: 'profile.json',
  MAX_BACKUPS: 5,
} as const;
