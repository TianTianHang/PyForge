use crate::infrastructure::{
    get_project_dir_by_id, load_projects_metadata, save_projects_metadata,
    path_to_str,
};
use std::fs;
use crate::debug;

pub fn delete_project(project_id: &str) -> Result<(), String> {
    debug!("🗑️  [PROJECT] 开始删除项目:");
    debug!("  - 项目ID: {}", project_id);

    // Load projects metadata
    debug!("📂 [PROJECT] 加载项目元数据...");
    let mut metadata = load_projects_metadata()?;

    // Check if project exists
    debug!("🔍 [PROJECT] 检查项目是否存在...");
    let project = metadata
        .projects
        .get(project_id)
        .cloned()
        .ok_or_else(|| {
            debug!("❌ [PROJECT] 项目不存在: {}", project_id);
            format!("项目不存在: {}", project_id)
        })?;
    debug!("✅ [PROJECT] 项目存在: {}", project.name);

    // Protect default project
    if project.is_default {
        debug!("❌ [PROJECT] 默认项目不可删除");
        return Err("默认项目不可删除".to_string());
    }

    // Remove project directory
    let project_dir = get_project_dir_by_id(project_id);
    debug!("📁 [PROJECT] 项目目录: {}", path_to_str(&project_dir)?);
    if project_dir.exists() {
        debug!("🗑️  [PROJECT] 删除项目目录...");
        fs::remove_dir_all(&project_dir)
            .map_err(|e| {
                debug!("❌ [PROJECT] 删除项目目录失败: {}", e);
                format!("删除项目目录失败: {}", e)
            })?;
        debug!("✅ [PROJECT] 项目目录删除成功");
    } else {
        debug!("⚠️  [PROJECT] 项目目录不存在，跳过删除");
    }

    // Remove from metadata
    debug!("💾 [PROJECT] 从元数据中移除项目...");
    metadata.projects.remove(project_id);
    save_projects_metadata(&metadata)?;
    debug!("✅ [PROJECT] 项目元数据更新成功");

    debug!("🎉 [PROJECT] 项目删除完成: {}", project_id);

    Ok(())
}
