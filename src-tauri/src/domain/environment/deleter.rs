use crate::infrastructure::{get_env_dir, load_envs_metadata, save_envs_metadata, load_projects_metadata};
use crate::domain::environment::is_kernel_bound_to_any_project;

pub async fn delete_environment(env_id: &str) -> Result<(), String> {
    if env_id == "default" {
        return Err("默认环境不可删除".to_string());
    }

    let mut metadata = load_envs_metadata()?;
    let environment = metadata
        .environments
        .get(env_id)
        .cloned()
        .ok_or_else(|| format!("环境不存在: {}", env_id))?;

    // Check if any project has this kernel bound
    if is_kernel_bound_to_any_project(env_id)? {
        // Find which projects have this kernel bound
        let projects_metadata = load_projects_metadata()?;
        let bound_projects: Vec<String> = projects_metadata
            .projects
            .values()
            .filter(|p| {
                if let Ok(kernels) = crate::domain::environment::list_project_kernels(&p.id) {
                    kernels.contains(&env_id.to_string())
                } else {
                    false
                }
            })
            .map(|p| p.name.clone())
            .collect();

        return Err(format!(
            "该环境已被项目 '{}' 绑定，请先在项目设置中解绑",
            bound_projects.join("', '")
        ));
    }

    if let Err(e) = super::unregister_kernel(&environment.id).await {
        eprintln!("警告: 注销内核失败 ({}), 继续删除环境", e);
    }

    // Note: Kernel binding is handled by the check above - if we reach here,
    // the kernel is not bound to any project, so no need to unbind

    let env_dir = get_env_dir(env_id);
    if env_dir.exists() {
        std::fs::remove_dir_all(&env_dir).map_err(|e| format!("删除环境目录失败: {}", e))?;
    }

    metadata.environments.remove(env_id);
    save_envs_metadata(&metadata)?;

    Ok(())
}
