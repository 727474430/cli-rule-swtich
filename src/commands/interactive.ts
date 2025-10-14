import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { ToolType, ProfileMetadata } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';
import { useProfile } from './use';
import { saveProfile } from './save';
import { createProfile } from './create';
import { deleteProfile } from './delete';
import { listProfiles } from './list';
import { listBackups, restoreBackup } from './restore';
import { listTemplates, interactiveTemplateInstall } from './template';

/**
 * Interactive mode
 */
export async function interactiveMode(toolType: ToolType = 'claude'): Promise<void> {
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  // Check if default profile was just created
  const profiles = await manager.listProfiles();
  const hasDefaultProfile = profiles.some((p) => p.name === 'default');

  Logger.box(
    chalk.bold('CRS - CLI Rule Switch') +
      '\n\n' +
      'Manage and switch between multiple Claude Code and Codex configurations',
    '🔄 Welcome'
  );

  // Show info about default profile if it exists and is the only one
  if (hasDefaultProfile && profiles.length === 1) {
    const targetDir = toolType === 'claude' ? '~/.claude' : '~/.codex';
    Logger.info(
      `A default profile has been created from your current ${targetDir} configuration`
    );
    Logger.newLine();
  }

  while (true) {
    // Get profiles from all tools for switch/delete operations
    const claudeManager = new ProfileManager('claude');
    const codexManager = new ProfileManager('codex');
    await claudeManager.initialize();
    await codexManager.initialize();
    
    const claudeProfiles = await claudeManager.listProfiles();
    const codexProfiles = await codexManager.listProfiles();
    const allProfiles = [...claudeProfiles, ...codexProfiles];
    
    const currentProfile = await manager.getCurrentProfile();

    const choices = [
      new inquirer.Separator(chalk.cyan('─── Profile Management ───')),
      { name: '📋 List all profiles', value: 'list' },
      { name: '🔄 Switch profile', value: 'use' },
      { name: '💾 Save current config as new profile', value: 'save' },
      { name: '➕ Create empty profile', value: 'create' },
      { name: '🗑️  Delete profile', value: 'delete' },
      new inquirer.Separator(),
      { name: '📜 List templates', value: 'templates' },
      { name: '📦 Install from template', value: 'template-install' },
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
        loop: false,
      },
    ]);

    Logger.newLine();

    switch (action) {
      case 'list':
        // Show all tools in list view
        await listProfiles();
        break;

      case 'use':
        await handleUseProfile(allProfiles);
        break;

      case 'save':
        await handleSaveProfile(toolType);
        break;

      case 'create':
        await handleCreateProfile(toolType);
        break;

      case 'delete':
        await handleDeleteProfile(allProfiles);
        break;

      case 'templates':
        await listTemplates();
        break;

      case 'template-install':
        await interactiveTemplateInstall();
        break;

      case 'backups':
        await listBackups();
        break;

      case 'restore':
        await restoreBackup();
        break;

      case 'exit':
        Logger.success('Goodbye!');
        return;
    }

    Logger.newLine();
  }
}

/**
 * Sort profiles: default first, then by name, grouped by tool type
 */
function sortProfilesByToolAndDefault(profiles: ProfileMetadata[]): ProfileMetadata[] {
  return profiles.sort((a, b) => {
    // First, sort by tool type (claude before codex)
    if (a.toolType !== b.toolType) {
      return a.toolType === 'claude' ? -1 : 1;
    }
    
    // Within same tool type, default comes first
    if (a.name === 'default' && b.name !== 'default') return -1;
    if (a.name !== 'default' && b.name === 'default') return 1;
    
    // Otherwise sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Handle use profile
 */
async function handleUseProfile(
  profiles: ProfileMetadata[]
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

  // Sort profiles
  const sortedProfiles = sortProfilesByToolAndDefault(profiles);

  // Display profiles in table format
  Logger.header('Available Profiles');
  Logger.newLine();

  const table = new Table({
    colWidths: [5, 8, 18, 35, 12],
    wordWrap: true,
  });

  let lastToolType: string | null = null;
  
  sortedProfiles.forEach((profile, index) => {
    // Add group header and column headers for each tool type
    if (lastToolType !== profile.toolType) {
      const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
      const separator = chalk.gray('─'.repeat(20));
      
      // Add group title
      table.push([
        { colSpan: 5, content: `${separator} ${toolLabel} ${separator}` }
      ]);
      
      // Add column headers
      table.push([
        chalk.cyan('#'),
        chalk.cyan('Tool'),
        chalk.cyan('Name'),
        chalk.cyan('Description'),
        chalk.cyan('Status'),
      ]);
    }
    lastToolType = profile.toolType;
    
    const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
    const status = profile.isCurrent ? chalk.green('● Current') : '';
    const nameDisplay = profile.isCurrent ? chalk.gray(profile.name) : profile.name;
    const descDisplay = profile.isCurrent ? chalk.gray(profile.description) : profile.description;
    
    table.push([
      profile.isCurrent ? chalk.gray((index + 1).toString()) : (index + 1).toString(),
      profile.isCurrent ? chalk.gray(toolLabel) : toolLabel,
      nameDisplay,
      descDisplay,
      status,
    ]);
  });

  console.log(table.toString());
  Logger.newLine();

  try {
    const { selection } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selection',
        message: `Enter profile number or name ${chalk.gray('(Enter to cancel)')}: `,
        validate: (input: string) => {
          if (!input.trim()) {
            return true; // Allow empty to cancel
          }
          
          // Check if it's a number
          const num = parseInt(input);
          if (!isNaN(num)) {
            if (num < 1 || num > sortedProfiles.length) {
              return `Please enter a number between 1 and ${sortedProfiles.length}`;
            }
            const profile = sortedProfiles[num - 1];
            if (profile.isCurrent) {
              return 'This profile is already active. Please select another one.';
            }
            return true;
          }
          
          // Check if it's a profile name
          const profile = sortedProfiles.find(p => p.name === input.trim());
          if (!profile) {
            return `Profile "${input}" not found`;
          }
          if (profile.isCurrent) {
            return 'This profile is already active. Please select another one.';
          }
          return true;
        },
      },
    ]);

    if (!selection.trim()) {
      Logger.info('↩️  Returning to main menu...');
      return;
    }

    // Determine the profile
    let selectedProfile: ProfileMetadata | undefined;
    const num = parseInt(selection);
    if (!isNaN(num)) {
      selectedProfile = sortedProfiles[num - 1];
    } else {
      selectedProfile = sortedProfiles.find(p => p.name === selection.trim());
    }

    if (!selectedProfile) {
      Logger.error('Profile not found');
      return;
    }

    const profileToolType = selectedProfile.toolType || 'claude';
    
    Logger.newLine();
    await useProfile(selectedProfile.name, profileToolType);
  } catch (error) {
    // User cancelled
    Logger.newLine();
    Logger.info('↩️  Cancelled.');
    return;
  }
}

