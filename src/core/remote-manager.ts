import path from 'path';
import fs from 'fs-extra';
import {
  RemoteTemplate,
  RemoteRegistry,
  RemoteFile,
  ValidationResult,
  ToolType,
} from '../types/index.js';
import { createFetcher } from '../utils/github-fetcher.js';
import { parseGitHubUrl } from '../utils/github-parser.js';
import { validateTemplate, filterSensitiveFiles } from '../utils/template-validator.js';
import { getConfigPaths } from './config.js';

const REGISTRY_VERSION = '1.0.0';
const REGISTRY_FILE = '.remotes.json';

/**
 * Remote template manager
 */
export class RemoteManager {
  private registryPath: string;

  constructor() {
    const configPaths = getConfigPaths('claude'); // Use claude for base path
    this.registryPath = path.join(configPaths.profilesDir, REGISTRY_FILE);
  }

  /**
   * Load remote registry
   */
  private async loadRegistry(): Promise<RemoteRegistry> {
    try {
      if (await fs.pathExists(this.registryPath)) {
        const data = await fs.readJson(this.registryPath);
        return data;
      }
    } catch (error) {
      console.warn('Failed to load remote registry, creating new one');
    }

    return {
      remotes: {},
      version: REGISTRY_VERSION,
    };
  }

  /**
   * Save remote registry
   */
  private async saveRegistry(registry: RemoteRegistry): Promise<void> {
    await fs.ensureDir(path.dirname(this.registryPath));
    await fs.writeJson(this.registryPath, registry, { spaces: 2 });
  }

  /**
   * Add a new remote template source
   */
  async addRemote(
    name: string,
    url: string,
    options?: {
      description?: string;
      toolType?: ToolType;
    }
  ): Promise<{ success: boolean; message: string; validation?: ValidationResult }> {
    try {
      // Parse URL
      const parsed = parseGitHubUrl(url);
      if (!parsed.isValid) {
        return {
          success: false,
          message: `Invalid GitHub URL: ${url}`,
        };
      }

      // Fetch and validate template
      const fetcher = createFetcher();
      const files = await fetcher.fetchFromUrl(url);

      const validation = validateTemplate(files);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Template validation failed',
          validation,
        };
      }

      // Get latest commit
      const commit = await fetcher.getLatestCommit(
        parsed.owner,
        parsed.repo,
        parsed.path || '',
        parsed.ref
      );

      // Load registry
      const registry = await this.loadRegistry();

      // Check if name already exists
      if (registry.remotes[name]) {
        return {
          success: false,
          message: `Remote template '${name}' already exists. Use update command to modify it.`,
        };
      }

      // Add remote
      registry.remotes[name] = {
        name,
        url,
        toolType: options?.toolType || validation.toolType || 'claude',
        branch: parsed.ref,
        path: parsed.path || undefined,
        lastSync: new Date().toISOString(),
        commit: commit || undefined,
        description: options?.description,
      };

      await this.saveRegistry(registry);

