use tokio::process::Command;
use tauri::Emitter;
use super::*;

/// 检查环境状态
#[tauri::command]
pub fn check_env() -> EnvStatus {
    let env_dir = get_env_dir();
    EnvStatus {
        exists: check_env_exists(),
        path: env_dir.to_string_lossy().to_string(),
    }
}

/// 创建默认环境（异步，不会阻塞 UI）
#[tauri::command]
pub async fn create_env(app: tauri::AppHandle) -> Result<String, String> {
    let env_dir = get_env_dir();
    let project_dir = get_project_dir();

    ensure_dir(&get_pyforge_root())?;
    ensure_dir(&project_dir)?;

    if check_env_exists() {
        return Ok("环境已存在".to_string());
    }

    let _ = app.emit("env-progress", "正在创建虚拟环境...");

    let output = Command::new("uv")
        .args(["venv", env_dir.to_str().unwrap(), "--python", "3.10"])
        .output()
        .await
        .map_err(|e| format!("执行 uv venv 失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("创建虚拟环境失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "正在安装基础包 (numpy, pandas, matplotlib)...");

    let python = get_python_path();
    let mirror_url = get_pypi_mirror_url();
    let output = Command::new("uv")
        .args([
            "pip", "install", "--python",
            python.to_str().unwrap(),
            "--index-url", mirror_url,
            "numpy", "pandas", "matplotlib", "ipykernel", "jupyterlab",
        ])
        .output()
        .await
        .map_err(|e| format!("安装包失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("安装包失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "正在注册 Jupyter 内核...");

    let kernel_name = "pyforge-default";
    let output = Command::new(&python)
        .args([
            "-m", "ipykernel", "install", "--user",
            "--name", kernel_name,
            "--display-name", "PyForge (Python 3.10)",
        ])
        .output()
        .await
        .map_err(|e| format!("注册内核失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("注册内核失败: {}", stderr));
    }

    let _ = app.emit("env-progress", "环境创建完成");

    Ok("环境创建成功".to_string())
}

/// 启动 Jupyter Server（异步，不会阻塞 UI）
#[tauri::command]
pub async fn start_jupyter(state: tauri::State<'_, AppStateWrapper>) -> Result<JupyterInfo, String> {
    if !check_env_exists() {
        return Err("环境不存在，请先创建环境".to_string());
    }

    // 检查是否已有运行中的 Jupyter（使用块作用域确保 MutexGuard 在 .await 前释放）
    {
        let state_lock = state.0.lock().map_err(|e| format!("获取状态失败: {}", e))?;
        if let Some(ref info) = state_lock.jupyter_info {
            return Ok(info.clone());
        }
    }

    let port = find_available_port()?;
    let project_dir = get_project_dir();
    ensure_dir(&project_dir)?;

    let jupyter = get_jupyter_path();
    let notebook_dir = project_dir.to_string_lossy().to_string();

    let child = Command::new(&jupyter)
        .args([
            "lab", "--no-browser",
            "--port", &port.to_string(),
            "--notebook-dir", &notebook_dir,
            "--ip", "127.0.0.1",
            "--LabApp.allow_origin=http://localhost:1420",
            "--ServerApp.allow_remote_access=True",
            "--ServerApp.token=''",
            "--ServerApp.password=''",
            "--ServerApp.disable_check_xsrf=True",
            "--LabApp.tornado_settings={\"headers\":{\"Content-Security-Policy\":\"frame-ancestors 'self' http://localhost:1420\"}}",
        ])
        .spawn()
        .map_err(|e| format!("启动 Jupyter 失败: {}", e))?;

    let pid = child.id();
    let url = format!("http://127.0.0.1:{}/lab", port);

    let info = JupyterInfo {
        port,
        token: String::new(),
        url: url.clone(),
        notebook_dir,
    };

    // 保存状态（使用块作用域确保 MutexGuard 在 .await 前释放）
    {
        let mut state_lock = state.0.lock().map_err(|e| format!("获取状态失败: {}", e))?;
        state_lock.jupyter_info = Some(info.clone());
        state_lock.jupyter_pid = pid;
    }

    // 等待 Jupyter 就绪（最多 30 秒）
    for _ in 0..60 {
        let check = Command::new("curl")
            .args(["-s", "-o", "/dev/null", "-w", "%{http_code}", &format!("http://127.0.0.1:{}/api", port)])
            .output()
            .await;
        
        if let Ok(output) = check {
            if output.status.success() {
                let status_code = String::from_utf8_lossy(&output.stdout);
                if status_code == "200" {
                    return Ok(info);
                }
            }
        }
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    }

    // 超时也返回（Jupyter 可能已启动，只是检查失败）
    Ok(info)
}

/// 停止 Jupyter Server
#[tauri::command]
pub async fn stop_jupyter(state: tauri::State<'_, AppStateWrapper>) -> Result<String, String> {
    // 获取 PID 并释放锁
    let pid = {
        let mut state_lock = state.0.lock().map_err(|e| format!("获取状态失败: {}", e))?;
        let pid = state_lock.jupyter_pid;
        state_lock.jupyter_info = None;
        state_lock.jupyter_pid = None;
        pid
    };

    // 在锁释放后执行异步操作
    if let Some(pid) = pid {
        #[cfg(unix)]
        {
            let _ = Command::new("kill")
                .args(["-9", &pid.to_string()])
                .output()
                .await;
        }
        #[cfg(windows)]
        {
            let _ = Command::new("taskkill")
                .args(["/F", "/PID", &pid.to_string()])
                .output()
                .await;
        }
    }

    Ok("Jupyter 已停止".to_string())
}

/// 获取当前 Jupyter 信息
#[tauri::command]
pub fn get_jupyter_info(state: tauri::State<AppStateWrapper>) -> Result<Option<JupyterInfo>, String> {
    let state_lock = state.0.lock().map_err(|e| format!("获取状态失败: {}", e))?;
    Ok(state_lock.jupyter_info.clone())
}

/// 获取应用状态
#[tauri::command]
pub fn get_app_state(state: tauri::State<AppStateWrapper>) -> Result<AppState, String> {
    let state_lock = state.0.lock().map_err(|e| format!("获取状态失败: {}", e))?;
    Ok(state_lock.clone())
}
