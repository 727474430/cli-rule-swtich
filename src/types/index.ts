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
  skills?: DirectoryFile[];    // skills/ directory files
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
  toolType?: ToolType;     // Tool type of the backup
}

/**
 * Template metadata interface
 */
export interface TemplateMetadata {
  name: string;
  displayName: string;
  description: string;
  toolType: ToolType;
  category: string;
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
}

/**
 * Template structure
 */
export interface Template {
  metadata: TemplateMetadata;
  path: string;           // Full path to template directory
}

/**
 * Template for listing
 */
export interface TemplateListItem {
  name: string;
  displayName: string;
  description: string;
  toolType: ToolType;
  category: string;
  tags: string[];
}

/**
 * Remote template source
 */
export interface RemoteTemplate {
  name: string;              // Unique identifier for this remote
  url: string;              // GitHub URL
  toolType: ToolType;       // Tool type (claude/codex)
  branch: string;           // Git branch/tag
  path?: string;            // Subdirectory path in repo
  lastSync?: string;        // Last sync timestamp
  commit?: string;          // Last synced commit hash
  description?: string;     // Optional description
}

/**
 * Parsed GitHub URL information
 */
export interface GitHubUrlInfo {
  owner: string;            // Repository owner
  repo: string;             // Repository name
  ref: string;              // Branch/tag/commit
  path: string;             // Path within repository
  isValid: boolean;         // Whether URL is valid
}

/**
 * Remote file structure from GitHub
 */
export interface RemoteFile {
  path: string;             // File path relative to base
  content: string;          // File content
  size: number;             // File size in bytes
}

/**
 * Template validation result
 */
export interface ValidationResult {
  isValid: boolean;
  toolType?: ToolType;
  errors: string[];
  warnings: string[];
  files: RemoteFile[];
}

/**
 * Remote template registry
 */
export interface RemoteRegistry {
  remotes: Record<string, RemoteTemplate>;
  version: string;
}
