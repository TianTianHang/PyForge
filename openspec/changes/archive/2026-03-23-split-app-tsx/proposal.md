## Why

当前 `src/App.tsx` 文件（279 行）包含了所有类型定义、业务逻辑和 UI 组件。随着功能增长，单一文件职责混乱，导致：
- **维护困难**：修改一个功能需要理解整个文件
- **测试困难**：业务逻辑与 UI 耦合，无法独立测试
- **协作困难**：多人修改同一文件容易冲突

## What Changes

采用**方案 2：功能模块拆分**，将 App.tsx 拆分为以下结构：

```
src/
  types/
    index.ts                 # 类型定义（AppState, EnvStatus, JupyterInfo）
    
  components/
    screens/
      LoadingScreen.tsx      # 加载屏幕
      WelcomeScreen.tsx      # 欢迎屏幕
      ProgressScreen.tsx     # 进度屏幕
      ErrorScreen.tsx        # 错误屏幕
    JupyterViewer.tsx        # Jupyter 查看器
    
  hooks/
    useEnvironment.ts        # 环境检查和创建逻辑
    useJupyter.ts            # Jupyter 启动和停止逻辑
    
  App.tsx                    # 简化为：状态持有 + hooks 调用 + UI 路由
```

**具体变更**：
1. 创建 `types/index.ts`，导出类型定义
2. 将 5 个子组件移动到 `components/screens/`
3. 将 `checkEnvironment`、`createEnvironment` 抽取为 `useEnvironment` hook
4. 将 `startJupyter`、`stopJupyter` 抽取为 `useJupyter` hook
5. 简化 App.tsx，只保留状态声明、hooks 调用和渲染路由

## Capabilities

### New Capabilities
无（这是重构，不引入新功能）

### Modified Capabilities
无（功能行为不变，只是代码结构调整）

## Impact

**受影响的文件**：
- `src/App.tsx`（重构）
- 新增 8 个文件（见目录结构）

**不受影响**：
- Tauri 后端命令
- 样式文件 `App.css`
- 用户功能行为

**无 Breaking Changes**：
- 外部接口不变
- 组件 props 不变
- 仅内部代码组织方式改变
