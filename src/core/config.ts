import path from 'path';
import os from 'os';
import { ConfigPaths } from '../types';

/**
 * Get configuration paths
 */
export function getConfigPaths(): ConfigPaths {
  const homeDir = os.homedir();
  const projectRoot = process.cwd();

  return {
    profilesDir: path.join(projectRoot, '.crs-profiles'),
    claudeDir: path.join(homeDir, '.claude'),
    currentFile: path.join(projectRoot, '.crs-profiles', '.current'),
    backupDir: path.join(projectRoot, '.crs-profiles', '.backup'),
  };
}

/**
 * Claude configuration files and directories
 */
export const CLAUDE_FILES = {
  CLAUDE_MD: 'CLAUDE.md',
  AGENTS_DIR: 'agents',
  WORKFLOWS_DIR: 'workflows',
  COMMANDS_DIR: 'commands',
} as const;

/**
 * Profile configuration
 */
export const PROFILE_CONFIG = {
  METADATA_FILE: 'profile.json',
  MAX_BACKUPS: 5,
} as const;
