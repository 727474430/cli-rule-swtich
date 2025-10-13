import fs from 'fs-extra';
import path from 'path';
import { Profile, ProfileMetadata, OperationResult, ToolType, ClaudeFiles, CodexFiles, ProfileFiles } from '../types';
import { getConfigPaths, PROFILE_CONFIG } from './config';
import {
  readClaudeFiles,
  writeClaudeFiles,
  clearClaudeFiles,
  readCodexFiles,
  writeCodexFiles,
  clearCodexFiles,
  countProfileFiles,
} from './file-system';

export class ProfileManager {
  private toolType: ToolType;
  private paths;

  constructor(toolType: ToolType = 'claude') {
    this.toolType = toolType;
    this.paths = getConfigPaths(toolType);
  }

  /**
   * Read target files based on tool type
   */
  private async readTargetFiles(): Promise<ProfileFiles> {
    if (this.toolType === 'claude') {
      return readClaudeFiles(this.paths.targetDir);
    } else {
      return readCodexFiles(this.paths.targetDir);
    }
  }

  /**
   * Write target files based on tool type
   */
  private async writeTargetFiles(files: ProfileFiles): Promise<void> {
    if (this.toolType === 'claude') {
      await writeClaudeFiles(this.paths.targetDir, files as ClaudeFiles);
    } else {
      await writeCodexFiles(this.paths.targetDir, files as CodexFiles);
    }
  }

  /**
   * Clear target files based on tool type
   */
  private async clearTargetFiles(): Promise<void> {
    if (this.toolType === 'claude') {
      await clearClaudeFiles(this.paths.targetDir);
    } else {
      await clearCodexFiles(this.paths.targetDir);
    }
  }

  /**
   * Initialize profile manager
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(this.paths.profilesDir);
    await fs.ensureDir(this.paths.backupDir);

    // Check if this is the first time using CRS (no profiles exist)
    await this.createDefaultProfileIfNeeded();
  }

  /**
   * Create default profile from current ~/.claude configuration if no profiles exist
   */
  private async createDefaultProfileIfNeeded(): Promise<void> {
    // Check if any profiles already exist
    const existingProfiles = await this.listProfiles();
    if (existingProfiles.length > 0) {
      return; // Profiles already exist, no need to create default
    }

    // Check if target directory exists and has content
    const targetDirExists = await fs.pathExists(this.paths.targetDir);
    if (!targetDirExists) {
      return; // No target directory, nothing to backup
    }

    // Read current configuration
    const files = await this.readTargetFiles();

    // Check if there's any content to save
    const hasContent = this.toolType === 'claude'
      ? !!(files as ClaudeFiles).claudeMd ||
        ((files as ClaudeFiles).agents && (files as ClaudeFiles).agents!.length > 0) ||
        ((files as ClaudeFiles).workflows && (files as ClaudeFiles).workflows!.length > 0) ||
        ((files as ClaudeFiles).commands && (files as ClaudeFiles).commands!.length > 0)
      : !!(files as CodexFiles).agentsMd;

    if (!hasContent) {
      return; // No content to save
    }

    // Create default profile
    const defaultProfile: Profile = {
      name: 'default',
      description: `Default configuration from ${this.toolType === 'claude' ? '~/.claude' : '~/.codex'}`,
      toolType: this.toolType,
      createdAt: new Date().toISOString(),
      files,
    };

    await this.saveProfile(defaultProfile);

    // Set as current profile
    await this.setCurrentProfile('default');
  }

  /**
   * List all profiles
   */
  async listProfiles(): Promise<ProfileMetadata[]> {
    const profilesDir = this.paths.profilesDir;
    const currentProfile = await this.getCurrentProfile();

    if (!(await fs.pathExists(profilesDir))) {
      return [];
    }

    const entries = await fs.readdir(profilesDir, { withFileTypes: true });
    const profiles: ProfileMetadata[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const profile = await this.loadProfile(entry.name);
        if (profile) {
          profiles.push({
            name: profile.name,
            description: profile.description,
            toolType: profile.toolType,
            createdAt: profile.createdAt,
            lastUsed: profile.lastUsed,
            fileCount: countProfileFiles(profile.files),
            isCurrent: profile.name === currentProfile,
          });
        }
      }
    }

