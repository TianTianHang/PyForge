use crate::infrastructure::{
    ensure_dir, get_env_dir, get_project_dir_by_id,
    load_envs_metadata, load_projects_metadata,
    save_projects_metadata,
    path_to_str,
};
use crate::models::Project;
use crate::domain::environment::bind_kernel_to_project;
use crate::debug;

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
    debug!("🔧 [PROJECT] 开始创建项目:");
    debug!("  - 项目名称: {}", name);
    debug!("  - 绑定环境: {}", env_id);

    // Validate name
    validate_project_name(&name)?;
    debug!("✅ [PROJECT] 项目名称验证通过");

    // Check if environment exists
    debug!("🔍 [PROJECT] 检查环境是否存在...");
    let env_metadata = load_envs_metadata()?;
    if !env_metadata.environments.contains_key(&env_id) {
        debug!("❌ [PROJECT] 环境不存在: {}", env_id);
        return Err(format!("环境不存在: {}", env_id));
    }
    debug!("✅ [PROJECT] 环境存在");

    let env_dir = get_env_dir(&env_id);
    debug!("📁 [PROJECT] 环境目录: {}", path_to_str(&env_dir)?);
    if !env_dir.exists() {
        debug!("❌ [PROJECT] 环境目录不存在: {:?}", env_dir);
        return Err(format!("环境目录不存在: {:?}", env_dir));
    }
    debug!("✅ [PROJECT] 环境目录存在");

    // Load projects metadata
    debug!("📂 [PROJECT] 加载项目元数据...");
    let mut metadata = load_projects_metadata()?;

    // Generate unique project ID
    let project_id = generate_project_id(&name);
    debug!("🆔 [PROJECT] 生成项目ID: {}", project_id);

    // Check if name already exists (case-insensitive)
    debug!("🔍 [PROJECT] 检查项目名称是否重复...");
    for project in metadata.projects.values() {
        if project.name.to_lowercase() == name.to_lowercase() {
            debug!("❌ [PROJECT] 项目名称已存在: {}", name);
            return Err(format!("项目名称已存在: {}", name));
        }
    }
    debug!("✅ [PROJECT] 项目名称可用");

    // Create project directory
    let project_dir = get_project_dir_by_id(&project_id);
    debug!("📁 [PROJECT] 创建项目目录: {}", path_to_str(&project_dir)?);
    ensure_dir(&project_dir)?;
    debug!("✅ [PROJECT] 项目目录创建成功");

    // Create kernels subdirectory
    let kernels_dir = project_dir.join("kernels");
    debug!("📁 [PROJECT] 创建内核目录: {}", path_to_str(&kernels_dir)?);
    ensure_dir(&kernels_dir)?;
    debug!("✅ [PROJECT] 内核目录创建成功");

    // Create project
    debug!("📝 [PROJECT] 创建项目对象...");
    let project = Project {
        id: project_id.clone(),
        name: name.clone(),
        env_id: env_id.clone(),
        path: project_dir.to_string_lossy().to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
        is_default: false,
    };

    // Save to metadata
    debug!("💾 [PROJECT] 保存项目元数据...");
    metadata.projects.insert(project_id.clone(), project.clone());
    save_projects_metadata(&metadata)?;
    debug!("✅ [PROJECT] 项目元数据保存成功");

    // Auto-bind the selected environment's kernel to the project
    debug!("🔗 [PROJECT] 自动绑定环境内核到项目...");
    debug!("  - 环境ID: {}", env_id);
    debug!("  - 项目ID: {}", project_id);
    bind_kernel_to_project(&project_id, &env_id)?;
    debug!("✅ [PROJECT] 内核绑定成功");

    debug!("🎉 [PROJECT] 项目创建完成: {} ({})", name, project_id);

    Ok(project)
}
