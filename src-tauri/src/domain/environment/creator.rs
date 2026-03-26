use tauri::Emitter;
use crate::infrastructure::{get_env_dir, get_pyforge_root, ensure_dir, get_python_path, path_to_str, run_uv_command};
use crate::debug;
use crate::models::Environment;
use crate::domain::environment::{register_jupyter_kernel, bind_kernel_to_project};

#[derive(Debug, Clone, serde::Serialize)]
pub enum CreateProgress {
    CreatingVenv,
    InstallingPackages,
    RegisteringKernel,
    Complete,
}

#[deprecated(note = "已由模板系统替代，请使用 create_environment_from_template")]
pub async fn create_default_environment(app: tauri::AppHandle) -> Result<(), String> {
    _ = create_environment(
        app,
        "Default".to_string(),
        "3.12".to_string(),
        vec!["numpy".to_string(), "pandas".to_string(), "matplotlib".to_string(), "ipykernel".to_string()],
        None,
        None,
    ).await?;
    Ok(())
}

pub async fn create_environment(
    app: tauri::AppHandle,
    name: String,
    python_version: String,
    packages: Vec<String>,
    project_id: Option<String>,
    template_id: Option<String>,
) -> Result<Environment, String> {
    let env_id = name.to_lowercase().replace(" ", "-");
    let env_dir = get_env_dir(&env_id);
    let python = get_python_path(&env_id);

    debug!("🔧 [ENV] 开始创建环境:");
    debug!("  - 环境名称: {}", name);
    debug!("  - 环境ID: {}", env_id);
    debug!("  - Python版本: {}", python_version);
    debug!("  - 环境目录: {}", path_to_str(&env_dir)?);
    debug!("  - Python路径: {}", path_to_str(&python)?);
    debug!("  - 安装包: {:?}", packages);

    ensure_dir(&get_pyforge_root())?;

    if !python.exists() {
        debug!("📁 [ENV] Python 不存在，开始创建虚拟环境...");
        ensure_dir(&env_dir)?;
        debug!("✅ [ENV] 环境目录已创建: {}", path_to_str(&env_dir)?);

        let _ = app.emit("env-progress", format!("正在创建虚拟环境 ({})...", name));

        debug!("🔨 [ENV] 执行 uv venv 命令...");
        let output = run_uv_command(&app, &[
            "venv",
            path_to_str(&env_dir)?,
            "--python",
            &python_version
        ]).await?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            debug!("❌ [ENV] 创建虚拟环境失败!");
            debug!("❌ [ENV] 错误详情: {}", stderr);
            return Err(format!("创建虚拟环境失败: {}", stderr));
        }

        debug!("✅ [ENV] 虚拟环境创建成功");
    } else {
        debug!("ℹ️  [ENV] Python 已存在，跳过虚拟环境创建");
    }

    let _ = app.emit("env-progress", format!("正在安装基础包 ({})...", packages.join(", ")));

    if !packages.is_empty() {
        debug!("📦 [ENV] 开始安装包...");
        debug!("📦 [ENV] 目标Python: {}", path_to_str(&python)?);

        // Build base args for install command
        let mut base_args = vec![
            "pip", "install", "--python",
            path_to_str(&python)?,
        ];
        // Append package names to install
        base_args.extend(packages.iter().map(|s| s.as_str()));

        debug!("📦 [ENV] 执行 uv pip install 命令...");
        let output = run_uv_command(&app, &base_args).await?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            debug!("❌ [ENV] 安装包失败!");
            debug!("❌ [ENV] 错误详情: {}", stderr);
            return Err(format!("安装包失败: {}", stderr));
        }

        debug!("✅ [ENV] 包安装成功");
    } else {
        debug!("ℹ️  [ENV] 无需安装包");
    }

    let _ = app.emit("env-progress", format!("正在注册 Jupyter 内核 ({})...", name));

    debug!("🔌 [ENV] 开始注册 Jupyter 内核...");
    debug!("🔌 [ENV] 内核名称: pyforge-{}", env_id);

    register_jupyter_kernel(&python, &env_id, &name, &python_version).await?;

    debug!("✅ [ENV] Jupyter 内核注册成功");

    // Auto-bind to current project if provided
    if let Some(ref proj_id) = project_id {
        debug!("🔗 [ENV] 绑定内核到项目: {}", proj_id);
        if let Err(e) = bind_kernel_to_project(proj_id, &env_id) {
            debug!("⚠️  [ENV] 警告: 绑定内核到项目失败 ({}), 继续创建环境", e);
        } else {
            debug!("✅ [ENV] 内核绑定到项目成功");
        }
    }

    debug!("💾 [ENV] 保存环境元数据...");

    let environment = Environment {
        id: env_id.clone(),
        name,
        python_version,
        path: env_dir.to_string_lossy().to_string(),
        kernel_name: format!("pyforge-{}", env_id),
        created_at: chrono::Utc::now().to_rfc3339(),
        is_default: env_id == "default",
        template_id,
    };

    let mut metadata = crate::infrastructure::load_envs_metadata()?;
    metadata.environments.insert(env_id.clone(), environment.clone());
    crate::infrastructure::save_envs_metadata(&metadata)?;

    debug!("✅ [ENV] 环境元数据保存成功");

    let _ = app.emit("env-progress", "环境创建完成");

    debug!("🎉 [ENV] 环境创建完成: {}", env_id);

    Ok(environment)
}