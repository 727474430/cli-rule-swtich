# CLI Rule Switcher (crs)

<div align="center">

🔄 **轻松管理和切换多套 Claude Code 和 Codex 配置的 CLI 工具**

[![npm version](https://img.shields.io/npm/v/cli-rule-switcher.svg)](https://www.npmjs.com/package/cli-rule-switcher)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](#) | [简体中文](#)

</div>

## 💡 为什么需要 CRS?

使用 Claude Code 或 Codex 时,你是否遇到过这些问题:

- 🔄 为不同项目需要不同的 Agent 和 Workflow 配置
- 🎯 在开发、测试、生产环境需要切换不同的提示词规则
- 💼 团队协作时需要统一的配置模板
- ⚠️ 担心修改配置后无法恢复到之前的稳定状态
- 🎨 想为前端、后端、DevOps 等场景创建专属配置
- 🔀 需要在 Claude Code 和 Codex 之间管理不同的配置

**CLI Rule Switcher (CRS)** 就是为了解决这些问题而生!它让你可以像管理 Git 分支一样管理 Claude Code 和 Codex 配置。

## ✨ 核心特性

### 🚀 开箱即用
- **零配置启动** - 首次运行自动创建 `default` profile,保护现有配置
- **智能检测** - 自动检测并备份 `~/.claude` 和 `~/.codex` 目录现有内容
- **无缝迁移** - 从现有配置平滑过渡,无需手动操作
- **双工具支持** - 同时支持 Claude Code 和 Codex,独立管理各自配置

### 🎨 用户体验
- **交互式 TUI** - 美观的文本界面,方便的上下箭头选择
- **即时反馈** - 彩色输出、进度动画、成功/错误提示
- **智能防护** - 防止误操作,无法删除当前使用的配置
- **流畅操作** - 操作完成后自动返回主菜单,无需重复确认

### 💪 强大功能
- **配置快照** - 保存任意时刻的配置状态
- **快速切换** - 一键在多个 profile 之间切换
- **自动备份** - 每次切换前自动备份,保留最近 5 个备份
- **灵活管理** - 创建、保存、删除、列出、恢复配置
- **工具切换** - 通过 `--tool` 参数在 Claude 和 Codex 之间切换

### 🛡️ 安全可靠
- **双重保护** - 切换前自动备份 + 手动备份目录
- **确认机制** - 危险操作需要确认
- **备份管理** - 自动清理旧备份,避免占用过多空间
- **数据完整** - 完整保存 CLAUDE.md、agents/、workflows/、commands/ 四大核心

## 📦 安装

### 方式 1: npm 全局安装（推荐）

```bash
npm install -g cli-rule-switcher
```

安装完成后，即可使用 `crs` 命令:

```bash
crs          # 启动交互式界面
crs --help   # 查看帮助
crs list     # 列出所有配置
```

### 方式 2: 从源码构建

```bash
# 克隆仓库
git clone https://github.com/yourusername/cli-rule-switcher.git
cd cli-rule-switcher

# 安装依赖并构建
npm install
npm run build

# 全局链接
npm link

# 验证安装
crs --version
```

### 方式 3: npx 直接运行（无需安装）

```bash
npx cli-rule-switcher
npx cli-rule-switcher list
npx cli-rule-switcher use development
```

## 🚀 快速开始

### 第一次使用

1. **启动 CRS**

```bash
crs
```

2. **自动创建默认配置**

首次运行时,CRS 会自动检测你的 `~/.claude` 目录:
- 如果存在配置文件,自动创建名为 `default` 的 profile
- 完整备份 CLAUDE.md、agents/、workflows/、commands/ 四个核心内容
- 设置 `default` 为当前激活的 profile

```
╭─────────────────────── 🔄 Welcome ────────────────────────╮
│                                                            │
│                 Claude Profile Switcher                    │
│                                                            │
│  Manage and switch between multiple Claude Code           │
│  configurations                                            │
│                                                            │
╰────────────────────────────────────────────────────────────╯

ℹ A default profile has been created from your current
  ~/.claude configuration
```

3. **开始使用**

现在你可以:
- 创建更多 profiles
- 在不同 profiles 之间切换
- 保存当前工作配置
- 安全地实验新配置

### 交互式模式（推荐）

直接运行 `crs` 进入交互式界面:

```bash
crs
```

**主菜单选项:**

```
? Current profile: default - What do you want to do?
❯ 📋 List all profiles
  🔄 Switch profile
  💾 Save current config as new profile
  ➕ Create empty profile
  🗑️  Delete profile
  ─────────────
  📦 List backups
  ♻️  Restore backup
  ─────────────
  ❌ Exit
```

**操作流程:**
- 使用 **↑/↓ 方向键** 选择操作
- 按 **Enter** 确认
- 操作完成后 **自动返回主菜单**
- 选择 **Exit** 或按 **Ctrl+C** 退出

### 命令行模式

适合脚本化和快速操作:

```bash
# 查看所有 profiles
crs list

# 切换 profile
crs use development

# 保存当前配置为新 profile
crs save my-config -d "My custom configuration"

# 创建空白 profile
crs create new-config -d "New configuration"

# 删除 profile
crs delete old-config

# 查看所有备份
crs backup

# 恢复备份（交互式）
crs restore

# 恢复指定备份
crs restore 2025-01-12T14-30-00-000Z

# 查看帮助
crs --help

# 查看版本
crs --version
```

## 🔀 Codex 支持

CRS 现已支持 Codex 工具配置管理！通过 `--tool` 参数可以轻松在 Claude Code 和 Codex 之间切换。

### 基本用法

```bash
# 管理 Claude Code 配置（默认）
crs list                              # 列出 Claude profiles
crs use frontend                      # 切换 Claude profile

# 管理 Codex 配置
crs list --tool codex                 # 列出 Codex profiles
crs use api-dev --tool codex          # 切换 Codex profile
crs save my-config --tool codex       # 保存 Codex 配置
```

### Codex 管理范围

Codex 工具配置较为简洁,CRS 仅管理：
- ✅ `~/.codex/AGENTS.md` - Agent 配置文件
- ❌ 不管理 `config.toml` 和 `config_*.toml` (这些由 Codex 自身管理)

### 配置独立性

- Claude 和 Codex 配置完全独立管理
- 各自维护独立的 `.current-claude` 和 `.current-codex` 追踪文件
- 备份目录分别为 `.backup/claude/` 和 `.backup/codex/`
- 可同时使用不同的 Claude 和 Codex profiles

### 目录结构

```
.crs-profiles/
├── claude/                   # Claude Code profiles
│   ├── default/
│   │   ├── profile.json
│   │   ├── CLAUDE.md
│   │   ├── agents/
│   │   ├── workflows/
│   │   └── commands/
│   └── frontend/
├── codex/                    # Codex profiles
│   ├── default/
│   │   ├── profile.json
│   │   └── AGENTS.md
│   └── backend-api/
├── .current-claude           # 当前 Claude profile
├── .current-codex            # 当前 Codex profile
└── .backup/
    ├── claude/
    └── codex/
```

### 使用场景

#### 场景 1: 分别管理 Claude 和 Codex

```bash
# 前端开发使用 Claude
crs use frontend

# API 开发使用 Codex
crs use api-dev --tool codex

# 两者完全独立，互不影响
```

#### 场景 2: 为 Codex 创建专属配置

```bash
# 方式 1: 交互模式（推荐）
crs --tool codex
# 选择 "💾 Save current config as new profile"
# 输入名称和描述

# 方式 2: 命令行模式
crs save backend-api --tool codex -d "Backend API development configuration"

# 方式 3: 创建空白配置
crs create minimal-codex --tool codex -d "Minimal Codex configuration"
```

#### 场景 3: 快速查看所有配置

```bash
# 默认显示所有工具的配置
crs list

# 输出示例：
# ┌────────┬──────────────┬────────────────────┬────────────────────┬───────────┐
# │ Tool   │ Name         │ Description        │ Created            │ Status    │
# ├────────┼──────────────┼────────────────────┼────────────────────┼───────────┤
# │ Claude │ default      │ Default config...  │ 2025-10-13 12:04:29│ ● Current │
# │ Claude │ frontend     │ Frontend dev...    │ 2025-10-13 14:20:15│           │
# │ Codex  │ default      │ Default config...  │ 2025-10-13 12:04:08│ ● Current │
# │ Codex  │ backend-api  │ Backend API...     │ 2025-10-13 15:30:42│           │
# └────────┴──────────────┴────────────────────┴────────────────────┴───────────┘

# 只看 Codex 配置
crs list --tool codex

# 只看 Claude 配置
crs list --tool claude
```

#### 场景 4: 项目切换时自动切换配置

```bash
# 进入前端项目目录
cd ~/projects/frontend-app
crs use frontend              # 切换到前端 Claude 配置

# 进入后端项目目录
cd ~/projects/backend-api
crs use backend-api --tool codex  # 切换到后端 Codex 配置
```

#### 场景 5: 备份和恢复 Codex 配置

```bash
# 查看 Codex 备份
crs backup --tool codex

# 恢复 Codex 备份（交互式）
crs restore --tool codex

# 切换 Codex profile 时自动创建备份
crs use another-profile --tool codex
# 自动备份当前配置到 .backup/codex/
```

### Codex 配置最佳实践

#### 1. 为不同项目类型创建专属配置

```bash
# Web 开发
crs save codex-web --tool codex -d "Web development with Node.js"

# 系统编程
crs save codex-systems --tool codex -d "Systems programming with Rust/C++"

# 数据科学
crs save codex-datascience --tool codex -d "Data science with Python"
```

#### 2. 使用描述性命名

```bash
# ✅ 好的命名
crs save nextjs-fullstack --tool codex
crs save fastapi-backend --tool codex
crs save react-frontend --tool codex

# ❌ 避免的命名
crs save test1 --tool codex
crs save config --tool codex
crs save tmp --tool codex
```

#### 3. 定期保存工作配置

```bash
# 完成重要配置调整后立即保存
# 1. 调整 ~/.codex/AGENTS.md
# 2. 测试配置是否工作
# 3. 保存为新版本
crs save codex-stable-v2 --tool codex -d "Stable config v2 with improved prompts"
```

#### 4. 实验新配置时先备份

```bash
# 保存当前稳定配置
crs save codex-stable --tool codex

# 创建实验配置
crs create codex-experiment --tool codex
crs use codex-experiment --tool codex

# 在 ~/.codex/AGENTS.md 中尝试新配置
# 如果不满意，随时切回
crs use codex-stable --tool codex
```

### Codex 与 Claude 对比

| 特性 | Claude Code | Codex |
|------|-------------|-------|
| 配置目录 | `~/.claude` | `~/.codex` |
| 主配置文件 | `CLAUDE.md` | `AGENTS.md` |
| Agent 配置 | `agents/*.md` (多文件) | `AGENTS.md` (单文件) |
| Workflow | ✅ `workflows/` | ❌ 不支持 |
| Commands | ✅ `commands/` | ❌ 不支持 |
| config.toml | ❌ 不适用 | ⚠️ 由 Codex 自身管理 |
| CRS 管理范围 | 完整管理 | 仅 AGENTS.md |
| 配置切换 | `crs use <name>` | `crs use <name> --tool codex` |

### 常见问题

#### Q: 为什么 Codex 只管理 AGENTS.md？

**A**: Codex 的 `config.toml` 文件包含 API 密钥、模型配置等敏感信息，由 Codex CLI 自身管理更安全。CRS 专注于管理 Agent 提示词配置，这是最常需要切换的部分。

#### Q: 可以同时使用不同的 Claude 和 Codex profile 吗？

**A**: 可以！Claude 和 Codex 的配置完全独立：

```bash
# Claude 使用 frontend profile
crs use frontend

# Codex 使用 backend-api profile  
crs use backend-api --tool codex

# 查看当前状态
crs list
# 会显示两个工具各自的 current profile
```

#### Q: 如何在团队间共享 Codex 配置？

**A**: 将 `.crs-profiles/codex/` 目录加入 Git：

```bash
# 方式 1: 共享整个 .crs-profiles
git add .crs-profiles/
git commit -m "Add team Codex configurations"

# 方式 2: 只共享特定 profile
git add .crs-profiles/codex/team-standard/
git commit -m "Add team standard Codex config"

# 团队成员拉取后
git pull
crs use team-standard --tool codex
```

#### Q: Codex profile 包含什么内容？

**A**: 一个典型的 Codex profile 结构：

```
.crs-profiles/codex/backend-api/
├── profile.json          # 元数据
└── AGENTS.md             # Agent 配置

profile.json 内容示例：
{
  "name": "backend-api",
  "description": "Backend API development",
  "toolType": "codex",
  "createdAt": "2025-10-13T15:30:42.123Z",
  "lastUsed": "2025-10-13T16:45:20.456Z"
}
```

## 📖 核心概念详解

### Profile (配置文件)

Profile 是一套完整的 Claude Code 配置快照,包含:

```
.crs-profiles/<profile-name>/
├── profile.json           # 元数据(名称、描述、创建时间)
├── CLAUDE.md              # Claude 主配置文件
├── agents/                # Agent 配置目录
│   ├── code-reviewer.md
│   └── test-writer.md
├── workflows/             # Workflow 配置目录
│   └── dev-workflow.md
└── commands/              # 命令配置目录
    └── commit.md
```

### 三种 Profile 来源

#### 1. 默认 Profile (自动创建)

**触发时机:** 首次运行 CRS 且没有任何 profiles

**行为:**
- 读取 `~/.claude` 的所有内容
- 创建名为 `default` 的 profile
- 自动设置为当前 profile

**适用场景:** 保护现有配置,作为基础 profile

#### 2. Save Current Config (保存当前配置)

**功能:** 将 **当前正在使用** 的 `~/.claude` 配置保存为新 profile

**使用时机:**
- ✅ 调整配置到满意状态,想要保存快照
- ✅ 为不同项目创建专属配置
- ✅ 在现有 profile 基础上创建变体
- ✅ 定期保存工作进度

**操作步骤:**

```bash
# 方式 1: 交互模式
crs
# 选择 "💾 Save current config as new profile"
# 输入名称: frontend-react
# 输入描述: React frontend development config

# 方式 2: 命令行模式
crs save frontend-react -d "React frontend development config"
```

**实际案例:**

```bash
# 场景: 你正在使用 default profile,添加了一些前端开发的 agents
# 当前 ~/.claude 的内容:
~/.claude/
├── CLAUDE.md (更新了前端相关规则)
├── agents/
│   ├── react-helper.md (新增)
│   └── typescript-expert.md (新增)
└── workflows/
    └── frontend-workflow.md (新增)

# 保存为新 profile
crs save frontend-react -d "Frontend development with React"

# 结果: 创建了新 profile,包含上述所有内容
# 你现在有两个 profiles:
# - default (原始配置)
# - frontend-react (新的前端配置)
```

**特点:**
- 📸 保存的是 **执行命令那一刻** 的配置快照
- 🔒 后续修改 `~/.claude` 不会影响已保存的 profile
- 🎯 适合基于现有配置创建变体

#### 3. Create Empty Profile (创建空白配置)

**功能:** 创建一个全新的空白 profile,只包含默认模板

**使用时机:**
- ✅ 从零开始创建全新配置
- ✅ 不想基于现有配置,避免污染
- ✅ 创建实验性配置
- ✅ 为特定场景创建极简配置

**操作步骤:**

```bash
# 方式 1: 交互模式
crs
# 选择 "➕ Create empty profile"
# 输入名称: minimal-config
# 输入描述: Minimal configuration for testing

# 方式 2: 命令行模式
crs create minimal-config -d "Minimal configuration for testing"
```

**初始内容:**

```markdown
# minimal-config Configuration

## Profile Description
Minimal configuration for testing

## Settings
Add your configuration here.
```

同时创建空的 agents/、workflows/、commands/ 目录。

**特点:**
- 🆕 完全空白的配置,不包含任何现有内容
- 📝 只有一个简单的 CLAUDE.md 模板
- 🎨 适合从头构建配置

### Switch Profile (切换配置)

**功能:** 切换到指定的 profile

**行为:**
1. **自动备份** - 备份当前 `~/.claude` 的内容到 `.backup/` 目录
2. **清空目录** - 删除 `~/.claude` 中的配置文件
3. **应用新配置** - 将目标 profile 的内容复制到 `~/.claude`
4. **更新状态** - 更新 `.current` 文件记录当前 profile

**使用场景:**

```bash
# 场景 1: 切换项目
crs use frontend-react    # 开发前端项目
crs use backend-api       # 开发后端项目

# 场景 2: 切换工作模式
crs use development       # 开发模式
crs use code-review       # 代码审查模式

# 场景 3: 切换环境
crs use local-dev         # 本地开发
crs use production        # 生产环境
```

**智能防护:**
- 如果只有一个 profile 且已是当前 profile,提示无法切换
- 自动显示当前 profile,避免误操作

### Backup (自动备份)

**触发时机:**
- 每次执行 `crs use <profile>` 切换配置
- 每次执行 `crs restore <backup>` 恢复备份

**备份内容:** 当前 `~/.claude` 的完整快照

**备份位置:** `.crs-profiles/.backup/<timestamp>/`

**备份管理:**
- 自动保留最近 **5 个备份**
- 超过 5 个时,自动删除最早的备份
- 时间戳格式: `2025-01-12T14-30-00-000Z`

**查看备份:**

```bash
crs backup

# 输出示例:
Available Backups
────────────────────────────────────────────────────────
┌──────┬──────────────────────────────┬────────────┬──────────────┐
│ #    │ Timestamp                    │ Date       │ Time         │
├──────┼──────────────────────────────┼────────────┼──────────────┤
│ 1    │ 2025-01-12T16-30-45-123Z    │ 2025/1/12  │ 16:30:45     │
├──────┼──────────────────────────────┼────────────┼──────────────┤
│ 2    │ 2025-01-12T15-00-00-456Z    │ 2025/1/12  │ 15:00:00     │
└──────┴──────────────────────────────┴────────────┴──────────────┘
```

**恢复备份:**

```bash
# 交互式选择（推荐）
crs restore

# 直接恢复指定备份
crs restore 2025-01-12T16-30-45-123Z
```

## 🎯 实际使用场景

### 场景 1: 前端 vs 后端开发

**问题:** 前端和后端需要不同的 Agents 和 Workflows

**解决方案:**

```bash
# 1. 切换到 default,添加前端配置
crs use default
# 在 ~/.claude 中添加 React、TypeScript、CSS 相关 agents

# 2. 保存为前端 profile
crs save frontend -d "Frontend development with React"

# 3. 切换回 default,添加后端配置
crs use default
# 在 ~/.claude 中添加 Node.js、Express、Database 相关 agents

# 4. 保存为后端 profile
crs save backend -d "Backend development with Node.js"

# 5. 日常使用
crs use frontend   # 开发前端时
crs use backend    # 开发后端时
```

### 场景 2: 开发 vs 代码审查

**问题:** 开发时需要快速生成代码,代码审查时需要详细的检查清单

**解决方案:**

```bash
# 开发配置
crs create development -d "Fast development workflow"
crs use development
# 配置快速代码生成、自动测试、格式化等

# 代码审查配置
crs create code-review -d "Detailed code review checklist"
crs use code-review
# 配置安全检查、性能分析、最佳实践检查等

# 日常使用
crs use development   # 写代码时
crs use code-review   # 审查代码时
```

### 场景 3: 实验新配置

**问题:** 想尝试新的 Agents,但不想破坏现有稳定配置

**解决方案:**

```bash
# 1. 保存当前稳定配置
crs save stable-v1 -d "Stable configuration v1"

# 2. 创建实验配置
crs create experiment -d "Experimental configuration"
crs use experiment
# 在 ~/.claude 中大胆尝试新配置

# 3. 如果实验失败,随时切换回稳定版本
crs use stable-v1

# 4. 如果实验成功,保存为新版本
crs use experiment
crs save stable-v2 -d "Stable configuration v2"
```

### 场景 4: 团队协作

**问题:** 团队成员需要统一的配置模板

**解决方案:**

```bash
# 团队管理员创建标准配置
crs create team-standard -d "Team standard configuration"
crs use team-standard
# 配置团队统一的规范、工作流、命令等
crs save team-standard -d "Team standard configuration"

# 分享配置（将 .crs-profiles 目录共享给团队）
# 方式 1: Git 仓库
git add .crs-profiles/
git commit -m "Add team standard configuration"
git push

# 方式 2: 文件共享
tar -czf team-config.tar.gz .crs-profiles/
# 分享给团队成员

# 团队成员使用
# 解压或克隆后
crs use team-standard
```

### 场景 5: 项目切换

**问题:** 同时维护多个项目,每个项目有不同的配置需求

**解决方案:**

```bash
# 为每个项目创建专属 profile
crs save project-a -d "Project A configuration"
crs save project-b -d "Project B configuration"
crs save project-c -d "Project C configuration"

# 切换项目时切换配置
cd ~/projects/project-a && crs use project-a
cd ~/projects/project-b && crs use project-b
cd ~/projects/project-c && crs use project-c

# 或在项目目录创建快捷脚本
# ~/projects/project-a/switch-config.sh
#!/bin/bash
crs use project-a
```

## 📋 命令参考

### 全局选项

```bash
crs [options] [command]

Options:
  -t, --tool <type>     # 工具类型: claude 或 codex
                        # 默认: 显示所有工具（list 命令）
                        #       或使用 claude（其他命令）
  -h, --help           # 显示帮助信息
  -V, --version        # 显示版本号

示例:
  crs                           # 启动交互式界面（Claude）
  crs --tool codex              # 启动交互式界面（Codex）
  crs list                      # 列出所有工具的 profiles
  crs list --tool codex         # 只列出 Codex profiles
  crs use frontend --tool codex # 切换 Codex profile
```

### Profile 管理

```bash
# 列出所有 profiles
crs list                      # 显示所有工具（Claude + Codex）
crs list --tool claude        # 只显示 Claude profiles
crs list --tool codex         # 只显示 Codex profiles
crs ls                        # list 的别名

# 切换 profile
crs use <profile-name>                    # 切换 Claude profile（默认）
crs use <profile-name> --tool codex      # 切换 Codex profile
crs use <profile-name> --tool claude     # 显式指定 Claude

# 保存当前配置为新 profile
crs save <profile-name> [options]
  -d, --description <desc>    # 添加描述
  -t, --tool <type>          # 工具类型（claude 或 codex）

示例:
  crs save my-frontend -d "Frontend development"
  crs save my-backend --tool codex -d "Backend API development"

# 创建空白 profile
crs create <profile-name> [options]
  -d, --description <desc>    # 添加描述
  -t, --tool <type>          # 工具类型（claude 或 codex）

示例:
  crs create minimal
  crs create api-config --tool codex -d "API configuration"

# 删除 profile
crs delete <profile-name> [options]
  -t, --tool <type>          # 工具类型（claude 或 codex）

crs rm <profile-name>         # delete 的别名

示例:
  crs delete old-config
  crs delete old-api --tool codex
```

### 备份管理

```bash
# 列出所有备份
crs backup [options]
  -t, --tool <type>          # 工具类型（claude 或 codex）

crs backups                   # backup 的别名

示例:
  crs backup                  # 列出 Claude 备份
  crs backup --tool codex     # 列出 Codex 备份

# 恢复备份（交互式）
crs restore [timestamp] [options]
  -t, --tool <type>          # 工具类型（claude 或 codex）

示例:
  crs restore                               # 交互式恢复 Claude 备份
  crs restore --tool codex                  # 交互式恢复 Codex 备份
  crs restore 2025-10-13T10-30-00-000Z     # 恢复指定 Claude 备份
  crs restore 2025-10-13T10-30-00-000Z --tool codex  # 恢复指定 Codex 备份
```

### 交互式模式

```bash
# 启动交互式界面
crs                           # Claude 交互模式（默认）
crs --tool codex              # Codex 交互模式

交互菜单:
  📋 List all profiles        # 列出所有 profiles
  🔄 Switch profile          # 切换 profile
  💾 Save current config     # 保存当前配置
  ➕ Create empty profile    # 创建空白 profile
  🗑️  Delete profile         # 删除 profile
  📦 List backups            # 列出备份
  ♻️  Restore backup         # 恢复备份
  ❌ Exit                    # 退出

提示:
  - 使用 ↑/↓ 方向键选择选项
  - 按 Enter 确认
  - 按 ESC 返回主菜单
  - 按 Ctrl+C 退出
```

## 🗂️ 项目结构

### 目录布局

```
项目根目录/
├── .crs-profiles/                 # CRS 配置目录
│   ├── claude/                       # Claude Code profiles
│   │   ├── default/                     # 默认 Claude profile
│   │   │   ├── profile.json                # 元数据
│   │   │   ├── CLAUDE.md                   # Claude 主配置
│   │   │   ├── agents/                     # Agent 配置目录
│   │   │   │   ├── code-reviewer.md
│   │   │   │   └── test-writer.md
│   │   │   ├── workflows/                  # Workflow 配置目录
│   │   │   │   └── dev-workflow.md
│   │   │   └── commands/                   # 命令配置目录
│   │   │       └── commit.md
│   │   ├── frontend/                    # 前端 Claude profile
│   │   │   └── ...
│   │   └── backend/                     # 后端 Claude profile
│   │       └── ...
│   │
│   ├── codex/                        # Codex profiles
│   │   ├── default/                     # 默认 Codex profile
│   │   │   ├── profile.json                # 元数据
│   │   │   └── AGENTS.md                   # Codex Agent 配置
│   │   ├── api-dev/                     # API 开发 Codex profile
│   │   │   └── ...
│   │   └── data-science/                # 数据科学 Codex profile
│   │       └── ...
│   │
│   ├── .current-claude               # 当前活动 Claude profile 名称
│   ├── .current-codex                # 当前活动 Codex profile 名称
│   └── .backup/                      # 自动备份目录
│       ├── claude/                      # Claude 备份
│       │   ├── 2025-10-13T10-30-00-000Z/
│       │   ├── 2025-10-13T11-00-00-000Z/
│       │   └── ...
│       └── codex/                       # Codex 备份
│           ├── 2025-10-13T12-00-00-000Z/
│           ├── 2025-10-13T13-00-00-000Z/
│           └── ...
│
├── ~/.claude/                     # Claude Code 配置目录
│   ├── CLAUDE.md                     # 当前使用的配置
│   ├── agents/
│   ├── workflows/
│   └── commands/
│
└── ~/.codex/                      # Codex 配置目录
    ├── AGENTS.md                     # 当前使用的 Agent 配置
    └── config.toml                   # Codex 自身管理，CRS 不涉及
```

### profile.json 元数据格式

#### Claude Profile 元数据

```json
{
  "name": "frontend",
  "description": "Frontend development with React",
  "toolType": "claude",
  "createdAt": "2025-10-13T10:30:00.000Z",
  "lastUsed": "2025-10-13T15:45:00.000Z"
}
```

#### Codex Profile 元数据

```json
{
  "name": "api-dev",
  "description": "Backend API development",
  "toolType": "codex",
  "createdAt": "2025-10-13T12:00:00.000Z",
  "lastUsed": "2025-10-13T16:30:00.000Z"
}
```

## 💻 开发指南

### 技术栈

- **TypeScript 5.3** - 类型安全的 JavaScript
- **Commander.js** - CLI 框架,命令解析
- **Inquirer.js** - 交互式命令行界面
- **Chalk** - 彩色终端输出
- **Ora** - 优雅的加载动画
- **Boxen** - 终端框盒子
- **cli-table3** - 美观的表格展示
- **fs-extra** - 增强的文件系统操作

### 项目结构

```
src/
├── index.ts              # CLI 入口点
├── commands/             # 命令实现
│   ├── list.ts           # 列出 profiles
│   ├── use.ts            # 切换 profile
│   ├── save.ts           # 保存当前配置
│   ├── create.ts         # 创建空白 profile
│   ├── delete.ts         # 删除 profile
│   ├── restore.ts        # 恢复备份
│   └── interactive.ts    # 交互式模式
├── core/                 # 核心逻辑
│   ├── profile-manager.ts    # Profile 管理器
│   ├── file-system.ts        # 文件系统操作
│   └── config.ts             # 配置路径管理
├── types/                # 类型定义
│   └── index.ts
└── utils/                # 工具函数
    └── logger.ts         # 日志输出
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/cli-rule-switcher.git
cd cli-rule-switcher

# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 本地测试
npm link
crs --version

# 运行
npm start
```

### 构建和发布

```bash
# 构建项目
npm run build

# 检查构建产物
ls -la dist/

# 测试命令
node dist/index.js --help

# 发布到 npm
npm publish
```

## 🔒 安全特性

### 多重保护机制

1. **自动备份**
   - 每次切换 profile 前自动备份当前配置
   - 保留最近 5 个备份,自动清理旧备份
   - 备份目录: `.crs-profiles/.backup/`

2. **操作确认**
   - 删除 profile 需要确认
   - 恢复备份需要确认
   - 防止误操作导致数据丢失

3. **状态保护**
   - 无法删除当前正在使用的 profile
   - 切换前检查目标 profile 是否存在
   - 输入验证,防止非法 profile 名称

4. **数据完整性**
   - 完整复制所有配置文件和目录
   - 保持文件结构和内容一致
   - 元数据跟踪创建时间和最后使用时间

### 输入验证规则

**Profile 名称要求:**
- 只能包含字母、数字、连字符 `-` 和下划线 `_`
- 不能为空
- 不能与现有 profile 重名

**示例:**
```bash
# ✅ 有效的 profile 名称
frontend
backend-api
my_config_v2
dev-2025

# ❌ 无效的 profile 名称
my config      # 包含空格
config!        # 包含特殊字符
前端配置        # 包含非 ASCII 字符
```

## ⚙️ 配置选项

### 环境变量

```bash
# 自定义 Claude 配置目录（默认: ~/.claude）
export CLAUDE_CONFIG_DIR="$HOME/my-claude-config"

# 自定义 profiles 目录（默认: ./.crs-profiles）
export CRS_PROFILES_DIR="$HOME/.crs-profiles"
```

### 配置常量

可在 `src/core/config.ts` 中修改:

```typescript
export const PROFILE_CONFIG = {
  METADATA_FILE: 'profile.json',
  MAX_BACKUPS: 5,  // 修改最大备份数量
} as const;
```

## 🐛 故障排除

### 常见问题

#### 1. 命令找不到: `crs: command not found`

**原因:** npm 全局包路径未添加到 PATH

**解决方案:**

```bash
# 查看 npm 全局包路径
npm config get prefix

# 添加到 PATH（macOS/Linux）
export PATH="$PATH:$(npm config get prefix)/bin"

# 永久添加到 ~/.bashrc 或 ~/.zshrc
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc
source ~/.zshrc

# 或重新链接
npm link

# 或使用 npx
npx cli-rule-switcher
```

#### 2. 权限错误: `EACCES: permission denied`

**原因:** 没有读写 `~/.claude` 目录的权限

**解决方案:**

```bash
# 检查目录权限
ls -la ~/.claude/

# 修改权限
chmod -R u+w ~/.claude/

# 检查所有权
sudo chown -R $(whoami) ~/.claude/
```

#### 3. Profile 切换后配置未生效

**原因:** Claude Code 可能需要重启

**解决方案:**

```bash
# 1. 切换 profile
crs use frontend

# 2. 验证配置已更新
cat ~/.claude/CLAUDE.md

# 3. 重启 Claude Code 或 IDE
# 或重新打开 Claude Code 窗口
```

#### 4. 备份目录占用过多空间

**原因:** 备份文件累积

**解决方案:**

```bash
# 查看备份大小
du -sh .crs-profiles/.backup/

# 手动清理旧备份
rm -rf .crs-profiles/.backup/2025-01-*

# 或调整最大备份数量（修改源码）
# src/core/config.ts: MAX_BACKUPS: 3
```

#### 5. Profile 配置损坏

**原因:** 手动编辑导致格式错误

**解决方案:**

```bash
# 方式 1: 恢复最近的备份
crs restore

# 方式 2: 手动检查 profile.json
cat .crs-profiles/<profile-name>/profile.json

# 方式 3: 重新创建 profile
crs delete broken-profile
crs save new-profile -d "Recreated profile"
```

#### 6. 无法删除 profile: `Cannot delete the current profile`

**原因:** 无法删除正在使用的 profile

**解决方案:**

```bash
# 先切换到其他 profile
crs use another-profile

# 再删除目标 profile
crs delete old-profile
```

### 调试模式

```bash
# 启用详细日志
DEBUG=crs:* crs list

# 查看配置文件
cat .crs-profiles/.current
cat .crs-profiles/<profile>/profile.json

# 验证文件结构
tree .crs-profiles/

# 检查备份
ls -la .crs-profiles/.backup/
```

### 紧急恢复

如果一切都出问题了:

```bash
# 1. 停止使用 CRS
# 不要运行任何 crs 命令

# 2. 手动恢复最新备份
cp -r .crs-profiles/.backup/<latest-timestamp>/* ~/.claude/

# 3. 或从 profile 手动恢复
cp -r .crs-profiles/<profile-name>/* ~/.claude/
rm ~/.claude/profile.json  # 删除元数据文件

# 4. 重新初始化 CRS
rm -rf .crs-profiles/
crs  # 重新创建 default profile
```

## 🤔 常见问题 (FAQ)

### Q1: CRS 会修改我的原始配置吗?

**A:** 不会。首次运行时,CRS 会将你的 `~/.claude` 配置保存为 `default` profile。之后,所有操作都基于 profiles,不会直接修改原始配置。

### Q2: 我可以在多个项目中使用 CRS 吗?

**A:** 可以。每个项目目录都可以有自己的 `.crs-profiles/` 目录。不同项目的 profiles 互不影响。

### Q3: Profile 可以跨项目共享吗?

**A:** 可以。你可以手动复制 `.crs-profiles/` 目录到其他项目,或通过 Git 共享。

### Q4: 删除 profile 后可以恢复吗?

**A:** 删除 profile 是永久操作,无法恢复。但如果该 profile 曾被使用过,可能在 `.backup/` 目录中有备份可以恢复。

### Q5: 备份会一直累积吗?

**A:** 不会。CRS 自动保留最近 5 个备份,超过数量会自动删除最旧的备份。

### Q6: 可以修改 profile 的内容吗?

**A:** 可以。有两种方式:
1. 切换到该 profile,修改 `~/.claude` 后重新保存
2. 直接编辑 `.crs-profiles/<profile-name>/` 目录下的文件

### Q7: CRS 支持 Windows 吗?

**A:** 支持。CRS 使用 Node.js 的跨平台 API,可在 Windows、macOS、Linux 上运行。

### Q8: 如何将 profile 分享给团队?

**A:** 将 `.crs-profiles/` 目录添加到 Git 仓库,团队成员克隆后即可使用。或打包为 tar.gz 文件分享。

### Q9: Profile 保存了哪些内容?

**A:** 保存以下四个核心:
- `CLAUDE.md` 主配置文件
- `agents/` 目录及所有 `.md` 文件
- `workflows/` 目录及所有 `.md` 文件
- `commands/` 目录及所有 `.md` 文件

### Q10: 如何卸载 CRS?

**A:**
```bash
# 卸载全局包
npm uninstall -g cli-rule-switcher

# 删除 profiles（可选）
rm -rf .crs-profiles/

# 删除全局链接（如果使用 npm link）
npm unlink -g cli-rule-switcher
```

## 🎓 最佳实践

### 1. 命名规范

**建议使用描述性名称:**

```bash
# ✅ 好的命名
crs save frontend-react
crs save backend-nodejs
crs save devops-k8s
crs save code-review-strict
crs save production-v2

# ❌ 避免的命名
crs save config1
crs save test
crs save tmp
crs save aaa
```

### 2. 添加详细描述

```bash
# ✅ 好的描述
crs save frontend -d "React 18 + TypeScript + Tailwind CSS frontend configuration"

# ❌ 简略的描述
crs save frontend -d "frontend"
```

### 3. 定期保存重要配置

```bash
# 在完成重要调整后立即保存
# 编辑 ~/.claude 配置...
crs save my-config-stable -d "Stable version before experiments"
```

### 4. 使用版本号

```bash
# 为配置添加版本号
crs save workflow-v1 -d "Initial workflow"
crs save workflow-v2 -d "Optimized workflow with new agents"
crs save workflow-v3 -d "Final stable version"
```

### 5. 创建实验分支

```bash
# 保存稳定版本
crs save stable

# 创建实验版本
crs create experiment
crs use experiment
# 大胆尝试新配置...

# 成功后保存,失败则切回稳定版本
crs use stable
```

### 6. 团队协作规范

```bash
# 团队标准配置命名规范
team-standard          # 团队标准配置
team-frontend          # 前端团队标准
team-backend           # 后端团队标准
<yourname>-custom      # 个人定制配置
```

### 7. 备份管理

```bash
# 重要操作前手动备份
cp -r ~/.claude ~/claude-backup-$(date +%Y%m%d)

# 定期检查备份
crs backup

# 清理不需要的旧 profiles
crs delete old-unused-profile
```

### 8. 文档化配置

在每个 profile 的 CLAUDE.md 中添加说明:

```markdown
# Frontend Configuration

## Purpose
This configuration is optimized for React frontend development.

## Key Features
- React 18 hooks and patterns
- TypeScript best practices
- Tailwind CSS utilities
- Component testing with Jest

## Usage
Switch to this profile when working on frontend projects:
```bash
crs use frontend-react
```

## Last Updated
2025-01-12

## Maintainer
@yourname
```

## 📝 更新日志

### v1.0.0 (2025-01-12)

#### ✨ 新功能
- 🚀 首次运行自动创建 `default` profile
- 🎨 优化交互流程,操作后自动返回主菜单
- 🛡️ 添加错误处理,防止 Ctrl+C 导致退出
- 📋 完善 profile 选择界面,无可选项时友好提示

#### 🐛 修复
- 修复只有一个 profile 时按回车退出的问题
- 修复用户取消操作导致程序退出的问题
- 修复交互模式下重复询问的问题

#### 📖 文档
- 更新 README,添加详细使用说明
- 添加核心概念详解
- 添加实际使用场景示例
- 添加故障排除和 FAQ 章节

## 🚧 路线图

### 短期计划 (v1.x)

- [ ] 添加 profile 导出/导入功能
- [ ] 支持 profile 差异对比 (`crs diff profile-a profile-b`)
- [ ] 添加配置验证功能
- [ ] 支持批量操作
- [ ] 添加配置模板市场

### 中期计划 (v2.x)

- [ ] 支持远程配置同步 (GitHub/GitLab)
- [ ] 添加配置版本控制 (Git 集成)
- [ ] Web UI 界面 (可选)
- [ ] VS Code 扩展
- [ ] 配置搜索和标签功能

### 长期计划 (v3.x)

- [ ] AI 辅助配置推荐
- [ ] 社区配置分享平台
- [ ] 多人协作配置管理
- [ ] 配置分析和优化建议

## 🤝 贡献

欢迎各种形式的贡献!

### 如何贡献

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 贡献指南

- 遵循现有代码风格
- 添加适当的注释
- 更新相关文档
- 添加测试用例 (如适用)

### 报告问题

发现 Bug 或有功能建议?请[开启 Issue](https://github.com/yourusername/cli-rule-switcher/issues)!

**Issue 模板:**

```markdown
**问题描述**
简要描述问题

**重现步骤**
1. 执行命令 `crs ...`
2. 看到错误 '...'
3. ...

**期望行为**
描述你期望的行为

**实际行为**
描述实际发生的情况

**环境信息**
- OS: [e.g. macOS 14.0]
- Node.js: [e.g. v18.17.0]
- CRS 版本: [e.g. 1.0.0]

**额外信息**
其他相关信息
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

```
MIT License

Copyright (c) 2025 CLI Rule Switcher Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 💖 致谢

感谢以下开源项目:

- [Commander.js](https://github.com/tj/commander.js) - CLI 框架
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - 交互式界面
- [Chalk](https://github.com/chalk/chalk) - 彩色输出
- [Ora](https://github.com/sindresorhus/ora) - 加载动画
- [Boxen](https://github.com/sindresorhus/boxen) - 终端框盒子
- [cli-table3](https://github.com/cli-table/cli-table3) - 表格展示

感谢所有贡献者和使用者!

## 👨‍💻 作者

Created with ❤️ for the Claude Code community

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🌟 Star History

如果这个项目对你有帮助,请给个 ⭐️ Star!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/cli-rule-switcher&type=Date)](https://star-history.com/#yourusername/cli-rule-switcher&Date)

---

<div align="center">

**[⬆ 回到顶部](#cli-rule-switcher-crs)**

Made with ❤️ by Claude Code Community

</div>
