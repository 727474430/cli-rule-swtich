import Table from 'cli-table3';
import chalk from 'chalk';
import boxen from 'boxen';
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
 * Sort backups: by tool type (claude first), then by date (newest first)
 */
function sortBackupsByToolAndDate(backups: any[]): any[] {
  return backups.sort((a, b) => {
    // First, sort by tool type (claude before codex)
    if (a.toolType !== b.toolType) {
      return a.toolType === 'claude' ? -1 : 1;
    }
    // Within same tool type, sort by date (newest first)
    return b.date.getTime() - a.date.getTime();
  });
}

/**
 * List all backups from all tools
 */
export async function listBackups(toolType?: ToolType): Promise<void> {
  // Get backups from both tools
  const claudeManager = new ProfileManager('claude');
  const codexManager = new ProfileManager('codex');
  await claudeManager.initialize();
  await codexManager.initialize();

  const claudeBackups = await claudeManager.listBackups();
  const codexBackups = await codexManager.listBackups();
  const allBackups = sortBackupsByToolAndDate([...claudeBackups, ...codexBackups]);

  if (allBackups.length === 0) {
    Logger.warning('No backups found');
    Logger.info('Backups are created automatically when you switch profiles');
    return;
  }

  Logger.header('Available Backups (All Tools)');
  Logger.newLine();

  const table = new Table({
    colWidths: [5, 8, 20, 25],
  });

  let lastToolType: string | null = null;

  allBackups.forEach((backup, index) => {
    // Add group header for each tool type
    if (lastToolType !== backup.toolType) {
      const toolLabel = backup.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
      const separator = chalk.gray('─'.repeat(20));
      table.push([
        { colSpan: 4, content: `${separator} ${toolLabel} ${separator}` }
      ]);
      
      // Add column headers
      table.push([
        chalk.cyan('#'),
        chalk.cyan('Tool'),
        chalk.cyan('Profile'),
        chalk.cyan('Backup Time'),
      ]);
    }
    lastToolType = backup.toolType;

    const toolLabel = backup.toolType === 'claude'
      ? chalk.blue('Claude')
      : backup.toolType === 'codex'
      ? chalk.magenta('Codex')
      : chalk.gray('unknown');
    
    table.push([
      (index + 1).toString(),
      toolLabel,
      backup.profileName || chalk.gray('unknown'),
      formatDate(backup.date),
    ]);
  });

  console.log(table.toString());
  Logger.newLine();
  Logger.info(`Total backups: ${chalk.green.bold(allBackups.length.toString())}`);
  Logger.info(`Restore a backup with: ${chalk.cyan('crs restore')}`);
}

/**
 * Restore a specific backup
 */
