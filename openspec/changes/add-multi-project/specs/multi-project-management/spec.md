## ADDED Requirements

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

The system SHALL start a Jupyter server with the notebook directory set to the selected project's path, using the Jupyter executable from the project's bound environment.

#### Scenario: Successful start

- **WHEN** user selects a project bound to environment "ml-project"
- **THEN** system starts Jupyter using `~/.pyforge/envs/ml-project/bin/jupyter`
- **AND** system sets `--notebook-dir` to the project's directory path
- **AND** system returns Jupyter connection info (port, token, URL)

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
