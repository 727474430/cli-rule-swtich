import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Logger utility with colored output
 */
export class Logger {
  /**
   * Log success message
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), chalk.green(message));
  }

  /**
   * Log error message
   */
  static error(message: string): void {
    console.log(chalk.red('✗'), chalk.red(message));
  }

  /**
   * Log warning message
   */
  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), chalk.yellow(message));
  }

  /**
   * Log info message
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), chalk.cyan(message));
  }

  /**
   * Log plain message
   */
  static log(message: string): void {
    console.log(message);
  }

  /**
   * Log boxed message
   */
  static box(message: string, title?: string): void {
    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        title,
        titleAlignment: 'center',
      })
    );
  }

  /**
   * Log header
   */
  static header(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('─'.repeat(message.length)));
  }

  /**
   * Create a divider
   */
  static divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * Log empty line
   */
  static newLine(): void {
    console.log();
  }
}
