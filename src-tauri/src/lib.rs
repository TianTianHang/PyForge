pub mod api;
pub mod domain;
pub mod infrastructure;
pub mod models;
pub mod state;

use domain::environment::{check_env_exists, list_environments};
use infrastructure::{get_env_dir, migrate_from_mvp};
use state::AppStateWrapper;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppStateWrapper::default())
        .invoke_handler(tauri::generate_handler![
            api::check_env,
            api::create_env,
            api::list_environments,
            api::create_environment,
            api::delete_environment,
            api::list_packages,
            api::install_package,
            api::uninstall_package,
            api::start_jupyter,
            api::stop_jupyter,
            api::get_jupyter_info,
            api::get_app_state,
        ])
        .setup(|app| {
            migrate_from_mvp()?;

            let env_dir = get_env_dir("default");
            let state = app.state::<AppStateWrapper>();
            let environments = list_environments()?;
            let current_env_id = environments.first().map(|env| env.id.clone());

            state.update_env_status(check_env_exists(), env_dir.to_string_lossy().to_string());
            state.set_environments(environments, current_env_id);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
