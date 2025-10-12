import ora from 'ora';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Switch to a profile
 */
export async function useProfile(name: string): Promise<void> {
  const manager = new ProfileManager();
  await manager.initialize();

  // Check if profile exists
  const profileExists = await manager.profileExists(name);
  if (!profileExists) {
    Logger.error(`Profile "${name}" not found`);
    Logger.info('Available profiles:');
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
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.box(
      `Profile "${name}" is now active!\n\nYour Claude configuration has been updated.`,
      'Success'
    );
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
