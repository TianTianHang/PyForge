# Rust 多平台文件操作指南

## 📚 概述

本文档总结了 Rust 在多平台文件操作中遇到的主要差异和解决方案，基于 PyForge 项目的实践经验，同时也涵盖了通用的跨平台开发模式。

## 🏗️ 平台差异概览

### 1. 文件系统架构差异

| 特性 | Windows | Unix/Linux | macOS | 处理策略 |
|------|---------|------------|-------|----------|
| **路径分隔符** | `\` | `/` | `/` | 使用 `PathBuf` 和 `std::path` |
| **大小写敏感** | 不敏感 | 敏感 | 敏感 | 统一转换为小写存储 |
| **最大路径长度** | 260 字符 | 4096 字符 | 4096 字节 | 使用 `LongPathAware` |
| **保留文件名** | `CON`, `PRN`, `AUX` 等 | 无保留 | 无保留 | 避免使用保留名称 |
| **文件扩展名** | 重要，关联程序 | 可选，约定俗成 | 可选，约定俗成 | 平台无关命名 |

### 2. 权限系统差异

| 系统特性 | Windows | Unix/Linux | macOS | 处理策略 |
|----------|---------|------------|-------|----------|
| **权限模型** | ACL (访问控制列表) | POSIX 权限 | POSIX + SIP | 使用 `std::fs::metadata` 检测 |
| **默认权限** | 继承父目录 | 755 | 755 + 隐藏文件 | 平台无关设置 |
| **特殊权限** | 管理员权限 | SUID/SGID | SUID/SGID + SIP | 避免依赖特殊权限 |
| **用户组** | AD 集成 | /etc/passwd | DSCL + OpenDirectory | UID/GID 抽象 |
| **符号链接** | 需要管理员权限或开发者模式 | 无限制 | 无限制（除 SIP 外） | 检查权限后操作 |

### 3. 文件操作差异

| 操作类型 | Windows | Unix | 跨平台策略 |
|----------|--------|------|------------|
| **文件创建** | `CreateFile` | `open()` | 使用 `std::fs::File::create()` |
| **删除** | `DeleteFile` + `RemoveDirectory` | `unlink()` + `rmdir()` | 使用 `std::fs::remove_file()` |
| **重命名** | `MoveFileEx` | `rename()` | 使用 `std::fs::rename()` |
| **复制** | `CopyFile` | `cp -r` | 手动实现递归复制 |
| **符号链接** | `CreateSymbolicLink` | `symlink()` | 条件编译 + 权限检查 |

## 🛠️ 核心实现模式

### 1. 路径管理抽象

```rust
// 推荐的跨平台路径处理
use std::path::{Path, PathBuf, Component};

pub fn normalize_path(path: &Path) -> PathBuf {
    // 处理平台特定的路径问题
    let mut components = path.components();
    let mut result = PathBuf::new();

    while let Some(comp) = components.next() {
        match comp {
            Component::Prefix(_) => {
                // Windows 盘符处理
                result.push(comp);
            }
            Component::RootDir => {
                result.push(comp);
            }
            Component::CurDir => {
                // 忽略 . 当前目录
            }
            Component::ParentDir => {
                // 处理 ..
                if let Some(parent) = result.pop() {
                    // 处理 Windows 的 UNC 路径特殊情况
                    if cfg!(windows) && result.as_os_str().is_empty() {
                        result.push(".");
                    }
                }
            }
            Component::Normal(name) => {
                result.push(name);
            }
        }
    }

    result
}

// 平台特定的路径扩展
pub fn get_executable_path(env_dir: &Path, executable: &str) -> PathBuf {
    if cfg!(target_os = "windows") {
        env_dir.join("Scripts").join(format!("{}.exe", executable))
    } else {
        env_dir.join("bin").join(executable)
    }
}
```

### 2. 符号链接处理

```rust
use std::os::windows::fs::symlink_dir;
use std::os::windows::fs::symlink_file;
use std::os::unix::fs::symlink;
use std::fs;
use std::path::Path;

/// 跨平台符号链接创建
pub fn create_symlink(target: &Path, link: &Path) -> Result<(), String> {
    #[cfg(unix)]
    {
        symlink(target, link)
            .map_err(|e| format!("创建符号链接失败: {}", e))?;
    }

    #[cfg(windows)]
    {
        // Windows 权限检查
        check_symlink_permissions()?;

        let is_dir = target
            .metadata()
            .map(|m| m.is_dir())
            .unwrap_or(false);

        if is_dir {
            symlink_dir(target, link)
        } else {
            symlink_file(target, link)
        }
        .map_err(|e| format!("创建符号链接失败: {}", e))?;
    }

    Ok(())
}

