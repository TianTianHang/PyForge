use crate::infrastructure::{get_env_dir, load_envs_metadata, save_envs_metadata};

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

    if let Err(e) = super::unregister_kernel(&environment.id).await {
        eprintln!("警告: 注销内核失败 ({}), 继续删除环境", e);
    }

    let env_dir = get_env_dir(env_id);
    if env_dir.exists() {
        std::fs::remove_dir_all(&env_dir).map_err(|e| format!("删除环境目录失败: {}", e))?;
    }

    metadata.environments.remove(env_id);
    save_envs_metadata(&metadata)?;

    Ok(())
}
