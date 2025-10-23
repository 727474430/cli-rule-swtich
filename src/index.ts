#!/usr/bin/env node

import { Command } from 'commander';
import { ToolType } from './types';
import { listProfiles } from './commands/list';
import { useProfile } from './commands/use';
import { saveProfile } from './commands/save';
import { createProfile } from './commands/create';
import { deleteProfile } from './commands/delete';
import { listBackups, restoreBackup } from './commands/restore';
import { interactiveMode } from './commands/interactive';
import { registerTemplateCommands } from './commands/template';
import { createRemoteCommand } from './commands/remote';
import { Logger } from './utils/logger';

const program = new Command();

program
  .name('crs')
  .description('CLI Rule Switch - Manage and switch between multiple Claude Code and Codex configuration profiles')
  .version('1.10.1')
  .option('-t, --tool <type>', 'Tool type: claude or codex (default: claude)', 'claude');

// List command
const listCommand = program
  .command('list')
  .alias('ls')
  .description('List all available profiles (use global -t/--tool to filter)');

listCommand.action(async () => {
  try {
    const globalOpts = program.opts();
    // Check if user explicitly provided --tool flag
    // If tool is provided and is not the default, use it for filtering
    const hasToolFlag = process.argv.includes('-t') || process.argv.includes('--tool');
    const toolType = hasToolFlag ? (globalOpts.tool as ToolType) : undefined;
    await listProfiles(toolType);
  } catch (error) {
    Logger.error('Failed to list profiles');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Use command
const useCommand = program
  .command('use <profile>')
  .description('Switch to a specific profile');

useCommand.action(async (profile: string) => {
  try {
    const toolType = program.opts().tool as ToolType;
    await useProfile(profile, toolType);
  } catch (error) {
    Logger.error('Failed to switch profile');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Save command
const saveCommand = program
  .command('save <name>')
  .description('Save current configuration as a new profile')
  .option('-d, --description <description>', 'Profile description');

saveCommand.action(async (name: string, options: { description?: string }) => {
  try {
    const toolType = program.opts().tool as ToolType;
    await saveProfile(name, options.description, toolType);
  } catch (error) {
    Logger.error('Failed to save profile');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Create command
const createCommand = program
  .command('create <name>')
  .description('Create an empty profile')
  .option('-d, --description <description>', 'Profile description');

createCommand.action(async (name: string, options: { description?: string }) => {
  try {
    const toolType = program.opts().tool as ToolType;
    await createProfile(name, options.description, toolType);
  } catch (error) {
    Logger.error('Failed to create profile');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Remove command
const removeCommand = program
  .command('remove <profile>')
  .alias('rm')
  .description('Remove a profile');

removeCommand.action(async (profile: string) => {
  try {
    const toolType = program.opts().tool as ToolType;
    await deleteProfile(profile, toolType);
  } catch (error) {
    Logger.error('Failed to remove profile');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Backup commands
const backupCommand = program
  .command('backup')
  .alias('backups')
  .description('List all available backups');

backupCommand.action(async () => {
  try {
    const toolType = program.opts().tool as ToolType;
    await listBackups(toolType);
  } catch (error) {
    Logger.error('Failed to list backups');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Restore command
const restoreCommand = program
  .command('restore [timestamp]')
  .description('Restore a backup (interactive if timestamp not provided)');

restoreCommand.action(async (timestamp?: string) => {
  try {
    const toolType = program.opts().tool as ToolType;
    await restoreBackup(timestamp, toolType);
  } catch (error) {
    Logger.error('Failed to restore backup');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Register template commands
registerTemplateCommands(program);

// Register remote commands
createRemoteCommand(program);

// Interactive mode (default when no command is provided)
program.action(async () => {
  try {
    const toolType = program.opts().tool as ToolType;
    await interactiveMode(toolType);
  } catch (error) {
    Logger.error('An error occurred');
    if (error instanceof Error) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
});

// Parse arguments
program.parse(process.argv);
