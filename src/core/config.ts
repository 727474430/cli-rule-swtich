import path from 'path';
import os from 'os';
import { ConfigPaths, ToolType } from '../types';

/**
 * Get configuration paths based on tool type
 */
export function getConfigPaths(toolType: ToolType = 'claude'): ConfigPaths {
  const homeDir = os.homedir();
  // Prefer env override, otherwise default to ~/.crs-profiles
  const envDir = process.env.CRS_PROFILES_DIR;
  // Support '~' prefix in env var by expanding to home directory
  const resolvedEnvDir = envDir && envDir.startsWith('~')
    ? path.join(homeDir, envDir.slice(1))
    : envDir;
  const baseProfilesDir = resolvedEnvDir || path.join(homeDir, '.crs-profiles');

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
  SKILLS_DIR: 'skills',
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
