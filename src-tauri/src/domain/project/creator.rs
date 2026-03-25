use crate::infrastructure::{
    ensure_dir, get_env_dir, get_project_dir_by_id,
    load_envs_metadata, load_projects_metadata, save_projects_metadata,
};
use crate::models::Project;
use crate::domain::environment::bind_kernel_to_project;

/// Generate a unique project ID from the project name
fn generate_project_id(name: &str) -> String {
    let base_id = format!("proj-{}", name.to_lowercase().replace(" ", "-"));

    // Check for conflicts and append number if needed
    let metadata = load_projects_metadata().unwrap_or_else(|_| crate::models::ProjectsMetadata {
        version: 1,
        projects: Default::default(),
    });

    let mut final_id = base_id.clone();
    let mut counter = 2;

    while metadata.projects.contains_key(&final_id) {
        final_id = format!("{}-{}", base_id, counter);
        counter += 1;
    }

    final_id
}

/// Validate project name
fn validate_project_name(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("项目名称不能为空".to_string());
    }

    if name.len() > 100 {
        return Err("项目名称过长（最多100个字符）".to_string());
    }

    // Check for path traversal attempts
    if name.contains("..") || name.contains('/') || name.contains('\\') {
        return Err("项目名称包含非法字符".to_string());
    }

    Ok(())
}

pub fn create_project(name: String, env_id: String) -> Result<Project, String> {
    // Validate name
    validate_project_name(&name)?;

    // Check if environment exists
    let env_metadata = load_envs_metadata()?;
    if !env_metadata.environments.contains_key(&env_id) {
        return Err(format!("环境不存在: {}", env_id));
    }

    let env_dir = get_env_dir(&env_id);
    if !env_dir.exists() {
        return Err(format!("环境目录不存在: {:?}", env_dir));
    }

    // Load projects metadata
    let mut metadata = load_projects_metadata()?;

    // Generate unique project ID
    let project_id = generate_project_id(&name);

    // Check if name already exists (case-insensitive)
    for project in metadata.projects.values() {
        if project.name.to_lowercase() == name.to_lowercase() {
            return Err(format!("项目名称已存在: {}", name));
        }
    }

    // Create project directory
    let project_dir = get_project_dir_by_id(&project_id);
    ensure_dir(&project_dir)?;

    // Create kernels subdirectory
    let kernels_dir = project_dir.join("kernels");
    ensure_dir(&kernels_dir)?;

    // Create project
    let project = Project {
        id: project_id.clone(),
        name: name.clone(),
        env_id: env_id.clone(),
        path: project_dir.to_string_lossy().to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
        is_default: false,
    };

    // Save to metadata
    metadata.projects.insert(project_id.clone(), project.clone());
    save_projects_metadata(&metadata)?;

    // Auto-bind the selected environment's kernel to the project
    bind_kernel_to_project(&project_id, &env_id)?;

    Ok(project)
}
