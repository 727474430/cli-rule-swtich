import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ToolType, Template, TemplateMetadata, TemplateListItem } from '../types';
import { ProfileManager } from './profile-manager';
import { getConfigPaths } from './config';

/**
 * Template Manager - Handles template operations
 */
export class TemplateManager {
  private templateBaseDir: string;
  private profileManager: ProfileManager;

  constructor(projectRoot?: string) {
    // Templates are stored in the package installation directory
    this.templateBaseDir = projectRoot 
      ? path.join(projectRoot, 'templates')
      : path.join(__dirname, '..', '..', 'templates');
    
    // Default to claude, will be overridden when installing template
    this.profileManager = new ProfileManager('claude');
  }

  /**
   * Get template directory path for a specific tool
   */
  private getTemplateToolDir(toolType: ToolType): string {
    return path.join(this.templateBaseDir, toolType);
  }

  /**
   * Get template path
   */
  getTemplatePath(name: string, toolType: ToolType): string {
    return path.join(this.getTemplateToolDir(toolType), name);
  }

  /**
   * Check if template exists
   */
  templateExists(name: string, toolType: ToolType): boolean {
    const templatePath = this.getTemplatePath(name, toolType);
    return fs.existsSync(templatePath);
  }

  /**
   * Load template metadata
   */
  private loadTemplateMetadata(templatePath: string): TemplateMetadata | null {
    const metadataPath = path.join(templatePath, 'template.json');
    
    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    try {
      const metadata = fs.readJsonSync(metadataPath);
      return metadata as TemplateMetadata;
    } catch (error) {
      console.error(chalk.red(`Failed to load template metadata: ${metadataPath}`));
      return null;
    }
  }

  /**
   * Validate template structure
   */
  validateTemplate(templatePath: string, toolType: ToolType): boolean {
    // Check if directory exists
    if (!fs.existsSync(templatePath)) {
      return false;
    }

    // Check if template.json exists
    const metadataPath = path.join(templatePath, 'template.json');
    if (!fs.existsSync(metadataPath)) {
      return false;
    }

    // Check tool-specific required files
    if (toolType === 'claude') {
      // Claude requires CLAUDE.md
      const claudeMdPath = path.join(templatePath, 'CLAUDE.md');
      return fs.existsSync(claudeMdPath);
    } else if (toolType === 'codex') {
      // Codex requires AGENTS.md
      const agentsMdPath = path.join(templatePath, 'AGENTS.md');
      return fs.existsSync(agentsMdPath);
    }

    return false;
  }

  /**
   * List all available templates
   */
  listTemplates(toolType?: ToolType): TemplateListItem[] {
    const templates: TemplateListItem[] = [];
    const toolTypes: ToolType[] = toolType ? [toolType] : ['claude', 'codex'];

    for (const tool of toolTypes) {
      const toolDir = this.getTemplateToolDir(tool);
      
      if (!fs.existsSync(toolDir)) {
        continue;
      }

      const templateDirs = fs.readdirSync(toolDir).filter(dir => {
        const dirPath = path.join(toolDir, dir);
        return fs.statSync(dirPath).isDirectory();
      });

      for (const templateName of templateDirs) {
        const templatePath = path.join(toolDir, templateName);
        const metadata = this.loadTemplateMetadata(templatePath);

        if (metadata && this.validateTemplate(templatePath, tool)) {
          templates.push({
            name: metadata.name,
            displayName: metadata.displayName,
            description: metadata.description,
            toolType: metadata.toolType,
            category: metadata.category,
            tags: metadata.tags,
          });
        }
      }
    }

    return templates;
  }

  /**
   * Get template details
   */
  getTemplate(name: string, toolType: ToolType): Template | null {
    const templatePath = this.getTemplatePath(name, toolType);
    
    if (!this.validateTemplate(templatePath, toolType)) {
      return null;
    }

    const metadata = this.loadTemplateMetadata(templatePath);
    if (!metadata) {
      return null;
    }

    return {
      metadata,
      path: templatePath,
    };
  }

  /**
   * Install template as a new profile
   */
  async installTemplate(
    templateName: string,
    profileName: string,
    toolType: ToolType,
    description?: string
  ): Promise<{ success: boolean; message: string }> {
    const spinner = ora('Installing template...').start();

    try {
      // Check if template exists
      const template = this.getTemplate(templateName, toolType);
      if (!template) {
        spinner.fail(chalk.red(`Template '${templateName}' not found for ${toolType}`));
        return { success: false, message: 'Template not found' };
      }

      // Create a profile manager instance for the specific tool type
      const profileManager = new ProfileManager(toolType);
      
      // Check if profile already exists
      if (await profileManager.profileExists(profileName)) {
        spinner.fail(chalk.red(`Profile '${profileName}' already exists`));
        return { success: false, message: 'Profile already exists' };
      }

      // Get profile directory path
      const paths = getConfigPaths(toolType);
      const profilePath = path.join(paths.profilesDir, profileName);
      fs.ensureDirSync(profilePath);

      // Copy template files to profile directory
      // Exclude template.json, as we'll create a profile.json instead
      const templateFiles = fs.readdirSync(template.path);
      
      for (const file of templateFiles) {
        if (file === 'template.json') {
          continue; // Skip template metadata
        }

        const sourcePath = path.join(template.path, file);
        const destPath = path.join(profilePath, file);
        
        fs.copySync(sourcePath, destPath);
      }

      // Create profile metadata
      const profileMetadata = {
        name: profileName,
        description: description || template.metadata.description,
        toolType: toolType,
        createdAt: new Date().toISOString(),
      };

      fs.writeJsonSync(
        path.join(profilePath, 'profile.json'),
        profileMetadata,
        { spaces: 2 }
      );

      spinner.succeed(
        chalk.green(
          `Template '${template.metadata.displayName}' installed as profile '${profileName}'`
        )
      );

      return { success: true, message: 'Template installed successfully' };
    } catch (error) {
      spinner.fail(chalk.red('Failed to install template'));
      console.error(error);
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Get templates directory (for checking if templates exist)
   */
  getTemplatesDir(): string {
    return this.templateBaseDir;
  }

  /**
   * Check if any templates are available
   */
  hasTemplates(toolType?: ToolType): boolean {
    const templates = this.listTemplates(toolType);
    return templates.length > 0;
  }
}
