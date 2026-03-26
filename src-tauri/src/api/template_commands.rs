use crate::models::Template;
use crate::templates::{get_builtin_templates, get_template_by_id};

#[tauri::command]
pub fn list_templates() -> Result<Vec<Template>, String> {
    get_builtin_templates()
}

#[tauri::command]
pub async fn create_environment_from_template(
    app: tauri::AppHandle,
    template_id: String,
) -> Result<crate::models::Environment, String> {
    let template = get_template_by_id(&template_id)?;

    let environment = crate::domain::environment::create_environment(
        app,
        template.id.clone(),
        template.requires_python.clone(),
        template.dependencies.clone(),
        None,
        Some(template_id.clone()),
    )
    .await?;

    let mut metadata = crate::infrastructure::load_envs_metadata()?;

    for env in metadata.environments.values_mut() {
        env.is_default = false;
    }

    if let Some(env) = metadata.environments.get_mut(&environment.id) {
        env.is_default = true;
    }

    crate::infrastructure::save_envs_metadata(&metadata)?;

    let default_env = metadata
        .environments
        .get(&environment.id)
        .cloned()
        .unwrap_or(environment);

    Ok(default_env)
}
