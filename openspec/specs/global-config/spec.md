## ADDED Requirements

### Requirement: 配置文件加载
系统 SHALL 在应用启动时加载 `~/.pyforge/config.toml` 配置文件。

#### Scenario: 配置文件存在
- **WHEN** 应用启动时 `~/.pyforge/config.toml` 存在
- **THEN** 系统成功加载配置文件内容

#### Scenario: 配置文件不存在
- **WHEN** 应用启动时 `~/.pyforge/config.toml` 不存在
- **THEN** 系统使用默认配置并创建配置文件

#### Scenario: 配置文件格式错误
- **WHEN** 配置文件格式错误（TOML 解析失败）
- **THEN** 系统使用默认配置并创建新的配置文件

### Requirement: 配置文件保存
系统 SHALL 在配置更新后保存到 `~/.pyforge/config.toml`。

#### Scenario: 保存成功
- **WHEN** 用户更新配置
- **THEN** 系统将配置保存到 `~/.pyforge/config.toml`

#### Scenario: 保存失败
- **WHEN** 配置文件不可写
- **THEN** 系统返回错误信息，不修改配置

### Requirement: PyPI 镜像源配置
系统 SHALL 支持配置 PyPI 镜像源。

#### Scenario: 默认 PyPI 源
- **WHEN** 用户未配置 PyPI 源
- **THEN** 系统使用默认 PyPI 源（https://pypi.org/simple）

#### Scenario: 自定义 PyPI 源
- **WHEN** 用户配置自定义 PyPI 源
- **THEN** 系统使用用户配置的 PyPI 源

#### Scenario: PyPI 源验证
- **WHEN** 用户配置的 PyPI 源 URL 格式无效
- **THEN** 系统返回错误信息，不保存配置

### Requirement: Python 安装镜像源配置
系统 SHALL 支持配置 Python 安装镜像源。

#### Scenario: 默认 Python 镜像源
- **WHEN** 用户未配置 Python 镜像源
- **THEN** 系统不设置 Python 镜像源（使用官方源）

#### Scenario: 自定义 Python 镜像源
- **WHEN** 用户配置自定义 Python 镜像源
- **THEN** 系统使用用户配置的 Python 镜像源

#### Scenario: Python 镜像源验证
- **WHEN** 用户配置的 Python 镜像源 URL 格式无效
- **THEN** 系统返回错误信息，不保存配置

### Requirement: Python 下载策略配置
系统 SHALL 支持配置 Python 下载策略。

#### Scenario: 默认下载策略
- **WHEN** 用户未配置下载策略
- **THEN** 系统使用默认下载策略（automatic）

#### Scenario: 手动下载策略
- **WHEN** 用户配置下载策略为 manual
- **THEN** 系统仅在手动执行 `uv python install` 时下载 Python

#### Scenario: 禁止下载策略
- **WHEN** 用户配置下载策略为 never
- **THEN** 系统禁止自动下载 Python

### Requirement: 应用数据目录配置
系统 SHALL 支持配置应用数据目录。

#### Scenario: 默认数据目录
- **WHEN** 用户未配置数据目录
- **THEN** 系统使用默认数据目录（~/.pyforge）

#### Scenario: 自定义数据目录
- **WHEN** 用户配置自定义数据目录
- **THEN** 系统使用用户配置的数据目录

### Requirement: 默认 Python 版本配置
系统 SHALL 支持配置默认 Python 版本。

#### Scenario: 默认 Python 版本
- **WHEN** 用户未配置默认 Python 版本
- **THEN** 系统使用默认 Python 版本（3.12）

#### Scenario: 自定义 Python 版本
- **WHEN** 用户配置自定义 Python 版本
- **THEN** 系统使用用户配置的 Python 版本

### Requirement: Jupyter 端口范围配置
系统 SHALL 支持配置 Jupyter 端口范围。

#### Scenario: 默认端口范围
- **WHEN** 用户未配置端口范围
- **THEN** 系统使用默认端口范围（8000-9000）

#### Scenario: 自定义端口范围
- **WHEN** 用户配置自定义端口范围
- **THEN** 系统使用用户配置的端口范围

#### Scenario: 端口范围验证
- **WHEN** 用户配置的端口范围无效（起始端口大于结束端口）
- **THEN** 系统返回错误信息，不保存配置

### Requirement: Jupyter 超时时间配置
系统 SHALL 支持配置 Jupyter 超时时间。

#### Scenario: 默认超时时间
- **WHEN** 用户未配置超时时间
- **THEN** 系统使用默认超时时间（30 秒）

#### Scenario: 自定义超时时间
- **WHEN** 用户配置自定义超时时间
- **THEN** 系统使用用户配置的超时时间

### Requirement: 默认安装包列表配置
系统 SHALL 支持配置默认安装包列表。

#### Scenario: 默认安装包列表
- **WHEN** 用户未配置默认安装包列表
- **THEN** 系统使用默认安装包列表（numpy, pandas, matplotlib, ipykernel）

#### Scenario: 自定义安装包列表
- **WHEN** 用户配置自定义安装包列表
- **THEN** 系统使用用户配置的安装包列表
