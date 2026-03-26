use chrono::Utc;

use crate::infrastructure::{
    ensure_dir, get_env_dir, get_env_metadata_path, get_envs_dir, get_project_dir,
    get_projects_dir, get_projects_metadata_path, get_pyforge_root, load_envs_metadata,
    save_envs_metadata, save_projects_metadata, DEFAULT_PYTHON_VERSION,
};
use crate::models::{Environment, EnvsMetadata, Project, ProjectsMetadata};
use std::fs;

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
    let _ = ensure_dir(&get_project_dir());

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
                template_id: None,
            },
        );

        save_envs_metadata(&metadata)?;
    }

    Ok(())
}

/// Migrate legacy projects directory to the new metadata-based system
pub fn migrate_projects() -> Result<(), String> {
    let projects_dir = get_projects_dir();
    let metadata_path = get_projects_metadata_path();

    // If metadata already exists, no migration needed
    if metadata_path.exists() {
        return Ok(());
    }

    // Check if there are any notebooks in the projects directory
    let mut has_notebooks = false;
    if projects_dir.exists() {
        for entry in fs::read_dir(&projects_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().map_err(|e| e.to_string())?.is_file() {
                // Check if it's a notebook file (.ipynb) or other files
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    if ext == "ipynb"
                        || path.file_name().and_then(|s| s.to_str()) == Some("README.md")
                    {
                        has_notebooks = true;
                        break;
                    }
                } else {
                    // Files without extensions could also be notebooks
                    let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
                    if name != "kernels" && !name.starts_with('.') {
                        has_notebooks = true;
                        break;
                    }
                }
            }
        }
    }

    // If no notebooks exist, no migration needed
    if !has_notebooks {
        return Ok(());
    }

    // Verify default environment exists
    let meta = load_envs_metadata()?;
    if !meta.environments.contains_key("default") {
        return Err("默认环境不存在".to_string());
    }

    let project = Project {
        id: "proj-我的项目".to_string(),
        name: "我的项目".to_string(),
        env_id: "default".to_string(),
        path: projects_dir.to_string_lossy().to_string(),
        created_at: Utc::now().to_rfc3339(),
        is_default: true,
    };

    let mut metadata = ProjectsMetadata {
        version: 1,
        projects: Default::default(),
    };

    metadata
        .projects
        .insert(project.id.clone(), project.clone());
    save_projects_metadata(&metadata)?;

    println!(
        "迁移完成: 创建了默认项目 '{}', 绑定到默认环境",
        project.name
    );

    Ok(())
}
