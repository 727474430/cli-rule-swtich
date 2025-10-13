import Table from 'cli-table3';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Format date as yyyy-MM-dd HH:mm:ss
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * List all backups
 */
export async function listBackups(toolType: ToolType = 'claude'): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  const backups = await manager.listBackups();

  if (backups.length === 0) {
    Logger.warning(`No ${toolType} backups found`);
    Logger.info('Backups are created automatically when you switch profiles');
    return;
  }

  const toolLabel = toolType === 'claude' ? 'Claude Code' : 'Codex';
  Logger.header(`Available ${toolLabel} Backups`);
  Logger.newLine();

  const table = new Table({
    head: [
      chalk.cyan('#'),
      chalk.cyan('Profile'),
      chalk.cyan('Backup Time'),
    ],
    colWidths: [5, 20, 25],
  });

  backups.forEach((backup, index) => {
    table.push([
      (index + 1).toString(),
      backup.profileName || chalk.gray('unknown'),
      formatDate(backup.date),
    ]);
  });

  console.log(table.toString());
  Logger.newLine();
  Logger.info(`Total backups: ${chalk.green.bold(backups.length.toString())}`);
  Logger.info(`Restore a backup with: ${chalk.cyan(`crs restore <timestamp> --tool ${toolType}`)}`);
}

/**
 * Restore a specific backup
 */
export async function restoreBackup(timestamp?: string, toolType: ToolType = 'claude'): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  const backups = await manager.listBackups();

  if (backups.length === 0) {
    Logger.warning('No backups available to restore');
    return;
  }

  // If no timestamp provided, show interactive selection
  if (!timestamp) {
    Logger.header('Select a Backup to Restore');
    Logger.newLine();

    const choices = backups.map((backup, index) => {
      const profileName = backup.profileName || 'unknown';
      const formattedDate = formatDate(backup.date);
      return {
        name: `${index + 1}. [${profileName}] ${formattedDate}`,
        value: backup.timestamp,
      };
    });

    const { selectedTimestamp } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTimestamp',
        message: 'Select a backup to restore:',
        choices,
      },
    ]);

    timestamp = selectedTimestamp;
  }

  // Confirm restoration
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to restore backup "${timestamp}"?\n  Current configuration will be backed up before restoring.`,
      default: false,
    },
  ]);

  if (!confirm) {
    Logger.info('Restoration cancelled');
    return;
  }

  // Restore backup (timestamp is guaranteed to be string at this point)
  if (!timestamp) {
    Logger.error('No backup selected');
    return;
  }

  const spinner = ora(`Restoring backup "${timestamp}"...`).start();

  const result = await manager.restoreBackup(timestamp);

  if (result.success) {
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.box(
      `Backup restored successfully!\n\nYour configuration has been restored to the state from:\n${timestamp}`,
      'Success'
    );
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
