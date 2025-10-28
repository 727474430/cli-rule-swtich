import { Router, Request, Response } from 'express';
import { ProfileManager } from '../core/profile-manager';
import { TemplateManager } from '../core/template-manager';
import { RemoteManager } from '../core/remote-manager';
import { ToolType } from '../types';
import { Logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/profiles - 获取所有 profiles 列表
 */
router.get('/profiles', async (req: Request, res: Response) => {
  try {
    const toolType = (req.query.toolType as ToolType) || 'claude';
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const profiles = await manager.listProfiles();
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    Logger.error(`获取 profiles 列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/profiles/current - 获取当前激活的 profile
 */
router.get('/profiles/current', async (req: Request, res: Response) => {
  try {
    const toolType = (req.query.toolType as ToolType) || 'claude';
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const currentProfile = await manager.getCurrentProfile();
    
    res.json({
      success: true,
      data: {
        name: currentProfile,
        toolType
      }
    });
  } catch (error) {
    Logger.error(`获取当前 profile 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * POST /api/profiles - 创建新 profile
 * Body: { name, description, toolType, fromCurrent }
 */
router.post('/profiles', async (req: Request, res: Response) => {
  try {
    const { name, description, toolType = 'claude', fromCurrent = true } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Profile 名称不能为空'
      });
    }
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    // 检查 profile 是否已存在
    const exists = await manager.profileExists(name);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Profile "${name}" 已存在`
      });
    }
    
    let result;
    if (fromCurrent) {
      // 从当前配置创建
      result = await manager.createFromCurrent(name, description || '');
    } else {
      // 创建空白 profile
      result = await manager.createEmpty(name, description || '');
    }
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    Logger.error(`创建 profile 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * PUT /api/profiles/:name/switch - 切换到指定 profile
 */
router.put('/profiles/:name/switch', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { toolType = 'claude' } = req.body;
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const result = await manager.switchToProfile(name);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    Logger.error(`切换 profile 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * DELETE /api/profiles/:name - 删除指定 profile
 */
router.delete('/profiles/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const toolType = (req.query.toolType as ToolType) || 'claude';
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const result = await manager.deleteProfile(name);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    Logger.error(`删除 profile 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/backups - 获取备份列表
 */
router.get('/backups', async (req: Request, res: Response) => {
  try {
    const toolType = (req.query.toolType as ToolType) || 'claude';
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const backups = await manager.listBackups();
    
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    Logger.error(`获取备份列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * POST /api/backups/:timestamp/restore - 恢复指定备份
 */
router.post('/backups/:timestamp/restore', async (req: Request, res: Response) => {
  try {
    const { timestamp } = req.params;
    const toolType = (req.query.toolType as ToolType) || 'claude';
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const result = await manager.restoreBackup(timestamp);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    Logger.error(`恢复备份失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/templates - 获取所有可用模板
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const toolType = (req.query.toolType as ToolType) || undefined;
    const manager = new TemplateManager();
    
    const templates = manager.listTemplates(toolType);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    Logger.error(`获取模板列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * POST /api/templates/install - 安装模板到 profile
 * Body: { templateName, profileName, toolType }
 */
router.post('/templates/install', async (req: Request, res: Response) => {
  try {
    const { templateName, profileName, toolType = 'claude' } = req.body;
    
    if (!templateName || !profileName) {
      return res.status(400).json({
        success: false,
        message: '模板名称和 Profile 名称不能为空'
      });
    }
    
    const manager = new TemplateManager();
    
    // 检查模板是否存在
    if (!manager.templateExists(templateName, toolType)) {
      return res.status(404).json({
        success: false,
        message: `模板 "${templateName}" 不存在`
      });
    }
    
    // 安装模板
    await manager.installTemplate(templateName, profileName, toolType);
    
    res.json({
      success: true,
      message: `模板 "${templateName}" 已成功安装到 Profile "${profileName}"`
    });
  } catch (error) {
    Logger.error(`安装模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/remotes - 获取所有远程源
 */
router.get('/remotes', async (req: Request, res: Response) => {
  try {
    const toolType = (req.query.toolType as ToolType) || undefined;
    const manager = new RemoteManager();
    
    const remotes = await manager.listRemotes(toolType);
    
    res.json({
      success: true,
      data: remotes
    });
  } catch (error) {
    Logger.error(`获取远程源列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * POST /api/remotes - 添加新的远程源
 * Body: { name, url, description, toolType }
 */
router.post('/remotes', async (req: Request, res: Response) => {
  try {
    const { name, url, description, toolType } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: '名称和 URL 不能为空'
      });
    }
    
    const manager = new RemoteManager();
    const result = await manager.addRemote(name, url, { description, toolType });
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        validation: result.validation
      });
    }
  } catch (error) {
    Logger.error(`添加远程源失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * DELETE /api/remotes/:name - 删除远程源
 */
router.delete('/remotes/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    const manager = new RemoteManager();
    const result = await manager.removeRemote(name);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    Logger.error(`删除远程源失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * POST /api/remotes/install - 从 URL 安装远程模板（支持 SSE 实时进度）
 * Body: { url, profileName, toolType, description, stream }
 */
router.post('/remotes/install', async (req: Request, res: Response) => {
  try {
    const { url, profileName, toolType = 'claude', description = '', stream = false } = req.body;
    
    if (!url || !profileName) {
      return res.status(400).json({
        success: false,
        message: 'URL 和 Profile 名称不能为空'
      });
    }
    
    // 如果客户端请求流式响应
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const sendProgress = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      try {
        sendProgress({ type: 'start', message: '开始安装远程模板...' });
        
        const manager = new RemoteManager();
        const result = await manager.installFromUrlWithProgress(
          url,
          profileName,
          toolType,
          sendProgress,
          description
        );
        
        if (result.success) {
          sendProgress({ type: 'complete', success: true, message: result.message });
        } else {
          sendProgress({ 
            type: 'error', 
            success: false, 
            message: result.message,
            validation: result.validation 
          });
        }
        
        res.end();
      } catch (error) {
        sendProgress({ 
          type: 'error', 
          success: false, 
          message: error instanceof Error ? error.message : '未知错误' 
        });
        res.end();
      }
    } else {
      // 普通请求方式（兼容）
      const manager = new RemoteManager();
      const result = await manager.installFromUrl(url, profileName, description, toolType);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          validation: result.validation
        });
      }
    }
  } catch (error) {
    Logger.error(`安装远程模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/profiles/:name/files - 获取 Profile 的文件列表
 */
router.get('/profiles/:name/files', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const toolType = (req.query.toolType as ToolType) || 'claude';
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    
    // 构建 profile 路径
    const profilesBaseDir = path.join(os.homedir(), '.crs-profiles', toolType);
    const profilePath = path.join(profilesBaseDir, name);
    
    // 检查 profile 是否存在
    if (!await fs.pathExists(profilePath)) {
      return res.status(404).json({
        success: false,
        message: `Profile "${name}" 不存在`
      });
    }
    
    // 递归读取文件树
    async function readDirRecursive(dirPath: string, basePath: string = ''): Promise<any[]> {
      const files = await fs.readdir(dirPath);
      const result = [];
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const relativePath = path.join(basePath, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          result.push({
            name: file,
            path: relativePath,
            type: 'directory',
            children: await readDirRecursive(filePath, relativePath)
          });
        } else {
          result.push({
            name: file,
            path: relativePath,
            type: 'file',
            size: stat.size
          });
        }
      }
      
      return result;
    }
    
    const fileTree = await readDirRecursive(profilePath);
    
    res.json({
      success: true,
      data: {
        name,
        path: profilePath,
        files: fileTree
      }
    });
  } catch (error) {
    Logger.error(`获取 Profile 文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * GET /api/profiles/:name/files/content - 获取文件内容
 */
router.get('/profiles/:name/files/content', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const filePath = req.query.path as string;
    const toolType = (req.query.toolType as ToolType) || 'claude';
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: '缺少文件路径参数'
      });
    }
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    
    // 构建 profile 路径
    const profilesBaseDir = path.join(os.homedir(), '.crs-profiles', toolType);
    const profilePath = path.join(profilesBaseDir, name);
    
    const fullPath = path.join(profilePath, filePath);
    
    // 安全检查：确保路径在 profile 目录内
    if (!fullPath.startsWith(profilePath)) {
      return res.status(403).json({
        success: false,
        message: '无效的文件路径'
      });
    }
    
    // 检查文件是否存在
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 读取文件内容
    const content = await fs.readFile(fullPath, 'utf-8');
    
    res.json({
      success: true,
      data: {
        path: filePath,
        content
      }
    });
  } catch (error) {
    Logger.error(`读取文件内容失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * PUT /api/profiles/:name/files/content - 保存文件内容
 */
router.put('/profiles/:name/files/content', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { path: filePath, content } = req.body;
    const toolType = (req.query.toolType as ToolType) || 'claude';
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: '缺少文件路径参数'
      });
    }
    
    if (content === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少文件内容'
      });
    }
    
    const manager = new ProfileManager(toolType);
    await manager.initialize();
    
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    
    // 构建 profile 路径
    const profilesBaseDir = path.join(os.homedir(), '.crs-profiles', toolType);
    const profilePath = path.join(profilesBaseDir, name);
    const fullPath = path.join(profilePath, filePath);
    
    // 安全检查：确保路径在 profile 目录内
    if (!fullPath.startsWith(profilePath)) {
      return res.status(403).json({
        success: false,
        message: '无效的文件路径'
      });
    }
    
    // 检查文件是否存在
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 保存文件内容
    await fs.writeFile(fullPath, content, 'utf-8');
    
    res.json({
      success: true,
      message: '文件保存成功'
    });
  } catch (error) {
    Logger.error(`保存文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;

