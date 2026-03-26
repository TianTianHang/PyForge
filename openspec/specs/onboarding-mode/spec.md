## ADDED Requirements

### Requirement: User mode detection based on project count

#### Scenario: First-time user with zero projects and zero environments
- **WHEN** user opens application with zero environments
- **THEN** system displays template selection screen
- **AND** after template selection, system automatically creates project and launches Jupyter

#### Scenario: First-time user with zero projects but existing environments
- **WHEN** user has zero projects but one or more environments exist
- **THEN** system SHALL display simple empty state with guidance to create a project
- **AND** system SHALL NOT display template cards

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

### Requirement: Simplified project creation dialog
The system SHALL provide a simplified project creation dialog for first-time and beginner users that hides technical complexity.

#### Scenario: Simplified dialog shown to first-time users
- **WHEN** first-time user clicks "create project" button
- **THEN** system displays dialog with only project name input and template selection
- **AND** system hides environment selection, Python version, and package configuration
- **AND** system shows "using default configuration" message

#### Scenario: Advanced options collapsed by default
- **WHEN** simplified dialog is displayed
- **THEN** system shows "advanced settings" link in collapsible section
- **AND** system hides Python version, environment selection, and custom package inputs

#### Scenario: User expands advanced options
- **WHEN** user clicks "advanced settings" link
- **THEN** system expands section to show all original configuration options
- **AND** system allows user to select environment, Python version, and custom packages
- **AND** "advanced settings" link changes to "hide advanced settings"

#### Scenario: Create button creates and launches Jupyter
- **WHEN** user fills project name and selects template in simplified dialog
- **THEN** "create and start" button creates project with default environment
- **AND** system automatically launches Jupyter for the new project
- **AND** system navigates directly to JupyterLab interface

### Requirement: Template-based project creation
The system SHALL allow users to create projects based on predefined templates that bundle Python version, packages, and use case guidance.

#### Scenario: Template provides default configuration
- **WHEN** user selects a project template
- **THEN** system populates hidden fields with template's default Python version
- **AND** system prepares to install template's package list
- **AND** system does not expose these technical details to beginner users

#### Scenario: Template selection in simplified dialog
- **WHEN** user views simplified project creation dialog
- **THEN** system displays templates as visual cards with icons, names, and descriptions
- **AND** system highlights currently selected template
- **AND** system shows at most 4-5 template options to avoid overwhelming

#### Scenario: Template pre-selection from welcome screen
- **WHEN** user clicks a template card from welcome screen
- **THEN** simplified creation dialog opens with that template already selected
- **AND** system focuses project name input for immediate entry
