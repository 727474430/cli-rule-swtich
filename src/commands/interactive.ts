import inquirer from 'inquirer';
import chalk from 'chalk';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';
import { useProfile } from './use';
import { saveProfile } from './save';
import { createProfile } from './create';
import { deleteProfile } from './delete';
import { listProfiles } from './list';
import { listBackups, restoreBackup } from './restore';

/**
 * Interactive mode
 */
export async function interactiveMode(toolType: ToolType = 'claude'): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  // Check if default profile was just created
  const profiles = await manager.listProfiles();
  const hasDefaultProfile = profiles.some((p) => p.name === 'default');

  const toolLabel = toolType === 'claude' ? 'Claude Code' : 'Codex';
  const targetDir = toolType === 'claude' ? '~/.claude' : '~/.codex';
  
  Logger.box(
    chalk.bold(`${toolLabel} Profile Switcher`) +
      '\n\n' +
      `Manage and switch between multiple ${toolLabel} configurations`,
    '🔄 Welcome'
  );

  // Show info about default profile if it exists and is the only one
  if (hasDefaultProfile && profiles.length === 1) {
    Logger.info(
      `A default profile has been created from your current ${targetDir} configuration`
    );
    Logger.newLine();
  }

  while (true) {
    const profiles = await manager.listProfiles();
    const currentProfile = await manager.getCurrentProfile();

    const choices = [
      { name: '📋 List all profiles', value: 'list' },
      { name: '🔄 Switch profile', value: 'use' },
      { name: '💾 Save current config as new profile', value: 'save' },
      { name: '➕ Create empty profile', value: 'create' },
      { name: '🗑️  Delete profile', value: 'delete' },
      new inquirer.Separator(),
      { name: '📦 List backups', value: 'backups' },
      { name: '♻️  Restore backup', value: 'restore' },
      new inquirer.Separator(),
      { name: '❌ Exit', value: 'exit' },
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: currentProfile
          ? `Current profile: ${chalk.green.bold(currentProfile)} - What do you want to do?`
          : 'What do you want to do?',
        choices,
      },
    ]);

    Logger.newLine();

    switch (action) {
      case 'list':
        // Show all tools in list view
        await listProfiles();
        break;

      case 'use':
        await handleUseProfile(profiles, toolType);
        break;

      case 'save':
        await handleSaveProfile(toolType);
        break;

      case 'create':
        await handleCreateProfile(toolType);
        break;

      case 'delete':
        await handleDeleteProfile(profiles, toolType);
        break;

      case 'backups':
        await listBackups(toolType);
        break;

      case 'restore':
        await restoreBackup(undefined, toolType);
        break;

      case 'exit':
        Logger.success('Goodbye!');
        return;
    }

    Logger.newLine();
  }
}

/**
 * Handle use profile
 */
async function handleUseProfile(
  profiles: Array<{ name: string; description: string; isCurrent: boolean }>,
  toolType: ToolType
): Promise<void> {
  if (profiles.length === 0) {
    Logger.warning('No profiles available');
    Logger.info('Create a new profile first');
    return;
  }

  // Check if there are any profiles that can be switched to
  const availableProfiles = profiles.filter((p) => !p.isCurrent);
  if (availableProfiles.length === 0) {
    Logger.warning('No other profiles to switch to');
    Logger.info('All profiles are either current or unavailable');
    return;
  }

  const choices = profiles.map((p) => ({
    name: p.isCurrent
      ? `${chalk.green('● ')}${chalk.green.bold(p.name)} - ${p.description} ${chalk.gray('(current)')}`
      : `  ${p.name} - ${p.description}`,
    value: p.name,
    disabled: p.isCurrent ? 'Already active' : false,
  }));

  try {
    const { profileName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'profileName',
        message: 'Select a profile to switch to:',
        choices,
      },
    ]);

    if (!profileName) {
      Logger.info('↩️  Returning to main menu...');
      return;
    }

    Logger.newLine();
    await useProfile(profileName, toolType);
  } catch (error) {
    // User cancelled (Ctrl+C or ESC)
    Logger.newLine();
    Logger.info('↩️  Returning to main menu...');
  }
}

/**
 * Handle save profile
 */
async function handleSaveProfile(toolType: ToolType): Promise<void> {
  try {
    const { name, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter profile name:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Profile name is required';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Profile name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter profile description (optional):',
        default: 'No description',
      },
    ]);

    Logger.newLine();
    await saveProfile(name, description, toolType);
  } catch (error) {
    // User cancelled (Ctrl+C or ESC)
    Logger.newLine();
    Logger.info('↩️  Returning to main menu...');
  }
}

/**
 * Handle create profile
 */
async function handleCreateProfile(toolType: ToolType): Promise<void> {
  try {
    const { name, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter profile name:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Profile name is required';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Profile name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter profile description (optional):',
        default: 'No description',
      },
    ]);

    Logger.newLine();
    await createProfile(name, description, toolType);
  } catch (error) {
    // User cancelled (Ctrl+C or ESC)
    Logger.newLine();
    Logger.info('↩️  Returning to main menu...');
  }
}

/**
 * Handle delete profile
 */
async function handleDeleteProfile(
  profiles: Array<{ name: string; description: string; isCurrent: boolean }>,
  toolType: ToolType
): Promise<void> {
  if (profiles.length === 0) {
    Logger.warning('No profiles available');
    return;
  }

  const deletableProfiles = profiles.filter((p) => !p.isCurrent);

  if (deletableProfiles.length === 0) {
    Logger.warning('No profiles can be deleted');
    Logger.info('Cannot delete the current profile');
    return;
  }

  const choices = deletableProfiles.map((p) => ({
    name: `${p.name} - ${p.description}`,
    value: p.name,
  }));

  try {
    const { profileName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'profileName',
        message: 'Select a profile to delete:',
        choices,
      },
    ]);

    if (!profileName) {
      Logger.info('↩️  Returning to main menu...');
      return;
    }

    Logger.newLine();
    await deleteProfile(profileName, toolType);
  } catch (error) {
    // User cancelled (Ctrl+C or ESC)
    Logger.newLine();
    Logger.info('↩️  Returning to main menu...');
  }
}
