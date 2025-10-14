# Sub-Agents 使用指南

本目录包含 9 个专业的 sub-agents,用于支持并发编程开发工作流。

## 📋 Agents 列表

### 🔍 信息检索层
- **searcher.md** - 代码检索专家
  - 在代码库中快速查找相关代码
  - 定位功能实现和依赖关系
  - 只读操作,使用 Glob/Grep/Read

- **analyzer.md** - 代码分析师
  - 深入分析代码结构和架构模式
  - 分析依赖关系和技术栈
  - 评估代码质量和复杂度
  - 只读操作

### 🏗️ 规划设计层
- **architect.md** - 架构规划师
  - 将需求转化为技术方案
  - 设计架构和技术选型
  - 分解任务并制定执行计划
  - 可调用 searcher/analyzer

### 💻 代码实现层
- **codex.md** - 代码实现者
  - 编写高质量的功能代码
  - 遵循项目规范和最佳实践
  - 处理类型定义和错误处理
  - 可调用 searcher

- **refactor.md** - 重构专家
  - 优化代码结构和性能
  - 消除重复代码
  - 改进可维护性
  - 可调用 analyzer/searcher/tester

### ✅ 质量保障层
- **reviewer.md** - 代码审查员
  - 多维度审查代码质量
  - 发现安全漏洞和性能问题
  - 提供改进建议
  - 只读操作,可调用 searcher/analyzer

- **tester.md** - 测试工程师
  - 设计测试用例
  - 编写单元/集成/E2E 测试
  - 执行测试并生成报告
  - 可调用 searcher/codex

### 🐛 问题诊断层
- **debugger.md** - 调试专家
  - 诊断问题和定位根因
  - 分析错误堆栈和日志
  - 提供修复方案和预防措施
  - 可调用 searcher/analyzer

### 📝 文档层
- **doc-writer.md** - 文档编写者
  - 编写 API 文档和使用指南
  - 编写技术方案文档
  - 添加代码注释
  - 可调用 searcher/analyzer

## 🔄 并发工作流示例

### 示例1: 实现新功能

```
用户需求: "实现用户登录功能"

主对话(调度器):
  └─ 创建 TodoList 跟踪进度

阶段1: 调研与规划(并发)
  ├─ searcher: 查找现有认证代码
  ├─ analyzer: 分析现有架构
  └─ architect: 设计登录方案
      └─ 输出: 技术方案 + 任务清单

阶段2: 实现(并发)
  ├─ codex: 实现登录逻辑
  ├─ codex: 实现前端表单
  └─ tester: 编写测试用例

阶段3: 质量保障(并发)
  ├─ reviewer: 代码审查
  ├─ tester: 执行测试
  └─ doc-writer: 编写 API 文档

主对话: 汇总结果,标记完成
```

### 示例2: 修复 Bug

```
用户反馈: "登录时报错"

主对话:
  └─ debugger: 诊断问题
      ├─ 调用 searcher 定位相关代码
      ├─ 调用 analyzer 分析影响
      └─ 输出: 诊断报告 + 修复方案

主对话:
  └─ codex: 实施修复
      └─ 根据 debugger 的方案修复代码

主对话(并发):
  ├─ tester: 添加回归测试
  └─ reviewer: 审查修复代码
```

### 示例3: 代码重构

```
需求: "优化用户模块性能"

主对话(并发):
  ├─ analyzer: 分析当前架构和性能瓶颈
  └─ searcher: 查找所有相关代码

主对话:
  └─ refactor: 制定重构方案
      ├─ 调用 analyzer 分析复杂度
      └─ 输出: 重构方案 + 步骤

主对话(串行):
  └─ refactor: 执行重构
      ├─ 调用 tester 确保测试覆盖
      └─ 小步重构,频繁验证

主对话(并发):
  ├─ reviewer: 审查重构代码
  ├─ tester: 运行性能测试
  └─ doc-writer: 更新文档
```

## 🎯 使用原则

### 1. 主对话作为调度器
- ✅ 只负责任务分配和进度跟踪
- ✅ 使用 TodoWrite 管理整体进度
- ✅ 并发调度多个 agents
- ❌ 不直接进行代码检索/编写/分析

### 2. 最大化并发
- ✅ 识别无依赖的任务并发执行
- ✅ 使用单个消息调用多个 agents
- ✅ 例: 同时调用多个 codex 实现不同模块

### 3. 链式调用
- ✅ Agents 可以调用其他 agents
- ✅ 例: architect 调用 searcher 查找代码
- ✅ 例: debugger 调用 analyzer 分析影响

### 4. 职责分离
- ✅ 每个 agent 专注自己的职责
- ✅ 检索用 searcher,不要用 codex
- ✅ 分析用 analyzer,不要用 architect
- ✅ 实现用 codex,不要让 architect 写代码

## 🚀 快速开始

### 在主对话中调用 agent

```
用户: "查找所有用户认证相关的代码"

主对话: 调用 searcher agent
[使用 Task 工具调用 searcher]

searcher: 返回搜索结果
- src/auth/login.ts
- src/services/auth.service.ts
- ...

主对话: 将结果呈现给用户
```

### 并发调用多个 agents

```
用户: "实现用户注册功能"

主对话:
1. 创建 TodoList
2. 并发调用 agents(单个消息,多个 Task):
   - searcher: 查找现有代码
   - analyzer: 分析架构
   - architect: 设计方案

等待所有 agents 完成后:
3. 汇总结果
4. 根据 architect 的方案继续
```

## 📝 注意事项

1. **上下文隔离**: 每个 agent 有独立的上下文,不会污染主对话
2. **工具权限**:
   - 只读 agents: searcher, analyzer, reviewer, debugger
   - 读写 agents: codex, refactor, tester, doc-writer
3. **遵循八荣八耻**: 所有 agents 都遵循 CLAUDE.md 中的原则
4. **奥卡姆剃刀**: 优先选择最简单的方案,避免过度设计

## 🔧 自定义和扩展

你可以根据需要:
- 修改现有 agents 的 system prompt
- 调整 agents 的工具权限
- 添加新的专业 agents
- 在项目级别创建项目特定的 agents

## 📚 更多信息

- 官方文档: https://docs.claude.com/en/docs/claude-code/sub-agents.md
- 每个 agent 文件内都有详细的使用说明
- 查看 CLAUDE.md 了解全局指导原则

---

**Happy Coding! 🎉**
