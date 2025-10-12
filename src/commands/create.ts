import ora from 'ora';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Create an empty profile
 */
export async function createProfile(
  name: string,
  description?: string
): Promise<void> {
  const manager = new ProfileManager();
  await manager.initialize();

  // Check if profile already exists
  const exists = await manager.profileExists(name);
  if (exists) {
    Logger.error(`Profile "${name}" already exists`);
    Logger.info('Use a different name or delete the existing profile first');
    return;
  }

  const spinner = ora(`Creating empty profile "${name}"...`).start();

  const result = await manager.createEmpty(name, description || 'No description');

  if (result.success) {
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.success('Empty profile has been created');
    Logger.info(`You can manually add files to the profile directory`);
    Logger.info(`Switch to it with: crs use ${name}`);
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