#[cfg(windows)]
fn check_symlink_permissions() -> Result<(), String> {
    use std::env;

    // 检查是否以管理员身份运行
    if !env::var("MSYSTEM").unwrap_or_default().is_empty() {
        // MSYS2 环境，通常有权限
        return Ok(());
    }

    // 检查开发者模式
    let developer_mode = check_windows_developer_mode()?;
    if !developer_mode {
        let is_admin = check_admin_privileges();
        if !is_admin {
            return Err(
                "创建符号链接需要管理员权限或启用开发者模式。\n\
                请以管理员身份运行程序，或启用开发者模式：
                设置 → 更新和安全 → 开发者选项 → 启用'开发人员模式'"
                .to_string()
            );
        }
    }

    Ok(())
}
```

### 3. 文件权限管理

```rust
use std::fs::Permissions;
use std::os::unix::fs::PermissionsExt;

/// 跨平台设置文件权限
pub fn set_file_permissions(path: &Path, mode: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        let perms = Permissions::from_mode(mode);
        fs::set_permissions(path, perms)
            .map_err(|e| format!("设置权限失败: {}", e))?;
    }

    #[cfg(windows)]
    {
        // Windows 不支持传统的 Unix 权限
        // 可以通过 ACL 设置，但这需要管理员权限
        // 这里仅做兼容性处理
        if mode & 0o777 != mode {
            // Windows 不支持所有 Unix 权限位
            eprintln!("警告: Windows 不支持某些 Unix 权限位");
        }
    }

    Ok(())
}

/// 检查文件是否可写
pub fn is_writable(path: &Path) -> Result<bool, String> {
    match path.metadata() {
        Ok(metadata) => {
            #[cfg(unix)]
            {
                Ok(metadata.permissions().mode() & 0o200 != 0)
            }

            #[cfg(windows)]
            {
                // Windows 权限检查较为复杂
                // 使用实际文件写入测试
                test_file_writability(path)
            }
        }
        Err(e) => Err(format!("获取文件权限失败: {}", e)),
    }
}
```

### 4. 进程和文件锁定

```rust
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::Path;
use std::time::Duration;

/// 跨平台文件锁定
pub fn lock_file(path: &Path) -> Result<File, String> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::FileExt;

        let file = File::create(path)
            .map_err(|e| format!("创建锁文件失败: {}", e))?;

        // 尝试获取独占锁
        match file.try_lock_exclusive() {
            Ok(()) => Ok(file),
            Err(_) => Err("文件被锁定".to_string()),
        }
    }

    #[cfg(windows)]
    {
        use std::os::windows::fs::FileExt;

        let file = File::create(path)
            .map_err(|e| format!("创建锁文件失败: {}", e))?;

        // Windows 支持共享和独占锁定
        match file.try_lock_exclusive(true) {
            Ok(()) => Ok(file),
            Err(_) => Err("文件被锁定".to_string()),
        }
    }
}

/// 等待文件解锁
pub fn wait_for_unlock(path: &Path, timeout: Duration) -> Result<(), String> {
    let start = std::time::Instant::now();

    while start.elapsed() < timeout {
        if !path.exists() {
            return Ok(());
        }

        // 检查是否可以打开文件
        if let Ok(_) = File::open(path) {
            #[cfg(unix)]
            {
                use std::os::unix::fs::FileExt;
                let file = File::open(path).unwrap();
                if file.try_lock_exclusive().is_ok() {
                    return Ok(());
                }
            }

            #[cfg(windows)]
            {
                use std::os::windows::fs::FileExt;
                let file = File::open(path).unwrap();
                if file.try_lock_exclusive(true).is_ok() {
                    return Ok(());
                }
            }
        }

        std::thread::sleep(Duration::from_millis(100));
    }

    Err("等待文件解锁超时".to_string())
}
```

## 🚨 常见陷阱和解决方案

### 1. 长路径问题

```rust
// Windows 长路径支持
use std::path::Path;

#[cfg(windows)]
pub fn handle_long_path(path: &Path) -> PathBuf {
    if let Some(path_str) = path.to_str() {
        if path_str.len() > 260 {
            // 添加 \\?\ 前缀
            let long_path = format!(r"\\?\{}", path_str);
            PathBuf::from(long_path)
        } else {
            path.to_path_buf()
        }
    } else {
        path.to_path_buf()
    }
}

