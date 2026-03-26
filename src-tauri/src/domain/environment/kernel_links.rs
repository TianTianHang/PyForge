use crate::infrastructure::{
    ensure_dir, get_kernel_store_dir, get_project_kernel_dir, load_envs_metadata,
    load_projects_metadata, path_to_str,
};
use std::fs;
use crate::debug;

/// Bind a kernel to a specific project
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
    debug!("✅ [KERNEL] 全局内核目录存在: {}", path_to_str(&global_kernel_dir)?);

    let project_kernels_dir = get_project_kernel_dir(project_id);
    debug!("📁 [KERNEL] 项目内核目录: {}", path_to_str(&project_kernels_dir)?);
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
        std::os::unix::fs::symlink(&global_kernel_dir, &link_path)
            .map_err(|e| {
                debug!("❌ [KERNEL] 创建内核链接失败: {}", e);
                format!("创建内核链接失败: {}", e)
            })?;
    }

    #[cfg(windows)]
    {
        std::os::windows::fs::symlink_dir(&global_kernel_dir, &link_path)
            .map_err(|e| {
                debug!("❌ [KERNEL] 创建内核链接失败: {}", e);
                format!("创建内核链接失败: {}", e)
            })?;
    }

    debug!("✅ [KERNEL] 内核绑定成功: {} -> {}", kernel_name, path_to_str(&link_path)?);

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

    let entries = fs::read_dir(&project_kernels_dir)
        .map_err(|e| format!("读取项目内核目录失败: {}", e))?;

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
