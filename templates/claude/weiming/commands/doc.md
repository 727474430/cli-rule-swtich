文档编写 - 生成清晰的技术文档

Arguments: $ARGUMENTS

## 📝 文档编写任务

调用 **doc-writer** agent 编写技术文档、API 文档和使用说明。

## 文档目标

**文档内容**: $ARGUMENTS

## 执行流程

我将调用 **doc-writer** agent 执行文档编写:

### 阶段 1: 理解代码

**1.1 确定文档范围**
- 需要为哪些代码编写文档?
- 目标读者是谁?(初学者/高级开发者)
- 文档类型是什么?(API/使用指南/技术方案)
- 文档详细程度?

**1.2 分析代码**
- 调用 searcher 定位相关代码
- 调用 analyzer 理解架构和设计
- 阅读代码理解逻辑

**1.3 理解功能**
- 这个模块做什么?
- 如何使用?
- 有哪些注意事项?
- 常见使用场景?

### 阶段 2: 编写文档

**文档类型:**

**1. API 文档**
- 函数/类/接口说明
- 参数和返回值
- 使用示例
- 错误处理
- JSDoc/TSDoc 格式

**2. README 使用指南**
- 快速开始
- 功能介绍
- 配置说明
- 常见问题 FAQ
- 最佳实践

**3. 架构设计文档**
- 技术选型
- 架构图
- 模块划分
- 设计模式
- 数据流

**4. 代码注释**
- 函数/类说明
- 复杂逻辑解释
- 注意事项
- TODO/FIXME

### 阶段 3: 文档审查

**检查清单:**
- ✅ 准确性: 文档与代码一致
- ✅ 完整性: 所有必要信息都包含
- ✅ 清晰性: 易于理解,没有歧义
- ✅ 示例: 包含实用的代码示例
- ✅ 格式: Markdown 格式正确
- ✅ 链接: 所有链接有效

**读者视角:**
- 初学者能理解吗?
- 示例够清晰吗?
- 常见问题都覆盖了吗?

## 文档类型模板

### API 文档 (JSDoc)
```typescript
/**
 * 创建新用户
 *
 * @param input - 用户创建输入
 * @param input.name - 用户名,2-50个字符
 * @param input.email - 邮箱地址
 * @returns 创建的用户对象
 *
 * @throws {ValidationError} 输入数据无效
 * @throws {DuplicateEmailError} 邮箱已存在
 *
 * @example
 * const user = await createUser({
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 */
```

### README 文档
```markdown
# 项目名称

[一句话描述]

## 功能特性
- ✨ 特性1
- 🚀 特性2

## 快速开始
[安装和基本使用]

## API 文档
[详细 API 说明]

## 配置
[配置说明]

## 常见问题
[FAQ]
```

### 架构文档
```markdown
# 架构设计文档

## 技术栈
[技术选型]

## 架构图
[架构图示]

## 模块划分
[模块说明]

## 设计模式
[使用的设计模式]

## 数据流
[数据流说明]
```

## 文档写作原则

**1. 清晰简洁**
- ✅ 使用简单直接的语言
- ✅ 一句话一个意思
- ✅ 避免专业术语(或解释术语)

**2. 示例优先**
- ✅ 提供可运行的代码示例
- ✅ 示例涵盖常见场景
- ✅ 示例包含错误处理

**3. 结构化组织**
- ✅ 使用清晰的标题层级
- ✅ 相关内容分组
- ✅ 使用列表和表格

**4. 用户视角**
- ✅ 从用户使用场景出发
- ✅ 回答"如何做"
- ✅ 提供故障排除指南

## 代码注释最佳实践

```typescript
// ✅ 好的注释: 解释"为什么"
// 使用缓存避免重复计算,因为这个函数可能被频繁调用
const memoized = memoize(expensiveFunction)

// ✅ 好的注释: 解释复杂算法
/**
 * 使用二分查找优化性能
 * 时间复杂度: O(log n)
 */
function binarySearch(arr: number[], target: number): number {
  // 实现...
}

// ✅ 好的注释: 标注注意事项
/**
 * 注意: 此函数会修改原数组!
 */
function sortInPlace(array: number[]): void {
  // 实现...
}

// ❌ 坏的注释: 重复代码
// 设置用户名
user.name = name // 不需要,代码已经很清楚
```

## 预期输出

```markdown
## 文档创建完成

### 创建/更新的文档
- `README.md` - 项目使用指南
- `docs/API.md` - API 文档
- `src/services/user.service.ts` - 添加 JSDoc 注释

### 文档概要
[简要说明文档内容]

### 后续维护建议
- [ ] 代码变更时及时更新文档
- [ ] 定期检查文档准确性
- [ ] 收集用户反馈改进文档
```

## 文档模板选择

- API 文档 → JSDoc/TSDoc 注释
- 使用指南 → README.md
- 架构文档 → ARCHITECTURE.md
- 贡献指南 → CONTRIBUTING.md
- 更新日志 → CHANGELOG.md
- 故障排除 → TROUBLESHOOTING.md

## 开始编写

现在调用 doc-writer agent 开始文档编写...
