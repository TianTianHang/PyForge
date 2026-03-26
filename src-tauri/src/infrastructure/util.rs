use rand::Rng;
use std::path::PathBuf;
use uuid::Uuid;

/// 将 PathBuf 转换为 &str，用于命令参数传递
pub fn path_to_str(path: &PathBuf) -> Result<&str, String> {
    path.to_str().ok_or_else(|| "路径包含无效字符".to_string())
}

pub fn find_available_port() -> Result<u16, String> {
    let mut rng = rand::rng();
    for _ in 0..10 {
        let port = rng.random_range(8000..9000);
        if is_port_available(port) {
            return Ok(port);
        }
    }
    Err("无法找到可用端口".to_string())
}

pub fn is_port_available(port: u16) -> bool {
    std::net::TcpListener::bind(("127.0.0.1", port)).is_ok()
}

pub fn generate_token() -> String {
    Uuid::new_v4().to_string().replace("-", "")
}
