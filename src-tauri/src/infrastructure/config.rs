use std::path::PathBuf;

use crate::models::AppConfig;

pub fn get_config_path() -> PathBuf {
    dirs::home_dir()
        .expect("无法获取用户主目录")
        .join(".pyforge")
        .join("config.toml")
}

pub fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path();

    if !config_path.exists() {
        let config = AppConfig::default();
        save_config(&config)?;
        return Ok(config);
    }

    let content =
        std::fs::read_to_string(&config_path).map_err(|e| format!("读取配置文件失败: {}", e))?;

    let config: AppConfig = toml::from_str(&content).map_err(|e| {
        let default = AppConfig::default();
        let _ = save_config(&default);
        format!("解析配置文件失败，已重置为默认配置: {}", e)
    })?;

    Ok(config)
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path();

    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建配置目录失败: {}", e))?;
    }

    let content = toml::to_string_pretty(config).map_err(|e| format!("序列化配置失败: {}", e))?;

    std::fs::write(&config_path, content).map_err(|e| format!("写入配置文件失败: {}", e))?;

    Ok(())
}

pub fn init_config() -> Result<AppConfig, String> {
    load_config()
}
