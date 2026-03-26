## ADDED Requirements

### Requirement: User mode detection based on project count
The system SHALL automatically detect user experience level based on the number of existing projects and display appropriate UI elements.

#### Scenario: First-time user with zero projects
- **WHEN** user opens application with zero existing projects
- **THEN** system displays welcome screen with quick-start template cards
- **AND** system sets user mode to "first-time"

#### Scenario: Beginner user with 1-3 projects
- **WHEN** user has created 1-3 projects
- **THEN** system displays simplified project creation dialog with template selection
- **AND** system sets user mode to "beginner"

#### Scenario: Standard user with 4+ projects
- **WHEN** user has created 4 or more projects
- **THEN** system displays full-featured interface with all options exposed
- **AND** system sets user mode to "standard"

### Requirement: Welcome screen for first-time users
The system SHALL display a welcome screen when no projects exist, providing quick-start options instead of blank project list.

#### Scenario: Welcome screen displayed on first launch
- **WHEN** application launches with zero projects
- **THEN** system shows welcome screen with application logo and friendly greeting
- **AND** system displays 3-4 template cards for quick project creation
- **AND** system provides "learn more" link to documentation (optional)

#### Scenario: User selects template from welcome screen
- **WHEN** user clicks on a template card from welcome screen
- **THEN** system opens simplified project creation dialog with template pre-selected
- **AND** system focuses project name input field

#### Scenario: Welcome screen hidden after project creation
- **WHEN** user creates first project successfully
- **THEN** system dismisses welcome screen and shows project list
- **AND** system stores flag in localStorage to prevent showing welcome screen again

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