/**
 * Handle save profile
 */
async function handleSaveProfile(toolType: ToolType): Promise<void> {
  try {
    const { tool, name, description } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tool',
        message: 'Select tool type:',
        choices: [
          { name: chalk.blue('Claude Code'), value: 'claude' },
          { name: chalk.magenta('Codex'), value: 'codex' },
        ],
        default: toolType,
        loop: false,
      },
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
    await saveProfile(name, description, tool as ToolType);
  } catch (error) {
    // User cancelled
    Logger.newLine();
    Logger.info('↩️  Cancelled.');
    return;
  }
}

/**
 * Handle create profile
 */
async function handleCreateProfile(toolType: ToolType): Promise<void> {
  try {
    const { tool, name, description } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tool',
        message: 'Select tool type:',
        choices: [
          { name: chalk.blue('Claude Code'), value: 'claude' },
          { name: chalk.magenta('Codex'), value: 'codex' },
        ],
        default: toolType,
        loop: false,
      },
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
    await createProfile(name, description, tool as ToolType);
  } catch (error) {
    // User cancelled
    Logger.newLine();
    Logger.info('↩️  Cancelled.');
    return;
  }
}

/**
 * Handle delete profile
 */
async function handleDeleteProfile(
  profiles: ProfileMetadata[]
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

  // Sort deletable profiles
  const sortedDeletableProfiles = sortProfilesByToolAndDefault(deletableProfiles);

  // Display deletable profiles in table format
  Logger.header('Deletable Profiles');
  Logger.newLine();

  const table = new Table({
    colWidths: [5, 8, 18, 43],
    wordWrap: true,
  });

  let lastToolType: string | null = null;
  
  sortedDeletableProfiles.forEach((profile, index) => {
    // Add group header and column headers for each tool type
    if (lastToolType !== profile.toolType) {
      const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
      const separator = chalk.gray('─'.repeat(20));
      
      // Add group title
      table.push([
        { colSpan: 4, content: `${separator} ${toolLabel} ${separator}` }
      ]);
      
      // Add column headers
      table.push([
        chalk.cyan('#'),
        chalk.cyan('Tool'),
        chalk.cyan('Name'),
        chalk.cyan('Description'),
      ]);
    }
    lastToolType = profile.toolType;
    
    const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
    
    table.push([
      (index + 1).toString(),
      toolLabel,
      profile.name,
      profile.description,
    ]);
  });

  console.log(table.toString());
  Logger.newLine();

  try {
    const { selection } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selection',
        message: `Enter profile number or name to delete ${chalk.gray('(Enter to cancel)')}: `,
        validate: (input: string) => {
          if (!input.trim()) {
            return true; // Allow empty to cancel
          }
          
          // Check if it's a number
          const num = parseInt(input);
          if (!isNaN(num)) {
            if (num < 1 || num > sortedDeletableProfiles.length) {
              return `Please enter a number between 1 and ${sortedDeletableProfiles.length}`;
            }
            return true;
          }
          
          // Check if it's a profile name
          const profile = sortedDeletableProfiles.find(p => p.name === input.trim());
          if (!profile) {
            return `Profile "${input}" not found in deletable profiles`;
          }
          return true;
        },
      },
    ]);

    if (!selection.trim()) {
      Logger.info('↩️  Returning to main menu...');
      return;
    }

    // Determine the profile
    let selectedProfile: ProfileMetadata | undefined;
    const num = parseInt(selection);
    if (!isNaN(num)) {
      selectedProfile = sortedDeletableProfiles[num - 1];
    } else {
      selectedProfile = sortedDeletableProfiles.find(p => p.name === selection.trim());
    }

    if (!selectedProfile) {
      Logger.error('Profile not found');
      return;
    }

    const profileToolType = selectedProfile.toolType || 'claude';
    
    Logger.newLine();
    await deleteProfile(selectedProfile.name, profileToolType);
  } catch (error) {
    // User cancelled
    Logger.newLine();
    Logger.info('↩️  Cancelled.');
    return;
  }
}
