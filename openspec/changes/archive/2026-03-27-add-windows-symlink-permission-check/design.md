# Design: Add Windows Symlink Permission Check

## Context

**Windows 符号链接权限模型**：
- **默认行为**：普通用户无法创建符号链接，返回 `ERROR_PRIVILEGE_NOT_HELD (0x00000522)`
- **开发者模式**：Windows 10 1703+ 提供的选项，允许普通用户创建符号链接
- **管理员权限**：始终可以创建符号链接

**当前实现**（[src-tauri/src/domain/environment/kernel_links.rs:47-54](src-tauri/src/domain/environment/kernel_links.rs#L47-L54)）：
```rust
#[cfg(windows)]
{
    std::os::windows::fs::symlink_dir(&global_kernel_dir, &link_path)
        .map_err(|e| {
            debug!("❌ [KERNEL] 创建内核链接失败: {}", e);
            format!("创建内核链接失败: {}", e)
        })?;
}
```

**问题**：
1. 直接尝试创建，无预检测
2. 错误消息包含技术细节，不友好
3. 用户不知道如何解决问题

## Goals / Non-Goals

**Goals**：
- ✅ 提前检测 Windows 符号链接权限
- ✅ 提供清晰、友好的错误消息
- ✅ 提供具体的解决方案指导
- ✅ 保持 API 和功能不变

**Non-Goals**：
- ❌ 不改变 Windows 权限模型
- ❌ 不实现自动权限提升（安全考虑）
- ❌ 不添加新的外部依赖
- ❌ 不修改 Unix 行为

## Decisions

### Decision 1: 先检测后创建模式

**选择方案**：
```rust
#[cfg(windows)]
{
    // 权限检查函数
    if check_symlink_permission().is_err() {
        return Err(permission_error_message());
    }

    // 执行创建
    std::os::windows::fs::symlink_dir(&global_kernel_dir, &link_path)
        .map_err(|e| format!("创建内核链接失败: {}", e))?;
}
```

**理由**：
1. **用户体验**：先告知问题，避免操作失败
2. **错误清晰**：区分"权限不足"和"创建失败"
3. **性能**：检查失败立即返回，避免无效操作

**备选方案**：
- 捕获错误后判断类型：实现复杂，需要解析系统错误代码
- 无预检测：当前实现，用户体验差

### Decision 2: 使用临时文件测试权限

**权限检测实现**：
```rust
fn check_symlink_permission() -> Result<(), String> {
    let temp_dir = std::env::temp_dir().join("pyforge-test-symlink");
    let test_target = temp_dir.join("test-target");

    // 创建测试目录
    std::fs::create_dir_all(&test_target)?;

    // 尝试创建符号链接
    std::os::windows::fs::symlink_dir(&test_target, &temp_dir.join("test-symlink"))
        .map_err(|e| {
            std::fs::remove_dir_all(&temp_dir).ok(); // 清理
            format!("权限不足: {}", e)
        })?;

    // 清理
    std::fs::remove_dir_all(&temp_dir).ok();
    Ok(())
}
```

**理由**：
1. **准确性**：直接测试创建能力
2. **可靠性**：不依赖系统特定 API
3. **安全性**：使用临时文件，不影响用户数据

### Decision 3: 分级错误消息设计

**错误消息模板**：
```rust
fn permission_error_message() -> String {
    format!(
        "创建符号链接需要管理员权限或启用 Windows 开发者模式。\n\n\
         解决方案:\n\
         1. 以管理员身份运行 PyForge\n\
         2. 或启用开发者模式：\n    \
            设置 → 更新和安全 → 开发者选项 → 启用\"开发人员模式\"\n\n\
         详细说明：https://learn.microsoft.com/zh-cn/windows/apps/get-started/enable-your-device-for-development"
    )
}
```

**设计原则**：
1. **优先级排序**：最简单的解决方案在前
2. **完整性**：包含所有可能解决方案
3. **可操作性**：提供明确的步骤指导
4. **扩展性**：预留添加其他解决方案的空间

## Risks / Trade-offs

**风险评估**：

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 权限检查创建临时文件 | 低 | 低 | 使用系统临时目录，确保清理 |
| 用户不理解错误信息 | 低 | 低 | 提供多语言支持选项（中英文） |
| 检查耗时 | 极低 | 低 | 检查非常快速（毫秒级） |
| 权限变化检测延迟 | 极低 | 低 | 检查失败立即提示用户 |

**Trade-offs**：
- ✅ 优先用户体验，哪怕增加少量代码
- ✅ 优先清晰指导，哪怕消息较长
- ⚠️ 不过度设计，保持方案简单

## Migration Plan

**部署步骤**：
1. 添加权限检测函数
2. 修改 `bind_kernel_to_project` 函数
3. 更新错误处理逻辑
4. 测试验证
5. 提交代码

**回滚策略**：
- 单函数修改，易于回滚
- 保留原有逻辑作为注释
- 可快速恢复到无检测版本

## Open Questions

无（技术方案明确，实现简单）