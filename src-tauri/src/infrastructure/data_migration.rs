use std::fs;
use std::path::{PathBuf, Path};
use serde::{Serialize, Deserialize};
use crate::infrastructure::{load_config, save_config, write_uv_config};

#[derive(Debug, Serialize, Deserialize)]
pub struct MigrationResult {
    pub success: bool,
    pub error: Option<String>,
    pub steps_completed: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MigrationProgress {
    pub step: String,
    pub total_steps: usize,
    pub current_step: usize,
}

/// Structure for tracking migration results
pub struct MigrationTracker {
    steps: Vec<String>,
    errors: Vec<String>,
}

impl MigrationTracker {
    pub fn new() -> Self {
        Self {
            steps: Vec::new(),
            errors: Vec::new(),
        }
    }

    pub fn add_step(&mut self, step: impl Into<String>) {
        self.steps.push(step.into());
    }

    pub fn add_error(&mut self, error: impl Into<String>) {
        self.errors.push(error.into());
    }

    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }

    pub fn result(self) -> MigrationResult {
        MigrationResult {
            success: !self.has_errors(),
            error: if self.has_errors() {
                Some(self.errors.join("; "))
            } else {
                None
            },
            steps_completed: self.steps,
        }
    }
}

/// Main migration function
pub async fn migrate_data(old_path: String, new_path: String) -> Result<MigrationResult, String> {
    let old_dir = PathBuf::from(&old_path);
    let new_dir = PathBuf::from(&new_path);

    if !old_dir.exists() {
        return Err(format!("源目录不存在: {}", old_path));
    }

    if !new_dir.exists() {
        fs::create_dir_all(&new_dir).map_err(|e| format!("创建目标目录失败: {}", e))?;
    }

    let mut tracker = MigrationTracker::new();

    // Step 1: Verify disk space
    tracker.add_step("检查磁盘空间");
    check_disk_space(&old_dir, &new_dir)?;

    // Step 2: Migrate environment directory
    tracker.add_step("迁移环境目录");
    migrate_environment_directory(&old_dir, &new_dir, &mut tracker)?;

    // Step 3: Migrate projects directory
    tracker.add_step("迁移项目目录");
    migrate_projects_directory(&old_dir, &new_dir, &mut tracker)?;

    // Step 4: Migrate kernels directory
    tracker.add_step("迁移内核目录");
    migrate_kernels_directory(&old_dir, &new_dir, &mut tracker)?;

    // Step 5: Migrate base environment
    tracker.add_step("迁移基础环境");
    migrate_base_directory(&old_dir, &new_dir, &mut tracker)?;

    // Step 6: Migrate metadata files
    tracker.add_step("迁移元数据文件");
    migrate_metadata_files(&old_dir, &new_dir, &mut tracker)?;

    // Step 7: Migrate configuration file
    tracker.add_step("迁移配置文件");
    migrate_config_file(&old_dir, &new_dir, &mut tracker).await?;

    // Step 8: Regenerate uv.toml
    tracker.add_step("重新生成 uv.toml");
    regenerate_uv_toml(&new_dir, &mut tracker)?;

    Ok(tracker.result())
}

/// Check if there's enough disk space for migration
fn check_disk_space(old_dir: &PathBuf, new_dir: &PathBuf) -> Result<(), String> {
    let old_metadata = old_dir.metadata()
        .map_err(|e| format!("无法读取源目录信息: {}", e))?;
    let old_size = old_metadata.len();

    let disk_metadata = new_dir.parent()
        .ok_or("无法获取磁盘信息")?
        .metadata()
        .map_err(|e| format!("无法读取磁盘信息: {}", e))?;
    let free_space = disk_metadata.len();

    if free_space < old_size * 2 {
        return Err("磁盘空间不足，无法完成迁移".to_string());
    }

    Ok(())
}

/// Migrate environment directory (envs/)
fn migrate_environment_directory(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let old_envs = old_dir.join("envs");
    let new_envs = new_dir.join("envs");

    if old_envs.exists() {
        fs::create_dir_all(&new_envs).map_err(|e| format!("创建 envs 目录失败: {}", e))?;
        copy_directory(&old_envs, &new_envs, tracker)?;
        fs::remove_dir_all(&old_envs).map_err(|e| format!("删除旧的 envs 目录失败: {}", e))?;
        tracker.add_step("envs 目录迁移完成");
    }

    Ok(())
}

/// Migrate projects directory (projects/)
fn migrate_projects_directory(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let old_projects = old_dir.join("projects");
    let new_projects = new_dir.join("projects");

    if old_projects.exists() {
        fs::create_dir_all(&new_projects).map_err(|e| format!("创建 projects 目录失败: {}", e))?;
        copy_directory(&old_projects, &new_projects, tracker)?;
        fs::remove_dir_all(&old_projects).map_err(|e| format!("删除旧的 projects 目录失败: {}", e))?;
        tracker.add_step("projects 目录迁移完成");
    }

    Ok(())
}

/// Migrate kernels directory (kernels/)
fn migrate_kernels_directory(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let old_kernels = old_dir.join("kernels");
    let new_kernels = new_dir.join("kernels");

    if old_kernels.exists() {
        fs::create_dir_all(&new_kernels).map_err(|e| format!("创建 kernels 目录失败: {}", e))?;
        copy_directory(&old_kernels, &new_kernels, tracker)?;
        fs::remove_dir_all(&old_kernels).map_err(|e| format!("删除旧的 kernels 目录失败: {}", e))?;
        tracker.add_step("kernels 目录迁移完成");
    }

    Ok(())
}

