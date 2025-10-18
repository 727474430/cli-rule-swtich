import { GitHubUrlInfo } from '../types';

/**
 * Parse various GitHub URL formats into structured information
 *
 * Supported formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch/path
 * - https://github.com/owner/repo/tree/branch
 * - owner/repo
 * - owner/repo@branch
 * - owner/repo@branch:path
 */
export function parseGitHubUrl(url: string): GitHubUrlInfo {
  const result: GitHubUrlInfo = {
    owner: '',
    repo: '',
    ref: 'main',
    path: '',
    isValid: false,
  };

  try {
    // Normalize URL
    url = url.trim();

    // Short format: owner/repo or owner/repo@branch or owner/repo@branch:path
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return parseShortFormat(url);
    }

    // Full URL format
    const urlObj = new URL(url);

    if (urlObj.hostname !== 'github.com') {
      return result;
    }

    // Parse path: /owner/repo/tree/branch/path/to/dir
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts.length < 2) {
      return result;
    }

    result.owner = pathParts[0];
    result.repo = pathParts[1];

    // Check if there's a tree/blob/commit path
    if (pathParts.length > 2) {
      const type = pathParts[2]; // 'tree', 'blob', or 'commit'

      if (type === 'tree' || type === 'blob') {
        if (pathParts.length > 3) {
          result.ref = pathParts[3];

          // Everything after branch is the path
          if (pathParts.length > 4) {
            result.path = pathParts.slice(4).join('/');
          }
        }
      } else if (type === 'commit') {
        // https://github.com/owner/repo/commit/hash
        if (pathParts.length > 3) {
          result.ref = pathParts[3];
        }
      }
    }

    result.isValid = true;
    return result;

  } catch (error) {
    return result;
  }
}

/**
 * Parse short format URLs
 * Examples:
 * - owner/repo
 * - owner/repo@branch
 * - owner/repo@branch:path/to/dir
 */
function parseShortFormat(shortUrl: string): GitHubUrlInfo {
  const result: GitHubUrlInfo = {
    owner: '',
    repo: '',
    ref: 'main',
    path: '',
    isValid: false,
  };

  // Check for path separator
  let urlPart = shortUrl;
  if (shortUrl.includes(':')) {
    const [url, path] = shortUrl.split(':');
    urlPart = url;
    result.path = path.trim();
  }

  // Check for branch specifier
  if (urlPart.includes('@')) {
    const [repoPath, ref] = urlPart.split('@');
    result.ref = ref.trim();
    urlPart = repoPath;
  }

  // Parse owner/repo
  const parts = urlPart.split('/');
  if (parts.length === 2) {
    result.owner = parts[0].trim();
    result.repo = parts[1].trim();
    result.isValid = !!(result.owner && result.repo);
  }

  return result;
}

/**
 * Convert parsed info back to full GitHub URL
 */
export function buildGitHubUrl(info: GitHubUrlInfo): string {
  let url = `https://github.com/${info.owner}/${info.repo}`;

  if (info.ref && info.ref !== 'main') {
    url += `/tree/${info.ref}`;
  }

  if (info.path) {
    url += `/${info.path}`;
  }

  return url;
}

/**
 * Validate if a string looks like a GitHub URL
 */
export function isGitHubUrl(url: string): boolean {
  const parsed = parseGitHubUrl(url);
  return parsed.isValid;
}
