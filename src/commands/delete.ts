import inquirer from 'inquirer';
import ora from 'ora';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Delete a profile
 */
export async function deleteProfile(name: string): Promise<void> {
  const manager = new ProfileManager();
  await manager.initialize();

  // Check if profile exists
  const exists = await manager.profileExists(name);
  if (!exists) {
    Logger.error(`Profile "${name}" not found`);
    return;
  }

  // Confirm deletion
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete profile "${name}"?`,
      default: false,
    },
  ]);

  if (!confirm) {
    Logger.info('Deletion cancelled');
    return;
  }

  const spinner = ora(`Deleting profile "${name}"...`).start();

  const result = await manager.deleteProfile(name);

  if (result.success) {
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.success('Profile has been deleted');
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
