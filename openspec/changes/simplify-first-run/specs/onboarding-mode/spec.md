## MODIFIED Requirements

### Requirement: Welcome screen for first-time users

#### Scenario: Welcome screen no longer shown to first-time users
- **WHEN** first-time user selects a template and creates an environment
- **THEN** system SHALL NOT display the welcome screen or project list
- **AND** system SHALL automatically create a default project and launch Jupyter

#### Scenario: Welcome screen shown when all projects deleted
- **WHEN** returning user has deleted all projects
- **AND** one or more environments exist
- **THEN** system SHALL display a simple empty state in the project panel area
- **AND** empty state SHALL show a folder icon, "还没有项目" text, and guidance to use the "新建项目" button
- **AND** empty state SHALL NOT show template cards

### Requirement: User mode detection based on project count

#### Scenario: First-time user with zero projects and zero environments
- **WHEN** user opens application with zero environments
- **THEN** system displays template selection screen
- **AND** after template selection, system automatically creates project and launches Jupyter

#### Scenario: First-time user with zero projects but existing environments
- **WHEN** user has zero projects but one or more environments exist
- **THEN** system SHALL display simple empty state with guidance to create a project
- **AND** system SHALL NOT display template cards
