# Changelog

## 1.11.0 - 2025-10-25

- feat(ui): 添加完整的 GUI 可视化界面
  - 新增 `crs ui` 命令，启动现代化的 Web 管理界面（默认端口 3000）
  - **Profiles 管理**：卡片式展示、实时查看、切换、创建和删除
  - **Templates 管理**：浏览内置模板列表，支持按工具类型筛选，一键安装到新 Profile
  - **Remote 源管理**：添加/删除 GitHub 远程源，支持从 URL 快速安装配置
  - **Backups 管理**：查看历史备份列表，一键恢复到指定时间点
  - **Profile 内容查看器**：全屏文件树浏览器，支持在线编辑文件并保存
  - 使用 Tailwind CSS 实现响应式设计，支持移动端访问
  - 支持 Claude 和 Codex 双工具类型切换
  - 基于 Express.js 提供完整的 RESTful API，前端使用原生 JavaScript
  - 自动打开浏览器，支持自定义端口和主机配置
  - 新增依赖：express, @types/express, open
- feat(ui/ux): UI 优化和交互增强
  - **斜角飘带**：工具类型标识以斜角飘带显示在卡片左上角
  - **自定义模态框**：替换原生 alert/prompt/confirm，支持动画和 ESC 关闭
  - **分段控制器**：统一所有页面的工具类型切换样式（iOS 风格）
  - **卡片布局**：所有卡片按钮底部对齐，视觉更加统一
  - **响应式按钮**：Remote 源卡片的安装/删除按钮等宽并列显示
- feat(ui/shortcuts): 键盘快捷键系统
  - **Ctrl/Cmd + S**：在编辑模式下快速保存文件
  - **ESC**：智能关闭 Profile 查看器/模态框/退出编辑模式（按优先级）
  - **Ctrl/Cmd + F**：快速聚焦到搜索框（Profile 页面）
  - 跨平台支持，自动识别 macOS Command 和 Windows/Linux Ctrl
- feat(ui/search): 搜索和过滤功能
  - **Profile 搜索**：实时搜索 Profile 名称和描述，Ctrl+F 快速聚焦
  - **文件树搜索**：递归搜索所有文件名，扁平化显示匹配结果
  - **智能空状态**：搜索无结果时显示友好提示，引导用户操作
  - 模糊搜索，不区分大小写，实时过滤无需按回车
- chore(build): 优化构建流程，自动复制 UI 静态文件到 dist 目录

## 1.10.1 - 2025-01-21

- fix(template-validator): 修复 codex 模板安装时脚本文件验证错误
  - 将 `.sh` 脚本文件从危险文件列表中移除，允许 codex 模板包含脚本文件
  - 为 codex 模板类型的脚本文件生成警告而非错误，提醒用户检查安全性
  - 保持对其他模板类型（如 claude）的严格安全检查
  - 解决 `crs remote install` 安装包含脚本文件的 codex 模板时的验证失败问题

## 1.10.0 - 2025-10-20

- feat(codex/templates): Add two Codex templates
  - `zh-quality-first`: 中文唯一输出；强调工程质量（SOLID/DRY/边界/测试）；提供输出风格与结构化清单
  - `autonomous-fullcycle`: 自主规划-实施-验证闭环；强制 sequential-thinking；四阶段工作流；默认自动执行
- feat(template): 为每个 Codex 模板新增独立 `template.json`，字段与 `templates/codex/tool_aug/template.json` 对齐
- chore: Bump CLI to 1.10.0

## 1.9.0 - 2025-10-19

- feat(codex/prompts): Add prompts directory support across profiles and workflows (Codex)
  - Read/write/cleanup/count include `prompts/` (recursive `.md` files)
  - Default Codex profile scaffolds empty `prompts/`
  - Backup/restore/switch preserve `prompts/` structure
  - Remote preview/install recognizes and installs `prompts/` under profile root
- fix(template): Improve `--tool` resolution for `template install` subcommand
  - Supports both `crs template install <tpl> <profile> --tool codex` and `crs template install <tpl> --tool codex <profile>`
  - Also respects top-level `--tool` when used with nested subcommands
- chore: Bump CLI to 1.9.0; remove temporary E2E test assets

## 1.8.0 - 2025-10-18

- feat(claude/skills): Add skills directory support across profiles
  - Read/write/cleanup/count include `skills/` (recursive nested files)
  - Default Claude profile includes empty `skills/`
  - Backup/restore/switch preserve `skills/` structure
  - Remote preview/install recognizes and installs `skills/`
- chore: CLI shows 1.8.0; MIT LICENSE present; import extensions unified

## 1.7.0 - 2025-01-17

- feat(template): Add jige Skills MCP Agent template
  - Add comprehensive CLAUDE.md with agent descriptions and usage guide
  - Include chrome-devtools-expert and context7-researcher agents
  - Add 5 specialized skills for task delegation and automation
  - Optimize template metadata with detailed description and tags
  - Support browser automation, tech docs research, and token optimization

## 1.6.0 - 2025-10-17

- remote install: 安装时基于工具类型严格过滤
  - Claude: 仅 `CLAUDE.md` 与 `agents/`, `commands/`, `workflows/`（仅 `.md`），支持模板位于任意子目录或仓库根
  - Codex: 仅 `AGENTS.md`
- 安装路径规范化：将 `CLAUDE.md`、`agents/`、`commands/`、`workflows/` 扁平到 profile 根目录（不保留 `.claude` 等容器目录）
- remote preview: 现在显示“将被安装的最终结构”，并提供 `--tool` 选项用于消歧
- 分支智能回退：当未显式指定分支且 `main` 不存在时，自动回退至仓库默认分支
- 安全过滤：继续过滤敏感文件与危险扩展名
