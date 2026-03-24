use crate::infrastructure::{get_env_dir, load_envs_metadata};
use crate::models::Environment;

pub fn list_environments() -> Result<Vec<Environment>, String> {
    let metadata = load_envs_metadata()?;
    let mut environments = metadata
        .environments
        .into_values()
        .filter(|env| get_env_dir(&env.id).exists())
        .collect::<Vec<_>>();

    environments.sort_by(|a, b| {
        b.is_default
            .cmp(&a.is_default)
            .then_with(|| a.name.cmp(&b.name))
    });

    Ok(environments)
}
