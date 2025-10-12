import Table from 'cli-table3';
import chalk from 'chalk';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * List all profiles
 */
export async function listProfiles(): Promise<void> {
  const manager = new ProfileManager();
  await manager.initialize();

  const profiles = await manager.listProfiles();

  if (profiles.length === 0) {
    Logger.warning('No profiles found');
    Logger.info('Create a new profile with: crs create <name>');
    return;
  }

  Logger.header('Available Profiles');
  Logger.newLine();

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Files'),
      chalk.cyan('Created'),
      chalk.cyan('Last Used'),
      chalk.cyan('Status'),
    ],
    colWidths: [20, 30, 8, 12, 12, 10],
    wordWrap: true,
  });

  for (const profile of profiles) {
    const status = profile.isCurrent ? chalk.green('● Current') : '';
    const createdDate = new Date(profile.createdAt).toLocaleDateString();
    const lastUsedDate = profile.lastUsed
      ? new Date(profile.lastUsed).toLocaleDateString()
      : '-';

    table.push([
      profile.isCurrent ? chalk.green.bold(profile.name) : profile.name,
      profile.description,
      profile.fileCount.toString(),
      createdDate,
      lastUsedDate,
      status,
    ]);
  }

  console.log(table.toString());
  Logger.newLine();

  const currentProfile = profiles.find((p) => p.isCurrent);
  if (currentProfile) {
    Logger.info(`Current profile: ${chalk.green.bold(currentProfile.name)}`);
  } else {
    Logger.warning('No profile is currently active');
  }
}
