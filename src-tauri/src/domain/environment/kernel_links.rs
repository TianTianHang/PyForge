use crate::infrastructure::{ensure_dir, get_kernel_store_dir, get_project_dir};

pub fn create_kernel_link(env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let global_kernel_dir = get_kernel_store_dir().join(&kernel_name);

    if !global_kernel_dir.exists() {
        return Err(format!("全局内核目录不存在: {:?}", global_kernel_dir));
    }

    let project_kernels_dir = get_project_dir().join("kernels");
    ensure_dir(&project_kernels_dir)?;

    let link_path = project_kernels_dir.join(&kernel_name);
    if link_path.exists() {
        return Ok(());
    }

    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(&global_kernel_dir, &link_path)
            .map_err(|e| format!("创建内核链接失败: {}", e))?;
    }

    #[cfg(windows)]
    {
        std::os::windows::fs::symlink_dir(&global_kernel_dir, &link_path)
            .map_err(|e| format!("创建内核链接失败: {}", e))?;
    }

    Ok(())
}

pub fn remove_kernel_link(env_id: &str) -> Result<(), String> {
    let kernel_name = format!("pyforge-{}", env_id);
    let link_path = get_project_dir().join("kernels").join(&kernel_name);

    if link_path.exists() {
        if link_path.is_symlink() || link_path.is_dir() {
            // Use remove_dir_all for symlinks to directories on some platforms
            let _ = std::fs::remove_file(&link_path);
            let _ = std::fs::remove_dir_all(&link_path);
        }
    }

    Ok(())
}
