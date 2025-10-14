---
description: Generate a commit message based on current changes
---

# Commit Command

You need to help the user generate a high-quality commit message. Please follow these steps

## 0. Use bg-worker agent to do following steps

## 1. Fetch Git Information

Run the following commands in parallel to get the current repository state:

- `git diff` - View unstaged changes
- `git diff --staged` - View staged changes
- `git status` - View current branch and file status
- `git log --oneline -10` - View the last 10 commits to understand the commit message format style

## 2. Analyze Changes

Based on the fetched information, analyze:

- Current branch name
- File types and scope of changes
- Nature of changes (new feature, fix, refactor, docs, etc.)
- Commit message format style in history (whether using emoji, English/Chinese, following conventional commits, etc.)

## 3. Generate Commit Message

Based on the above analysis, generate a commit message that meets the following requirements:

- **Follow project style**: Based on the historical commit format seen in git log
- **Accurately describe changes**: Clearly explain what was changed
- **Be concise**: Keep the first line within 50-72 characters (if in English)
- **Use correct type**: Such as feat, fix, docs, refactor, test, chore, etc. (if the project uses conventional commits)

## 4. Output Format

After generating the commit message, display it directly to the user and ask if they want to:

1. Use this message to commit
2. Need to modify it
3. Regenerate

**Important Notes**:

- If there are no changes (git status shows clean), inform the user there are no changes to commit
- If there are only unstaged changes, ask the user if they need to add files first
- The message should describe "why" rather than just "what"