      return {
        success: true,
        message: `Remote template '${name}' added successfully`,
        validation,
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to add remote: ${error.message}`,
      };
    }
  }

  /**
   * List all remote templates
   */
  async listRemotes(toolType?: ToolType): Promise<RemoteTemplate[]> {
    const registry = await this.loadRegistry();
    let remotes = Object.values(registry.remotes);

    if (toolType) {
      remotes = remotes.filter(r => r.toolType === toolType);
    }

    return remotes.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a specific remote template
   */
  async getRemote(name: string): Promise<RemoteTemplate | null> {
    const registry = await this.loadRegistry();
    return registry.remotes[name] || null;
  }

  /**
   * Remove a remote template
   */
  async removeRemote(name: string): Promise<{ success: boolean; message: string }> {
    const registry = await this.loadRegistry();

    if (!registry.remotes[name]) {
      return {
        success: false,
        message: `Remote template '${name}' not found`,
      };
    }

    delete registry.remotes[name];
    await this.saveRegistry(registry);

    return {
      success: true,
      message: `Remote template '${name}' removed successfully`,
    };
  }

  /**
   * Preview a remote template (without adding to registry)
   */
  async previewRemote(url: string): Promise<{
    success: boolean;
    message?: string;
    validation?: ValidationResult;
    info?: {
      toolType?: ToolType;
      fileCount: number;
      totalSize: number;
      files: string[];
    };
  }> {
    try {
      const fetcher = createFetcher();
      const files = await fetcher.fetchFromUrl(url);
      const validation = validateTemplate(files);

      const totalSize = files.reduce((sum, f) => sum + f.size, 0);

      return {
        success: true,
        validation,
        info: {
          toolType: validation.toolType,
          fileCount: files.length,
          totalSize,
          files: files.map(f => f.path),
        },
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to preview: ${error.message}`,
      };
    }
  }

  /**
   * Install a remote template as a local profile
   */
  async installRemote(
    remoteName: string,
    profileName: string,
    description?: string
  ): Promise<{ success: boolean; message: string; validation?: ValidationResult }> {
    try {
      // Get remote config
      const remote = await this.getRemote(remoteName);
      if (!remote) {
        return {
          success: false,
          message: `Remote template '${remoteName}' not found`,
        };
      }

      // Fetch files
      const fetcher = createFetcher();
      const files = await fetcher.fetchFromUrl(remote.url);

      // Validate
      const validation = validateTemplate(files);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Template validation failed',
          validation,
        };
      }

      // Filter sensitive files
      const safeFiles = filterSensitiveFiles(files);

      // Save as profile
      await this.saveAsProfile(
        profileName,
        safeFiles,
        remote.toolType,
        description || remote.description || `Installed from ${remoteName}`
      );

      // Update last sync
      const registry = await this.loadRegistry();
      if (registry.remotes[remoteName]) {
        registry.remotes[remoteName].lastSync = new Date().toISOString();
        await this.saveRegistry(registry);
      }

      return {
        success: true,
        message: `Remote template '${remoteName}' installed as profile '${profileName}'`,
        validation,
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to install remote: ${error.message}`,
      };
    }
  }

  /**
   * Install directly from URL and automatically save the remote
   */
  async installFromUrl(
    url: string,
    profileName: string,
    description?: string
  ): Promise<{
    success: boolean;
    message: string;
    validation?: ValidationResult;
    remoteName?: string;
  }> {
    try {
      // Parse URL
      const parsed = parseGitHubUrl(url);
      if (!parsed.isValid) {
        return {
          success: false,
          message: `Invalid GitHub URL: ${url}`,
        };
      }

      // Fetch and validate template
      const fetcher = createFetcher();
      const files = await fetcher.fetchFromUrl(url);

      const validation = validateTemplate(files);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Template validation failed',
          validation,
        };
      }

      // Filter sensitive files
      const safeFiles = filterSensitiveFiles(files);

      // Generate remote name from URL
      const remoteName = this.generateRemoteName(url);

      // Save as profile
      await this.saveAsProfile(
        profileName,
        safeFiles,
        validation.toolType || 'claude',
        description || `Installed from ${url}`
      );

      // Get latest commit
      const commit = await fetcher.getLatestCommit(
        parsed.owner,
        parsed.repo,
        parsed.path || '',
        parsed.ref
      );

      // Save or update remote in registry
      const registry = await this.loadRegistry();
      registry.remotes[remoteName] = {
        name: remoteName,
        url,
        toolType: validation.toolType || 'claude',
        branch: parsed.ref,
        path: parsed.path || undefined,
        lastSync: new Date().toISOString(),
        commit: commit || undefined,
        description: description || `Installed from ${url}`,
      };
      await this.saveRegistry(registry);

      return {
        success: true,
        message: `Installed as profile '${profileName}' and saved as remote '${remoteName}'`,
        validation,
        remoteName,
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to install from URL: ${error.message}`,
      };
    }
  }

  /**
   * Generate a unique remote name from URL
   */
  private generateRemoteName(url: string): string {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const baseName = `${match[1]}-${match[2]}`.toLowerCase();
        // Check if name exists, add number suffix if needed
        return baseName;
      }
    } catch {
      // fallback
    }
    return `remote-${Date.now()}`;
  }

  /**
   * Save remote files as a local profile
   */
  private async saveAsProfile(
    profileName: string,
    files: RemoteFile[],
    toolType: ToolType,
    description: string
  ): Promise<void> {
    const configPaths = getConfigPaths(toolType);
    const profileDir = path.join(configPaths.profilesDir, profileName);

    // Create profile directory
    await fs.ensureDir(profileDir);

    // Normalize file paths - remove common prefix
    const normalizedFiles = this.normalizeFilePaths(files);

    // Save files
    for (const file of normalizedFiles) {
      const filePath = path.join(profileDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    // Create profile metadata
    const metadata = {
      name: profileName,
      description,
      toolType,
      createdAt: new Date().toISOString(),
    };

    await fs.writeJson(
      path.join(profileDir, 'profile.json'),
      metadata,
      { spaces: 2 }
    );
  }

  /**
   * Normalize file paths by removing common prefix
   * e.g., "templates/claude/ace/CLAUDE.md" -> "CLAUDE.md"
   *       "templates/claude/ace/agents/scout.md" -> "agents/scout.md"
   */
  private normalizeFilePaths(files: RemoteFile[]): RemoteFile[] {
    if (files.length === 0) return files;

    // Split all paths into segments
    const paths = files.map(f => f.path.split('/'));

    if (paths.length === 0) return files;

    // Find common prefix length
    let commonPrefixLength = 0;
    const firstPath = paths[0];

    for (let i = 0; i < firstPath.length; i++) {
      const segment = firstPath[i];
      // Check if all paths have this segment at position i
      if (paths.every(p => p.length > i && p[i] === segment)) {
        // This is a common segment
        // But check if this is the last common segment and if it's a known directory
        const knownDirs = ['agents', 'workflows', 'commands'];
        const isLastCommonSegment = !paths.every(p => p.length > i + 1 && p[i + 1] === firstPath[i + 1]);

        if (isLastCommonSegment && knownDirs.includes(segment)) {
          // Don't include known directories in common prefix - keep them
          break;
        }

        commonPrefixLength = i + 1;
      } else {
        break;
      }
    }

    // Remove common prefix from all paths
    return files.map(file => ({
      ...file,
      path: file.path.split('/').slice(commonPrefixLength).join('/') || file.path,
    }));
  }
}

/**
 * Create a remote manager instance
 */
export function createRemoteManager(): RemoteManager {
  return new RemoteManager();
}
