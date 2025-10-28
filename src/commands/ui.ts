import chalk from 'chalk';
import boxen from 'boxen';
import open from 'open';
import { startServer } from '../server';
import { Logger } from '../utils/logger';

interface UIOptions {
  port?: number;
  host?: string;
  noBrowser?: boolean;
}

/**
 * 启动 GUI Web 界面
 */
export async function startUI(options: UIOptions = {}): Promise<void> {
  const port = options.port || 3000;
  const host = options.host || 'localhost';
  const url = `http://${host}:${port}`;

  try {
    // 显示启动信息
    console.log(chalk.cyan('\n🚀 正在启动 CRS GUI 界面...\n'));

    // 启动服务器
    await startServer({ port, host });

    // 显示成功信息
    const message = [
      chalk.green('✓ 服务器启动成功！'),
      '',
      chalk.bold('访问地址:'),
      chalk.blue.underline(url),
      '',
      chalk.gray('按 Ctrl+C 停止服务器')
    ].join('\n');

    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
      })
    );

    // 自动打开浏览器（如果未禁用）
    if (!options.noBrowser) {
      try {
        Logger.info('正在打开浏览器...');
        await open(url);
      } catch (error) {
        Logger.warning(`无法自动打开浏览器，请手动访问: ${url}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'EADDRINUSE') {
        Logger.error(`端口 ${port} 已被占用`);
        Logger.info('请尝试以下解决方案:');
        console.log(chalk.gray('  1. 使用其他端口: ') + chalk.cyan(`crs ui --port 3001`));
        console.log(chalk.gray('  2. 停止占用端口的程序'));
      } else {
        Logger.error(`启动服务器失败: ${error.message}`);
      }
    }
    process.exit(1);
  }
}

