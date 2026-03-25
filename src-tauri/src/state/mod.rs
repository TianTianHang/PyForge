use crate::models::{AppState, EnvStatus, JupyterInfo, Project};
use std::sync::Mutex;

pub struct AppStateWrapper(pub Mutex<AppState>);

impl AppStateWrapper {
    pub fn update_env_status(&self, exists: bool, path: String) {
        let mut state_lock = self.0.lock().unwrap();
        state_lock.env_status = EnvStatus { exists, path };
    }

    pub fn set_environments(&self, environments: Vec<crate::models::Environment>, current_env_id: Option<String>) {
        let mut state_lock = self.0.lock().unwrap();
        state_lock.environments = environments;
        state_lock.current_env_id = current_env_id;
    }

    pub fn set_jupyter_info(&self, info: JupyterInfo, pid: Option<u32>) {
        let mut state_lock = self.0.lock().unwrap();
        state_lock.jupyter_info = Some(info);
        state_lock.jupyter_pid = pid;
    }

    pub fn clear_jupyter(&self) -> Option<u32> {
        let mut state_lock = self.0.lock().unwrap();
        let pid = state_lock.jupyter_pid;
        state_lock.jupyter_info = None;
        state_lock.jupyter_pid = None;
        pid
    }

    pub fn get_jupyter_info(&self) -> Option<JupyterInfo> {
        let state_lock = self.0.lock().unwrap();
        state_lock.jupyter_info.clone()
    }

    pub fn get_env_status(&self) -> EnvStatus {
        let state_lock = self.0.lock().unwrap();
        state_lock.env_status.clone()
    }

    pub fn set_projects(&self, projects: Vec<Project>, current_project_id: Option<String>) {
        let mut state_lock = self.0.lock().unwrap();
        state_lock.projects = projects;
        state_lock.current_project_id = current_project_id;
    }

    pub fn get_projects(&self) -> Vec<Project> {
        let state_lock = self.0.lock().unwrap();
        state_lock.projects.clone()
    }

    pub fn get_current_project_id(&self) -> Option<String> {
        let state_lock = self.0.lock().unwrap();
        state_lock.current_project_id.clone()
    }

    pub fn get_app_state(&self) -> AppState {
        let state_lock = self.0.lock().unwrap();
        AppState {
            env_status: state_lock.env_status.clone(),
            environments: state_lock.environments.clone(),
            current_env_id: state_lock.current_env_id.clone(),
            jupyter_info: state_lock.jupyter_info.clone(),
            jupyter_pid: state_lock.jupyter_pid,
            projects: state_lock.projects.clone(),
            current_project_id: state_lock.current_project_id.clone(),
        }
    }
}

impl Default for AppStateWrapper {
    fn default() -> Self {
        Self(Mutex::new(AppState {
            env_status: EnvStatus {
                exists: false,
                path: String::new(),
            },
            environments: Vec::new(),
            current_env_id: None,
            jupyter_info: None,
            jupyter_pid: None,
            projects: Vec::new(),
            current_project_id: None,
        }))
    }
}
