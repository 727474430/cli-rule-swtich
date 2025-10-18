import fs from 'fs-extra';
import path from 'path';
import { CLAUDE_FILES, CODEX_FILES } from './config';
import { ProfileFiles, DirectoryFile, ClaudeFiles, CodexFiles } from '../types';

/**
 * Read files from a directory
 */
async function readDirectoryFiles(dirPath: string): Promise<DirectoryFile[]> {
  const files: DirectoryFile[] = [];

  if (await fs.pathExists(dirPath)) {
    const walk = async (current: string) => {
      const entries = await fs.readdir(current);
      for (const entry of entries) {
        const entryPath = path.join(current, entry);
        const stat = await fs.stat(entryPath);
        if (stat.isDirectory()) {
          await walk(entryPath);
        } else if (stat.isFile() && entry.toLowerCase().endsWith('.md')) {
          const content = await fs.readFile(entryPath, 'utf-8');
          const rel = path.relative(dirPath, entryPath) || entry;
          files.push({ name: rel, content });
        }
      }
    };
    await walk(dirPath);
  }

  return files;
}

/**
 * Read all Claude Code configuration files from a directory
 */
export async function readClaudeFiles(claudeDir: string): Promise<ClaudeFiles> {
  const files: ClaudeFiles = {};

  // Read CLAUDE.md (even if empty)
  const claudeMdPath = path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD);
  if (await fs.pathExists(claudeMdPath)) {
    files.claudeMd = await fs.readFile(claudeMdPath, 'utf-8');
  }

  // Read agents directory
  const agentsDir = path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR);
  const agentsFiles = await readDirectoryFiles(agentsDir);
  if (agentsFiles.length > 0) {
    files.agents = agentsFiles;
  } else if (await fs.pathExists(agentsDir)) {
    // Directory exists but empty, preserve as empty array
    files.agents = [];
  }

  // Read workflows directory
  const workflowsDir = path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR);
  const workflowsFiles = await readDirectoryFiles(workflowsDir);
  if (workflowsFiles.length > 0) {
    files.workflows = workflowsFiles;
  } else if (await fs.pathExists(workflowsDir)) {
    // Directory exists but empty, preserve as empty array
    files.workflows = [];
  }

  // Read commands directory
  const commandsDir = path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR);
  const commandsFiles = await readDirectoryFiles(commandsDir);
  if (commandsFiles.length > 0) {
    files.commands = commandsFiles;
  } else if (await fs.pathExists(commandsDir)) {
    // Directory exists but empty, preserve as empty array
    files.commands = [];
  }

  // Read skills directory
  const skillsDir = path.join(claudeDir, CLAUDE_FILES.SKILLS_DIR);
  const skillsFiles = await readDirectoryFiles(skillsDir);
  if (skillsFiles.length > 0) {
    files.skills = skillsFiles;
  } else if (await fs.pathExists(skillsDir)) {
    files.skills = [];
  }

  return files;
}

/**
 * Write files to a directory
 */
async function writeDirectoryFiles(
  dirPath: string,
  files: DirectoryFile[]
): Promise<void> {
  if (files && files.length > 0) {
    await fs.ensureDir(dirPath);
    for (const file of files) {
      const targetPath = path.join(dirPath, file.name);
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, file.content);
    }
  }
}

/**
 * Read all Codex configuration files from a directory
 */
export async function readCodexFiles(codexDir: string): Promise<CodexFiles> {
  const files: CodexFiles = {};

  // Read AGENTS.md
  const agentsMdPath = path.join(codexDir, CODEX_FILES.AGENTS_MD);
  if (await fs.pathExists(agentsMdPath)) {
    files.agentsMd = await fs.readFile(agentsMdPath, 'utf-8');
  }

  return files;
}

/**
 * Write Claude Code configuration files to a directory
 */
export async function writeClaudeFiles(
  claudeDir: string,
  files: ClaudeFiles
): Promise<void> {
  // Ensure directory exists
  await fs.ensureDir(claudeDir);

  // Write CLAUDE.md
  if (files.claudeMd !== undefined) {
    await fs.writeFile(
      path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD),
      files.claudeMd
    );
  }

  // Write agents directory
  if (files.agents !== undefined) {
    const agentsDir = path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR);
    if (files.agents.length > 0) {
      await writeDirectoryFiles(agentsDir, files.agents);
    } else {
      // Create empty directory
      await fs.ensureDir(agentsDir);
    }
  }

  // Write workflows directory
  if (files.workflows !== undefined) {
    const workflowsDir = path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR);
    if (files.workflows.length > 0) {
      await writeDirectoryFiles(workflowsDir, files.workflows);
    } else {
      // Create empty directory
      await fs.ensureDir(workflowsDir);
    }
  }

  // Write commands directory
  if (files.commands !== undefined) {
    const commandsDir = path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR);
    if (files.commands.length > 0) {
      await writeDirectoryFiles(commandsDir, files.commands);
    } else {
      // Create empty directory
      await fs.ensureDir(commandsDir);
    }
  }

  // Write skills directory
  if (files.skills !== undefined) {
    const skillsDir = path.join(claudeDir, CLAUDE_FILES.SKILLS_DIR);
    if (files.skills.length > 0) {
      await writeDirectoryFiles(skillsDir, files.skills);
    } else {
      await fs.ensureDir(skillsDir);
    }
  }
}

/**
 * Write Codex configuration files to a directory
 */
export async function writeCodexFiles(
  codexDir: string,
  files: CodexFiles
): Promise<void> {
  // Ensure directory exists
  await fs.ensureDir(codexDir);

  // Write AGENTS.md
  if (files.agentsMd) {
    await fs.writeFile(
      path.join(codexDir, CODEX_FILES.AGENTS_MD),
      files.agentsMd
    );
  }
}

/**
 * Clear Claude Code configuration files from a directory
 */
export async function clearClaudeFiles(claudeDir: string): Promise<void> {
  const filesToRemove = [
    path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD),
    path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR),
    path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR),
    path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR),
    path.join(claudeDir, CLAUDE_FILES.SKILLS_DIR),
  ];

  for (const file of filesToRemove) {
    if (await fs.pathExists(file)) {
      await fs.remove(file);
    }
  }
}

/**
 * Clear Codex configuration files from a directory
 */
export async function clearCodexFiles(codexDir: string): Promise<void> {
  const agentsMdPath = path.join(codexDir, CODEX_FILES.AGENTS_MD);
  
  if (await fs.pathExists(agentsMdPath)) {
    await fs.remove(agentsMdPath);
  }
}

/**
 * Copy directory recursively
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, { overwrite: true });
}

/**
 * Count files in a Claude profile
 */
export function countClaudeFiles(files: ClaudeFiles): number {
  let count = 0;
  if (files.claudeMd) count++;
  if (files.agents) count += files.agents.length;
  if (files.workflows) count += files.workflows.length;
  if (files.commands) count += files.commands.length;
  if ((files as any).skills) count += (files as any).skills.length;
  return count;
}

/**
 * Count files in a Codex profile
 */
export function countCodexFiles(files: CodexFiles): number {
  let count = 0;
  if (files.agentsMd) count++;
  return count;
}

/**
 * Count files in a profile (wrapper function)
 */
export function countProfileFiles(files: ProfileFiles): number {
  // Type guard to check if it's ClaudeFiles
  if ('claudeMd' in files || 'agents' in files || 'workflows' in files || 'commands' in files) {
    return countClaudeFiles(files as ClaudeFiles);
  } else {
    return countCodexFiles(files as CodexFiles);
  }
}
