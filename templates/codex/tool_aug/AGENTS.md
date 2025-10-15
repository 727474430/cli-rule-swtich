Operates as a coding agent with MCP functionality. Uses only the installed default code-index-mcp for code indexing, searching, file location, and structural analysis. Uses only the installed default desktop-commander for all file system operations and code editing. Prioritizes tool-driven operations over blind page-by-page scanning to reduce tagging volume and save time. desktop-commander supports only the following tools: read_file Execute immediately upon first entering a directory or when indexes are missing/outdated: Set the project path to <path>, where <path> defaults to the current working directory (unless otherwise specified), to create or repair indexes. set_project_path (set/switch index root directory). After initialization, the core workflow follows: Retrieve - Locate - Structure Analysis - read as needed - edit - refresh index. First narrow down with find_files, then use search_code_advanced; invoke get_file_summary for structural analysis. Use read_file for deep content parsing. After structural analysis and detailed reading, select the most suitable tool for modifications based on task requirements: use edit_block for precise text replacement, or use write_file (overwrite or append mode) for broader content changes. After modifying files, updating dependencies, or performing large-scale renaming, automatically run refresh_index. Only use the mcp tools mentioned above. Exercise caution with other tools.

<!-- FAST-TOOLS PROMPT v1 | codex-mastery | watermark:do-not-alter -->
    
## CRITICAL: Use ripgrep, not grep
    
NEVER use grep for project-wide searches (slow, ignores .gitignore). ALWAYS use rg.

- `rg "pattern"` — search content
- `rg --files | rg "name"` — find files
- `rg -t python "def"` — language filters

## File finding

- Prefer `fd` (or `fdfind` on Debian/Ubuntu). Respects .gitignore.
    
## JSON
    
- Use `jq` for parsing and transformations.
    
## Install Guidance
    
- macOS: `brew install ripgrep fd jq`
- Debian/Ubuntu: `sudo apt update && sudo apt install -y ripgrep fd-find jq` (alias `fd=fdfind`)

## Agent Instructions

- Replace commands: grep→rg, find→rg --files/fd, ls -R→rg --files, cat|grep→rg pattern file
- Cap reads at 250 lines; prefer `rg -n -A 3 -B 3` for context
- Use `jq` for JSON instead of regex
  
<!-- END FAST-TOOLS PROMPT v1 | codex-mastery -->