// 使用示例
pub fn open_file(path: &Path) -> Result<File, String> {
    let final_path = if cfg!(windows) {
        handle_long_path(path)
    } else {
        path.to_path_buf()
    };

    File::open(final_path)
        .map_err(|e| format!("打开文件失败: {}", e))
}
```

### 2. 符号链接循环检测

```rust
use std::collections::HashSet;
use std::fs;
use std::path::Path;

/// 检测符号链接循环
pub fn detect_symlink_loop(path: &Path) -> Result<bool, String> {
    let mut visited = HashSet::new();
    let mut current = path.to_path_buf();

    while current.exists() && current.is_symlink() {
        if visited.contains(&current) {
            return Ok(true); // 检测到循环
        }

        visited.insert(current.clone());

        // 解析符号链接目标
        match fs::read_link(&current) {
            Ok(target) => {
                current = if target.is_absolute() {
                    target
                } else {
                    current.parent()
                        .unwrap_or(&current)
                        .join(&target)
                        .canonicalize()
                        .unwrap_or(target)
                };
            }
            Err(_) => break, // 无法读取，终止循环
        }
    }

    Ok(false)
}
```

### 3. 缓存目录处理

```rust
use std::env;
use std::path::PathBuf;

/// 获取平台特定的缓存目录
pub fn get_cache_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        env::var("LOCALAPPDATA")
            .map(|path| PathBuf::from(path).join("AppName"))
            .unwrap_or_else(|_| {
                env::var("APPDATA")
                    .map(|path| PathBuf::from(path).join("AppName"))
                    .unwrap_or_else(|_| {
                        env::home_dir().map(|home| home.join("AppData\\Local\\AppName"))
                            .unwrap_or_else(|| PathBuf::from("."))
                    })
            })
    }

    #[cfg(target_os = "macos")]
    {
        env::var("HOME")
            .map(|path| PathBuf::from(path).join("Library/Caches/AppName"))
            .unwrap_or_else(|_| {
                PathBuf::from("/tmp/AppName")
            })
    }

    #[cfg(target_os = "linux")]
    {
        env::var("XDG_CACHE_HOME")
            .map(|path| PathBuf::from(path).join("AppName"))
            .unwrap_or_else(|_| {
                env::var("HOME")
                    .map(|path| PathBuf::from(path).join(".cache/AppName"))
                    .unwrap_or_else(|| {
                        PathBuf::from("/tmp/AppName")
                    })
            })
    }
}

/// 获取平台特定的数据目录
pub fn get_data_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        env::var("APPDATA")
            .map(|path| PathBuf::from(path).join("AppName"))
            .unwrap_or_else(|_| {
                env::home_dir().map(|home| home.join("AppData\\Roaming\\AppName"))
                    .unwrap_or_else(|| PathBuf::from("."))
            })
    }

    #[cfg(target_os = "macos")]
    {
        env::var("HOME")
            .map(|path| PathBuf::from(path).join("Library/Application Support/AppName"))
            .unwrap_or_else(|_| {
                PathBuf::from("/tmp/AppName")
            })
    }

    #[cfg(target_os = "linux")]
    {
        env::var("XDG_DATA_HOME")
            .map(|path| PathBuf::from(path).join("AppName"))
            .unwrap_or_else(|_| {
                env::var("HOME")
                    .map(|path| PathBuf::from(path).join(".local/share/AppName"))
                    .unwrap_or_else(|| {
                        PathBuf::from("/tmp/AppName")
                    })
            })
    }
}
```

## 📦 推荐的 crate

### 1. 跨平台工具

```toml
[dependencies]
# 路径处理
pathdiff = "0.2"  # 路径差异计算
walkdir = "2.3"   # 递归目录遍历

# 权限管理
umask = "2.0"      # Unix 权限掩码

# 文件监控
notify = "6.0"     # 跨平台文件系统监控

# 进程管理
command-group = "2.0"  # 进程组管理
```

### 2. 高级功能

```toml
# 高级路径操作
path-clean = "0.1"    # 清理路径中的冗余部分

# 符号链接处理
atomic-file = "0.2"    # 原子文件操作

# 配置管理
config = "0.13"       # 跨平台配置管理

# 日志
log = "0.4"           # 跨平台日志
```

## 🔧 最佳实践

### 1. 文件命名约定

```rust
// ✅ 推荐
pub fn safe_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            c if c.is_control() => '_',
            c => c,
        })
        .collect()
}

// ❌ 避免
// 使用未经检查的用户输入作为文件名
```

### 2. 资源清理

```rust
use std::fs;
use std::path::Path;

