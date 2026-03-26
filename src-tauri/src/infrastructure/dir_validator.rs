use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub is_writable: bool,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestFileResult {
    pub created: bool,
    pub written: bool,
    pub read: bool,
    pub deleted: bool,
    pub error: Option<String>,
}

// Test file name for validation
const TEST_FILE_NAME: &str = ".pyforge_write_test";

/// Validate if a directory is writable by creating and managing test files
pub fn validate_directory(dir_path: &str) -> ValidationResult {
    let dir = PathBuf::from(dir_path);

    // Check if directory exists
    if !dir.exists() {
        return ValidationResult {
            is_valid: false,
            is_writable: false,
            error: Some(format!("目录不存在: {}", dir_path)),
        };
    }

    // Check if it's actually a directory
    if !dir.is_dir() {
        return ValidationResult {
            is_valid: false,
            is_writable: false,
            error: Some(format!("路径不是目录: {}", dir_path)),
        };
    }

    // Test directory writability by creating test files
    let test_result = test_directory_writability(&dir);

    ValidationResult {
        is_valid: true,
        is_writable: test_result.created && test_result.written && test_result.read,
        error: if test_result.created && test_result.written && test_result.read {
            None
        } else {
            Some(format!("目录不可写: {:?}", test_result))
        },
    }
}

/// Test directory writability by creating, writing, reading, and deleting test files
fn test_directory_writability(dir: &PathBuf) -> TestFileResult {
    let test_file = dir.join(TEST_FILE_NAME);
    let test_content = test_file_content(); // Generate once and reuse
    let mut result = TestFileResult {
        created: false,
        written: false,
        read: false,
        deleted: false,
        error: None,
    };

    // Step 1: Create test file
    match fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&test_file)
    {
        Ok(mut file) => {
            result.created = true;

            // Step 2: Write test content
            match write_test_content(&mut file, &test_content) {
                Ok(()) => {
                    result.written = true;

                    // Step 3: Read test content
                    let content = fs::read_to_string(&test_file);
                    match content {
                        Ok(read_content) if read_content == test_content => {
                            result.read = true;
                        }
                        Err(e) => {
                            result.error = Some(format!("读取测试文件失败: {}", e));
                        }
                        Ok(_) => {
                            result.error = Some("测试文件内容不匹配".to_string());
                        }
                    }
                }
                Err(e) => {
                    result.error = Some(format!("写入测试文件失败: {}", e));
                }
            }
        }
        Err(e) => {
            result.error = Some(format!("创建测试文件失败: {}", e));
        }
    }

    // Step 4: Delete test file (ignore errors if other steps failed)
    let _ = fs::remove_file(&test_file);
    result.deleted = true;

    result
}

/// Write test content to a file
fn write_test_content(file: &mut std::fs::File, content: &str) -> Result<(), std::io::Error> {
    use std::io::Write;
    file.write_all(content.as_bytes())?;
    file.sync_all()?; // Ensure data is written to disk
    Ok(())
}

/// Generate test file content with timestamp and random data
fn test_file_content() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    format!("pyforge_write_test_{}_{}", timestamp, uuid::Uuid::new_v4())
}