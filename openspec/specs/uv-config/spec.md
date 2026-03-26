## ADDED Requirements

### Requirement: uv 配置文件生成
系统 SHALL 在应用启动时和配置更新后生成 `~/.pyforge/uv.toml` 配置文件。

#### Scenario: 首次启动生成 uv.toml
- **WHEN** 应用首次启动
- **THEN** 系统生成 `~/.pyforge/uv.toml` 配置文件

#### Scenario: 配置更新后更新 uv.toml
- **WHEN** 用户更新配置
- **THEN** 系统更新 `~/.pyforge/uv.toml` 配置文件

### Requirement: PyPI 源配置写入
系统 SHALL 将 PyPI 镜像源配置写入 `~/.pyforge/uv.toml`。

#### Scenario: 默认 PyPI 源
- **WHEN** 用户未配置 PyPI 源
- **THEN** 系统生成默认 PyPI 源配置（https://pypi.org/simple）

#### Scenario: 自定义 PyPI 源
- **WHEN** 用户配置自定义 PyPI 源
- **THEN** 系统将用户配置的 PyPI 源写入 uv.toml

### Requirement: Python 下载策略配置写入
系统 SHALL 将 Python 下载策略配置写入 `~/.pyforge/uv.toml`。

#### Scenario: 默认下载策略
- **WHEN** 用户未配置下载策略
- **THEN** 系统生成默认下载策略配置（automatic）

#### Scenario: 手动下载策略
- **WHEN** 用户配置下载策略为 manual
- **THEN** 系统将手动下载策略写入 uv.toml

#### Scenario: 禁止下载策略
- **WHEN** 用户配置下载策略为 never
- **THEN** 系统将禁止下载策略写入 uv.toml

### Requirement: Python 安装镜像源配置写入
系统 SHALL 将 Python 安装镜像源配置写入 `~/.pyforge/uv.toml`。

#### Scenario: 未配置 Python 镜像源
- **WHEN** 用户未配置 Python 镜像源
- **THEN** 系统不写入 python-install-mirror 配置

#### Scenario: 配置 Python 镜像源
- **WHEN** 用户配置 Python 镜像源
- **THEN** 系统将 python-install-mirror 写入 uv.toml

### Requirement: uv 命令调用
系统 SHALL 在执行 uv 命令时使用 `--config-file` 参数指定配置文件。

#### Scenario: uv 命令调用成功
- **WHEN** 系统执行 uv 命令（如 venv, pip install）
- **THEN** 系统使用 `--config-file ~/.pyforge/uv.toml` 参数

#### Scenario: uv 命令调用失败
- **WHEN** uv 命令调用失败
- **THEN** 系统返回错误信息

### Requirement: uv.toml 格式正确性
系统 SHALL 生成格式正确的 uv.toml 文件。

#### Scenario: 索引配置格式
- **WHEN** 系统生成 uv.toml
- **THEN** 索引配置使用正确的 `[[index]]` 格式

#### Scenario: 其他配置格式
- **WHEN** 系统生成 uv.toml
- **THEN** 其他配置使用正确的键值对格式
