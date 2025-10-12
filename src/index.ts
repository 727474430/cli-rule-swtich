#!/usr/bin/env node

import { Command } from 'commander';
import { listProfiles } from './commands/list';
import { useProfile } from './commands/use';
import { saveProfile } from './commands/save';
import { createProfile } from './commands/create';
import { deleteProfile } from './commands/delete';
import { listBackups, restoreBackup } from './commands/restore';
import { interactiveMode } from './commands/interactive';
import { Logger } from './utils/logger';

const program = new Command();

program
  .name('crs')
  .description('CLI Rule Switch - Manage and switch between multiple Claude Code configuration profiles')
  .version('1.0.0');

// List command
program
  .command('list')
  .alias('ls')
  .description('List all available profiles')
  .action(async () => {
    try {
      await listProfiles();
    } catch (error) {
      Logger.error('Failed to list profiles');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Use command
program
  .command('use <profile>')
  .description('Switch to a specific profile')
  .action(async (profile: string) => {
    try {
      await useProfile(profile);
    } catch (error) {
      Logger.error('Failed to switch profile');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Save command
program
  .command('save <name>')
  .description('Save current configuration as a new profile')
  .option('-d, --description <description>', 'Profile description')
  .action(async (name: string, options: { description?: string }) => {
    try {
      await saveProfile(name, options.description);
    } catch (error) {
      Logger.error('Failed to save profile');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Create command
program
  .command('create <name>')
  .description('Create an empty profile')
  .option('-d, --description <description>', 'Profile description')
  .action(async (name: string, options: { description?: string }) => {
    try {
      await createProfile(name, options.description);
    } catch (error) {
      Logger.error('Failed to create profile');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Delete command
program
  .command('delete <profile>')
  .alias('rm')
  .description('Delete a profile')
  .action(async (profile: string) => {
    try {
      await deleteProfile(profile);
    } catch (error) {
      Logger.error('Failed to delete profile');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Backup commands
program
  .command('backup')
  .alias('backups')
  .description('List all available backups')
  .action(async () => {
    try {
      await listBackups();
    } catch (error) {
      Logger.error('Failed to list backups');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Restore command
program
  .command('restore [timestamp]')
  .description('Restore a backup (interactive if timestamp not provided)')
  .action(async (timestamp?: string) => {
    try {
      await restoreBackup(timestamp);
    } catch (error) {
      Logger.error('Failed to restore backup');
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      process.exit(1);
    }
  });

// Interactive mode (default when no command is provided)
program.action(async () => {
  try {
    await interactiveMode();
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
