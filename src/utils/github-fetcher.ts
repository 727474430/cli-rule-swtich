import { Octokit } from '@octokit/rest';
import { GitHubUrlInfo, RemoteFile } from '../types';
import { parseGitHubUrl } from './github-parser';

/**
 * GitHub API client wrapper for fetching repository contents
 */
export class GitHubFetcher {
  private octokit: Octokit;
  private maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'cli-rule-switcher',
    });
  }

  /**
   * Fetch files from a GitHub repository path
   */
  async fetchFromUrl(url: string): Promise<RemoteFile[]> {
    const parsed = parseGitHubUrl(url);

    if (!parsed.isValid) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }

    const refExplicit = /(?:^|[^\w])(@|\/tree\/|\/commit\/)/.test(url);
    const tryFetch = async (ref: string) =>
      this.fetchDirectory(parsed.owner, parsed.repo, parsed.path || '', ref);

    try {
      return await tryFetch(parsed.ref);
    } catch (err: any) {
      // If branch not found and ref was not explicitly specified, fall back to repo default branch
      const is404 = err && /not found/i.test(String(err.message));
      if (is404 && !refExplicit) {
        try {
          const info = await this.getRepoInfo(parsed.owner, parsed.repo);
          if (info?.defaultBranch && info.defaultBranch !== parsed.ref) {
            return await tryFetch(info.defaultBranch);
          }
        } catch (_) {
          // ignore and rethrow original error below
        }
      }
      throw err;
    }
  }

  /**
   * Fetch directory contents recursively
   */
  private async fetchDirectory(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<RemoteFile[]> {
    const files: RemoteFile[] = [];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (!Array.isArray(data)) {
        // Single file
        if (data.type === 'file') {
          const file = await this.fetchFile(owner, repo, data.path, ref);
          if (file) {
            files.push(file);
          }
        }
        return files;
      }

      // Directory - process each item
      for (const item of data) {
        if (item.type === 'file') {
          const file = await this.fetchFile(owner, repo, item.path, ref);
          if (file) {
            files.push(file);
          }
        } else if (item.type === 'dir') {
          // Recursively fetch subdirectory
          const subFiles = await this.fetchDirectory(
            owner,
            repo,
            item.path,
            ref
          );
          files.push(...subFiles);
        }
      }

      return files;

    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(
          `Repository or path not found: ${owner}/${repo}${path ? '/' + path : ''} (ref: ${ref || 'default'})`
        );
      }
      if (error.status === 403) {
        throw new Error(
          'API rate limit exceeded or authentication required. Set GITHUB_TOKEN environment variable.'
        );
      }
      throw new Error(`Failed to fetch from GitHub: ${error.message}`);
    }
  }

  /**
   * Fetch a single file's content
   */
  private async fetchFile(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<RemoteFile | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (Array.isArray(data) || data.type !== 'file') {
        return null;
      }

      // Check file size
      if (data.size > this.maxFileSize) {
        console.warn(`Skipping large file: ${path} (${data.size} bytes)`);
        return null;
      }

      // Decode content
      const content = data.content
        ? Buffer.from(data.content, 'base64').toString('utf-8')
        : '';

      return {
        path,
        content,
        size: data.size,
      };

    } catch (error: any) {
      console.warn(`Failed to fetch file ${path}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get repository info (for validation)
   */
  async getRepoInfo(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return {
        name: data.name,
        description: data.description,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository not found: ${owner}/${repo}`);
      }
      throw error;
    }
  }

  /**
   * Check if a path exists in repository
   */
  async pathExists(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get latest commit for a path
   */
  async getLatestCommit(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner,
        repo,
        path,
        sha: ref,
        per_page: 1,
      });

      return data[0]?.sha || null;
    } catch {
      return null;
    }
  }
}

/**
 * Get GitHub token from environment
 */
export function getGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

/**
 * Create a GitHub fetcher instance
 */
export function createFetcher(): GitHubFetcher {
  const token = getGitHubToken();
  return new GitHubFetcher(token);
}
