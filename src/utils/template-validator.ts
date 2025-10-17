import { RemoteFile, ValidationResult, ToolType } from '../types/index.js';

/**
 * Filter files by tool type for installation
 * - claude: keep CLAUDE.md and content under agents/, commands/, workflows/
 * - codex: keep AGENTS.md only
 *
 * This works even when the template lives in a nested subdirectory of the repo
 * by scanning all fetched files and matching by basename or directory segment.
 */
export function filterFilesByToolType(files: RemoteFile[], toolType: ToolType): RemoteFile[] {
  const norm = (p: string) => p.replace(/\\/g, '/');
  const dirname = (p: string) => {
    const n = norm(p);
    const idx = n.lastIndexOf('/');
    return idx === -1 ? '' : n.slice(0, idx);
  };
  const isBasename = (p: string, name: string) => p.split('/').pop()?.toLowerCase() === name.toLowerCase();

  if (toolType === 'codex') {
    const candidates = files.filter(f => isBasename(norm(f.path), 'agents.md'));
    if (candidates.length <= 1) return candidates;
    // Choose the shallowest path (closest to repo root) to avoid duplicates
    const best = candidates.reduce((a, b) => (dirname(a.path).split('/').length <= dirname(b.path).split('/').length ? a : b));
    return [best];
  }

  // claude: anchor on a CLAUDE.md, then include its sibling agents/workflows/commands content
  const claudeAnchors = files
    .filter(f => isBasename(norm(f.path), 'claude.md'))
    .map(f => ({ file: f, dir: dirname(f.path) }));

  if (claudeAnchors.length === 0) {
    // Fallback to broad match (shouldn't happen if validation passed)
    const anywhereAllowed = /(^|\/)((agents)|(workflows)|(commands))\//i;
    return files.filter(f => anywhereAllowed.test(norm(f.path)) && /\.md$/i.test(f.path));
  }

  // Choose best anchor
  const bestAnchor = claudeAnchors
    .sort((a, b) => (a.dir.split('/').length - b.dir.split('/').length))[0];
  const bestPrefix = bestAnchor.dir ? norm(bestAnchor.dir) + '/' : '';

  // Within the anchor, detect the best "container" (e.g., '', '.claude', 'templates/x', etc.)
  const relOf = (p: string) => (p.startsWith(bestPrefix) ? p.slice(bestPrefix.length) : null);
  const containerCounts = new Map<string, number>();
  const allowed = ['agents', 'commands', 'workflows'];

  for (const f of files) {
    const p = norm(f.path);
    const rel = relOf(p);
    if (!rel) continue;
    const m = rel.match(/^(.*?)(agents|commands|workflows)\/.+\.md$/i);
    if (m) {
      const container = (m[1] || '').replace(/\/$/, ''); // '' or like '.claude'
      containerCounts.set(container, (containerCounts.get(container) || 0) + 1);
    }
  }

  // Prefer a non-empty container like '.claude' when present; otherwise ''
  let bestContainer = '';
  if (containerCounts.size > 0) {
    bestContainer = Array.from(containerCounts.entries())
      .sort((a, b) => (b[1] - a[1]) || (a[0].split('/').length - b[0].split('/').length))[0][0];
  }

  const containerPrefix = bestContainer ? bestContainer + '/' : '';

  return files.filter(f => {
    const p = norm(f.path);
    const rel = relOf(p);
    if (rel == null) return false;
    if (isBasename(p, 'claude.md')) return true;

    // Only include allowed dirs possibly under bestContainer
    const rx = new RegExp(`^${containerPrefix}(?:${allowed.join('|')})\\/.+\\.md$`, 'i');
    return rx.test(rel);
  });
}

/**
 * Validation rules for each tool type
 */
const VALIDATION_RULES = {
  claude: {
    required: ['CLAUDE.md'],
    optional: ['agents/', 'workflows/', 'commands/'],
    patterns: {
      // Match files under these directories
      agents: /^agents\/.+\.md$/,
      workflows: /^workflows\/.+\.md$/,
      commands: /^commands\/.+\.md$/,
    },
  },
  codex: {
    required: ['AGENTS.md'],
    optional: [],
    patterns: {},
  },
};

/**
 * Security check patterns - files/content to reject
 */
