# Design: Improve Process Termination Logic

## Context

**当前状态**：
进程终止逻辑分布在两个文件中，存在实现不完整和代码重复问题：

1. **进程.rs** ([src-tauri/src/infrastructure/process.rs](src-tauri/src/infrastructure/process.rs))：
   - `kill_gracefully`: 使用 `taskkill /PID`（Windows）
   - `kill_forcefully`: 使用 `taskkill /PID`（Windows）

2. **终止器.rs** ([src-tauri/src/domain/jupyter/terminator.rs](src-tauri/src/domain/jupyter/terminator.rs))：
   - `stop_jupyter_server`: 使用 `taskkill /F /PID`（Windows）

**主要问题**：
- Windows 缺少 `/T` 标志，无法终止进程树
- 错误被忽略 (`let _ = ...`)，无法诊断失败
- 重复代码违背 DRY 原则

## Goals / Non-Goals

**Goals**：
- ✅ 修复 Windows 进程树终止问题（添加 `/T` 标志）
- ✅ 统一进程终止逻辑（消除重复代码）
- ✅ 添加完善的错误处理和诊断信息
- ✅ 保持 API 向后兼容性

**Non-Goals**：
- ❌ 不改变公共函数的签名
- ❌ 不引入新的外部依赖
- ❌ 不改变 Unix 行为（保持现有实现）
- ❌ 不修改性能敏感路径

## Decisions

### Decision 1: 使用 `taskkill /F /T /PID` 终止进程树

**选择方案**：
```rust
#[cfg(windows)]
{
    let output = Command::new("taskkill")
        .args(["/F", "/T", "/PID", &pid.to_string()])  // 添加 /T
        .output()
        .await?;
}
```

**理由**：
1. **完整性**：`/T` 确保终止进程及其所有子进程
2. **一致性**：`/F` 强制终止，与 `kill_forcefully` 行为一致
3. **兼容性**：Windows Vista+ 都支持这些参数

**备选方案**：
- 仅使用 `/T`：可能无法强制终止僵死进程
- 使用 PowerShell：更复杂，无实际优势
- 手动枚举子进程：实现复杂且容易出错

### Decision 2: 统一错误处理模式

**选择方案**：
```rust
pub async fn kill_forcefully(pid: u32) -> Result<(), String> {
    let output = Command::new(if cfg!(unix) {
        "kill"
    } else {
        "taskkill"
    })
    .args(if cfg!(unix) {
        &["-9", &pid.to_string()]
    } else {
        &["/F", "/T", "/PID", &pid.to_string()]
    })
    .output()
    .await
    .map_err(|e| format!("执行终止命令失败: {}", e))?;

    if !output.status.success() {
        return Err(format!("终止进程失败: {}",
            String::from_utf8_lossy(&output.stderr)));
    }

    Ok(())
}
```

**理由**：
1. **错误诊断**：能够获取并报告命令执行结果
2. **调试友好**：包含 stderr 输出帮助定位问题
3. **跨平台一致**：统一的错误处理模式

### Decision 3: 重构消除重复代码

**重构策略**：
1. 将 `stop_jupyter_server` 改为调用 `kill_forcefully`
2. 移除重复的 Windows 命令构建逻辑
3. 保持所有公共 API 不变

**理由**：
1. **代码复用**：避免维护两套相似逻辑
2. **易于维护**：修改终止逻辑只需改动一处
3. **测试简化**：统一行为，减少测试覆盖范围

## Risks / Trade-offs

**风险评估**：

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Windows 进程终止失败 | 低 | 中 | 添加重试机制（可选） |
| 权限问题 | 低 | 低 | 提供清晰错误提示 |
| 破坏现有调用者 | 极低 | 低 | 保持 API 不变 |
| 性能影响 | 无 | 无 | 命令执行时间不变 |

**Trade-offs**：
- ✅ 优先保证进程完整终止，哪怕更激进
- ✅ 统一错误处理，哪怕增加少量代码
- ⚠️ 不做过度设计，保持最小变更

## Migration Plan

**部署步骤**：
1. 更新 `src-tauri/src/infrastructure/process.rs`
   - 增强错误处理
   - 添加 `/T` 标志
2. 更新 `src-tauri/src/domain/jupyter/terminator.rs`
   - 重构为调用 `kill_forcefully`
3. 运行测试验证
4. 提交代码

**回滚策略**：
- 小范围修改，易于回滚
- 保留原有逻辑作为注释
- 如有问题可快速恢复

## Open Questions

无（技术决策明确，实现路径清晰）