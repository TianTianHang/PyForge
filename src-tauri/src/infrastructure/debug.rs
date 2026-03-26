/// 检查是否启用了调试模式
pub fn is_debug_enabled() -> bool {
    std::env::var("PYFORGE_DEBUG").is_ok()
}

/// 打印调试信息（如果启用调试模式）
///
/// 使用方法：
/// ```rust
/// debug!("这是一个调试信息: {}", value);
/// ```
#[macro_export]
macro_rules! debug {
    ($($arg:tt)*) => {
        if $crate::infrastructure::debug::is_debug_enabled() {
            eprintln!($($arg)*);
        }
    };
}

/// 打印模块级别的调试信息（如果启用调试模式）
///
/// 使用方法：
/// ```rust
/// debug_module!("ENV", "创建环境: {}", name);
/// ```
#[macro_export]
macro_rules! debug_module {
    ($module:expr, $($arg:tt)*) => {
        if $crate::infrastructure::debug::is_debug_enabled() {
            eprintln!("[{}] {}", $module, format!($($arg)*));
        }
    };
}
