use crate::infrastructure::{ensure_dir, get_env_metadata_path, get_pyforge_root};
use crate::models::EnvsMetadata;

pub fn load_envs_metadata() -> Result<EnvsMetadata, String> {
    let metadata_path = get_env_metadata_path();
    if !metadata_path.exists() {
        return Ok(EnvsMetadata {
            version: 1,
            environments: Default::default(),
        });
    }

    let content = std::fs::read_to_string(&metadata_path)
        .map_err(|e| format!("读取环境元数据失败: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("解析环境元数据失败: {}", e))
}

pub fn save_envs_metadata(metadata: &EnvsMetadata) -> Result<(), String> {
    ensure_dir(&get_pyforge_root())?;

    let content = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("序列化环境元数据失败: {}", e))?;

    std::fs::write(get_env_metadata_path(), content)
        .map_err(|e| format!("写入环境元数据失败: {}", e))
}
