import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Switch to a profile
 */
export async function useProfile(name: string, toolType: ToolType = 'claude'): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  // Check if profile exists
  const profileExists = await manager.profileExists(name);
  if (!profileExists) {
    const toolLabel = toolType === 'claude' ? 'Claude Code' : 'Codex';
    Logger.error(`${toolLabel} profile "${name}" not found`);
    Logger.info(`Available ${toolType} profiles:`);
    const profiles = await manager.listProfiles();
    profiles.forEach((p) => {
      Logger.log(`  - ${p.name}`);
    });
    return;
  }

  // Check if already current
  const currentProfile = await manager.getCurrentProfile();
  if (currentProfile === name) {
    Logger.warning(`Profile "${name}" is already active`);
    return;
  }

  // Switch profile with spinner
  const spinner = ora(`Switching to profile "${name}"...`).start();

  const result = await manager.switchToProfile(name);

  if (result.success) {
    spinner.succeed(chalk.green(`Switched to profile "${name}"`));
    console.log();
    console.log(
      boxen(
        chalk.green.bold('✓ Profile Switched Successfully'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );
    
    const toolLabel = toolType === 'claude' ? '🤖 Claude Code' : '⚙️  Codex';
    const configPath = toolType === 'claude' ? '~/.claude' : '~/.codex';
    
    console.log(chalk.bold('Profile:'), chalk.green(name));
    console.log(chalk.bold('Tool:'), toolLabel);
    console.log(chalk.bold('Config Path:'), chalk.cyan(configPath));
    console.log();
    console.log(chalk.green('✓'), 'Your configuration has been updated');
    console.log(chalk.green('✓'), 'Previous configuration backed up automatically');
    console.log();
    console.log(chalk.cyan('💡 Other commands:'));
    console.log(chalk.gray('  crs list              # View all profiles'));
    console.log(chalk.gray('  crs backup            # View backup history'));
    console.log(chalk.gray('  crs restore           # Restore from backup'));
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
