import ora from 'ora';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Create an empty profile
 */
export async function createProfile(
  name: string,
  description?: string,
  toolType: ToolType = 'claude'
): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  // Check if profile already exists
  const exists = await manager.profileExists(name);
  if (exists) {
    Logger.error(`Profile "${name}" already exists`);
    Logger.info('Use a different name or delete the existing profile first');
    return;
  }

  const toolLabel = toolType === 'claude' ? 'Claude Code' : 'Codex';
  const spinner = ora(`Creating empty ${toolLabel} profile "${name}"...`).start();

  const result = await manager.createEmpty(name, description || 'No description');

  if (result.success) {
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.success(`Empty ${toolLabel} profile has been created`);
    Logger.info(`You can manually add files to the profile directory`);
    Logger.info(`Switch to it with: crs use ${name} --tool ${toolType}`);
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
