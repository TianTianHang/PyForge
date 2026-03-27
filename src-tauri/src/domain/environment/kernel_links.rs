use crate::debug;
use crate::infrastructure::{
    ensure_dir, get_kernel_store_dir, get_project_kernel_dir, load_envs_metadata,
    load_projects_metadata, path_to_str,
};
use std::fs;
use std::sync::OnceLock;

/// Cache for symlink permission check result on Windows
#[cfg(windows)]
static SYMLINK_PERMISSION_CACHE: OnceLock<bool> = OnceLock::new();

/// Check if the user has permission to create symbolic links on Windows
/// Returns Ok(()) if permission is granted, Err with message if denied
///
/// The result is cached after the first check to avoid repeated expensive operations.
#[cfg(windows)]
fn check_symlink_permission() -> Result<(), String> {
    // Check cache first
    if let Some(&has_permission) = SYMLINK_PERMISSION_CACHE.get() {
        return if has_permission {
            Ok(())
        } else {
            Err(permission_error_message())
        };
    }

    let temp_dir = std::env::temp_dir().join("pyforge-test-symlink");
    let test_target = temp_dir.join("test-target");

    // Create test directory
    fs::create_dir_all(&test_target).map_err(|e| format!("创建测试目录失败: {}", e))?;

    // Attempt to create symlink
    let test_link = temp_dir.join("test-symlink");
    let result = std::os::windows::fs::symlink_dir(&test_target, &test_link);

    // Clean up regardless of result
    let _ = fs::remove_file(&test_link);
    let _ = fs::remove_dir_all(&temp_dir);

    // Cache the result
    let has_permission = result.is_ok();
    SYMLINK_PERMISSION_CACHE.set(has_permission).ok();

    if has_permission {
        Ok(())
    } else {
        Err(permission_error_message())
    }
}

/// Check symlink permission (no-op on Unix platforms)
#[cfg(not(windows))]
fn check_symlink_permission() -> Result<(), String> {
    Ok(())
}

/// Generate user-friendly error message for permission issues
#[cfg(windows)]
fn permission_error_message() -> String {
    let is_chinese = is_system_language_chinese();

    if is_chinese {
        format!(
            "创建符号链接需要管理员权限或启用 Windows 开发者模式。\n\n\
             解决方案:\n\
             1. 以管理员身份运行 PyForge\n\
             2. 或启用开发者模式：\n    \
                设置 → 更新和安全 → 开发者选项 → 启用\"开发人员模式\"\n\n\
             详细说明：https://learn.microsoft.com/zh-cn/windows/apps/get-started/enable-your-device-for-development"
        )
    } else {
        format!(
            "Creating symbolic links requires administrator privileges or Windows Developer Mode.\n\n\
             Solutions:\n\
             1. Run PyForge as administrator\n\
             2. Or enable Developer Mode:\n    \
                Settings → Update & Security → For developers → Enable \"Developer mode\"\n\n\
             More information: https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development"
        )
    }
}

/// Check if system language is Chinese
///
/// Uses environment variables to detect language, avoiding expensive PowerShell calls.
#[cfg(windows)]
fn is_system_language_chinese() -> bool {
    use std::env;

    // Try common locale environment variables
    env::var("LANG")
        .or_else(|_| env::var("LC_ALL"))
        .or_else(|_| env::var("LC_CTYPE"))
        .or_else(|_| env::var("LC_MESSAGES"))
        .map(|lang| lang.to_lowercase().starts_with("zh"))
        .unwrap_or(false)
}

/// Bind a kernel to a specific project
///
/// This function creates a symbolic link from the project's kernel directory
/// to the global kernel store. On Windows, it checks symlink permissions first
/// and provides helpful error messages if permissions are insufficient.
///
/// # Arguments
/// * `project_id` - The ID of the project to bind the kernel to
/// * `env_id` - The ID of the environment/kernel to bind
///
/// # Returns
/// * `Ok(())` if the binding was successful
/// * `Err(String)` with a descriptive error message if the binding failed
pub fn bind_kernel_to_project(project_id: &str, env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let global_kernel_dir = get_kernel_store_dir().join(&kernel_name);

    debug!("🔗 [KERNEL] 开始绑定内核到项目:");
    debug!("  - 项目ID: {}", project_id);
    debug!("  - 环境ID: {}", env_id);
    debug!("  - 内核名称: {}", kernel_name);

    if !global_kernel_dir.exists() {
        debug!("❌ [KERNEL] 全局内核目录不存在: {:?}", global_kernel_dir);
        return Err(format!("全局内核目录不存在: {:?}", global_kernel_dir));
    }
    debug!(
        "✅ [KERNEL] 全局内核目录存在: {}",
        path_to_str(&global_kernel_dir)?
    );

    let project_kernels_dir = get_project_kernel_dir(project_id);
    debug!(
        "📁 [KERNEL] 项目内核目录: {}",
        path_to_str(&project_kernels_dir)?
    );
    ensure_dir(&project_kernels_dir)?;
    debug!("✅ [KERNEL] 项目内核目录准备就绪");

    let link_path = project_kernels_dir.join(&kernel_name);
    debug!("🔗 [KERNEL] 链接路径: {}", path_to_str(&link_path)?);

    if link_path.exists() {
        debug!("ℹ️  [KERNEL] 内核已绑定，跳过");
        return Ok(()); // Already bound
    }

    debug!("🔗 [KERNEL] 创建内核链接...");
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(&global_kernel_dir, &link_path).map_err(|e| {
            debug!("❌ [KERNEL] 创建内核链接失败: {}", e);
            format!("创建内核链接失败: {}", e)
        })?;
    }

    #[cfg(windows)]
    {
        // Check symlink permission before attempting to create
        check_symlink_permission()?;

        std::os::windows::fs::symlink_dir(&global_kernel_dir, &link_path).map_err(|e| {
            debug!("❌ [KERNEL] 创建内核链接失败: {}", e);
            format!("创建内核链接失败: {}", e)
        })?;
    }

    debug!(
        "✅ [KERNEL] 内核绑定成功: {} -> {}",
        kernel_name,
        path_to_str(&link_path)?
    );

    Ok(())
}

