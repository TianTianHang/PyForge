## MODIFIED Requirements

### Requirement: Frontend duplicate submission prevention
The system SHALL prevent users from submitting multiple project creation requests simultaneously by disabling the submit button during submission.

#### Scenario: Button disabled during submission
- **WHEN** user clicks "创建" or "创建并开始" button and submission is in progress
- **THEN** button becomes disabled and shows "创建中..." text

#### Scenario: Button re-enabled after completion
- **WHEN** project creation completes (success or failure)
- **THEN** button becomes enabled again and shows "创建" text
- **AND** if creation was successful and "创建并开始" was clicked, system navigates to Jupyter instead of returning to dialog

#### Scenario: Button disabled during Jupyter startup
- **WHEN** project creation succeeds and Jupyter startup is in progress
- **THEN** submit button remains disabled with "启动中..." text
- **AND** user cannot cancel or resubmit during Jupyter startup

### Requirement: Frontend state management
The system SHALL use immutable state updates to ensure consistent UI state during project creation.

#### Scenario: Error state update
- **WHEN** validation error occurs
- **THEN** error message is displayed without modifying the original state object

#### Scenario: Success state update
- **WHEN** project creation succeeds in simplified mode (template-based)
- **THEN** dialog closes and project list updates consistently
- **AND** system automatically initiates Jupyter startup for the new project

#### Scenario: Success state update with manual launch
- **WHEN** project creation succeeds in advanced mode or user cancels auto-launch
- **THEN** dialog closes and project list updates consistently
- **AND** system does not automatically initiate Jupyter startup
- **AND** new project card appears in list with "Launch Jupyter" button enabled

## ADDED Requirements

### Requirement: Template-based project creation flow
The system SHALL support creating projects based on selected templates, which automatically configure environment, Python version, and packages.

#### Scenario: Template selection auto-fills configuration
- **WHEN** user selects a template in simplified creation dialog
- **THEN** system populates internal state with template's default Python version
- **AND** system populates internal state with template's package list
- **AND** system does not expose these technical details in the UI

#### Scenario: Create with template creates environment
- **WHEN** user submits project creation with selected template
- **THEN** system validates project name for uniqueness
- **AND** system creates or reuses environment based on template configuration
- **AND** system installs template's packages in environment
- **AND** system links project to the environment

#### Scenario: Template creation bypasses environment selection
- **WHEN** user creates project using template-based flow
- **THEN** system does not show environment selection dropdown
- **AND** system does not prompt user to create or select environment
- **AND** system handles environment lifecycle in background

### Requirement: Simplified creation dialog validation
The system SHALL validate project creation submissions in simplified mode with minimal required fields.

#### Scenario: Validation requires only name and template
- **WHEN** user attempts to create project in simplified mode
- **THEN** system validates that project name is not empty
- **AND** system validates that a template is selected
- **AND** system does not require environment selection or custom package configuration

#### Scenario: Duplicate name validation in simplified mode
- **WHEN** user enters duplicate project name in simplified creation dialog
- **THEN** system displays error message "项目名称已存在"
- **AND** system prevents form submission
- **AND** system maintains template selection and name input for correction

### Requirement: Auto-launch Jupyter after creation
The system SHALL provide option to automatically launch Jupyter after successful project creation in simplified mode.

#### Scenario: "Create and start" launches Jupyter
- **WHEN** user clicks "创建并开始" button in simplified dialog
- **THEN** system creates project with selected template configuration
- **AND** upon successful creation, system automatically initiates Jupyter startup
- **AND** system navigates to JupyterLab interface when ready
- **AND** system does not return to project list

#### Scenario: Create-only flow preserves manual launch
- **WHEN** user expands advanced options and clicks "创建" button
- **THEN** system creates project but does not auto-launch Jupyter
- **AND** system returns to project list showing new project
- **AND** user can manually click "Launch Jupyter" button on project card

### Requirement: Advanced options in creation dialog
The system SHALL provide collapsible advanced options section in simplified creation dialog for users who need manual control.

#### Scenario: Advanced options expand on request
- **WHEN** user clicks "advanced settings" link in simplified dialog
- **THEN** system expands section to show environment selection, Python version, and custom package inputs
- **AND** system allows user to override template defaults
- **AND** system maintains template selection as starting point

#### Scenario: Manual override of template configuration
- **WHEN** user expands advanced options and changes Python version or packages
- **THEN** system uses manual values instead of template defaults
- **AND** system creates environment with custom configuration
- **AND** template selection remains as visual indicator but not used for configuration
