import ora from 'ora';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * Save current configuration as a profile
 */
export async function saveProfile(
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
  const spinner = ora(`Saving current ${toolLabel} configuration as "${name}"...`).start();

  const result = await manager.createFromCurrent(
    name,
    description || 'No description'
  );

  if (result.success) {
    spinner.succeed(result.message);
    Logger.newLine();
    Logger.success(`Current ${toolLabel} configuration has been saved`);
    Logger.info(`Switch to it anytime with: crs use ${name} --tool ${toolType}`);
  } else {
    spinner.fail(result.message);
    if (result.error) {
      Logger.error(result.error.message);
    }
  }
}
