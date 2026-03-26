pub mod api;
pub mod domain;
pub mod infrastructure;
pub mod models;
pub mod state;

use domain::environment::{check_env_exists, list_environments};
use domain::project::list_projects;
use infrastructure::{get_env_dir, init_config, init_paths, migrate_from_mvp, migrate_projects, write_uv_config};
use state::AppStateWrapper;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppStateWrapper::default())
        .invoke_handler(tauri::generate_handler![
            api::initialize_app,
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
            api::create_project_command,
            api::list_projects_command,
            api::delete_project_command,
            api::bind_kernel_command,
            api::unbind_kernel_command,
            api::list_project_kernels_command,
            api::list_unbound_kernels_command,
            api::get_config,
            api::update_config,
            api::validate_data_dir,
            api::migrate_data,
        ])
        .setup(|app| {
            // Load global config
            let config = init_config()?;
            init_paths(config.data_dir())?;
            write_uv_config(&config)?;

            migrate_from_mvp()?;
            migrate_projects()?;

            let env_dir = get_env_dir("default");
            let state = app.state::<AppStateWrapper>();
            let environments = list_environments()?;
            let current_env_id = environments.first().map(|env| env.id.clone());

            state.update_env_status(check_env_exists(), env_dir.to_string_lossy().to_string());
            state.set_environments(environments, current_env_id);

            // Load projects and set initial state
            if let Ok(projects) = list_projects() {
                let current_project_id = projects.first().map(|p| p.id.clone());
                state.set_projects(projects, current_project_id);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
