# data-migration Specification

## Purpose
Simplify data migration by removing symbolic link handling and focusing on file replication for kernel configurations.

## Requirements

### Requirement: Simplified Migration Process
The migration process SHALL NOT handle symbolic links, focusing only on file operations. All kernel configurations SHALL be replicated as regular files.

#### Scenario: Migration without symbolic links
- **WHEN** user migrates data from old to new location
- **THEN` system SHALL copy kernel configuration files directly
- **AND` SHALL NOT process any symbolic links
- **AND` SHALL NOT perform symlink path resolution or conversion

#### Scenario: Migration progress tracking
- **WHEN` migrating kernel directories
- **THEN` system SHALL provide progress updates for each file copied
- **AND` SHALL include kernel migration in overall migration steps

### Requirement: Kernel Configuration Migration
The system SHALL migrate kernel configurations by copying files, not preserving symbolic link relationships.

#### Scenario: Migrate kernel configurations
- **WHEN` moving kernel store from old location
- **THEN` system SHALL copy all kernel.json files to new location
- **AND` SHALL copy all supporting files (logo.png, etc.)
- **AND` SHALL NOT create symbolic links

#### Scenario: Migrate project-specific kernels
- **WHEN` migrating projects with bound kernels
- **THEN` system SHALL copy kernel directories to new project structure
- **AND` SHALL update path references in configuration files
- **AND` SHALL maintain complete kernel functionality

### Requirement: Path Resolution Migration
The system SHALL update path references in configuration files to reflect new locations after migration.

#### Scenario: Update kernel paths in configuration
- **WHEN` migrating kernel configuration files
- **THEN` system SHALL update `argv` paths in kernel.json to reflect new locations
- **AND` SHALL ensure paths point to correct Python interpreters

#### Scenario: Update project metadata
- **WHEN` migrating project data
- **THEN` system SHALL update project paths in metadata files
- **AND` SHALL ensure kernel paths are correct in project configurations

## MODIFIED Requirements

### Requirement: Migration Process
FROM: Migration includes complex symbolic link handling, path resolution, and cross-link conversion
TO: Migration focuses on direct file copying with simplified path updates

The migration process SHALL be simplified by removing all symbolic link processing, reducing complexity and potential failure points.

#### Scenario: Faster migration execution
- **WHEN` performing data migration
- **THEN` system SHALL complete migration without symbolic link processing
- **AND` SHALL process file operations more efficiently
- **AND` SHALL provide clearer progress indicators

#### Scenario: Reduced error scenarios
- **WHEN` migration encounters file system issues
- **THEN` system SHALL have fewer error conditions to handle
- **AND` SHALL provide simpler error recovery options
- **AND` SHALL report errors in a consistent format

## REMOVED Requirements

### Requirement: Symbolic Link Migration
**Reason**: Symbolic links are no longer used, eliminating the need for complex link processing
**Migration**: Remove all symlink detection, conversion, and validation logic

### Requirement: Link Path Resolution
**Reason**: Not applicable when using direct file copying
**Migration**: Remove path resolution for symbolic links
**Migration**: Remove relative to absolute path conversion

### Requirement: Loop Detection in Migration
**Reason**: Not needed when not processing symbolic links
**Migration**: Remove circular reference detection for symlinks
**Migration**: Simplify traversal logic to only handle regular files

### Requirement: Cross-Platform Symlink Creation
**Reason**: Symbolic links are no longer used in the migration process
**Migration**: Remove platform-specific symlink creation during migration
**Migration**: Remove Windows permission checks during migration