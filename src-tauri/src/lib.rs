pub mod api;
pub mod domain;
pub mod infrastructure;
pub mod models;
pub mod state;

use state::AppStateWrapper;
use domain::environment::check_env_exists;
use infrastructure::get_env_dir;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppStateWrapper::default())
        .invoke_handler(tauri::generate_handler![
            api::check_env,
            api::create_env,
            api::start_jupyter,
            api::stop_jupyter,
            api::get_jupyter_info,
            api::get_app_state,
        ])
        .setup(|app| {
            let env_dir = get_env_dir();
            let state = app.state::<AppStateWrapper>();
            state.update_env_status(check_env_exists(), env_dir.to_string_lossy().to_string());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
