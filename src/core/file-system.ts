import fs from 'fs-extra';
import path from 'path';
import { CLAUDE_FILES } from './config';
import { ProfileFiles, DirectoryFile } from '../types';

/**
 * Read files from a directory
 */
async function readDirectoryFiles(dirPath: string): Promise<DirectoryFile[]> {
  const files: DirectoryFile[] = [];

  if (await fs.pathExists(dirPath)) {
    const entries = await fs.readdir(dirPath);

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const stat = await fs.stat(entryPath);

      if (stat.isFile() && entry.endsWith('.md')) {
        const content = await fs.readFile(entryPath, 'utf-8');
        files.push({ name: entry, content });
      }
    }
  }

  return files;
}

/**
 * Read all Claude configuration files from a directory
 */
export async function readClaudeFiles(claudeDir: string): Promise<ProfileFiles> {
  const files: ProfileFiles = {};

  // Read CLAUDE.md
  const claudeMdPath = path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD);
  if (await fs.pathExists(claudeMdPath)) {
    files.claudeMd = await fs.readFile(claudeMdPath, 'utf-8');
  }

  // Read agents directory
  const agentsDir = path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR);
  const agentsFiles = await readDirectoryFiles(agentsDir);
  if (agentsFiles.length > 0) {
    files.agents = agentsFiles;
  }

  // Read workflows directory
  const workflowsDir = path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR);
  const workflowsFiles = await readDirectoryFiles(workflowsDir);
  if (workflowsFiles.length > 0) {
    files.workflows = workflowsFiles;
  }

  // Read commands directory
  const commandsDir = path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR);
  const commandsFiles = await readDirectoryFiles(commandsDir);
  if (commandsFiles.length > 0) {
    files.commands = commandsFiles;
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
      await fs.writeFile(path.join(dirPath, file.name), file.content);
    }
  }
}

/**
 * Write Claude configuration files to a directory
 */
export async function writeClaudeFiles(
  claudeDir: string,
  files: ProfileFiles
): Promise<void> {
  // Ensure directory exists
  await fs.ensureDir(claudeDir);

  // Write CLAUDE.md
  if (files.claudeMd) {
    await fs.writeFile(
      path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD),
      files.claudeMd
    );
  }

  // Write agents directory
  if (files.agents && files.agents.length > 0) {
    const agentsDir = path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR);
    await writeDirectoryFiles(agentsDir, files.agents);
  }

  // Write workflows directory
  if (files.workflows && files.workflows.length > 0) {
    const workflowsDir = path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR);
    await writeDirectoryFiles(workflowsDir, files.workflows);
  }

  // Write commands directory
  if (files.commands && files.commands.length > 0) {
    const commandsDir = path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR);
    await writeDirectoryFiles(commandsDir, files.commands);
  }
}

/**
 * Clear Claude configuration files from a directory
 */
export async function clearClaudeFiles(claudeDir: string): Promise<void> {
  const filesToRemove = [
    path.join(claudeDir, CLAUDE_FILES.CLAUDE_MD),
    path.join(claudeDir, CLAUDE_FILES.AGENTS_DIR),
    path.join(claudeDir, CLAUDE_FILES.WORKFLOWS_DIR),
    path.join(claudeDir, CLAUDE_FILES.COMMANDS_DIR),
  ];

  for (const file of filesToRemove) {
    if (await fs.pathExists(file)) {
      await fs.remove(file);
    }
  }
}

/**
 * Copy directory recursively
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, { overwrite: true });
}

/**
 * Count files in a profile
 */
export function countProfileFiles(files: ProfileFiles): number {
  let count = 0;
  if (files.claudeMd) count++;
  if (files.agents) count += files.agents.length;
  if (files.workflows) count += files.workflows.length;
  if (files.commands) count += files.commands.length;
  return count;
}