/// 确保文件被删除，忽略错误
pub fn ensure_file_deleted(path: &Path) {
    let _ = fs::remove_file(path); // 忽略删除错误
}

/// 确保目录被删除，忽略错误
pub fn ensure_dir_deleted(path: &Path) {
    let _ = fs::remove_dir_all(path); // 忽略删除错误
}
```

### 3. 错误处理

```rust
use std::io::Error as IoError;

/// 跨平台错误信息
pub fn get_platform_error() -> &'static str {
    #[cfg(windows)]
    {
        "Windows 文件系统错误"
    }

    #[cfg(target_os = "macos")]
    {
        "macOS 文件系统错误"
    }

    #[cfg(target_os = "linux")]
    {
        "Linux 文件系统错误"
    }
}

/// 统一的错误处理
pub fn handle_file_error(e: IoError) -> String {
    format!("{}: {}", get_platform_error(), e)
}
```

## 📖 测试策略

### 1. 平台特定测试

```rust
#[cfg(test)]
mod cross_platform_tests {
    use super::*;

    #[test]
    fn test_path_normalization() {
        let test_cases = vec![
            (Path::new("/usr/../local/bin"), Path::new("/usr/local/bin")),
            (Path::new("C:\\Users\\..\\Admin"), Path::new("C:\\Admin")),
        ];

        for (input, expected) in test_cases {
            assert_eq!(normalize_path(input), expected);
        }
    }

    #[test]
    #[cfg(windows)]
    fn test_symlink_permissions_windows() {
        // Windows 专有测试
        assert!(check_symlink_permissions().is_ok());
    }

    #[test]
    #[cfg(unix)]
    fn test_symlink_creation_unix() {
        // Unix 专有测试
        let temp_dir = tempfile::tempdir().unwrap();
        let target = temp_dir.path().join("target");
        let link = temp_dir.path().join("link");

        fs::write(&target, "test").unwrap();
        create_symlink(&target, &link).unwrap();

        assert!(link.exists());
        assert!(link.is_symlink());
    }
}
```

### 2. 集成测试

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_file_operations_workflow() {
        let temp_dir = tempfile::tempdir().unwrap();
        let test_file = temp_dir.path().join("test.txt");

        // 1. 创建文件
        let mut file = File::create(&test_file).unwrap();
        write!(file, "Hello, World!").unwrap();

        // 2. 读取文件
        let mut content = String::new();
        File::open(&test_file).unwrap().read_to_string(&mut content).unwrap();
        assert_eq!(content, "Hello, World!");

        // 3. 重命名文件
        let renamed_file = temp_dir.path().join("renamed.txt");
        fs::rename(&test_file, &renamed_file).unwrap();
        assert!(!test_file.exists());
        assert!(renamed_file.exists());

        // 4. 删除文件
        fs::remove_file(&renamed_file).unwrap();
        assert!(!renamed_file.exists());
    }
}
```

## 🔄 性能考虑

### 1. 批量操作优化

```rust
/// 批量文件操作
pub fn batch_copy_files(files: &[(PathBuf, PathBuf)], progress: impl Fn(u32)) -> Result<(), String> {
    let total = files.len() as u32;
    let mut succeeded = 0;

    for (src, dst) in files {
        match fs::copy(src, dst) {
            Ok(_) => succeeded += 1,
            Err(e) => {
                eprintln!("复制失败: {} -> {}, 错误: {}", src.display(), dst.display(), e);
            }
        }
        progress(succeeded);
    }

    if succeeded < total {
        Err(format!("批量复制完成: {}/{}", succeeded, total))
    } else {
        Ok(())
    }
}
```

### 2. 并发处理

```rust
use std::sync::Arc;
use rayon::prelude::*;

/// 并行目录扫描
pub fn scan_directories_parallel(paths: &[PathBuf]) -> Vec<PathBuf> {
    let results: Vec<_> = paths
        .par_iter()
        .filter_map(|path| {
            if path.exists() && path.is_dir() {
                Some(path.clone())
            } else {
                None
            }
        })
        .collect();

    results
}
```

## 📊 总结

Rust 多平台文件操作的关键要点：

1. **使用标准库** - `std::fs` 和 `std::path` 已经提供了良好的跨平台抽象
2. **条件编译** - 对平台特定功能使用 `#[cfg(target_os = "...")]`
3. **错误处理** - 提供友好的跨平台错误消息
4. **权限检查** - 特别是 Windows 符号链接权限
5. **路径长度** - 处理 Windows 的长路径限制
6. **测试覆盖** - 针对不同平台编写适当的测试

遵循这些原则可以构建健壮的跨平台文件系统应用。