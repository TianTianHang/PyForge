use crate::infrastructure::{ensure_dir, get_env_metadata_path, get_projects_metadata_path, get_pyforge_root};
use crate::models::{EnvsMetadata, ProjectsMetadata};

pub fn load_envs_metadata() -> Result<EnvsMetadata, String> {
    let metadata_path = get_env_metadata_path();
    if !metadata_path.exists() {
        return Ok(EnvsMetadata {
            version: 1,
            environments: Default::default(),
        });
    }

    let content = std::fs::read_to_string(&metadata_path)
        .map_err(|e| format!("读取环境元数据失败: {}", e))?;

    if content.trim().is_empty() {
        return Ok(EnvsMetadata {
            version: 1,
            environments: Default::default(),
        });
    }

    serde_json::from_str(&content).map_err(|e| format!("解析环境元数据失败: {}", e))
}

pub fn save_envs_metadata(metadata: &EnvsMetadata) -> Result<(), String> {
    ensure_dir(&get_pyforge_root())?;

    let content = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("序列化环境元数据失败: {}", e))?;

    std::fs::write(get_env_metadata_path(), content)
        .map_err(|e| format!("写入环境元数据失败: {}", e))
}

pub fn load_projects_metadata() -> Result<ProjectsMetadata, String> {
    let metadata_path = get_projects_metadata_path();
    if !metadata_path.exists() {
        return Ok(ProjectsMetadata {
            version: 1,
            projects: Default::default(),
        });
    }

    let content = std::fs::read_to_string(&metadata_path)
        .map_err(|e| format!("读取项目元数据失败: {}", e))?;

    if content.trim().is_empty() {
        return Ok(ProjectsMetadata {
            version: 1,
            projects: Default::default(),
        });
    }

    serde_json::from_str(&content).map_err(|e| format!("解析项目元数据失败: {}", e))
}

pub fn save_projects_metadata(metadata: &ProjectsMetadata) -> Result<(), String> {
    ensure_dir(&get_pyforge_root())?;

    let content = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("序列化项目元数据失败: {}", e))?;

    std::fs::write(get_projects_metadata_path(), content)
        .map_err(|e| format!("写入项目元数据失败: {}", e))
}
