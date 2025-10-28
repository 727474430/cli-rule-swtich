#!/usr/bin/env node

/**
 * 构建脚本：复制 UI 文件到 dist 目录
 */

const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '../src/ui');
const destDir = path.join(__dirname, '../dist/ui');

async function copyUI() {
  try {
    console.log('📦 正在复制 UI 文件...');
    
    // 确保源目录存在
    if (!fs.existsSync(srcDir)) {
      console.error('❌ 源目录不存在:', srcDir);
      process.exit(1);
    }
    
    // 复制文件
    await fs.copy(srcDir, destDir, {
      overwrite: true,
      errorOnExist: false
    });
    
    console.log('✅ UI 文件复制成功!');
    console.log('   源目录:', srcDir);
    console.log('   目标目录:', destDir);
  } catch (error) {
    console.error('❌ 复制 UI 文件失败:', error.message);
    process.exit(1);
  }
}

// 执行复制
copyUI();

