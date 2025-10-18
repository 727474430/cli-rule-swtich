import path from 'path';
import fs from 'fs-extra';
import {
  RemoteTemplate,
  RemoteRegistry,
  RemoteFile,
  ValidationResult,
  ToolType,
} from '../types';
import { createFetcher } from '../utils/github-fetcher';
import { parseGitHubUrl } from '../utils/github-parser';
import { validateTemplate, filterSensitiveFiles, filterFilesByToolType } from '../utils/template-validator';
import { getConfigPaths } from './config';

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
  async previewRemote(url: string, toolType?: ToolType): Promise<{
    success: boolean;
    message?: string;
    validation?: ValidationResult;
    info?: {
      toolType?: ToolType;
      // For backward compatibility: 'files', 'fileCount', 'totalSize' reflect FINAL install set
      fileCount: number;
      totalSize: number;
      files: string[];
      // Raw source stats (new)
      sourceFileCount?: number;
      sourceTotalSize?: number;
      sourceFiles?: string[];
      // Install plan details (new)
      installToolType?: ToolType;
      installFileCount?: number;
      installTotalSize?: number;
      installFiles?: string[];
      skippedCount?: number;
    };
  }> {
    try {
      const fetcher = createFetcher();
      const files = await fetcher.fetchFromUrl(url);
      const validation = validateTemplate(files);

      const sourceTotalSize = files.reduce((sum, f) => sum + f.size, 0);

      // Compute prospective install set using same filtering + restructuring
      const finalTool: ToolType | undefined = (toolType as ToolType) || validation.toolType;
      let installFiles: RemoteFile[] = [];
      if (finalTool) {
        const filtered = filterFilesByToolType(files, finalTool);
        const safe = filterSensitiveFiles(filtered);
        installFiles = this.restructurePaths(safe, finalTool);
      }

      const installTotal = installFiles.reduce((sum, f) => sum + f.size, 0);

      return {
        success: true,
        validation,
        info: {
          toolType: validation.toolType,
          // final set for backward-compatible consumers
          fileCount: installFiles.length,
          totalSize: installTotal,
          files: installFiles.map(f => f.path),
          // raw stats provided separately
          sourceFileCount: files.length,
          sourceTotalSize,
          sourceFiles: files.map(f => f.path),
          // explicit install plan
          installToolType: finalTool,
          installFileCount: installFiles.length,
          installTotalSize: installTotal,
          installFiles: installFiles.map(f => f.path),
          skippedCount: files.length - installFiles.length,
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

      // Filter by tool type and remove sensitive files
      const filtered = filterFilesByToolType(files, remote.toolType);
      const safeFiles = filterSensitiveFiles(filtered);

      if (filtered.length === 0) {
        return {
          success: false,
          message: `No files matching tool type '${remote.toolType}' were found in the remote source`,
          validation,
        };
      }

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
    description?: string,
    toolType?: ToolType
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

      // Filter by final tool type and remove sensitive files
      const finalToolType = toolType || validation.toolType || 'claude';
      const filtered = filterFilesByToolType(files, finalToolType);
      const safeFiles = filterSensitiveFiles(filtered);

      // Generate remote name from URL
      const remoteName = this.generateRemoteName(url);

      if (filtered.length === 0) {
        return {
          success: false,
          message: `No files matching tool type '${finalToolType}' were found in the remote source`,
          validation,
        };
      }

      // Save as profile
      await this.saveAsProfile(
        profileName,
        safeFiles,
        finalToolType,
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
        toolType: finalToolType,
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

    // Step 1: Restructure paths so required files live at profile root
    const restructured = this.restructurePaths(files, toolType);

    // Step 2: Normalize file paths - remove common prefix if any remains
    const normalizedFiles = this.normalizeFilePaths(restructured);

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
      if (paths.every(p => p.length > i && p[i] === segment)) {
        const knownDirs = ['agents', 'workflows', 'commands', 'skills'];
        const isLastCommonSegment = !paths.every(p => p.length > i + 1 && p[i + 1] === firstPath[i + 1]);
        if (isLastCommonSegment && knownDirs.includes(segment)) {
          break;
        }
        commonPrefixLength = i + 1;
      } else {
        break;
      }
    }

    return files.map(file => ({
      ...file,
      path: file.path.split('/').slice(commonPrefixLength).join('/') || file.path,
    }));
  }

  /**
   * Restructure paths to ensure required content lives at profile root.
   * - claude: CLAUDE.md at root; agents|commands|workflows dirs at root
   * - codex: AGENTS.md at root
   */
  private restructurePaths(files: RemoteFile[], toolType: ToolType): RemoteFile[] {
    const norm = (p: string) => p.replace(/\\/g, '/').replace(/^\/+/, '');

    if (toolType === 'codex') {
      return files.map(f => {
        const base = norm(f.path).split('/').pop()?.toLowerCase();
        if (base === 'agents.md') return { ...f, path: 'AGENTS.md' };
        return { ...f, path: norm(f.path) };
      });
    }

    // claude
    const allowed = new Set(['agents', 'commands', 'workflows', 'skills']);

    return files.map(f => {
      const p = norm(f.path);
      const parts = p.split('/');
      const base = parts[parts.length - 1].toLowerCase();
      if (base === 'claude.md') {
        return { ...f, path: 'CLAUDE.md' };
      }
      const idx = parts.findIndex(seg => allowed.has(seg.toLowerCase()));
      if (idx !== -1) {
        return { ...f, path: parts.slice(idx).join('/') };
      }
      // Fallback: keep basename
      return { ...f, path: parts[parts.length - 1] };
    });
  }
}

/**
 * Create a remote manager instance
 */
export function createRemoteManager(): RemoteManager {
  return new RemoteManager();
}
