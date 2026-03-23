## 1. 准备工作

- [x] 1.1 创建目录结构 `src/types/`, `src/components/screens/`, `src/hooks/`
- [x] 1.2 创建 `src/types/index.ts`，移动类型定义（AppState, EnvStatus, JupyterInfo）

## 2. 组件拆分

- [x] 2.1 创建 `src/components/screens/LoadingScreen.tsx`
- [x] 2.2 创建 `src/components/screens/WelcomeScreen.tsx`
- [x] 2.3 创建 `src/components/screens/ProgressScreen.tsx`
- [x] 2.4 创建 `src/components/screens/ErrorScreen.tsx`
- [x] 2.5 创建 `src/components/JupyterViewer.tsx`

## 3. Hooks 抽离

- [x] 3.1 创建 `src/hooks/useEnvironment.ts`，封装 `checkEnvironment` 和 `createEnvironment`
- [x] 3.2 创建 `src/hooks/useJupyter.ts`，封装 `startJupyter` 和 `stopJupyter`

## 4. App.tsx 重构

- [x] 4.1 导入新模块（types, components, hooks）
- [x] 4.2 重写 App 组件，使用 hooks 管理状态
- [x] 4.3 删除旧代码（类型定义、子组件、业务逻辑函数）

## 5. 验证

- [x] 5.1 运行 `pnpm build`，确认无编译错误
- [x] 5.2 运行 `pnpm tauri dev`，确认功能正常
- [x] 5.3 检查所有屏幕组件渲染正确
