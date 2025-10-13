/**
 * Tool type enumeration
 */
export type ToolType = 'claude' | 'codex';

/**
 * Claude Code configuration files
 */
export interface ClaudeFiles {
  claudeMd?: string;          // CLAUDE.md content
  agents?: DirectoryFile[];   // agents/ directory files
  workflows?: DirectoryFile[]; // workflows/ directory files
  commands?: DirectoryFile[];  // commands/ directory files
}

/**
 * Codex configuration files
 */
export interface CodexFiles {
  agentsMd?: string;          // AGENTS.md content
}

/**
 * Profile files structure (union type based on tool)
 */
export type ProfileFiles = ClaudeFiles | CodexFiles;

/**
 * Profile configuration interface
 */
export interface Profile {
  name: string;
  description: string;
  toolType: ToolType;         // Tool type this profile is for
  createdAt: string;
  lastUsed?: string;
  files: ProfileFiles;
}

/**
 * Directory file structure
 */
export interface DirectoryFile {
  name: string;
  content: string;
}

/**
 * Configuration paths
 */
export interface ConfigPaths {
  profilesDir: string;      // Where profiles are stored (tool-specific)
  targetDir: string;        // Target directory (~/.claude or ~/.codex)
  currentFile: string;      // File tracking current profile (tool-specific)
  backupDir: string;        // Backup directory (tool-specific)
}

/**
 * Operation result
 */
export interface OperationResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Profile metadata for listing
 */
export interface ProfileMetadata {
  name: string;
  description: string;
  toolType: ToolType;       // Tool type
  createdAt: string;
  lastUsed?: string;
  fileCount: number;
  isCurrent: boolean;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  timestamp: string;        // ISO timestamp used as directory name
  date: Date;              // Parsed date object
  profileName?: string;    // Name of the profile when backup was created
}