/// Migrate base environment (base/)
fn migrate_base_directory(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let old_base = old_dir.join("base");
    let new_base = new_dir.join("base");

    if old_base.exists() {
        fs::create_dir_all(&new_base).map_err(|e| format!("创建 base 目录失败: {}", e))?;
        copy_directory(&old_base, &new_base, tracker)?;
        fs::remove_dir_all(&old_base).map_err(|e| format!("删除旧的 base 目录失败: {}", e))?;
        tracker.add_step("base 目录迁移完成");
    }

    Ok(())
}

/// Migrate metadata files
fn migrate_metadata_files(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let metadata_files = [
        ".envs-metadata.json",
        ".projects-metadata.json",
        ".kernels-metadata.json",
    ];

    for file_name in &metadata_files {
        let old_file = old_dir.join(file_name);
        let new_file = new_dir.join(file_name);

        if old_file.exists() {
            fs::copy(&old_file, &new_file).map_err(|e| format!("复制元数据文件失败: {}", e))?;
            fs::remove_file(&old_file).map_err(|e| format!("删除旧元数据文件失败: {}", e))?;
            tracker.add_step(format!("{} 迁移完成", file_name));
        }
    }

    Ok(())
}

/// Migrate configuration file and update data_dir
async fn migrate_config_file(old_dir: &PathBuf, new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    let old_config_file = old_dir.join("config.toml");
    let new_config_file = new_dir.join("config.toml");

    if old_config_file.exists() {
        // Copy old config
        fs::copy(&old_config_file, &new_config_file).map_err(|e| format!("复制配置文件失败: {}", e))?;

        // Load and update config with new data_dir
        let config = load_config()
            .map_err(|e| format!("加载配置失败: {}", e))?;

        let mut updated_config = config;
        updated_config.paths.data_dir = Some(new_dir.to_string_lossy().to_string());

        // Save updated config
        save_config(&updated_config).map_err(|e| format!("保存配置失败: {}", e))?;
        write_uv_config(&updated_config).map_err(|e| format!("生成 uv.toml 失败: {}", e))?;

        tracker.add_step("配置文件迁移并更新完成");
    }

    Ok(())
}

/// Regenerate uv.toml in the new directory
fn regenerate_uv_toml(new_dir: &PathBuf, tracker: &mut MigrationTracker) -> Result<(), String> {
    // This would use the existing write_uv_config function
    // For now, create a placeholder uv.toml
    let uv_toml_path = new_dir.join("uv.toml");
    let uv_toml_content = r#"[tool.uv]
dev-dependencies = [
    "ipykernel",
    "jupyterlab",
    "matplotlib",
    "pandas",
    "numpy",
]"#;

    fs::write(&uv_toml_path, uv_toml_content).map_err(|e| format!("写入 uv.toml 失败: {}", e))?;
    tracker.add_step("uv.toml 重新生成完成");

    Ok(())
}

/// Copy a directory and its contents
fn copy_directory(src: &Path, dst: &Path, tracker: &mut MigrationTracker) -> Result<(), String> {
    if !src.exists() {
        return Ok(());
    }

    for entry in fs::read_dir(src).map_err(|e| format!("读取目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            fs::create_dir_all(&dst_path).map_err(|e| format!("创建目录失败: {}", e))?;
            copy_directory(&src_path, &dst_path, tracker)?;
        } else {
            fs::copy(&src_path, &dst_path).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    Ok(())
}

/// Helper function to check if a path is a symlink that might create a loop
fn has_loop_symlink(path: &Path, seen: &mut std::collections::HashSet<PathBuf>) -> bool {
    if !path.exists() || !path.is_symlink() {
        return false;
    }

    let resolved = fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
    if seen.contains(&resolved) {
        return true;
    }

    seen.insert(resolved);
    false
}

/// Recreate symlinks in the new location
fn recreate_symlink(
    src: &Path,
    dst: &Path,
    old_root: &Path,
    new_root: &Path,
) -> Result<(), String> {
    if src.exists() && src.is_symlink() {
        let target = fs::read_link(src).map_err(|e| format!("读取符号链接失败: {}", e))?;
        let resolved_target = if target.is_absolute() {
            target.clone()
        } else {
            src.parent().unwrap_or(src).join(&target)
        };

        if resolved_target.starts_with(old_root) {
            let relative_path = pathdiff::diff_paths(&resolved_target, old_root)
                .unwrap_or_default();
            let new_target = new_root.join(relative_path);
            std::os::unix::fs::symlink(&new_target, dst)
                .map_err(|e| format!("创建符号链接失败: {}", e))?;
        } else {
            std::os::unix::fs::symlink(&target, dst)
                .map_err(|e| format!("创建符号链接失败: {}", e))?;
        }
    }
    Ok(())
}

/// Enhanced copy directory function with symlink handling
fn copy_dir_recursive(
    src: &Path,
    dst: &Path,
    old_root: &Path,
    new_root: &Path,
    symlinks: &mut Vec<(PathBuf, PathBuf)>,
) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| format!("创建目录失败: {}", e))?;

    for entry in fs::read_dir(src).map_err(|e| format!("读取目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_symlink() {
            if has_loop_symlink(&src_path, &mut std::collections::HashSet::new()) {
                eprintln!("警告: 检测到循环符号链接 {:?}, 跳过", src_path);
                continue;
            }
            symlinks.push((src_path.clone(), dst_path.clone()));
        } else if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path, old_root, new_root, symlinks)?;
        } else {
            fs::copy(&src_path, &dst_path).map_err(|e| format!("复制文件失败: {}", e))?;
        }
    }

    Ok(())
}