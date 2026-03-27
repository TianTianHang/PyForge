# Implementation Tasks

## 1. Code Fix

- [ ] 1.1 修改 `src-tauri/src/api/config_commands.rs:227` 的类型错误
  - 将 `if file_exts.contains(&*ext_str)` 改为 `if file_exts.contains(&ext_str.as_ref())`
  - 保持其他代码不变

## 2. Verification

- [ ] 2.1 验证修改后的代码编译通过
  - 运行 `cargo check --target x86_64-pc-windows-msvc`
  - 确认无编译错误

- [ ] 2.2 验证其他平台编译不受影响
  - 运行 `cargo check` (当前平台)
  - 确认无警告或错误

## 3. Testing

- [ ] 3.1 运行现有测试套件
  - 执行 `cargo test`
  - 确认所有测试通过

## 4. Documentation

- [ ] 4.1 提交变更
  - 创建 commit 说明类型修复
  - 推送到远程分支