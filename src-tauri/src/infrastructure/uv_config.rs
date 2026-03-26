use std::path::PathBuf;

use crate::infrastructure::get_pyforge_root;
use crate::models::AppConfig;

pub fn get_uv_config_path() -> PathBuf {
    get_pyforge_root().join("uv.toml")
}

pub fn write_uv_config(config: &AppConfig) -> Result<PathBuf, String> {
    let uv_config_path = get_uv_config_path();

    if let Some(parent) = uv_config_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建 uv 配置目录失败: {}", e))?;
    }

    let mut lines = Vec::new();

    // PyPI index configuration
    lines.push(format!(
        "[[index]]\nurl = \"{}\"\ndefault = true",
        config.sources.pypi_mirror
    ));

    // Python download strategy
    let strategy = match config.python.download_strategy {
        crate::models::PythonDownloadStrategy::Automatic => "automatic",
        crate::models::PythonDownloadStrategy::Manual => "manual",
        crate::models::PythonDownloadStrategy::Never => "never",
    };
    lines.push(format!("python-downloads = \"{}\"", strategy));

    // Python install mirror
    if let Some(ref mirror) = config.sources.python_install_mirror {
        lines.push(format!("python-install-mirror = \"{}\"", mirror));
    }

    let content = lines.join("\n\n") + "\n";

    std::fs::write(&uv_config_path, content).map_err(|e| format!("写入 uv 配置文件失败: {}", e))?;

    Ok(uv_config_path)
}
