import express, { Express } from 'express';
import path from 'path';
import apiRouter from './api-router';
import { Logger } from '../utils/logger';

export interface ServerOptions {
  port?: number;
  host?: string;
}

/**
 * 创建并配置 Express 应用
 */
export function createServer(options: ServerOptions = {}): Express {
  const app = express();
  
  // 配置 JSON body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // 配置静态文件服务
  // 在开发环境和生产环境都从 dist/ui 目录提供静态文件
  const uiDir = path.join(__dirname, '../ui');
  app.use(express.static(uiDir));
  
  // 注册 API 路由
  app.use('/api', apiRouter);
  
  // SPA fallback - 所有未匹配的路由都返回 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(uiDir, 'index.html'));
  });
  
  return app;
}

/**
 * 启动服务器
 */
export async function startServer(options: ServerOptions = {}): Promise<void> {
  const { port = 3000, host = 'localhost' } = options;
  
  const app = createServer(options);
  
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      Logger.success(`🚀 服务器已启动: http://${host}:${port}`);
      resolve();
    });
    
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        Logger.error(`端口 ${port} 已被占用，请尝试其他端口`);
      } else {
        Logger.error(`服务器启动失败: ${error.message}`);
      }
      reject(error);
    });
    
    // 优雅退出处理
    const shutdown = () => {
      Logger.info('\n正在关闭服务器...');
      server.close(() => {
        Logger.success('服务器已关闭');
        process.exit(0);
      });
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}

