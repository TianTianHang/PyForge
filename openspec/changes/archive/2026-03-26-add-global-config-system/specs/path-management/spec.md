## ADDED Requirements

### Requirement: 路径初始化
系统 SHALL 在应用启动时从配置文件读取数据目录路径。

#### Scenario: 默认数据目录
- **WHEN** 用户未配置数据目录
- **THEN** 系统使用默认数据目录（~/.pyforge）

#### Scenario: 自定义数据目录
- **WHEN** 用户配置自定义数据目录
- **THEN** 系统使用用户配置的数据目录

### Requirement: 路径函数改造
系统 SHALL 将路径函数从硬编码改为从配置读取。

#### Scenario: get_pyforge_root() 函数
- **WHEN** 调用 get_pyforge_root() 函数
- **THEN** 函数返回配置的数据目录路径

#### Scenario: 其他路径函数
- **WHEN** 调用其他路径函数（如 get_envs_dir()）
- **THEN** 函数基于配置的数据目录返回路径

### Requirement: 路径验证
系统 SHALL 验证配置的数据目录路径。

#### Scenario: 目录不存在
- **WHEN** 配置的数据目录不存在
- **THEN** 系统创建目录

#### Scenario: 目录不可写
- **WHEN** 配置的数据目录不可写
- **THEN** 系统返回错误信息

### Requirement: 路径配置保存
系统 SHALL 在配置更新后保存路径配置。

#### Scenario: 保存路径配置
- **WHEN** 用户更新数据目录配置
- **THEN** 系统将路径配置保存到配置文件

### Requirement: 环境路径计算
系统 SHALL 基于配置的数据目录计算环境路径。

#### Scenario: 默认环境路径
- **WHEN** 需要获取默认环境路径
- **THEN** 系统返回 {data_dir}/envs/default

#### Scenario: 自定义环境路径
- **WHEN** 需要获取自定义环境路径
- **THEN** 系统返回 {data_dir}/envs/{env_id}

### Requirement: 项目路径计算
系统 SHALL 基于配置的数据目录计算项目路径。

#### Scenario: 项目目录
- **WHEN** 需要获取项目目录
- **THEN** 系统返回 {data_dir}/projects

#### Scenario: 项目路径
- **WHEN** 需要获取特定项目路径
- **THEN** 系统返回 {data_dir}/projects/{project_id}

### Requirement: 内核路径计算
系统 SHALL 基于配置的数据目录计算内核路径。

#### Scenario: 内核存储目录
- **WHEN** 需要获取内核存储目录
- **THEN** 系统返回 {data_dir}/kernels

#### Scenario: 项目内核目录
- **WHEN** 需要获取项目内核目录
- **THEN** 系统返回 {data_dir}/projects/{project_id}/kernels
