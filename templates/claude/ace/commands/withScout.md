---
description: Use scout agent to gather information and then proceed with the task
---

# WithScout Command

This command explicitly uses the scout agent to gather information first, then proceeds with the next steps based on the findings.

## Workflow

### 1. Understanding the Task

First, clearly understand what the user wants to accomplish. The user's request typically follows the pattern:
- "Use scout to research [topic] and then [action]"
- "Gather information about [topic] and [action]"

Break down the request into two parts:
1. **Research Phase**: What information needs to be gathered?
2. **Action Phase**: What to do with the gathered information?

### 2. Launch Scout Agent

Use the Task tool to invoke the **tr:scout** agent with a detailed research prompt:

**Scout Prompt Template**:
```
Please investigate [specific topic/area] and provide comprehensive information about:

1. [Research question 1]
2. [Research question 2]
3. [Research question 3]
...

Context:
- Working directory: [provide working directory]
- Known files/areas: [list any known context to avoid duplication]
- Specific focus: [what specifically should this scout investigate]

Please provide your findings in the structured format with:
- Research Summary
- Key Findings (with file paths and line numbers)
- Detailed Analysis
- Recommendations
- Sources
```

**Important**:
- Provide clear, specific research questions to the scout
- Include any known context to avoid duplicate work
- Specify the exact focus area for investigation

### 3. Process Scout Results

After the scout agent returns its findings:

1. **Review the research summary** - Get a high-level understanding
2. **Examine key findings** - Identify the most important discoveries
3. **Read detailed analysis** - Understand the implications
4. **Note the sources** - Know where information came from

### 4. Execute Next Steps

Based on the scout's findings, proceed with the action phase:

- If the task is to **implement a feature**: Use the findings to understand existing patterns and create the implementation
- If the task is to **refactor code**: Use the findings to identify what needs to change and how
- If the task is to **fix a bug**: Use the findings to locate the issue and apply the fix
- If the task is to **write documentation**: Use the findings to create accurate documentation
- If the task is to **answer a question**: Synthesize the findings into a clear answer

### 5. Provide Summary to User

After completing the action phase, provide the user with:

1. **What the scout discovered** (brief summary)
2. **What actions were taken** based on those findings
3. **Results or outcomes** of the actions
4. **Any recommendations** for next steps

## Examples

### Example 1: Research and Implement
```
User: Use scout to research authentication patterns in the codebase and then implement JWT token refresh

Process:
1. Scout investigates: auth patterns, token handling, existing JWT usage
2. Action: Implement JWT refresh based on discovered patterns
3. Summary: Show what was found and what was implemented
```

### Example 2: Research and Document
```
User: Gather information about the API endpoints and create documentation

Process:
1. Scout investigates: API route definitions, handler functions, request/response formats
2. Action: Create API documentation based on findings
3. Summary: Show discovered endpoints and documentation created
```

### Example 3: Research and Fix
```
User: Use scout to understand the caching system and fix the cache invalidation bug

Process:
1. Scout investigates: cache implementation, invalidation logic, related bug reports
2. Action: Fix the identified bug based on understanding from scout
3. Summary: Show the problem found and the fix applied
```

## Best Practices

1. **Be Specific**: Give the scout clear, focused research questions
2. **Provide Context**: Share what's already known to avoid duplicate work
3. **Parallel Scouting**: For complex tasks, consider launching multiple scouts in parallel to explore different areas
4. **Trust the Scout**: The scout agent is specialized for research - trust its findings
5. **Bridge Research to Action**: Clearly connect how scout findings inform the next steps

## Important Notes

- The scout agent has access to: Read, Glob, Grep, WebSearch, WebFetch tools
- Scout outputs are structured and detailed - use them fully
- Always acknowledge the scout's findings when presenting results to the user
- If scout findings are insufficient, you can launch another scout with refined questions