    return profiles.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Load a profile
   */
  async loadProfile(name: string): Promise<Profile | null> {
    const profileDir = path.join(this.paths.profilesDir, name);
    const metadataPath = path.join(profileDir, PROFILE_CONFIG.METADATA_FILE);

    if (!(await fs.pathExists(metadataPath))) {
      return null;
    }

    const metadata = await fs.readJson(metadataPath);
    
    // Read files based on tool type
    const files = metadata.toolType === 'claude'
      ? await readClaudeFiles(profileDir)
      : await readCodexFiles(profileDir);

    return {
      ...metadata,
      files,
    };
  }

  /**
   * Save a profile
   */
  async saveProfile(profile: Profile): Promise<OperationResult> {
    try {
      const profileDir = path.join(this.paths.profilesDir, profile.name);
      await fs.ensureDir(profileDir);

      // Save metadata
      const metadata = {
        name: profile.name,
        description: profile.description,
        toolType: profile.toolType,
        createdAt: profile.createdAt,
        lastUsed: profile.lastUsed,
      };
      await fs.writeJson(
        path.join(profileDir, PROFILE_CONFIG.METADATA_FILE),
        metadata,
        { spaces: 2 }
      );

      // Save files based on tool type
      if (profile.toolType === 'claude') {
        await writeClaudeFiles(profileDir, profile.files as ClaudeFiles);
      } else {
        await writeCodexFiles(profileDir, profile.files as CodexFiles);
      }

      return { success: true, message: `Profile "${profile.name}" saved` };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save profile "${profile.name}"`,
        error: error as Error,
      };
    }
  }

  /**
   * Create a new profile from current configuration
   */
  async createFromCurrent(
    name: string,
    description: string
  ): Promise<OperationResult> {
    try {
      // Check if profile already exists
      if (await this.profileExists(name)) {
        return {
          success: false,
          message: `Profile "${name}" already exists`,
        };
      }

      // Read current configuration from target directory
      const files = await this.readTargetFiles();

      const profile: Profile = {
        name,
        description,
        toolType: this.toolType,
        createdAt: new Date().toISOString(),
        files,
      };

      return await this.saveProfile(profile);
    } catch (error) {
      return {
        success: false,
        message: `Failed to create profile "${name}"`,
        error: error as Error,
      };
    }
  }

  /**
   * Create an empty profile with default structure
   */
  async createEmpty(
    name: string,
    description: string
  ): Promise<OperationResult> {
    try {
      if (await this.profileExists(name)) {
        return {
          success: false,
          message: `Profile "${name}" already exists`,
        };
      }

      // Create profile with default content based on tool type
      const profile: Profile = {
        name,
        description,
        toolType: this.toolType,
        createdAt: new Date().toISOString(),
        files: this.toolType === 'claude' 
          ? {
              claudeMd: `# ${name} Configuration

## Profile Description
${description}

## Settings
Add your configuration here.
`,
              agents: [],
              workflows: [],
              commands: [],
            }
          : {
              agentsMd: `# ${name} Agents Configuration

## Profile Description
${description}

## Agents
Add your agents configuration here.
`,
            },
      };

      // Save profile first
      const result = await this.saveProfile(profile);

      // Create empty directories in the profile (Claude only)
      if (result.success && this.toolType === 'claude') {
        const profileDir = path.join(this.paths.profilesDir, name);
        await fs.ensureDir(path.join(profileDir, 'agents'));
        await fs.ensureDir(path.join(profileDir, 'workflows'));
        await fs.ensureDir(path.join(profileDir, 'commands'));
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: `Failed to create profile "${name}"`,
        error: error as Error,
      };
    }
  }

  /**
   * Switch to a profile
   */
  async switchToProfile(name: string): Promise<OperationResult> {
    try {
      // Check if profile exists
      const profile = await this.loadProfile(name);
      if (!profile) {
        return {
          success: false,
          message: `Profile "${name}" not found`,
        };
      }

      // Backup current configuration
      await this.backupCurrentConfig();

      // Clear current configuration
      await this.clearTargetFiles();

      // Write new configuration
      await this.writeTargetFiles(profile.files);

      // Update current profile
      await this.setCurrentProfile(name);

      // Update last used
      profile.lastUsed = new Date().toISOString();
      await this.saveProfile(profile);

      return {
        success: true,
        message: `Switched to profile "${name}"`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to switch to profile "${name}"`,
        error: error as Error,
      };
    }
  }

  /**
   * Delete a profile
   */
  async deleteProfile(name: string): Promise<OperationResult> {
    try {
      const profileDir = path.join(this.paths.profilesDir, name);

      if (!(await fs.pathExists(profileDir))) {
        return {
          success: false,
          message: `Profile "${name}" not found`,
        };
      }

      // Check if it's the current profile
      const currentProfile = await this.getCurrentProfile();
      if (currentProfile === name) {
        return {
          success: false,
          message: `Cannot delete the current profile "${name}"`,
        };
      }

      await fs.remove(profileDir);

      return {
        success: true,
        message: `Profile "${name}" deleted`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete profile "${name}"`,
        error: error as Error,
      };
    }
  }

  /**
   * Check if profile exists
   */
  async profileExists(name: string): Promise<boolean> {
    const profileDir = path.join(this.paths.profilesDir, name);
    return fs.pathExists(profileDir);
  }

  /**
   * Get current profile name
   */
  async getCurrentProfile(): Promise<string | null> {
    try {
      if (await fs.pathExists(this.paths.currentFile)) {
        return (await fs.readFile(this.paths.currentFile, 'utf-8')).trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Set current profile
   */
  private async setCurrentProfile(name: string): Promise<void> {
    await fs.writeFile(this.paths.currentFile, name);
  }

  /**
   * Backup current configuration
   */
  private async backupCurrentConfig(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.paths.backupDir, timestamp);

    if (await fs.pathExists(this.paths.targetDir)) {
      const files = await this.readTargetFiles();
      
      // Write files to backup directory
      if (this.toolType === 'claude') {
        await writeClaudeFiles(backupDir, files as ClaudeFiles);
      } else {
        await writeCodexFiles(backupDir, files as CodexFiles);
      }

      // Save backup metadata with current profile name
      const currentProfile = await this.getCurrentProfile();
      const metadata = {
        timestamp,
        profileName: currentProfile || 'unknown',
        toolType: this.toolType,
        createdAt: new Date().toISOString(),
      };
      await fs.writeJson(
        path.join(backupDir, 'backup.json'),
        metadata,
        { spaces: 2 }
      );
    }

    // Keep only recent backups
    await this.cleanupOldBackups();
  }

  /**
   * Cleanup old backups
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await fs.readdir(this.paths.backupDir);
    if (backups.length > PROFILE_CONFIG.MAX_BACKUPS) {
      const sorted = backups.sort();
      const toRemove = sorted.slice(
        0,
        backups.length - PROFILE_CONFIG.MAX_BACKUPS
      );

      for (const backup of toRemove) {
        await fs.remove(path.join(this.paths.backupDir, backup));
      }
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<Array<{ timestamp: string; date: Date; profileName?: string; toolType?: ToolType }>> {
    try {
      if (!(await fs.pathExists(this.paths.backupDir))) {
        return [];
      }

      const backupDirs = await fs.readdir(this.paths.backupDir);
      const backups = await Promise.all(
        backupDirs
          .filter((name) => !name.startsWith('.'))
          .map(async (timestamp) => {
            // Try to read backup metadata
            const metadataPath = path.join(this.paths.backupDir, timestamp, 'backup.json');
            let profileName: string | undefined;
            let toolType: ToolType | undefined;

            try {
              if (await fs.pathExists(metadataPath)) {
                const metadata = await fs.readJson(metadataPath);
                profileName = metadata.profileName;
                toolType = metadata.toolType;
              }
            } catch {
              // Ignore metadata read errors
            }

            // Parse timestamp back to date
            // Timestamp format is like: 2024-01-15T12-30-45-123Z
            // Need to restore : and . for proper ISO format
            const isoString = timestamp
              .replace(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, '$1-$2-$3T$4:$5:$6.$7Z');
            
            return {
              timestamp,
              date: new Date(isoString),
              profileName,
              toolType,
            };
          })
      );

      return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Restore a backup by timestamp
   */
  async restoreBackup(timestamp: string): Promise<OperationResult> {
    try {
      const backupDir = path.join(this.paths.backupDir, timestamp);

      // Check if backup exists
      if (!(await fs.pathExists(backupDir))) {
        return {
          success: false,
          message: `Backup "${timestamp}" not found`,
        };
      }

      // Backup current configuration before restoring
      await this.backupCurrentConfig();

      // Read backup files (need to determine tool type from metadata)
      const metadataPath = path.join(backupDir, 'backup.json');
      let toolType: ToolType = this.toolType;
      
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        toolType = metadata.toolType || this.toolType;
      }
      
      const files = toolType === 'claude'
        ? await readClaudeFiles(backupDir)
        : await readCodexFiles(backupDir);

      // Clear current configuration
      await this.clearTargetFiles();

      // Write backup files to target directory
      await this.writeTargetFiles(files);

      return {
        success: true,
        message: `Restored backup from ${timestamp}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to restore backup "${timestamp}"`,
        error: error as Error,
      };
    }
  }
}
