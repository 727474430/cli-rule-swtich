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
- 🎨 **GUI 可视化** - 现代化 Web 界面，直观的 Profile 管理体验
- 📦 **模板系统** - 内置 ACE/Weiming 等专业模板，一键安装
- 🌐 **远程模板** - 直接从 GitHub 安装配置，支持多种 URL 格式
- 💻 **交互式 CLI** - 美观的 TUI，上下键选择，自动返回主菜单
- 🔄 **快速切换** - 一键在多个 profile 之间切换
- 💾 **自动备份** - 每次切换前自动备份，保留最近 5 个
- 🔀 **双工具支持** - 同时管理 Claude Code 和 Codex 配置
- 🛡️ **安全可靠** - 操作确认、备份管理、安全验证、数据完整性保护

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
# 启动图形界面（推荐）🎨
crs ui

# 列出所有配置
crs list
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

### 🎨 GUI 可视化界面

CRS 提供了一个现代化的 Web 界面，让 Profile 管理更加直观：

```bash
# 启动 GUI 界面（默认端口 3000）
crs ui

# 自定义端口和主机
crs ui --port 8080 --host 0.0.0.0

# 启动但不自动打开浏览器
crs ui --no-browser
```

**功能特性：**
- 📋 **Profiles 管理**：可视化展示、切换、创建、删除、内容查看和在线编辑
- 📦 **Templates 管理**：浏览内置模板并一键安装
- 🌐 **Remote 源管理**：添加、删除远程源，从 GitHub URL 快速安装
- 💾 **Backups 管理**：查看历史备份并一键恢复
- 🔍 **搜索功能**：快速搜索 Profile 和文件树
- ⌨️ **键盘快捷键**：Ctrl+S 保存、ESC 关闭、Ctrl+F 搜索
- 🔀 支持 Claude 和 Codex 双工具类型
- 📱 响应式设计，支持移动端访问
- 🎯 实时状态显示和操作反馈

**快捷键：**
- `Ctrl/Cmd + S` - 保存正在编辑的文件
- `ESC` - 关闭 Profile 查看器、模态框或退出编辑模式
- `Ctrl/Cmd + F` - 聚焦到搜索框（在 Profiles 页面）

启动后浏览器会自动打开 `http://localhost:3000`，享受完整的图形化管理体验！

### 交互式模式

运行 `crs` 或 `crs --tool codex` 进入交互界面，使用 ↑/↓ 选择操作：

- 📋 List all profiles - 列出所有配置
- 🔄 Switch profile - 切换配置
- 💾 Save current config - 保存当前配置
- ➕ Create empty profile - 创建空白配置
- 🗑️ Delete profile - 删除配置
- 📜 List templates / 📦 Install from template - 模板管理
- 🌐 List remote sources / 🚀 Install from remote - 远程模板管理
- 📦 List backups / ♻️ Restore backup - 备份管理
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

### 内置模板

CRS 内置专业配置模板，快速创建标准化配置：

```bash
# 列出所有模板
crs template list

# 查看模板详情
crs template show ace

# 安装模板
crs template install ace my-ace-config
crs template install weiming my-config

# 交互式安装
crs template install-interactive
```

**可用模板：**
- Claude（claude）
  - `ace` — ACE (Advanced Code Engineering)：自主编码工作流与助手配置
  - `weiming` — Weiming（未名配置）：专业开发工作流与多子代理能力
  - `jige` — Skills MCP Agent：浏览器自动化与技术文档检索专家
- Codex（codex）
  - `tool_aug` — Tool Augmentation：工具增强的 AGENTS.md 示例
  - `zh-quality-first` — 中文优先 · 质量标准：中文唯一输出、工程质量规范、危险操作确认
  - `autonomous-fullcycle` — 自主闭环 · 全流程：四阶段工作流、强制 sequential-thinking、自动执行

安装示例：
```bash
# Codex 模板
crs template install zh-quality-first mycodex-zh --tool codex
crs template install autonomous-fullcycle mycodex-auto --tool codex
crs template install tool_aug mycodex-tool --tool codex

# Claude 模板
crs template install ace my-ace-config
crs template install weiming my-weiming
crs template install jige my-jige
```

### 远程模板（GitHub）

从 GitHub 仓库直接安装配置模板：

```bash
# 从 GitHub URL 安装（模板可以在任意目录或仓库根，下面仅示例其中一种路径写法）
crs remote install https://github.com/owner/repo/tree/main/templates my-profile

# 支持简短格式
crs remote install owner/repo my-profile
crs remote install owner/repo@branch my-profile
crs remote install owner/repo@branch:path/to/template my-profile  # 显式指定子目录可用于多模板仓库的消歧

# 指定工具类型（默认自动检测）
crs remote install owner/repo my-profile --tool codex

# 查看已保存的远程源
crs remote list

# 重复使用已保存的远程源
crs remote install owner-repo another-profile

# 预览远程模板（不安装）- 显示将被安装的最终结构
crs remote preview https://github.com/owner/repo
crs remote preview owner/repo --tool claude  # 指定工具类型进行预览

# 删除远程源
crs remote remove owner-repo
```

**远程模板特性：**
- 🔗 支持多种 GitHub URL 格式
- 📂 模板可位于任意子目录或仓库根目录（不要求使用 templates/ 等固定目录名），会自动递归扫描并定位；安装后会将 `CLAUDE.md`、`agents/`、`commands/`、`workflows/` 规范化到 profile 根目录（不保留隐藏容器目录，如 `.claude`）
- 🔍 自动检测工具类型（Claude/Codex）并仅安装对应所需文件
- 🛡️ 安全验证：拒绝可执行文件，过滤敏感文件
- 📦 自动保存远程源，便于重复使用
- 🔄 记录 commit SHA，支持版本追踪
- 🧭 分支智能回退：未显式指定分支且 main 不存在时，自动回退到仓库默认分支进行预览与安装

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
| `crs remove <name>` / `rm` | 删除 profile | `crs remove old-config` |

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

### 远程模板命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `crs remote install <source> <profile>` | 安装远程模板 | `crs remote install owner/repo my-profile` |
| `crs remote list` / `ls` | 列出已保存的远程源 | `crs remote list --tool codex` |
| `crs remote preview <url>` | 预览远程模板（显示最终安装结构） | `crs remote preview owner/repo --tool claude` |
| `crs remote remove <name>` / `rm` | 删除远程源 | `crs remote remove owner-repo` |

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

**Q: 远程模板如何保证安全？**
A: 自动拒绝可执行文件（.exe/.sh 等），过滤敏感文件（.env/.key 等），扫描危险代码模式

**Q: GitHub API 速率限制怎么办？**
A: 设置 GitHub token：`export GITHUB_TOKEN=your_token`

## 💻 技术栈

- TypeScript 5.3
- Commander.js - CLI 框架
- Inquirer.js - 交互式界面
- Octokit - GitHub API 集成
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
