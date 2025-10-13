import Table from 'cli-table3';
import chalk from 'chalk';
import { ToolType } from '../types';
import { ProfileManager } from '../core/profile-manager';
import { Logger } from '../utils/logger';

/**
 * List all profiles
 * If toolType is undefined, list profiles from all tools
 */
export async function listProfiles(toolType?: ToolType): Promise<void> {
  // If no toolType specified, list all tools
  if (!toolType) {
    await listAllToolsProfiles();
    return;
  }

  // List specific tool profiles
  const manager = new ProfileManager(toolType);
  await manager.initialize();

  const profiles = await manager.listProfiles();

  if (profiles.length === 0) {
    Logger.warning(`No ${toolType} profiles found`);
    Logger.info(`Create a new profile with: crs create <name> --tool ${toolType}`);
    return;
  }

  const toolLabel = toolType === 'claude' ? 'Claude Code' : 'Codex';
  Logger.header(`Available ${toolLabel} Profiles`);
  Logger.newLine();

  const table = new Table({
    head: [
      chalk.cyan('Tool'),
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Created'),
      chalk.cyan('Status'),
    ],
    colWidths: [8, 18, 30, 20, 12],
    wordWrap: true,
  });

  for (const profile of profiles) {
    const status = profile.isCurrent ? chalk.green('● Current') : '';
    
    // Format tool type
    const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
    
    // Format date as yyyy-MM-dd HH:mm:ss
    const createdDate = new Date(profile.createdAt);
    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, '0');
    const day = String(createdDate.getDate()).padStart(2, '0');
    const hours = String(createdDate.getHours()).padStart(2, '0');
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const seconds = String(createdDate.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    table.push([
      toolLabel,
      profile.isCurrent ? chalk.green.bold(profile.name) : profile.name,
      profile.description,
      formattedDate,
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

/**
 * List profiles from all tools (Claude and Codex)
 */
async function listAllToolsProfiles(): Promise<void> {
  const claudeManager = new ProfileManager('claude');
  const codexManager = new ProfileManager('codex');
  
  await claudeManager.initialize();
  await codexManager.initialize();

  const claudeProfiles = await claudeManager.listProfiles();
  const codexProfiles = await codexManager.listProfiles();

  const allProfiles = [...claudeProfiles, ...codexProfiles];

  if (allProfiles.length === 0) {
    Logger.warning('No profiles found');
    Logger.info('Create a new profile with: crs create <name>');
    return;
  }

  Logger.header('Available Profiles (All Tools)');
  Logger.newLine();

  const table = new Table({
    head: [
      chalk.cyan('Tool'),
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Created'),
      chalk.cyan('Status'),
    ],
    colWidths: [8, 18, 30, 20, 12],
    wordWrap: true,
  });

  for (const profile of allProfiles) {
    const status = profile.isCurrent ? chalk.green('● Current') : '';
    
    // Format tool type
    const toolLabel = profile.toolType === 'claude' ? chalk.blue('Claude') : chalk.magenta('Codex');
    
    // Format date as yyyy-MM-dd HH:mm:ss
    const createdDate = new Date(profile.createdAt);
    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, '0');
    const day = String(createdDate.getDate()).padStart(2, '0');
    const hours = String(createdDate.getHours()).padStart(2, '0');
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const seconds = String(createdDate.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    table.push([
      toolLabel,
      profile.isCurrent ? chalk.green.bold(profile.name) : profile.name,
      profile.description,
      formattedDate,
      status,
    ]);
  }

  console.log(table.toString());
  Logger.newLine();

  const claudeCurrent = claudeProfiles.find((p) => p.isCurrent);
  const codexCurrent = codexProfiles.find((p) => p.isCurrent);

  if (claudeCurrent || codexCurrent) {
    Logger.info('Current profiles:');
    if (claudeCurrent) {
      Logger.info(`  Claude: ${chalk.green.bold(claudeCurrent.name)}`);
    }
    if (codexCurrent) {
      Logger.info(`  Codex: ${chalk.magenta.bold(codexCurrent.name)}`);
    }
  } else {
    Logger.warning('No profiles are currently active');
  }
}
