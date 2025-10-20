# Changelog

## 1.10.0 - 2025-10-20

- feat(codex/templates): Add two Codex templates
  - `zh-quality-first`: 中文唯一输出；强调工程质量（SOLID/DRY/边界/测试）；提供输出风格与结构化清单
  - `autonomous-fullcycle`: 自主规划-实施-验证闭环；强制 sequential-thinking；四阶段工作流；默认自动执行
- feat(template): 为每个 Codex 模板新增独立 `template.json`，字段与 `templates/codex/tool_aug/template.json` 对齐
- refactor(templates): 将 `c1` 重命名为 `zh-quality-first`，`c2` 重命名为 `autonomous-fullcycle`
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
