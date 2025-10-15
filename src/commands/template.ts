import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { TemplateManager } from '../core/template-manager';
import { ToolType } from '../types';

/**
 * Template list command
 */
export async function listTemplates(toolType?: ToolType): Promise<void> {
  const templateManager = new TemplateManager();
  const templates = templateManager.listTemplates(toolType);

  if (templates.length === 0) {
    console.log(chalk.yellow('No templates available'));
    return;
  }

  console.log(
    boxen(chalk.bold.cyan('📦 Available Templates'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    })
  );

  const table = new Table({
    head: [
      chalk.cyan('Tool'),
      chalk.cyan('Name'),
      chalk.cyan('Display Name'),
      chalk.cyan('Description'),
      chalk.cyan('Category'),
    ],
    colWidths: [8, 15, 30, 50, 15],
    wordWrap: true,
  });

  templates.forEach((template) => {
    table.push([
      template.toolType === 'claude' ? '🤖 Claude' : '⚙️  Codex',
      chalk.green(template.name),
      chalk.bold(template.displayName),
      template.description,
      chalk.gray(template.category),
    ]);
  });

  console.log(table.toString());
  console.log();
  console.log(chalk.gray(`Found ${templates.length} template(s)`));
  console.log();
  console.log(chalk.cyan('💡 Usage:'));
  console.log(chalk.gray('  crs template install <template-name> <profile-name>'));
  console.log(chalk.gray('  crs template show <template-name>'));
}

/**
 * Template show command
 */
export async function showTemplate(
  templateName: string,
  toolType: ToolType = 'claude'
): Promise<void> {
  const templateManager = new TemplateManager();
  const template = templateManager.getTemplate(templateName, toolType);

  if (!template) {
    console.log(chalk.red(`✗ Template '${templateName}' not found for ${toolType}`));
    console.log();
    console.log(chalk.cyan('💡 Available templates:'));
    await listTemplates(toolType);
    return;
  }

  const { metadata } = template;

  console.log(
    boxen(
      chalk.bold.cyan(`📦 ${metadata.displayName}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    )
  );

  console.log(chalk.bold('Name:'), chalk.green(metadata.name));
  console.log(chalk.bold('Tool Type:'), metadata.toolType === 'claude' ? '🤖 Claude Code' : '⚙️  Codex');
  console.log(chalk.bold('Category:'), chalk.gray(metadata.category));
  console.log(chalk.bold('Version:'), metadata.version);
  console.log(chalk.bold('Author:'), metadata.author);
  console.log();
  console.log(chalk.bold('Description:'));
  console.log(chalk.white(metadata.description));
  console.log();
  console.log(chalk.bold('Tags:'));
  console.log(metadata.tags.map(tag => chalk.cyan(`#${tag}`)).join(' '));
  console.log();
  console.log(chalk.bold('Created:'), new Date(metadata.createdAt).toLocaleDateString());
  console.log();
  console.log(chalk.cyan('💡 Install this template:'));
  console.log(chalk.gray(`  crs template install ${metadata.name} my-profile`));
}

/**
 * Template install command
 */
export async function installTemplate(
  templateName: string,
  profileName: string,
  options: { tool?: ToolType; description?: string }
): Promise<void> {
  const templateManager = new TemplateManager();
  
  // Auto-detect tool type if not specified
  let toolType = options.tool;
  if (!toolType) {
    // Try to find the template in both claude and codex
    const claudeTemplate = templateManager.getTemplate(templateName, 'claude');
    const codexTemplate = templateManager.getTemplate(templateName, 'codex');
    
    if (claudeTemplate) {
      toolType = 'claude';
    } else if (codexTemplate) {
      toolType = 'codex';
    } else {
      console.log(chalk.red(`✖ Template '${templateName}' not found`));
      console.log();
      console.log(chalk.cyan('💡 Available templates:'));
      await listTemplates();
      return;
    }
  }

  const result = await templateManager.installTemplate(
    templateName,
    profileName,
    toolType,
    options.description
  );

  if (result.success) {
    console.log();
    console.log(
      boxen(
        chalk.green.bold('✓ Template Installed Successfully'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );
    console.log(chalk.bold('Profile:'), chalk.green(profileName));
    console.log(chalk.bold('Template:'), chalk.cyan(templateName));
    console.log(chalk.bold('Tool:'), toolType === 'claude' ? '🤖 Claude Code' : '⚙️  Codex');
    console.log();
    console.log(chalk.cyan('💡 Next steps:'));
    console.log(chalk.gray(`  crs use ${profileName} ${toolType !== 'claude' ? `--tool ${toolType}` : ''}`));
  } else {
    console.log(chalk.red(`✗ Failed to install template: ${result.message}`));
  }
}

/**
 * Interactive template installation
 */
export async function interactiveTemplateInstall(toolType?: ToolType): Promise<void> {
  const templateManager = new TemplateManager();

  // Step 1: Select tool type if not specified
  let selectedToolType = toolType;
  if (!selectedToolType) {
    const toolAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'tool',
        message: 'Select tool type:',
        choices: [
          { name: '🤖 Claude Code', value: 'claude' },
          { name: '⚙️  Codex', value: 'codex' },
        ],
      },
    ]);
    selectedToolType = toolAnswer.tool;
  }

  // Step 2: List and select template
  const templates = templateManager.listTemplates(selectedToolType);

  if (templates.length === 0) {
    console.log(chalk.yellow(`No templates available for ${selectedToolType}`));
    return;
  }

  const templateChoices = templates.map((t) => ({
    name: `${t.displayName} - ${chalk.gray(t.description.substring(0, 60))}`,
    value: t.name,
  }));

  const templateAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: templateChoices,
      pageSize: 10,
    },
  ]);

  // Step 3: Enter profile name
  const profileAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter profile name:',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Profile name cannot be empty';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return 'Profile name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    },
  ]);

  // Step 4: Enter description (optional)
  const descAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Enter description (optional):',
    },
  ]);

  // Step 5: Install template
  await installTemplate(templateAnswer.template, profileAnswer.name, {
    tool: selectedToolType,
    description: descAnswer.description,
  });
}

/**
 * Register template commands
 */
export function registerTemplateCommands(program: Command): void {
  const template = program
    .command('template')
    .alias('tpl')
    .description('Manage configuration templates');

  // List templates
  template
    .command('list')
    .alias('ls')
    .description('List all available templates')
    .option('-t, --tool <type>', 'Tool type (claude or codex)')
    .action(async (options) => {
      await listTemplates(options.tool as ToolType);
    });

  // Show template details
  template
    .command('show <name>')
    .description('Show template details')
    .option('-t, --tool <type>', 'Tool type (claude or codex)', 'claude')
    .action(async (name, options) => {
      await showTemplate(name, options.tool as ToolType);
    });

  // Install template
  template
    .command('install <template-name> <profile-name>')
    .description('Install a template as a new profile')
    .option('-t, --tool <type>', 'Tool type (claude or codex)')
    .option('-d, --description <desc>', 'Profile description')
    .action(async (templateName, profileName, options) => {
      await installTemplate(templateName, profileName, {
        tool: options.tool as ToolType,
        description: options.description,
      });
    });

  // Interactive install
  template
    .command('install-interactive')
    .alias('i')
    .description('Install a template interactively')
    .option('-t, --tool <type>', 'Tool type (claude or codex)')
    .action(async (options) => {
      await interactiveTemplateInstall(options.tool as ToolType);
    });
}
