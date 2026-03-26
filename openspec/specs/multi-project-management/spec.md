# multi-project-management Specification

## Purpose
TBD - created by archiving change add-multi-project. Update Purpose after archive.
## Requirements
### Requirement: Create project

The system SHALL allow users to create a new project by providing a name and selecting a bound environment. The system SHALL create a directory under `~/.pyforge/projects/{project_id}/` and persist metadata.

#### Scenario: Successful creation

- **WHEN** user submits a create project form with name "数据分析" and env_id "default"
- **THEN** system creates directory `~/.pyforge/projects/proj-数据分析/`
- **AND** system adds the project entry to `.projects-metadata.json`
- **AND** system returns the created Project object

#### Scenario: Duplicate name

- **WHEN** user submits a create project form with a name that already exists
- **THEN** system returns an error indicating the project name is already taken

#### Scenario: Invalid env_id

- **WHEN** user submits a create project form with an env_id that does not exist
- **THEN** system returns an error indicating the environment was not found

### Requirement: List projects

The system SHALL return all projects with valid directories from the metadata file. Projects whose directories no longer exist SHALL be filtered out.

#### Scenario: List with valid projects

- **WHEN** user opens the project selection screen
- **THEN** system returns all projects whose directories still exist on disk

#### Scenario: Filter stale projects

- **WHEN** a project's directory has been deleted externally
- **THEN** system excludes it from the returned list

### Requirement: Delete project

The system SHALL allow users to delete a project, removing its metadata and optionally its directory. The default project SHALL NOT be deletable.

#### Scenario: Successful deletion

- **WHEN** user confirms deletion of a non-default project
- **THEN** system removes the project entry from metadata
- **AND** system deletes the project directory recursively

#### Scenario: Protect default project

- **WHEN** user attempts to delete the default project
- **THEN** system returns an error indicating the default project cannot be deleted

### Requirement: Select project on startup

The system SHALL display a project selection screen on startup when projects exist. If no projects exist, the system SHALL display a project creation prompt.

#### Scenario: Projects exist

- **WHEN** application starts and projects are found
- **THEN** system displays the project selection screen with all available projects

#### Scenario: No projects exist

- **WHEN** application starts and no projects are found
- **THEN** system displays the project creation screen

### Requirement: Start Jupyter by project

The system SHALL start a Jupyter server with the notebook directory set to the selected project's path, using the base JupyterLab environment. The kernel directories SHALL be scoped to only the kernels bound to the selected project.

#### Scenario: Successful start

- **WHEN** user selects a project bound to environment "ml-project"
- **THEN** system starts Jupyter using the base environment Python
- **AND** system sets `--notebook-dir` to the project's directory path
- **AND** system sets `--KernelSpecManager.kernel_dirs` to only `projects/{project_id}/kernels/`
- **AND** system returns Jupyter connection info (port, token, URL)

#### Scenario: Kernel isolation

- **WHEN** user starts Jupyter for project A which has kernel "default" bound
- **AND** project B has kernel "ml" bound but project A does not
- **THEN** project A's Jupyter kernel picker shows only "pyforge-default"
- **AND** project A's Jupyter kernel picker does NOT show "pyforge-ml"

#### Scenario: Bound environment missing

- **WHEN** the project's bound environment directory does not exist
- **THEN** system returns an error indicating the environment is not available

### Requirement: Migrate existing projects directory

The system SHALL detect users with existing notebooks in `~/.pyforge/projects/` but no project metadata, and automatically create a default project entry.

#### Scenario: First run with existing notebooks

- **WHEN** application starts and `~/.pyforge/projects/` contains files but `.projects-metadata.json` does not exist
- **THEN** system creates a project named "我的项目" bound to the default environment
- **AND** system saves the project metadata

#### Scenario: Metadata already exists

- **WHEN** application starts and `.projects-metadata.json` exists
- **THEN** system skips migration and loads existing project metadata

### Requirement: Bind kernel to project

The system SHALL allow users to bind an existing environment's kernel to a project by creating a symlink in the project's `kernels/` directory.

#### Scenario: Successful binding

- **WHEN** user binds kernel "pyforge-ml" to project "proj-数据分析"
- **THEN** system creates symlink `projects/proj-数据分析/kernels/pyforge-ml` pointing to global kernel spec
- **AND** the kernel becomes visible in project's Jupyter kernel picker

#### Scenario: Already bound

- **WHEN** user attempts to bind a kernel that is already bound to the project
- **THEN** system returns success without duplicating the symlink

### Requirement: Unbind kernel from project

The system SHALL allow users to unbind a kernel from a project by removing the symlink from the project's `kernels/` directory.

#### Scenario: Successful unbinding

- **WHEN** user unbinds kernel "pyforge-ml" from project "proj-数据分析"
- **THEN** system removes symlink `projects/proj-数据分析/kernels/pyforge-ml`
- **AND** the kernel is no longer visible in project's Jupyter kernel picker

### Requirement: Auto-bind kernel on environment creation

When a user creates a new environment while a current project is active, the system SHALL automatically bind the new environment's kernel to the current project.

#### Scenario: Auto-bind to current project

- **WHEN** user creates environment "ml-env" while viewing project "proj-数据分析"
- **THEN** system creates the venv and registers the kernel globally
- **AND** system creates symlink `projects/proj-数据分析/kernels/pyforge-ml-env`
- **AND** the kernel is immediately available in project's Jupyter

#### Scenario: Create env from other project

- **WHEN** user creates environment "ml-env" from project "proj-机器学习"
- **AND** later wants to use it in project "proj-数据分析"
- **THEN** user must explicitly bind the kernel via project settings

### Requirement: Delete environment protection

The system SHALL prevent deletion of an environment if any project has its kernel bound.

#### Scenario: Blocked deletion

- **WHEN** user attempts to delete environment "ml-env"
- **AND** project "proj-机器学习" has "ml-env" kernel bound
- **THEN** system returns an error: "该环境已被项目 'proj-机器学习' 绑定，请先在项目设置中解绑"
- **AND** the environment is NOT deleted

#### Scenario: Allowed deletion

- **WHEN** user attempts to delete environment "ml-env"
- **AND** no project has "ml-env" kernel bound (or all have been unbound)
- **THEN** system deletes the environment, global kernel spec, and venv directory

### Requirement: Runtime kernel management

The system SHALL allow users to add or remove kernels from a project while Jupyter is running, without requiring a restart.

#### Scenario: Add kernel while Jupyter is running

- **WHEN** user opens project settings while Jupyter is running for "proj-数据分析"
- **AND** user binds kernel "pyforge-ml"
- **THEN** system creates the symlink
- **AND** the kernel becomes available in the running Jupyter's kernel picker (via auto-discovery or API refresh)

#### Scenario: Remove kernel while Jupyter is running

- **WHEN** user opens project settings while Jupyter is running
- **AND** user unbinds kernel "pyforge-ml"
- **THEN** system removes the symlink
- **AND** the kernel is no longer available for new notebooks (existing running kernels are not affected)

