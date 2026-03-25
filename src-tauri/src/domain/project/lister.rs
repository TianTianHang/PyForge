use crate::infrastructure::{get_project_dir_by_id, load_projects_metadata};
use crate::models::Project;

pub fn list_projects() -> Result<Vec<Project>, String> {
    let metadata = load_projects_metadata()?;
    let mut projects = metadata
        .projects
        .into_values()
        .filter(|project| {
            // Filter out projects whose directories no longer exist
            let project_dir = get_project_dir_by_id(&project.id);
            project_dir.exists()
        })
        .collect::<Vec<_>>();

    // Sort: default project first, then by name
    projects.sort_by(|a, b| {
        b.is_default
            .cmp(&a.is_default)
            .then_with(|| a.name.cmp(&b.name))
    });

    Ok(projects)
}
