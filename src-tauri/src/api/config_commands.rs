use crate::infrastructure::{init_paths, load_config, save_config, write_uv_config};
use crate::models::AppConfig;
use pathdiff::diff_paths;
use std::collections::HashSet;

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    load_config()
}

#[tauri::command]
pub fn update_config(config: AppConfig) -> Result<(), String> {
    save_config(&config)?;
    write_uv_config(&config)?;

    // Re-initialize paths with new data dir
    let data_dir = config.data_dir();
    init_paths(data_dir)?;

    Ok(())
}

#[tauri::command]
pub fn validate_data_dir(path: String) -> Result<bool, String> {
    let dir = std::path::PathBuf::from(&path);
    if dir.exists() {
        Ok(true)
    } else {
        std::fs::create_dir_all(&dir)
            .map(|_| true)
            .map_err(|e| format!("无法创建目录 {}: {}", path, e))
    }
}

#[tauri::command]
pub fn migrate_data(old_path: String, new_path: String) -> Result<(), String> {
    let old = std::path::PathBuf::from(&old_path);
    let new = std::path::PathBuf::from(&new_path);

    if !old.exists() {
        return Err(format!("源目录不存在: {}", old_path));
    }

    std::fs::create_dir_all(&new).map_err(|e| format!("创建目标目录失败: {}", e))?;

    // Collect symlinks during first pass
    let mut symlinks: Vec<(std::path::PathBuf, std::path::PathBuf)> = Vec::new();

    // Pass 1: copy files/dirs, skip symlinks
    for entry in std::fs::read_dir(&old).map_err(|e| format!("读取源目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src = entry.path();
        let dst = new.join(entry.file_name());

        if src.is_symlink() {
            // 检测循环符号链接
            if has_loop_symlink(&src, &mut HashSet::new()) {
                eprintln!("警告: 检测到循环符号链接 {:?}, 跳过", src);
                continue;
            }
            symlinks.push((src.clone(), dst.clone()));
        } else if src.is_dir() {
            copy_dir_recursive(&src, &dst, &old, &new, &mut symlinks)?;
        } else {
            std::fs::copy(&src, &dst).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    // Pass 2: recreate all symlinks
    for (src, dst) in &symlinks {
        recreate_symlink(src, dst, &old, &new)?;
    }

    Ok(())
}

fn copy_dir_recursive(
    src: &std::path::Path,
    dst: &std::path::Path,
    old_root: &std::path::Path,
    new_root: &std::path::Path,
    symlinks: &mut Vec<(std::path::PathBuf, std::path::PathBuf)>,
) -> Result<(), String> {
    std::fs::create_dir_all(dst).map_err(|e| format!("创建目录失败: {}", e))?;

    for entry in std::fs::read_dir(src).map_err(|e| format!("读取目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_symlink() {
            // 检测循环符号链接
            if has_loop_symlink(&src_path, &mut HashSet::new()) {
                eprintln!("警告: 检测到循环符号链接 {:?}, 跳过", src_path);
                continue;
            }
            symlinks.push((src_path, dst_path));
        } else if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path, old_root, new_root, symlinks)?;
        } else {
            std::fs::copy(&src_path, &dst_path).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    Ok(())
}

fn recreate_symlink(
    src: &std::path::Path,
    dst: &std::path::Path,
    old_root: &std::path::Path,
    new_root: &std::path::Path,
) -> Result<(), String> {
    let target = std::fs::read_link(src).map_err(|e| format!("读取符号链接失败: {}", e))?;

    // 检查并处理损坏的符号链接
    if is_broken_symlink(src) {
        eprintln!("警告: 检测到损坏的符号链接 {:?}, 尝试重建", src);
    }

    let resolved = if target.is_absolute() {
        // Absolute path: rewrite prefix if within old_root
        if let Ok(rel) = target.strip_prefix(old_root) {
            new_root.join(rel)
        } else {
            target.clone()
        }
    } else {
        // Relative path: resolve against old symlink location, check if within old_root
        let old_parent = src.parent().unwrap_or(old_root);
        let abs_target = old_parent.join(&target);
        let canonical = abs_target
            .canonicalize()
            .unwrap_or_else(|_| abs_target.clone());

        if let Ok(rel) = canonical.strip_prefix(old_root) {
            // Rewrite: new_dst_parent -> new_target (relative)
            let new_dst_parent = dst.parent().unwrap_or(new_root);
            let new_target = new_root.join(rel);
            diff_paths(&new_target, new_dst_parent).unwrap_or(target.clone())
        } else {
            target.clone()
        }
    };

    #[cfg(unix)]
    std::os::unix::fs::symlink(&resolved, dst).map_err(|e| format!("创建符号链接失败: {}", e))?;
    #[cfg(windows)]
    {
        let is_dir = if target.is_absolute() {
            std::fs::symlink_metadata(&target)
                .map(|m| m.is_dir())
                .unwrap_or_else(|_| guess_symlink_type(&target))
        } else {
            // 相对路径需要相对于符号链接的父目录解析
            let resolved = src.parent()
                .map(|parent| parent.join(&target))
                .unwrap_or_else(|| target.clone());

            std::fs::symlink_metadata(&resolved)
                .map(|m| m.is_dir())
                .unwrap_or_else(|_| guess_symlink_type(&target))
        };

        if is_dir {
            std::os::windows::fs::symlink_dir(&resolved, dst)
                .map_err(|e| format!("创建目录符号链接失败: {}", e))?;
        } else {
            std::os::windows::fs::symlink_file(&resolved, dst)
                .map_err(|e| format!("创建文件符号链接失败: {}", e))?;
        }
    }

    Ok(())
}


/// 检测循环符号链接
/// 返回 true 表示检测到循环
fn has_loop_symlink(path: &std::path::Path, visited: &mut HashSet<std::path::PathBuf>) -> bool {
    match std::fs::read_link(path) {
        Ok(target) => {
            // 将相对路径转换为绝对路径后再检查
            let absolute_target = if target.is_absolute() {
                target.clone()
            } else {
                // 解析相对于当前符号链接所在路径的绝对路径
                path.parent()
                    .map(|parent| parent.canonicalize().unwrap_or(parent.to_path_buf()).join(&target))
                    .unwrap_or_else(|| target.clone())
            };

            if !visited.insert(absolute_target.clone()) {
                return true; // 已访问过，检测到循环
            }

            // 递归检查目标是否也是符号链接
            if absolute_target.is_symlink() {
                return has_loop_symlink(&absolute_target, visited);
            }
            false
        }
        Err(_) => false, // 无法读取，不视为循环
    }
}

/// 检查符号链接目标是否存在
fn is_broken_symlink(path: &std::path::Path) -> bool {
    match std::fs::read_link(path) {
        Ok(target) => {
            // 解析相对路径
            let resolved = if target.is_absolute() {
                target
            } else {
                path.parent()
                    .map(|p| p.join(&target))
                    .unwrap_or_else(|| target)
            };

            // 使用 canonicalize 解析相对路径中的 '..'
            // 如果 canonicalize 失败，说明路径不存在或跨挂载点
            let final_resolved = resolved.canonicalize().unwrap_or(resolved);

            // 使用 metadata 检查最终目标是否存在
            std::fs::metadata(&final_resolved).is_err()
        }
        Err(_) => true, // 无法读取视为损坏
    }
}

/// 在 Windows 上尝试推断符号链接类型（文件或目录）
#[cfg(windows)]
fn guess_symlink_type(target: &std::path::Path) -> bool {
    // 策略1: 根据路径特征推断
    let target_str = target.to_string_lossy().to_lowercase();
    if target_str.contains("bin") || target_str.contains("lib") ||
       target_str.contains("include") || target_str.ends_with("env") {
        return true; // 可能是目录
    }

    // 策略2: 根据扩展名判断
    if let Some(ext) = target.extension() {
        let file_exts = ["exe", "dll", "txt", "py", "json", "yaml", "toml"];
        if file_exts.contains(&ext.to_string_lossy().as_str()) {
            return false; // 文件
        }
    }

    // 默认: 尝试目录链接
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;
    use tempfile::TempDir;

    /// 测试辅助函数：创建测试文件
    fn create_test_file(path: &std::path::Path, content: &str) {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).unwrap();
        }
        fs::write(path, content).unwrap();
    }

    /// 测试辅助函数：创建符号链接
    #[cfg(unix)]
    fn create_symlink_link(target: &std::path::Path, link: &std::path::Path) {
        std::os::unix::fs::symlink(target, link).unwrap();
    }

    #[cfg(windows)]
    fn create_symlink_link(target: &std::path::Path, link: &std::path::Path) {
        if target.is_dir() {
            std::os::windows::fs::symlink_dir(target, link).unwrap();
        } else {
            std::os::windows::fs::symlink_file(target, link).unwrap();
        }
    }

    
    #[test]
    fn test_migrate_file_symlink() {
        let old_dir = TempDir::new().unwrap();
        let new_dir = TempDir::new().unwrap();

        // 创建源文件和符号链接
        let src_file = old_dir.path().join("real.txt");
        create_test_file(&src_file, "content");

        let symlink = old_dir.path().join("link.txt");
        create_symlink_link(&src_file, &symlink);

        // 执行迁移
        migrate_data(
            old_dir.path().to_str().unwrap().to_string(),
            new_dir.path().to_str().unwrap().to_string(),
        ).unwrap();

        // 验证符号链接正确迁移
        let new_symlink = new_dir.path().join("link.txt");
        assert!(new_symlink.is_symlink());
        assert_eq!(fs::read_to_string(&new_symlink).unwrap(), "content");
    }

    #[test]
    fn test_migrate_mixed_content() {
        let old_dir = TempDir::new().unwrap();
        let new_dir = TempDir::new().unwrap();

        // 创建混合内容: 文件、目录、符号链接
        create_test_file(&old_dir.path().join("file.txt"), "content");
        fs::create_dir_all(old_dir.path().join("dir")).unwrap();

        let file = old_dir.path().join("file.txt");
        let symlink = old_dir.path().join("link");
        create_symlink_link(&file, &symlink);

        // 迁移
        migrate_data(
            old_dir.path().to_str().unwrap().to_string(),
            new_dir.path().to_str().unwrap().to_string(),
        ).unwrap();

        // 验证所有内容都正确迁移
        assert!(new_dir.path().join("file.txt").exists());
        assert!(new_dir.path().join("dir").is_dir());
        assert!(new_dir.path().join("link").is_symlink());
    }

    #[test]
    fn test_is_broken_symlink() {
        let temp_dir = TempDir::new().unwrap();

        // 创建指向不存在目标的符号链接
        #[cfg(unix)]
        {
            let broken_link = temp_dir.path().join("broken");
            std::os::unix::fs::symlink("/nonexistent/path", &broken_link).unwrap();
            assert!(is_broken_symlink(&broken_link));
        }

        #[cfg(windows)]
        {
            let broken_link = temp_dir.path().join("broken");
            std::os::windows::fs::symlink_file("/nonexistent/path", &broken_link).unwrap();
            assert!(is_broken_symlink(&broken_link));
        }
    }

    #[test]
    fn test_migrate_broken_symlink() {
        let old_dir = TempDir::new().unwrap();
        let new_dir = TempDir::new().unwrap();

        // 创建指向不存在目标的符号链接
        let symlink = old_dir.path().join("broken");
        #[cfg(unix)]
        std::os::unix::fs::symlink(PathBuf::from("/nonexistent"), &symlink).unwrap();
        #[cfg(windows)]
        {
            // Windows 不允许创建指向不存在目标的符号链接（除非有特殊权限）
            // 跳过此测试或使用替代方案
            return;
        }

        // 迁移应该成功（损坏链接也应被复制）
        let result = migrate_data(
            old_dir.path().to_str().unwrap().to_string(),
            new_dir.path().to_str().unwrap().to_string(),
        );

        // 损坏链接应该被复制，但可能是警告而不是错误
        assert!(result.is_ok());
        assert!(new_dir.path().join("broken").is_symlink());
    }

    #[cfg(unix)]
    #[test]
    fn test_has_loop_symlink_absolute() {
        let temp_dir = TempDir::new().unwrap();

        // 创建循环符号链接: a -> b, b -> a
        let a_path = temp_dir.path().join("a");
        let b_path = temp_dir.path().join("b");

        // a -> b
        std::os::unix::fs::symlink(&b_path, &a_path).unwrap();
        // b -> a
        std::os::unix::fs::symlink(&a_path, &b_path).unwrap();

        // 检测循环
        assert!(has_loop_symlink(&a_path, &mut HashSet::new()));
        assert!(has_loop_symlink(&b_path, &mut HashSet::new()));
    }

    #[cfg(unix)]
    #[test]
    fn test_has_loop_symlink_complex_relative() {
        let temp_dir = TempDir::new().unwrap();

        // 创建一个真正的循环：a -> b, b -> c, c -> a
        let a_path = temp_dir.path().join("a");
        let b_path = temp_dir.path().join("b");
        let c_path = temp_dir.path().join("c");

        std::os::unix::fs::symlink("b", &a_path).unwrap();
        std::os::unix::fs::symlink("c", &b_path).unwrap();
        std::os::unix::fs::symlink("a", &c_path).unwrap();

        // 检测循环
        assert!(has_loop_symlink(&a_path, &mut HashSet::new()));
        assert!(has_loop_symlink(&b_path, &mut HashSet::new()));
        assert!(has_loop_symlink(&c_path, &mut HashSet::new()));
    }

    #[test]
    fn test_is_broken_symlink_with_dots() {
        let temp_dir = TempDir::new().unwrap();

        // 创建带 .. 的相对路径符号链接
        let real_file = temp_dir.path().join("real.txt");
        create_test_file(&real_file, "content");

        let nested_dir = temp_dir.path().join("nested");
        fs::create_dir_all(&nested_dir).unwrap();

        // 创建符号链接: link.txt -> ../real.txt
        let symlink_path = nested_dir.join("link.txt");
        #[cfg(unix)]
        std::os::unix::fs::symlink("../real.txt", &symlink_path).unwrap();
        #[cfg(windows)]
        std::os::windows::fs::symlink_file(&PathBuf::from("../real.txt"), &symlink_path).unwrap();

        // 应该不是损坏的链接
        assert!(!is_broken_symlink(&symlink_path));

        // 删除目标文件后变为损坏链接
        fs::remove_file(&real_file).unwrap();
        assert!(is_broken_symlink(&symlink_path));
    }

    #[test]
    fn test_migrate_relative_symlink_with_parent() {
        let old_dir = TempDir::new().unwrap();
        let new_dir = TempDir::new().unwrap();

        // 创建目录结构:
        // old/
        //   dir/
        //     file.txt
        //   link -> ../dir/file.txt
        let dir = old_dir.path().join("dir");
        fs::create_dir_all(&dir).unwrap();
        let file = dir.join("file.txt");
        create_test_file(&file, "content");

        let symlink = old_dir.path().join("link");
        #[cfg(unix)]
        std::os::unix::fs::symlink("dir/file.txt", &symlink).unwrap();
        #[cfg(windows)]
        std::os::windows::fs::symlink_file(&PathBuf::from("dir/file.txt"), &symlink).unwrap();

        // 迁移
        migrate_data(
            old_dir.path().to_str().unwrap().to_string(),
            new_dir.path().to_str().unwrap().to_string(),
        ).unwrap();

        // 验证相对符号链接仍然有效
        let new_symlink = new_dir.path().join("link");
        assert!(new_symlink.is_symlink());
        let content = fs::read_to_string(&new_symlink).unwrap();
        assert_eq!(content, "content");
    }
}
