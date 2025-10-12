# Claude Profile Switcher - MVP Implementation Plan

## 项目概述

创建一个 CLI 工具，用于管理和切换多套 Claude Code 配置文件组合（CLAUDE.md、commands、agents 等）。

## 核心功能

### 1. 配置管理
- 存储多套配置模板（profiles）
- 支持创建、删除、重命名配置
- 配置文件包括：CLAUDE.md、commands 目录、agents.md 等

### 2. 快速切换
- 一键切换到指定配置
- 自动备份当前配置
- 通过文件复制实现配置切换

### 3. 交互界面
- 基础 CLI 命令（list, use, create, save, delete）
- TUI 交互式选择界面
- 彩色输出和友好提示

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **核心依赖**:
  - `commander`: CLI 框架
  - `inquirer`: 交互式提示
  - `chalk`: 彩色输出
  - `fs-extra`: 文件操作
  - `ora`: 加载动画
  - `boxen`: 美化输出
  - `cli-table3`: 表格展示

## 项目结构

```
cli-rule-switch/
├── src/
│   ├── index.ts              # CLI 入口
│   ├── commands/
│   │   ├── list.ts           # 列出所有配置
│   │   ├── use.ts            # 切换配置
│   │   ├── create.ts         # 创建新配置
│   │   ├── save.ts           # 保存当前配置
│   │   ├── delete.ts         # 删除配置
│   │   └── interactive.ts    # TUI 交互模式
│   ├── core/
│   │   ├── profile-manager.ts    # 配置管理核心
│   │   ├── file-system.ts        # 文件操作封装
│   │   └── config.ts             # 全局配置
│   ├── types/
│   │   └── index.ts              # 类型定义
│   └── utils/
│       ├── logger.ts             # 日志工具
│       ├── validator.ts          # 配置验证
│       └── backup.ts             # 备份工具
├── profiles/                 # 配置模板存储目录
│   ├── default/
│   └── .current              # 记录当前使用的配置
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 实现步骤

### 第一阶段：基础架构（30%）
1. ✅ 初始化 TypeScript 项目
2. ✅ 配置 package.json 和构建脚本
3. ✅ 创建核心类型定义
4. ✅ 实现 ProfileManager 核心类

### 第二阶段：核心功能（40%）
5. ✅ 实现 `list` 命令 - 列出所有配置
6. ✅ 实现 `use` 命令 - 切换配置（包含备份逻辑）
7. ✅ 实现 `create` 命令 - 创建新配置
8. ✅ 实现 `save` 命令 - 保存当前配置
9. ✅ 实现 `delete` 命令 - 删除配置

### 第三阶段：交互增强（20%）
10. ✅ 实现 TUI 交互模式
11. ✅ 添加配置预览功能
12. ✅ 美化输出和错误提示

### 第四阶段：完善优化（10%）
13. ✅ 添加配置验证
14. ✅ 实现备份恢复机制
15. ✅ 编写 README 文档
16. ✅ 添加示例配置

## 核心设计

### 配置结构
```typescript
interface Profile {
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  files: {
    claudeMd?: string;      // CLAUDE.md 内容
    commands?: string[];     // commands 目录下的文件
    agentsMd?: string;       // agents.md 内容
  };
}
```

### 配置存储路径
- 全局存储：`~/.crs-profiles/`
- 项目存储：`<project>/.crs-profiles/`
- 目标路径：`~/.claude/` 和 `<project>/.claude/`

### 切换逻辑
1. 备份当前配置到临时目录
2. 删除目标目录下的相关文件
3. 从 profile 复制文件到目标目录
4. 更新 `.current` 记录
5. 显示切换成功信息

## CLI 命令设计

```bash
# 交互式模式（推荐）
crs

# 列出所有配置
crs list

# 切换到指定配置
crs use <profile-name>

# 创建新配置（从当前配置）
crs save <profile-name> [--description "描述"]

# 创建空白配置
crs create <profile-name> [--description "描述"]

# 删除配置
crs delete <profile-name>

# 显示当前配置
crs current

# 显示帮助
crs --help
```

## 安全特性

1. **自动备份**：每次切换前自动备份当前配置
2. **冲突检测**：检查是否有未保存的修改
3. **回滚机制**：支持回滚到上一个配置
4. **配置验证**：检查配置完整性

## 用户体验优化

1. **彩色输出**：成功、警告、错误使用不同颜色
2. **加载动画**：切换配置时显示进度
3. **表格展示**：美观地展示配置列表
4. **交互提示**：避免误删除等危险操作

## 预期时间线

- 项目初始化：15分钟
- 核心功能实现：45分钟
- 交互界面：30分钟
- 文档和优化：30分钟

**总计**: 约 1-2 小时完成 MVP
