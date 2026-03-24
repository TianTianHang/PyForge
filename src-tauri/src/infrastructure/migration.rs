use chrono::Utc;

use crate::infrastructure::{
    ensure_dir, get_env_dir, get_env_metadata_path, get_envs_dir, get_project_dir, get_projects_dir,
    get_pyforge_root, save_envs_metadata, DEFAULT_PYTHON_VERSION,
};
use crate::models::{Environment, EnvsMetadata};

pub fn migrate_from_mvp() -> Result<(), String> {
    let root = get_pyforge_root();
    let old_env_dir = root.join("env");
    let old_project_dir = root.join("project");
    let envs_dir = get_envs_dir();
    let default_env_dir = get_env_dir("default");
    let projects_dir = get_projects_dir();

    ensure_dir(&root)?;

    if old_env_dir.exists() && !default_env_dir.exists() {
        ensure_dir(&envs_dir)?;
        std::fs::rename(&old_env_dir, &default_env_dir)
            .map_err(|e| format!("迁移默认环境失败: {}", e))?;
    }

    if old_project_dir.exists() && !projects_dir.exists() {
        std::fs::rename(&old_project_dir, &projects_dir)
            .map_err(|e| format!("迁移项目目录失败: {}", e))?;
    }

    ensure_dir(&envs_dir)?;
    ensure_dir(&get_project_dir())?;

    if default_env_dir.exists() && !get_env_metadata_path().exists() {
        let mut metadata = EnvsMetadata {
            version: 1,
            environments: Default::default(),
        };

        metadata.environments.insert(
            "default".to_string(),
            Environment {
                id: "default".to_string(),
                name: "Default".to_string(),
                python_version: DEFAULT_PYTHON_VERSION.to_string(),
                path: default_env_dir.to_string_lossy().to_string(),
                kernel_name: "pyforge-default".to_string(),
                created_at: Utc::now().to_rfc3339(),
                is_default: true,
            },
        );

        save_envs_metadata(&metadata)?;
    }

    Ok(())
}