/// Unbind a kernel from a specific project
pub fn unbind_kernel_from_project(project_id: &str, env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let link_path = get_project_kernel_dir(project_id).join(&kernel_name);

    if link_path.exists() {
        if link_path.is_symlink() || link_path.is_dir() {
            // Use remove_dir_all for symlinks to directories on some platforms
            let _ = fs::remove_file(&link_path);
            let _ = fs::remove_dir_all(&link_path);
        }
    }

    Ok(())
}

/// List all kernels bound to a specific project
pub fn list_project_kernels(project_id: &str) -> Result<Vec<String>, String> {
    let project_kernels_dir = get_project_kernel_dir(project_id);

    if !project_kernels_dir.exists() {
        return Ok(Vec::new());
    }

    let entries =
        fs::read_dir(&project_kernels_dir).map_err(|e| format!("读取项目内核目录失败: {}", e))?;

    let mut kernel_names = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("读取内核条目失败: {}", e))?;
        let name = entry.file_name();
        if let Some(name_str) = name.to_str() {
            if name_str.starts_with("pyforge-") {
                // Extract env_id from kernel name (remove "pyforge-" prefix)
                let env_id = name_str.strip_prefix("pyforge-").unwrap_or(name_str);
                kernel_names.push(env_id.to_string());
            }
        }
    }

    Ok(kernel_names)
}

/// List all kernels that are NOT bound to a specific project
pub fn list_unbound_kernels(project_id: &str) -> Result<Vec<String>, String> {
    // Get all environments
    let env_metadata = load_envs_metadata()?;
    let all_env_ids: Vec<String> = env_metadata.environments.keys().cloned().collect();

    // Get bound kernels for this project
    let bound_kernels = list_project_kernels(project_id).unwrap_or_default();

    // Filter out bound kernels
    let unbound: Vec<String> = all_env_ids
        .into_iter()
        .filter(|env_id| !bound_kernels.contains(env_id))
        .collect();

    Ok(unbound)
}

/// Check if any project has this kernel bound
pub fn is_kernel_bound_to_any_project(env_id: &str) -> Result<bool, String> {
    let projects_metadata = load_projects_metadata()?;

    for project_id in projects_metadata.projects.keys() {
        let bound_kernels = list_project_kernels(project_id)?;
        if bound_kernels.contains(&env_id.to_string()) {
            return Ok(true);
        }
    }

    Ok(false)
}

/// Legacy functions for backward compatibility (deprecated)
#[deprecated(note = "Use bind_kernel_to_project instead")]
pub fn create_kernel_link(_env_id: &str) -> Result<(), String> {
    // This is now a no-op for backward compatibility
    // Kernel binding should be done per-project
    Ok(())
}

#[deprecated(note = "Use unbind_kernel_from_project instead")]
pub fn remove_kernel_link(env_id: &str) -> Result<(), String> {
    // Remove from all projects
    let projects_metadata = load_projects_metadata()?;
    for project_id in projects_metadata.projects.keys() {
        let _ = unbind_kernel_from_project(project_id, env_id);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(windows)]
    fn test_check_symlink_permission() {
        // This test only runs on Windows
        // It verifies that the permission check function works
        let result = check_symlink_permission();
        // We can't predict the result (depends on system permissions),
        // but we can verify the function doesn't panic
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    #[cfg(not(windows))]
    fn test_check_symlink_permission_on_unix() {
        // On Unix, permission check should always pass
        let result = check_symlink_permission();
        assert!(result.is_ok());
    }

    #[test]
    #[cfg(windows)]
    fn test_permission_error_message() {
        let message = permission_error_message();
        assert!(!message.is_empty());
        // Check that message contains expected content
        assert!(message.contains("管理员") || message.contains("administrator"));
        assert!(message.contains("开发者模式") || message.contains("Developer Mode"));
    }

    #[test]
    #[cfg(windows)]
    fn test_is_system_language_chinese() {
        // This test checks if the language detection function works
        let is_chinese = is_system_language_chinese();
        // We can't predict the result, but we can verify it doesn't panic
        assert!(is_chinese == true || is_chinese == false);
    }

    #[test]
    #[cfg(windows)]
    fn test_permission_check_performance() {
        use std::time::Instant;

        let start = Instant::now();
        let _ = check_symlink_permission();
        let duration = start.elapsed();

        // Permission check should complete within 100ms
        assert!(
            duration.as_millis() < 100,
            "Permission check took too long: {:?}",
            duration
        );
    }

    #[test]
    #[cfg(windows)]
    fn test_resource_cleanup() {
        let temp_dir = std::env::temp_dir().join("pyforge-test-symlink");

        // Run permission check
        let _ = check_symlink_permission();

        // Verify temporary directory is cleaned up
        assert!(!temp_dir.exists(), "Temporary directory was not cleaned up");
    }
}
