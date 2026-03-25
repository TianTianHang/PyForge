use tauri::Emitter;
use tokio::process::Command;
use crate::infrastructure::{get_env_dir, get_pyforge_root, ensure_dir, get_python_path, PYPI_MIRROR_URL};
use crate::models::Environment;
use crate::domain::environment::{register_jupyter_kernel, bind_kernel_to_project};

#[derive(Debug, Clone, serde::Serialize)]
pub enum CreateProgress {
    CreatingVenv,
    InstallingPackages,
    RegisteringKernel,
    Complete,
}

pub async fn create_default_environment(app: tauri::AppHandle) -> Result<(), String> {
    _ = create_environment(
        app,
        "Default".to_string(),
        "3.12".to_string(),
        vec!["numpy".to_string(), "pandas".to_string(), "matplotlib".to_string(), "ipykernel".to_string()],
        None, // No project binding for default environment during migration
    ).await?;
    Ok(())
}

pub async fn create_environment(
    app: tauri::AppHandle,
    name: String,
    python_version: String,
    packages: Vec<String>,
    project_id: Option<String>,
) -> Result<Environment, String> {
    let env_id = name.to_lowercase().replace(" ", "-");
    let env_dir = get_env_dir(&env_id);
    let python = get_python_path(&env_id);

    ensure_dir(&get_pyforge_root())?;

    if !python.exists() {
        ensure_dir(&env_dir)?;

        let _ = app.emit("env-progress", format!("正在创建虚拟环境 ({})...", name));

        let output = Command::new("uv")
            .args(["venv", env_dir.to_str().unwrap(), "--python", &python_version])
            .output()
            .await
            .map_err(|e| format!("执行 uv venv 失败: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("创建虚拟环境失败: {}", stderr));
        }
    }

    let _ = app.emit("env-progress", format!("正在安装基础包 ({})...", packages.join(", ")));

    let mirror_url = PYPI_MIRROR_URL;

    if !packages.is_empty() {
        let output = Command::new("uv")
            .args([
                "pip", "install", "--python",
                python.to_str().unwrap(),
                "--index-url", mirror_url,
            ])
            .args(packages.clone())
            .output()
            .await
            .map_err(|e| format!("安装包失败: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("安装包失败: {}", stderr));
        }
    }

    let _ = app.emit("env-progress", format!("正在注册 Jupyter 内核 ({})...", name));

    register_jupyter_kernel(&python, &env_id, &name, &python_version).await?;

    // Auto-bind to current project if provided
    if let Some(ref proj_id) = project_id {
        if let Err(e) = bind_kernel_to_project(proj_id, &env_id) {
            eprintln!("警告: 绑定内核到项目失败 ({}), 继续创建环境", e);
        }
    }

    let environment = Environment {
        id: env_id.clone(),
        name,
        python_version,
        path: env_dir.to_string_lossy().to_string(),
        kernel_name: format!("pyforge-{}", env_id),
        created_at: chrono::Utc::now().to_rfc3339(),
        is_default: env_id == "default",
    };

    let mut metadata = crate::infrastructure::load_envs_metadata()?;
    metadata.environments.insert(env_id.clone(), environment.clone());
    crate::infrastructure::save_envs_metadata(&metadata)?;

    let _ = app.emit("env-progress", "环境创建完成");

    Ok(environment)
}