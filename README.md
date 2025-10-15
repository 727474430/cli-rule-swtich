# CLI Rule Switcher (crs)

<div align="center">

🔄 **轻松管理和切换多套 Claude Code 和 Codex 配置的 CLI 工具**

[![npm version](https://img.shields.io/npm/v/cli-rule-switcher.svg)](https://www.npmjs.com/package/cli-rule-switcher)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## 💡 为什么需要 CRS?

- 🔄 为 Claude Code 和 Codex 灵活管理多套配置
- 🎯 快速切换开发、测试、生产环境的提示词规则
- 📦 使用现成模板快速创建配置
- ⚠️ 自动备份，安全恢复之前的稳定配置
- 🔀 同时管理 Claude Code 和 Codex 配置

**CRS** 让你像管理 Git 分支一样管理 AI 工具配置。

## ✨ 核心特性

- 🚀 **开箱即用** - 零配置启动，自动创建默认 profile
- 📦 **模板系统** - 内置 ACE/Weiming 等专业模板，一键安装
- 🎨 **交互式界面** - 美观的 TUI，上下键选择，自动返回主菜单
- 🔄 **快速切换** - 一键在多个 profile 之间切换
- 💾 **自动备份** - 每次切换前自动备份，保留最近 5 个
- 🔀 **双工具支持** - 同时管理 Claude Code 和 Codex 配置
- 🛡️ **安全可靠** - 操作确认、备份管理、数据完整性保护

## 📦 安装

```bash
# npm 安装（推荐）
npm install -g cli-rule-switcher@latest

# 验证安装
crs --version
crs --help
```

## 🚀 快速开始

```bash
# 启动交互式界面
crs

# 首次运行会自动创建 default profile
# 从现有 ~/.claude 或 ~/.codex 配置复制，或创建空白模板
```

### 常用命令

```bash
# 列出所有配置
crs list
crs list --tool claude
crs list --tool codex

# 切换配置
crs use <profile-name>
crs use <profile-name> --tool codex

# 保存当前配置
crs save <name> -d "描述"

# 使用模板创建配置
crs template list
crs template install ace my-ace-config
```

### 交互式模式

运行 `crs` 或 `crs --tool codex` 进入交互界面，使用 ↑/↓ 选择操作：

- 📋 List all profiles - 列出所有配置
- 🔄 Switch profile - 切换配置  
- 💾 Save current config - 保存当前配置
- ➕ Create empty profile - 创建空白配置
- 🗑️ Delete profile - 删除配置
- 📦 List backups / ♻️ Restore backup - 备份管理
- 📦 Install template - 安装模板
- ❌ Exit - 退出

## 🔀 双工具支持

CRS 同时支持 Claude Code 和 Codex，通过 `--tool` 参数切换：

```bash
# Claude Code（默认）
crs list
crs use frontend

# Codex
crs list --tool codex
crs use api-dev --tool codex
```

### 管理范围

| 工具 | 管理内容 |
|------|---------|
| Claude Code | `CLAUDE.md`, `agents/`, `workflows/`, `commands/` |
| Codex | `AGENTS.md` （config.toml 由 Codex 自身管理）|

### 配置独立性

- 两个工具的配置完全独立
- 各自维护独立的当前 profile 和备份目录
- 可同时使用不同的 Claude 和 Codex profiles

```bash
# 同时管理不同工具
crs use frontend              # Claude 前端配置
crs use api-dev --tool codex  # Codex API 配置
crs list                      # 显示所有工具的配置
```

## 📦 模板系统

CRS 内置专业配置模板，快速创建标准化配置：

```bash
# 列出所有模板
crs template list

# 查看模板详情
crs template show ace

# 安装模板
crs template install ace my-ace-config
crs template install weiming my-config --tool codex

# 交互式安装
crs template install-interactive
```

### 内置模板

- **ACE (Autonomous Coding Expert)** - 适用于 Claude Code，提供自主编码专家配置
- **Weiming** - 适用于 Codex，提供专业开发配置
- 更多模板持续添加中...

## 🎯 使用场景

```bash
# 为不同项目创建专属配置
crs save frontend -d "React frontend"
crs save backend -d "Node.js backend"

# 切换项目时切换配置
crs use frontend
crs use backend

# 实验新配置前备份
crs save stable-v1 -d "Stable config"
crs create experiment -d "Experimental config"
crs use experiment
# 失败时切回: crs use stable-v1

# 团队配置共享
git add .crs-profiles/
git commit -m "Add team configs"
```

## 📋 命令参考

### 全局选项

```bash
-t, --tool <type>  # 指定工具类型: claude（默认）或 codex
-h, --help         # 显示帮助
-V, --version      # 显示版本
```

### Profile 命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `crs` | 交互式模式 | `crs --tool codex` |
| `crs list` / `ls` | 列出所有 profiles | `crs list --tool codex` |
| `crs use <name>` | 切换 profile | `crs use frontend --tool codex` |
| `crs save <name>` | 保存当前配置 | `crs save my-config -d "描述"` |
| `crs create <name>` | 创建空白 profile | `crs create minimal -d "描述"` |
| `crs delete <name>` / `rm` | 删除 profile | `crs delete old-config` |

### 备份命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `crs backup` / `backups` | 列出备份 | `crs backup --tool codex` |
| `crs restore [timestamp]` | 恢复备份 | `crs restore` 或 `crs restore 2025-01-12T...` |

### 模板命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `crs template list` / `tpl ls` | 列出所有模板 | `crs template list --tool codex` |
| `crs template show <name>` | 显示模板详情 | `crs template show ace` |
| `crs template install <template> <profile>` | 安装模板 | `crs template install ace my-ace -d "描述"` |
| `crs template install-interactive` / `i` | 交互式安装 | `crs template i --tool codex` |

## 🔧 常见问题

**Q: 首次运行会发生什么？**  
A: 自动检测 `~/.claude` 和 `~/.codex`，创建对应的 `default` profile

**Q: 如何共享配置？**  
A: 将 `.crs-profiles/` 目录加入 Git 或打包分享

**Q: 备份存在哪里？**  
A: `~/.crs-profiles/.backup/`，自动保留最近 5 个备份

**Q: Codex 为什么只管理 AGENTS.md？**  
A: `config.toml` 包含敏感信息，由 Codex 自身管理

**Q: 如何自定义 profiles 目录？**  
A: 设置环境变量 `export CRS_PROFILES_DIR=/your/path`

## 💻 技术栈

- TypeScript 5.3
- Commander.js - CLI 框架
- Inquirer.js - 交互式界面
- Chalk / Ora / Boxen / cli-table3 - 终端 UI
- fs-extra - 文件系统操作

## 🤝 贡献

欢迎贡献！Fork 项目后提交 PR 即可。[查看 Issues](https://github.com/yourusername/cli-rule-switcher/issues)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

Made with ❤️ for the AI coding community

[⬆ 回到顶部](#cli-rule-switcher-crs)

</div>
