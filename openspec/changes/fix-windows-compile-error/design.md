# Design: Fix Windows Compile Error

## Context

**背景**：
Windows 平台创建符号链接时需要明确指定类型（文件或目录），`guess_symlink_type` 函数负责推断类型。该函数在检查文件扩展名时出现类型错误，导致 Windows 平台编译失败。

**问题定位**：
```rust
let file_exts = ["exe", "dll", "txt", "py", "json", "yaml", "toml"];  // &[&str; 7]
let ext_str = ext.to_string_lossy();                                   // Cow<str>
if file_exts.contains(&*ext_str) {                                     // ❌ 类型错误
    // 期望: &&str (匹配数组元素 &str 的引用)
    // 实际: &str (解引用后的字符串切片)
}
```

**类型系统分析**：
- `file_exts` 类型为 `&[&str; 7]`，切片为 `&[&str]`
- `contains` 方法期望参数类型为 `&&str`（匹配元素 `&str` 的引用）
- `ext_str` 类型为 `Cow<str>`（可拷贝的字符串）
- `&*ext_str` 解引用得到 `str`，再取引用得到 `&str`
- **类型不匹配**：提供了 `&str`，但需要 `&&str`

## Goals / Non-Goals

**Goals**：
- ✅ 修复类型错误，使 Windows 平台能够编译通过
- ✅ 保持代码清晰易读
- ✅ 避免引入不必要的类型转换

**Non-Goals**：
- ❌ 不改变函数逻辑（推断策略保持不变）
- ❌ 不优化推断算法
- ❌ 不重构相关代码

## Decisions

### Decision 1: 使用 `as_ref()` 进行类型转换

**选择方案**：
```rust
let ext_str = ext.to_string_lossy();
if file_exts.contains(&ext_str.as_ref()) {  // ✅ 类型正确
    return false;
}
```

**理由**：
1. **类型正确性**：
   - `ext_str.as_ref()` 返回 `&str`
   - `&ext_str.as_ref()` 得到 `&&str`
   - 完全匹配 `contains` 的期望类型

2. **语义清晰**：
   - `as_ref()` 明确表示"借用引用"
   - 比手动解引用更符合 Rust 惯用法

3. **避免复制**：
   - 不创建新的字符串
   - 仅借用现有数据

**备选方案对比**：

| 方案 | 代码 | 优点 | 缺点 |
|------|------|------|------|
| ❌ 方案 1 | `&*ext_str` | 简洁 | 类型错误 |
| ✅ 方案 2 | `&ext_str.as_ref()` | 类型正确、语义清晰 | 稍长 |
| ⚠️ 方案 3 | 改变数组类型 | 无需修改调用 | 类型推断不直观 |
| ⚠️ 方案 4 | `iter().any()` | 灵活 | 过于复杂 |

**方案 3 代码**（未选择）：
```rust
let file_exts: &[&str] = &["exe", "dll", "txt", "py", "json", "yaml", "toml"];
// 仍然需要类型转换
```

**方案 4 代码**（未选择）：
```rust
if file_exts.iter().any(|&e| e == ext_str.as_ref()) {
    // 过于冗长
}
```

## Risks / Trade-offs

**风险评估**：

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 类型转换引入 bug | 极低 | 低 | 逻辑完全不变，仅修复类型 |
| 其他平台编译失败 | 极低 | 中 | 该函数仅 Windows 使用，不影响其他平台 |
| 性能影响 | 无 | 无 | `as_ref()` 零成本抽象 |

**Trade-offs**：
- ✅ 选择正确的类型系统用法，而非"恰好能编译"的方案
- ✅ 优先可读性和类型安全性
- ⚠️ 代码稍长（`&ext_str.as_ref()` vs `&*ext_str`），但可接受

## Migration Plan

**部署步骤**：
1. 修改单行代码
2. 提交 PR
3. CI 验证 Windows 编译通过
4. 合并到主分支

**回滚策略**：
- 单行修改，无需回滚计划
- 如有问题，直接 revert commit

## Open Questions

无（问题明确，解决方案简单）