# Changelog

## 1.6.0 - 2025-10-17

- remote install: 安装时基于工具类型严格过滤
  - Claude: 仅 `CLAUDE.md` 与 `agents/`, `commands/`, `workflows/`（仅 `.md`），支持模板位于任意子目录或仓库根
  - Codex: 仅 `AGENTS.md`
- 安装路径规范化：将 `CLAUDE.md`、`agents/`、`commands/`、`workflows/` 扁平到 profile 根目录（不保留 `.claude` 等容器目录）
- remote preview: 现在显示“将被安装的最终结构”，并提供 `--tool` 选项用于消歧
- 分支智能回退：当未显式指定分支且 `main` 不存在时，自动回退至仓库默认分支
- 安全过滤：继续过滤敏感文件与危险扩展名

