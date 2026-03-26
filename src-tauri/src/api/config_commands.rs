use crate::infrastructure::{init_paths, load_config, save_config, write_uv_config};
use crate::models::AppConfig;

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

    // Copy contents from old to new
    for entry in std::fs::read_dir(&old).map_err(|e| format!("读取源目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src = entry.path();
        let dst = new.join(entry.file_name());

        if src.is_dir() {
            copy_dir_recursive(&src, &dst)?;
        } else {
            std::fs::copy(&src, &dst).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    Ok(())
}

fn copy_dir_recursive(src: &std::path::Path, dst: &std::path::Path) -> Result<(), String> {
    std::fs::create_dir_all(dst).map_err(|e| format!("创建目录失败: {}", e))?;

    for entry in std::fs::read_dir(src).map_err(|e| format!("读取目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            std::fs::copy(&src_path, &dst_path).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    Ok(())
}
