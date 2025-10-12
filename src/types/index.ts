/**
 * Profile configuration interface
 */
export interface Profile {
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  files: ProfileFiles;
}

/**
 * Profile files structure
 */
export interface ProfileFiles {
  claudeMd?: string;          // CLAUDE.md content
  agents?: DirectoryFile[];   // agents/ directory files
  workflows?: DirectoryFile[]; // workflows/ directory files
  commands?: DirectoryFile[];  // commands/ directory files
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
  profilesDir: string;      // Where profiles are stored
  claudeDir: string;        // Target ~/.claude directory
  currentFile: string;      // File tracking current profile
  backupDir: string;        // Backup directory
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