export async function restoreBackup(timestamp?: string, toolType?: ToolType): Promise<void> {
  // Get backups from both tools
  const claudeManager = new ProfileManager('claude');
  const codexManager = new ProfileManager('codex');
  await claudeManager.initialize();
  await codexManager.initialize();

  const claudeBackups = await claudeManager.listBackups();
  const codexBackups = await codexManager.listBackups();
  const allBackups = sortBackupsByToolAndDate([...claudeBackups, ...codexBackups]);

  if (allBackups.length === 0) {
    Logger.warning('No backups available to restore');
    return;
  }

  // If no timestamp provided, show interactive selection
  if (!timestamp) {
    Logger.header('Available Backups to Restore');
    Logger.newLine();

    // Display backups in table format
    const table = new Table({
      colWidths: [5, 8, 20, 25],
    });

    let lastToolType: string | null = null;

    allBackups.forEach((backup, index) => {
      // Add group header for each tool type
      if (lastToolType !== backup.toolType) {
        const toolLabel = backup.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
        const separator = chalk.gray('─'.repeat(20));
        table.push([
          { colSpan: 4, content: `${separator} ${toolLabel} ${separator}` }
        ]);
        
        // Add column headers
        table.push([
          chalk.cyan('#'),
          chalk.cyan('Tool'),
          chalk.cyan('Profile'),
          chalk.cyan('Backup Time'),
        ]);
      }
      lastToolType = backup.toolType;

      const toolLabel = backup.toolType === 'claude'
        ? chalk.blue('Claude')
        : backup.toolType === 'codex'
        ? chalk.magenta('Codex')
        : chalk.gray('unknown');
      
      table.push([
        (index + 1).toString(),
        toolLabel,
        backup.profileName || chalk.gray('unknown'),
        formatDate(backup.date),
      ]);
    });

    console.log(table.toString());
    Logger.newLine();

    try {
      const { selection } = await inquirer.prompt([
        {
          type: 'input',
          name: 'selection',
          message: `Enter backup number ${chalk.gray('(Enter to cancel)')}: `,
          validate: (input: string) => {
            if (!input.trim()) {
              return true; // Allow empty to cancel
            }
            
            // Only allow number input
            const num = parseInt(input);
            if (isNaN(num)) {
              return 'Please enter a valid backup number';
            }
            if (num < 1 || num > allBackups.length) {
              return `Please enter a number between 1 and ${allBackups.length}`;
            }
            return true;
          },
        },
      ]);

      if (!selection.trim()) {
        Logger.info('↩️  Cancelled.');
        return;
      }

      // Get the selected backup
      const num = parseInt(selection);
      const selectedBackup = allBackups[num - 1];
      timestamp = selectedBackup.timestamp;
      
      // Determine which manager to use based on backup's toolType
      const backupToolType = selectedBackup.toolType || 'claude';
      const manager = backupToolType === 'claude' ? claudeManager : codexManager;
    } catch (error) {
      // User cancelled
      Logger.newLine();
      Logger.info('↩️  Cancelled.');
      return;
    }
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

  // If timestamp is set (either from parameter or selection), determine the tool type
  let manager: ProfileManager;
  if (timestamp) {
    // Find the backup to determine its tool type
    const selectedBackup = allBackups.find(b => b.timestamp === timestamp);
    const backupToolType = selectedBackup?.toolType || 'claude';
    manager = backupToolType === 'claude' ? claudeManager : codexManager;
  } else {
    // Shouldn't reach here, but default to claude
    manager = claudeManager;
  }
  
  const spinner = ora(`Restoring backup "${timestamp}"...`).start();

  const result = await manager.restoreBackup(timestamp!);

  if (result.success) {
    spinner.succeed(chalk.green(`Restored backup from ${timestamp}`));
    console.log();
    console.log(
      boxen(
        chalk.green.bold('✓ Backup Restored Successfully'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );
    
    const backupToolType = allBackups.find(b => b.timestamp === timestamp)?.toolType || 'claude';
    const toolLabel = backupToolType === 'claude' ? '🤖 Claude Code' : '⚙️  Codex';
    const configPath = backupToolType === 'claude' ? '~/.claude' : '~/.codex';
    
    console.log(chalk.bold('Backup Time:'), formatDate(new Date(timestamp.replace(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, '$1-$2-$3T$4:$5:$6.$7Z'))));
    console.log(chalk.bold('Tool:'), toolLabel);
    console.log(chalk.bold('Config Path:'), chalk.cyan(configPath));
    console.log();
    console.log(chalk.green('✓'), 'Configuration restored to backup state');
    console.log(chalk.green('✓'), 'Previous configuration backed up automatically');
    console.log(chalk.yellow('⚠'), chalk.yellow('Current profile cleared - no active profile'));
    console.log();
    console.log(chalk.cyan('💡 Next steps:'));
    console.log(chalk.gray('  crs save <name>       # Save restored config as new profile'));
    console.log(chalk.gray('  crs use <profile>     # Switch to an existing profile'));
    console.log(chalk.gray('  crs list              # View all profiles'));
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
