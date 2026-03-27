# kernel-management Specification

## Purpose
Simplify kernel binding and management by replacing symbolic links with file replication.

## Requirements

### Requirement: Kernel File Replication
The system SHALL use file replication instead of symbolic links to bind kernels to projects. Each project SHALL maintain its own copy of the kernel configuration file.

#### Scenario: Binding a kernel to a new project
- **WHEN** a user binds an environment kernel to a project
- **THEN** the system creates a copy of the kernel configuration file in the project's kernel directory
- **AND** the project kernel SHALL be independent from the global kernel configuration

#### Scenario: Binding a kernel to multiple projects
- **WHEN** the same kernel is bound to multiple projects
- **THEN** each project SHALL have its own copy of the kernel configuration file
- **AND** modifications to one project's kernel SHALL NOT affect other projects

### Requirement: Kernel File Structure Preservation
The system SHALL preserve the complete kernel file structure when creating project copies. All supporting files SHALL be included.

#### Scenario: Binding kernel with additional files
- **WHEN** a kernel directory contains multiple files (kernel.json, logo.png, etc.)
- **THEN** all files SHALL be copied to the project's kernel directory
- **AND** the relative structure SHALL be preserved

### Requirement: Kernel Unbinding with Cleanup
The system SHALL remove all kernel files when unbinding a kernel from a project, including all supporting files.

#### Scenario: Unbinding kernel from project
- **WHEN** a kernel is unbound from a project
- **THEN** the project's kernel directory SHALL be completely removed
- **AND** no kernel files SHALL remain in the project directory

## MODIFIED Requirements

### Requirement: Kernel Binding Process
FROM: The system SHALL create symbolic links to bind kernels to projects
TO: The system SHALL use file replication to bind kernels to projects

The system SHALL bind an environment kernel to a project by copying the kernel configuration file(s) from the global kernel store to the project's kernel directory.

#### Scenario: Binding kernel with file replication
- **WHEN** user binds kernel "pyforge-python3" to project "my-project"
- **THEN** system copies kernel files from `~/.pyforge/kernels/pyforge-python3/` to `~/.pyforge/projects/my-project/kernels/pyforge-python3/`
- **AND** the binding SHALL work without requiring administrator privileges
- **AND** the binding SHALL work on all supported platforms (Windows, macOS, Linux)

#### Scenario: Binding existing project with legacy symlinks
- **WHEN** binding a kernel to a project that uses legacy symbolic links
- **THEN** system SHALL replace symlinks with file copies
- **AND** project SHALL continue to function normally after binding

## REMOVED Requirements

### Requirement: Symbolic Link Permission Check
**Reason**: Replaced by file replication which does not require special permissions
**Migration**: Existing projects using symlinks will be automatically migrated during binding

### Requirement: Cross-Platform Symlink Creation
**Reason**: No longer needed as we use file replication instead of symlinks
**Migration**: Remove all platform-specific symlink creation logic

### Requirement: Symlink Loop Detection
**Reason**: Not applicable when using file replication instead of symlinks
**Migration**: Remove symlink loop detection code and simplify migration logic
