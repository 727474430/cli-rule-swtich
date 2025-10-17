import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { createRemoteManager } from '../core/remote-manager.js';
import { ToolType } from '../types/index.js';
import { Logger } from '../utils/logger.js';
import { isGitHubUrl } from '../utils/github-parser.js';

/**
 * Create remote command group
 */
export function createRemoteCommand(program: Command): void {
  const remote = program
    .command('remote')
    .description('Manage remote template sources');

  // List remotes
  remote
    .command('list')
    .alias('ls')
    .description('List all installed remote templates')
    .option('-t, --tool <type>', 'Filter by tool type: claude or codex')
    .action(async (options: any) => {
      const spinner = ora('Loading remotes...').start();

      try {
        const manager = createRemoteManager();
        const remotes = await manager.listRemotes(options.tool as ToolType);

        spinner.stop();

        if (remotes.length === 0) {
          Logger.info('No remote templates installed yet');
          Logger.info('Install a remote with: crs remote install <url> <profile-name>');
          return;
        }

        // Display as table
        const table = new Table({
          head: ['Name', 'Tool', 'URL', 'Branch', 'Last Used'],
          colWidths: [20, 8, 50, 12, 22],
          wordWrap: true,
        });

        for (const r of remotes) {
          table.push([
            chalk.cyan(r.name),
            r.toolType,
            truncateUrl(r.url),
            r.branch,
            r.lastSync ? formatDate(r.lastSync) : '-',
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\nTotal: ${remotes.length} remote(s)`));

      } catch (error: any) {
        spinner.stop();
        Logger.error(`Failed to list remotes: ${error.message}`);
      }
    });

  // Preview remote
  remote
    .command('preview')
    .description('Preview a remote template without installing (auto-detects templates in any subdirectory or repo root)')
    .argument('<url>', 'GitHub repository URL')
    .option('-t, --tool <type>', 'Tool type: claude or codex (preview with specific tool)')
    .action(async (url: string, options: any) => {
      const spinner = ora('Fetching template preview...').start();

      try {
        const manager = createRemoteManager();
        const result = await manager.previewRemote(url, options.tool as ToolType);

        spinner.stop();

        if (!result.success) {
          Logger.error(result.message || 'Failed to preview remote');
          return;
        }

        if (result.validation) {
          console.log(chalk.bold('\n📦 Template Preview\n'));
          displayValidation(result.validation);
        }

        if (result.info) {
          console.log(chalk.bold('\n📊 Source Statistics\n'));
          console.log(`Detected Tool: ${chalk.cyan(result.info.toolType || 'Unknown')}`);
          if (typeof result.info.sourceFileCount === 'number') {
            console.log(`Fetched Files: ${chalk.yellow(result.info.sourceFileCount)} | Total Size: ${chalk.yellow(formatBytes(result.info.sourceTotalSize || 0))}`);
          }

          if (result.info.installFiles && result.info.installFiles.length > 0) {
            console.log(chalk.bold('\n🧩 Install Plan\n'));
            console.log(`Tool For Install: ${chalk.cyan(result.info.installToolType)}`);
            console.log(`Will Install:     ${chalk.yellow(result.info.installFileCount)} file(s) | ${chalk.yellow(formatBytes(result.info.installTotalSize || 0))}`);
            if (typeof result.info.skippedCount === 'number') {
              console.log(`Skipped (non-matching/sensitive): ${chalk.dim(result.info.skippedCount)}`);
            }

            console.log(chalk.bold('\n📁 Files To Be Installed (final structure):\n'));
            (result.info.files || result.info.installFiles || []).forEach(file => {
              console.log(`  ${chalk.dim('├─')} ${file}`);
            });
          } else {
            console.log(chalk.yellow('\nNo installable files detected for the selected tool. Try --tool claude|codex or specify a subpath: owner/repo@branch:path/to/template\n'));
          }
        }

        if (result.validation?.isValid) {
          console.log(chalk.green('\n✓ Template is valid. You can install with: crs remote install <url> <profile> [--tool <type>]\n'));
        }

      } catch (error: any) {
        spinner.stop();
        Logger.error(`Failed to preview: ${error.message}`);
      }
    });

  // Remove remote
  remote
    .command('remove')
    .alias('rm')
    .description('Remove a remote template')
    .argument('<name>', 'Remote template name')
    .action(async (name: string) => {
      try {
        // Confirm deletion
        const { confirmed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Remove remote template '${name}'?`,
            default: false,
          },
        ]);

        if (!confirmed) {
          Logger.info('Cancelled');
          return;
        }

        const spinner = ora('Removing remote...').start();
        const manager = createRemoteManager();
        const result = await manager.removeRemote(name);

        spinner.stop();

        if (result.success) {
          Logger.success(result.message);
        } else {
          Logger.error(result.message);
        }

      } catch (error: any) {
        Logger.error(`Failed to remove remote: ${error.message}`);
      }
    });

  // Install from remote
  remote
    .command('install')
    .description('Install a remote template as a profile (supports URL or saved remote name; auto-detects template in any subdirectory or repo root)')
    .argument('<source>', 'GitHub URL or saved remote name')
    .argument('<profile>', 'Profile name to create')
    .option('-d, --description <desc>', 'Profile description')
    .option('-t, --tool <type>', 'Tool type: claude or codex (auto-detected if not specified)')
    .action(async (source: string, profileName: string, options: any) => {
      const spinner = ora('Installing remote template...').start();

      try {
        const manager = createRemoteManager();

        // Check if source is a URL or a saved remote name
        const isUrl = isGitHubUrl(source);

        if (isUrl) {
          // Install directly from URL and save the remote
          const result = await manager.installFromUrl(
            source,
            profileName,
            options.description,
            options.tool as ToolType
          );

          spinner.stop();

          if (result.success) {
            Logger.success(result.message);

            if (result.validation) {
              displayValidation(result.validation);
            }

            console.log(chalk.dim(`\nSwitch to profile: ${chalk.cyan(`crs use ${profileName}`)}`));
            console.log(chalk.dim(`Reuse this remote: ${chalk.cyan(`crs remote install ${result.remoteName} <profile-name>`)}`));
          } else {
            Logger.error(result.message);

            if (result.validation) {
              displayValidation(result.validation);
            }
          }
        } else {
          // Install from saved remote name
          const result = await manager.installRemote(
            source,
            profileName,
            options.description
          );

          spinner.stop();

          if (result.success) {
            Logger.success(result.message);

            if (result.validation) {
              displayValidation(result.validation);
            }

            console.log(chalk.dim(`\nSwitch to profile: ${chalk.cyan(`crs use ${profileName}`)}`));
          } else {
            Logger.error(result.message);

            if (result.validation) {
              displayValidation(result.validation);
            }
          }
        }

      } catch (error: any) {
        spinner.stop();
        Logger.error(`Failed to install: ${error.message}`);
      }
    });
}

/**
 * Display validation results
 */
function displayValidation(validation: any): void {
  if (validation.errors && validation.errors.length > 0) {
    console.log(chalk.red('\n❌ Errors:\n'));
    validation.errors.forEach((err: string) => {
      console.log(`  ${chalk.red('•')} ${err}`);
    });
  }

  if (validation.warnings && validation.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:\n'));
    validation.warnings.forEach((warn: string) => {
      console.log(`  ${chalk.yellow('•')} ${warn}`);
    });
  }

  if (validation.isValid && validation.errors.length === 0) {
    console.log(chalk.green('\n✓ Validation passed'));
  }
}

/**
 * Generate a remote name from URL
 */
function generateRemoteName(url: string): string {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return `${match[1]}-${match[2]}`.toLowerCase();
    }
  } catch {
    // fallback
  }
  return `remote-${Date.now()}`;
}

/**
 * Truncate URL for display
 */
function truncateUrl(url: string, maxLength: number = 47): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
