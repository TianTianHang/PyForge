# Template-Based Environment Creation

## Requirements

### Requirement: Parse template from pyproject.toml
The system SHALL parse template definitions from pyproject.toml format files compiled into the application binary.

#### Scenario: Parse valid template
- **WHEN** system reads a valid pyproject.toml template file
- **THEN** system SHALL extract template ID from `[project.name]`
- **AND** system SHALL extract display name from `[tool.pyforge.display-name]`
- **AND** system SHALL extract description from `[project.description]`
- **AND** system SHALL extract Python version requirement from `[project.requires-python]`
- **AND** system SHALL extract dependencies list from `[project.dependencies]`
- **AND** system SHALL extract icon from `[tool.pyforge.icon]`
- **AND** system SHALL extract use cases from `[tool.pyforge.use-cases]`

#### Scenario: Parse Python version constraint
- **WHEN** system reads `requires-python` field with version constraint like ">=3.11"
- **THEN** system SHALL extract the base version number (e.g., "3.11")
- **AND** extracted version SHALL be used for environment creation

### Requirement: List available templates
The system SHALL provide a list of all built-in templates to the frontend for user selection.

#### Scenario: List all templates
- **WHEN** frontend requests template list
- **THEN** system SHALL return array of template objects
- **AND** each template SHALL include: id, display name, description, icon, dependencies, use cases
- **AND** templates SHALL be sorted by priority (general-learning last)

#### Scenario: Template data structure
- **WHEN** template object is constructed
- **THEN** it SHALL contain `id` field matching `[project.name]`
- **AND** it SHALL contain `display_name` field matching `[tool.pyforge.display-name]`
- **AND** it SHALL contain `description` field matching `[project.description]`
- **AND** it SHALL contain `icon` field matching `[tool.pyforge.icon]`
- **AND** it SHALL contain `dependencies` array matching `[project.dependencies]`
- **AND** it SHALL contain `use_cases` array matching `[tool.pyforge.use-cases]`

### Requirement: Create environment from template
The system SHALL create a Python environment based on the selected template definition.

#### Scenario: Create environment with template name
- **WHEN** user selects a template (e.g., "data-science")
- **THEN** system SHALL create environment with ID matching template name (e.g., "data-science")
- **AND** environment directory SHALL be `~/.pyforge/env/<template-name>/`
- **AND** environment Python version SHALL match template's `requires-python`
- **AND** system SHALL install all packages listed in template's `dependencies`

#### Scenario: Install template dependencies
- **WHEN** creating environment from template
- **THEN** system SHALL pass each dependency string (with version constraints) directly to uv
- **AND** uv SHALL resolve and install packages according to PEP 440 version constraints
- **AND** system SHALL NOT modify or parse version constraints

#### Scenario: Mark environment as default
- **WHEN** environment is successfully created from template
- **THEN** system SHALL set `is_default: true` for the newly created environment
- **AND** system SHALL set `is_default: false` for all other existing environments
- **AND** metadata SHALL be persisted to `~/.pyforge/environments.json`

#### Scenario: Record template source
- **WHEN** environment is created from template
- **THEN** system SHALL record `template_id` in environment metadata
- **AND** `template_id` SHALL match the template used for creation
- **AND** this information SHALL be stored in `~/.pyforge/environments.json`

### Requirement: Handle template creation errors
The system SHALL handle errors during template-based environment creation gracefully.

#### Scenario: Template not found
- **WHEN** requested template ID does not exist
- **THEN** system SHALL return error "模板不存在"
- **AND** environment creation SHALL NOT proceed

#### Scenario: Invalid template syntax
- **WHEN** pyproject.toml file has invalid syntax
- **THEN** system SHALL return error with parsing details
- **AND** system SHALL provide fallback to default template if available

#### Scenario: Package installation failure
- **WHEN** uv fails to install a package from template dependencies
- **THEN** system SHALL return error with package name and failure reason
- **AND** partial environment SHALL be cleaned up (deleted)
- **AND** user SHALL be informed of the failure

### Requirement: Built-in templates
The system SHALL include four built-in templates compiled into the binary.

#### Scenario: Data science template
- **WHEN** "data-science" template is loaded
- **THEN** it SHALL include numpy, pandas, matplotlib, ipykernel
- **AND** display name SHALL be "数据分析"
- **AND** icon SHALL be "📊"
- **AND** use cases SHALL include "数据处理", "可视化图表", "统计分析"

#### Scenario: Machine learning template
- **WHEN** "machine-learning" template is loaded
- **THEN** it SHALL include numpy, pandas, scikit-learn, ipykernel
- **AND** display name SHALL be "机器学习"
- **AND** icon SHALL be "🤖"
- **AND** use cases SHALL include "分类任务", "回归分析", "聚类", "模型训练"

#### Scenario: Web development template
- **WHEN** "web-development" template is loaded
- **THEN** it SHALL include flask, requests, ipykernel
- **AND** display name SHALL be "Web 开发"
- **AND** icon SHALL be "🌐"
- **AND** use cases SHALL include "Web 应用", "API 开发", "网络爬虫", "后端服务"

#### Scenario: General learning template
- **WHEN** "general-learning" template is loaded
- **THEN** it SHALL include ipykernel, jupyterlab
- **AND** display name SHALL be "通用学习"
- **AND** icon SHALL be "📚"
- **AND** use cases SHALL include "Python 基础", "算法练习", "编程学习", "实验项目"

### Requirement: Template storage
The system SHALL store template definitions as TOML files in the source tree and compile them into the binary.

#### Scenario: Template file location
- **WHEN** application is built
- **THEN** template files SHALL be located at `src-tauri/templates/*.toml`
- **AND** files SHALL be named using template IDs (e.g., `data-science.toml`)
- **AND** files SHALL be included using `include_str!` macro

#### Scenario: Template compilation
- **WHEN** Rust binary is compiled
- **THEN** template TOML content SHALL be embedded in the binary
- **AND** templates SHALL be accessible at runtime without file I/O
- **AND** template changes SHALL require recompilation