const SECURITY_PATTERNS = {
  // Dangerous file extensions
  dangerousFiles: /\.(exe|dll|so|dylib|sh|bat|cmd|ps1|app)$/i,

  // Sensitive files
  sensitiveFiles: /\.(env|key|pem|p12|pfx|cer|crt|credentials)$/i,

  // Dangerous content patterns
  dangerousContent: [
    /eval\s*\(/i,
    /exec\s*\(/i,
    /rm\s+-rf/i,
    /del\s+\/[sS]\s+\/[qQ]/i,
  ],
};

/**
 * Validate remote template files
 */
export function validateTemplate(files: RemoteFile[]): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    files,
  };

  // Check if there are any files
  if (files.length === 0) {
    result.errors.push('No files found in the remote template');
    return result;
  }

  // Detect tool type
  const toolType = detectToolType(files);
  if (!toolType) {
    result.errors.push(
      'Cannot detect tool type. Required: CLAUDE.md (Claude) or AGENTS.md (Codex)'
    );
    return result;
  }

  result.toolType = toolType;

  // Validate structure
  const structureErrors = validateStructure(files, toolType);
  result.errors.push(...structureErrors);

  // Security checks
  const securityIssues = checkSecurity(files);
  result.errors.push(...securityIssues.errors);
  result.warnings.push(...securityIssues.warnings);

  // Check file sizes
  const sizeWarnings = checkFileSizes(files);
  result.warnings.push(...sizeWarnings);

  // Template is valid if no errors
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Detect tool type from file structure
 */
function detectToolType(files: RemoteFile[]): ToolType | null {
  const fileNames = new Set(
    files.map(f => f.path.split('/').pop()?.toLowerCase())
  );

  if (fileNames.has('claude.md')) {
    return 'claude';
  }

  if (fileNames.has('agents.md')) {
    return 'codex';
  }

  return null;
}

/**
 * Validate file structure for tool type
 */
function validateStructure(files: RemoteFile[], toolType: ToolType): string[] {
  const errors: string[] = [];
  const rules = VALIDATION_RULES[toolType];

  // Get all file paths (normalized)
  const filePaths = files.map(f => normalizeFilePath(f.path));
  const fileNames = new Set(filePaths.map(p => p.split('/').pop()));

  // Check required files
  for (const required of rules.required) {
    const found = fileNames.has(required.toLowerCase());
    if (!found) {
      errors.push(`Missing required file: ${required}`);
    }
  }

  // Validate file patterns for optional directories
  if (toolType === 'claude') {
    const claudeRules = VALIDATION_RULES.claude;
    for (const dir of ['agents', 'workflows', 'commands'] as const) {
      const dirFiles = files.filter(f => f.path.startsWith(`${dir}/`));
      if (dirFiles.length > 0) {
        // Check if files match expected patterns
        const pattern = claudeRules.patterns[dir];
        if (pattern) {
          for (const file of dirFiles) {
            if (!pattern.test(normalizeFilePath(file.path))) {
              errors.push(
                `Invalid file in ${dir}/: ${file.path} (expected .md files)`
              );
            }
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Perform security checks on files
 */
function checkSecurity(files: RemoteFile[]): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    const fileName = file.path.toLowerCase();

    // Check for dangerous file extensions
    if (SECURITY_PATTERNS.dangerousFiles.test(fileName)) {
      errors.push(
        `Dangerous file type detected: ${file.path} (executable or script)`
      );
      continue;
    }

    // Check for sensitive files
    if (SECURITY_PATTERNS.sensitiveFiles.test(fileName)) {
      warnings.push(
        `Potentially sensitive file: ${file.path} (will not be installed)`
      );
      continue;
    }

    // Check content for dangerous patterns
    for (const pattern of SECURITY_PATTERNS.dangerousContent) {
      if (pattern.test(file.content)) {
        warnings.push(
          `Potentially dangerous content in ${file.path} (contains: ${pattern.source})`
        );
      }
    }
  }

  return { errors, warnings };
}

/**
 * Check file sizes and warn about large files
 */
function checkFileSizes(files: RemoteFile[]): string[] {
  const warnings: string[] = [];
  const maxSingleFile = 1024 * 1024; // 1MB
  const maxTotalSize = 10 * 1024 * 1024; // 10MB

  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;

    if (file.size > maxSingleFile) {
      warnings.push(
        `Large file detected: ${file.path} (${formatBytes(file.size)})`
      );
    }
  }

  if (totalSize > maxTotalSize) {
    warnings.push(
      `Template size is large: ${formatBytes(totalSize)} (may take longer to download)`
    );
  }

  return warnings;
}

/**
 * Normalize file path for comparison
 */
function normalizeFilePath(path: string): string {
  return path
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Filter out sensitive files before installation
 */
export function filterSensitiveFiles(files: RemoteFile[]): RemoteFile[] {
  return files.filter(file => {
    const fileName = file.path.toLowerCase();
    return !SECURITY_PATTERNS.sensitiveFiles.test(fileName);
  });
}
