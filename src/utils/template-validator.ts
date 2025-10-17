import { RemoteFile, ValidationResult, ToolType } from '../types/index.js';

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
