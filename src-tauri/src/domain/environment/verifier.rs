use crate::infrastructure::{get_env_dir, get_python_path};

pub fn check_env_exists() -> bool {
    let env_dir = get_env_dir();
    env_dir.exists() && env_dir.join("bin").join("python").exists()
}

pub fn verify_environment() -> Result<(), String> {
    if !check_env_exists() {
        return Err("环境不存在".to_string());
    }

    let python_path = get_python_path();
    if !python_path.exists() {
        return Err("Python 可执行文件不存在".to_string());
    }

    Ok(())
}
