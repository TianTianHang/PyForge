## ADDED Requirements

### Requirement: 目录可写性检测
系统 SHALL 检测目标目录的可写性。

#### Scenario: 检测成功
- **WHEN** 目标目录存在且可写
- **THEN** 系统返回检测成功结果

#### Scenario: 目录不存在
- **WHEN** 目标目录不存在
- **THEN** 系统返回检测失败结果和错误信息

#### Scenario: 目录不可写
- **WHEN** 目标目录不可写
- **THEN** 系统返回检测失败结果和错误信息

#### Scenario: 测试文件创建失败
- **WHEN** 在目标目录创建测试文件失败
- **THEN** 系统返回检测失败结果和错误信息

#### Scenario: 测试文件写入失败
- **WHEN** 向测试文件写入内容失败
- **THEN** 系统返回检测失败结果和错误信息

#### Scenario: 测试文件读取失败
- **WHEN** 从测试文件读取内容失败
- **THEN** 系统返回检测失败结果和错误信息

### Requirement: 数据目录迁移确认
系统 SHALL 在迁移前显示确认对话框。

#### Scenario: 确认对话框显示
- **WHEN** 用户点击迁移按钮
- **THEN** 系统显示迁移确认对话框

#### Scenario: 旧目录显示
- **WHEN** 显示迁移确认对话框
- **THEN** 系统显示旧数据目录路径

#### Scenario: 新目录显示
- **WHEN** 显示迁移确认对话框
- **THEN** 系统显示新数据目录路径

#### Scenario: 迁移内容列表
- **WHEN** 显示迁移确认对话框
- **THEN** 系统显示迁移内容列表（envs、projects、kernels、base 等）

#### Scenario: 确认按钮
- **WHEN** 用户点击确认按钮
- **THEN** 系统开始执行迁移

#### Scenario: 取消按钮
- **WHEN** 用户点击取消按钮
- **THEN** 系统关闭确认对话框，不执行迁移

### Requirement: 数据目录迁移执行
系统 SHALL 执行数据目录迁移（文件移动）。

#### Scenario: 环境目录迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动 envs/ 目录到新位置

#### Scenario: 项目目录迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动 projects/ 目录到新位置

#### Scenario: 内核目录迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动 kernels/ 目录到新位置

#### Scenario: 基础环境迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动 base/ 目录到新位置

#### Scenario: 元数据文件迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动元数据文件（.envs-metadata.json、.projects-metadata.json）

#### Scenario: 配置文件迁移
- **WHEN** 执行数据目录迁移
- **THEN** 系统移动 config.toml 文件

#### Scenario: 配置文件更新
- **WHEN** 执行数据目录迁移
- **THEN** 系统更新 config.toml 中的 data_dir 配置

#### Scenario: uv.toml 重新生成
- **WHEN** 执行数据目录迁移
- **THEN** 系统在新位置重新生成 uv.toml

### Requirement: 迁移进度显示
系统 SHALL 显示迁移进度。

#### Scenario: 进度显示
- **WHEN** 执行数据目录迁移
- **THEN** 系统显示当前迁移步骤

#### Scenario: 迁移完成
- **WHEN** 数据目录迁移完成
- **THEN** 系统显示迁移完成提示

### Requirement: 迁移错误处理
系统 SHALL 处理迁移过程中的错误。

#### Scenario: 磁盘空间不足
- **WHEN** 目标磁盘空间不足
- **THEN** 系统显示错误信息，不执行迁移

#### Scenario: 文件移动失败
- **WHEN** 文件移动过程中失败
- **THEN** 系统显示错误信息，保留原数据

#### Scenario: 权限不足
- **WHEN** 文件移动权限不足
- **THEN** 系统显示错误信息，保留原数据

### Requirement: 迁移后应用重启
系统 SHALL 在迁移完成后自动重启应用。

#### Scenario: 自动重启
- **WHEN** 数据目录迁移完成
- **THEN** 系统自动重启应用

#### Scenario: 配置生效
- **WHEN** 应用重启后
- **THEN** 系统使用新的数据目录配置
