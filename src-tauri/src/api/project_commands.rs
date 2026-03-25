use crate::domain::project::{create_project, delete_project};
use crate::domain::environment::{
    bind_kernel_to_project, unbind_kernel_from_project, list_project_kernels, list_unbound_kernels,
};
use crate::state::AppStateWrapper;
use tauri::State;

/// 创建新项目
#[tauri::command]
pub async fn create_project_command(
    state: State<'_, AppStateWrapper>,
    name: String,
    env_id: String,
) -> Result<(), String> {
    let project = create_project(name, env_id)?;
    let mut projects = state.get_projects();
    projects.push(project);
    state.set_projects(projects, None);
    Ok(())
}

/// 获取项目列表
#[tauri::command]
pub async fn list_projects_command(
    state: State<'_, AppStateWrapper>,
) -> Result<Vec<crate::models::Project>, String> {
    Ok(state.get_projects())
}

/// 删除项目
#[tauri::command]
pub async fn delete_project_command(
    state: State<'_, AppStateWrapper>,
    project_id: String,
) -> Result<(), String> {
    delete_project(&project_id)?;

    // Remove from app state
    let mut projects = state.get_projects();
    projects.retain(|p| p.id != project_id);

    // Clear current project if it's being deleted
    let current_project_id = state.get_current_project_id();
    if current_project_id == Some(project_id) {
        state.set_projects(projects, None);
    } else {
        state.set_projects(projects, current_project_id);
    }

    Ok(())
}

/// 绑定内核到项目
#[tauri::command]
pub async fn bind_kernel_command(
    _state: State<'_, AppStateWrapper>,
    project_id: String,
    env_id: String,
) -> Result<(), String> {
    bind_kernel_to_project(&project_id, &env_id)?;
    Ok(())
}

/// 从项目解绑内核
#[tauri::command]
pub async fn unbind_kernel_command(
    _state: State<'_, AppStateWrapper>,
    project_id: String,
    env_id: String,
) -> Result<(), String> {
    unbind_kernel_from_project(&project_id, &env_id)?;
    Ok(())
}

/// 获取项目的内核列表
#[tauri::command]
pub async fn list_project_kernels_command(
    _state: State<'_, AppStateWrapper>,
    project_id: String,
) -> Result<Vec<String>, String> {
    list_project_kernels(&project_id)
}

/// 获取项目未绑定的内核列表
#[tauri::command]
pub async fn list_unbound_kernels_command(
    _state: State<'_, AppStateWrapper>,
    project_id: String,
) -> Result<Vec<String>, String> {
    list_unbound_kernels(&project_id)
}
