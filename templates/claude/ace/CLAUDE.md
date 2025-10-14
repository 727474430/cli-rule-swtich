# ACE (Advanced Code Engineering) Configuration

## Overview

This configuration is based on TokenRoll's cc-plugin, featuring intelligent workflow automation with sub-agent architecture.

## Key Features

### 🤖 Intelligent Git Workflow
- **`/tr:commit`** - Smart commit message generator that learns from your project's Git history
- Analyzes commit style (emoji, conventional commits, language)
- Generates contextual messages describing the "why", not just the "what"

### 🔍 Context-Efficient Research
- **`/tr:withScout`** + **Scout Agent** - Save 83% context with sub-agent architecture
- Perfect for refactoring, bug fixing, feature planning in medium-to-large codebases
- Independent context isolation for massive read operations

### 💡 Viral Product Ideation
- **Super-Idea Agent** - Transform trending topics into viral product concepts
- Analyzes viral mechanics and emotional triggers
- Designs AI-powered product concepts optimized for sharing

### ⚙️ Background Worker
- **BG-Worker Agent** - Executes simple, well-defined, sequential tasks
- Ideal for file operations, simple Git commands, data extraction
- High reliability and cost-efficiency with Haiku model

## Agents

- **tr:scout** - Professional research specialist (Haiku)
- **tr:super-idea** - Viral product idea generator
- **tr:bg-worker** - Autonomous junior execution agent (Haiku)

## Commands

- **`/tr:commit`** - Generate intelligent commit messages
- **`/tr:withScout`** - Research-first workflow with scout agent

- always use scout agent to get information/knowledge of proejct/tech stack/programming etc.