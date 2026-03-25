use crate::infrastructure::{
    get_project_dir_by_id, load_projects_metadata, save_projects_metadata,
};
use std::fs;

pub fn delete_project(project_id: &str) -> Result<(), String> {
    // Load projects metadata
    let mut metadata = load_projects_metadata()?;

    // Check if project exists
    let project = metadata
        .projects
        .get(project_id)
        .cloned()
        .ok_or_else(|| format!("项目不存在: {}", project_id))?;

    // Protect default project
    if project.is_default {
        return Err("默认项目不可删除".to_string());
    }

    // Remove project directory
    let project_dir = get_project_dir_by_id(project_id);
    if project_dir.exists() {
        fs::remove_dir_all(&project_dir)
            .map_err(|e| format!("删除项目目录失败: {}", e))?;
    }

    // Remove from metadata
    metadata.projects.remove(project_id);
    save_projects_metadata(&metadata)?;

    Ok(())
}
