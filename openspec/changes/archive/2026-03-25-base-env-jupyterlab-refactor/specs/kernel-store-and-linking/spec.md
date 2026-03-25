## ADDED Requirements

### Requirement: Store kernelspecs in a PyForge-managed global directory
The system SHALL write each environment's kernelspec into `~/.pyforge/kernels/pyforge-<env-id>/kernel.json` instead of a user-level Jupyter directory.

#### Scenario: Register environment kernel
- **WHEN** the system creates or refreshes an environment kernel for env `default`
- **THEN** it writes a kernelspec directory at `~/.pyforge/kernels/pyforge-default/`
- **AND** `kernel.json` points to that environment's Python executable

### Requirement: Link kernels into project directories
The system SHALL expose project-usable kernels by creating links under the project's `kernels/` directory that point to entries in `~/.pyforge/kernels/`.

#### Scenario: Bind default kernel into project
- **WHEN** a project needs access to env `default`
- **THEN** the system creates `~/.pyforge/projects/<project-id>/kernels/pyforge-default` as a link to `~/.pyforge/kernels/pyforge-default`

### Requirement: Start Jupyter with project and global kernel directories
The system SHALL configure Jupyter to read kernels from the current project's `kernels/` directory and the global `~/.pyforge/kernels/` directory.

#### Scenario: Start Jupyter for a project
- **WHEN** the system launches Jupyter for a project
- **THEN** it includes kernel directory configuration that makes project-linked kernels and globally managed kernels available to Jupyter
