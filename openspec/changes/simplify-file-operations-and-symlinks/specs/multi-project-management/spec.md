# multi-project-management Specification

## Purpose
Manage multiple projects with simplified kernel binding using file replication instead of symbolic links.

## Requirements

### Requirement: Kernel Binding to Projects
The system SHALL allow binding environment kernels to projects using file replication instead of symbolic links. Each project SHALL maintain independent copies of kernel configuration files.

#### Scenario: Bind kernel to new project
- **WHEN** user binds environment kernel "python3" to project "data-analysis"
- **THEN** system copies kernel files from `~/.pyforge/kernels/pyforge-python3/` to `~/.pyforge/projects/data-analysis/kernels/pyforge-python3/`
- **AND** creates `kernel.json` in the destination with correct paths
- **AND** does NOT create any symbolic links

#### Scenario: Multiple projects with same kernel
- **WHEN** kernel "python3" is bound to both "project-a" and "project-b"
- **THEN** each project SHALL have its own copy of kernel configuration files
- **AND** modifications to one project SHALL NOT affect the other
- **AND** both projects SHALL function independently

#### Scenario: Verify kernel independence
- **WHEN** kernel configuration in project-a is modified
- **THEN** the global kernel configuration SHALL remain unchanged
- **AND** project-b's kernel SHALL maintain its original configuration

### Requirement: Project Kernel Directory Management
The system SHALL maintain clean kernel directories within each project, including proper creation and cleanup.

#### Scenario: Project kernel directory creation
- **WHEN** binding a kernel to a project for the first time
- **THEN** system SHALL create `~/.pyforge/projects/{project_id}/kernels/` directory
- **AND** SHALL create subdirectory for the specific kernel

#### Scenario: Project kernel directory cleanup
- **WHEN** unbinding a kernel from a project
- **THEN** system SHALL remove the entire kernel directory from the project
- **AND** SHALL NOT affect the global kernel store
- **AND** SHALL NOT affect other projects

### Requirement: Project Startup with Local Kernels
The system SHALL start Jupyter with kernel directories scoped to only the kernels bound to the selected project.

#### Scenario: Start Jupyter with project-specific kernels
- **WHEN** user selects project "data-analysis" with kernel "python3" bound
- **THEN** system starts Jupyter with `--KernelSpecManager.kernel_dirs` set to `[projects/data-analysis/kernels/]`
- **AND** Jupyter SHALL only display kernels bound to this project
- **AND** SHALL NOT show kernels from other projects or global store

#### Scenario: Kernel isolation between projects
- **WHEN** project A has kernel "python3" and project B has kernel "r"
- **THEN** Jupyter for project A SHALL ONLY show pyforge-python3
- **AND** Jupyter for project B SHALL ONLY show pyforge-r

## MODIFIED Requirements

### Requirement: Kernel Binding Process
FROM: The system SHALL create symbolic links to bind kernels to projects
TO: The system SHALL use file replication to bind kernels to projects

The kernel binding SHALL create file copies instead of symbolic links, ensuring independence between projects.

#### Scenario: Binding kernel without special permissions
- **WHEN** binding a kernel to a project on Windows
- **THEN** operation SHALL succeed without requiring administrator privileges
- **AND** SHALL work on Windows without Developer Mode
- **AND** SHALL work on macOS and Linux without any special requirements

#### Scenario: Migrating from symbolic links to file copies
- **WHEN** an existing project uses symbolic links for kernel binding
- **THEN** binding SHALL automatically convert to file copies
- **AND** SHALL preserve all kernel configuration
- **AND** SHALL maintain Jupyter compatibility

## REMOVED Requirements

### Requirement: Symbolic Link Permission Handling
**Reason**: No longer needed as file replication does not require special permissions
**Migration**: Existing permissions SHALL be removed and permission check SHALL be eliminated

### Requirement: Cross-Platform Symlink Creation
**Reason**: Replaced by file replication which works consistently across platforms
**Migration**: Remove platform-specific symlink creation code
**Migration**: Remove conditional compilation for symlink creation

### Requirement: Symlink Validation in Project Listing
**Reason**: Not applicable when using file copies
**Migration**: Remove validation that checks for broken symlinks
**Migration**: Remove symlink resolution logic in project management
