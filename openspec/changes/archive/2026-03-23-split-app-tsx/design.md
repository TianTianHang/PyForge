## Context

PyForge 是一个基于 Tauri 2.0 的桌面 Python 开发环境。当前 `src/App.tsx` 文件包含 279 行代码，混合了：
- 3 个 TypeScript 类型定义
- 5 个 state 状态
- 2 个 useEffect hook
- 5 个业务逻辑函数
- 5 个 UI 子组件

这是一个典型的**功能堆砌**问题。随着 MVP 验证完成，需要将代码拆分为可维护的模块。

**技术约束**：
- 使用 React 19 + TypeScript 5.8
- Tauri invoke API 必须在 React 组件内调用（需要异步处理）
- 保持现有功能行为不变

## Goals / Non-Goals

**Goals:**
- 每个文件职责单一，易于理解
- 业务逻辑可独立测试（hooks）
- 组件 UI 与逻辑解耦
- App.tsx 控制在 60 行以内

**Non-Goals:**
- 不引入全局状态管理（当前 state 足够）
- 不改变任何功能行为
- 不优化性能（这是结构重组）
- 不创建测试文件（后续单独处理）

## Decisions

### 决策 1：按功能领域划分 Hooks

**选择**：创建 `useEnvironment` 和 `useJupyter` 两个 hooks

```
src/hooks/
  useEnvironment.ts   # checkEnvironment, createEnvironment
  useJupyter.ts       # startJupyter, stopJupyter
```

**考虑的替代方案**：
- ❌ 单一 `useApp.ts` hook：职责仍然混合
- ❌ 将 invoke 调用封装为 service：需要在组件内处理 state，反而更复杂

**理由**：hooks 自然地封装了“状态 + 业务逻辑”的组合，且可独立测试。

### 决策 2：屏幕组件保持简单

**选择**：屏幕组件只接受 props，不调用 hooks

```
// ✅ 正确
function WelcomeScreen({ onCreateEnv, envPath }: Props) {
  return <div onClick={onCreateEnv}>...</div>
}

// ❌ 错误
function WelcomeScreen({ envPath }: { envPath: string }) {
  const { createEnv } = useEnvironment();
  return <div onClick={createEnv}>...</div>
}
```

**理由**：组件越简单，可复用性越高。业务逻辑在 hooks 层，UI 层只负责展示。

### 决策 3：类型文件独立管理

**选择**：创建 `src/types/index.ts` 集中管理类型

**考虑的替代方案**：
- ❌ 每个模块各自定义类型：会导致重复定义
- ❌ 放在 App.tsx 内：拆分后无法跨模块引用

**理由**：类型定义需要被多个模块共享，集中管理更清晰。

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 引入循环依赖 | 编译失败 | 保持 hooks 不依赖 components，单向依赖 |
| Props 钻取 | 未来可能需要 Context | 当前层级浅（仅 2 层），先不引入 |
| 文件增多 | 项目结构变复杂 | 使用清晰的目录结构和命名规范 |
| 重构过程中引入 bug | 功能异常 | 每个文件拆分后立即验证行为 |

**已知权衡**：
- 8 个新文件 vs 1 个大文件 → 接受，换取可维护性
- 需要额外 import 语句 → 接受，换取清晰的模块边界
