## ADDED Requirements

### Requirement: One-click Jupyter launch from project card
The system SHALL provide a direct "Launch Jupyter" button on each project card, eliminating the two-step "select then launch" interaction.

#### Scenario: Launch button visible on all project cards
- **WHEN** user views project list
- **THEN** each project card displays a "Launch Jupyter" button in top-right corner
- **AND** button uses primary action styling (brand color, prominent)
- **AND** button is visible without user needing to select or hover the card

#### Scenario: Launch button starts Jupyter directly
- **WHEN** user clicks "Launch Jupyter" button on a project card
- **THEN** system initiates Jupyter server startup for that project
- **AND** system bypasses any project selection state
- **AND** system shows loading state with progress message

#### Scenario: Launch button disabled during startup
- **WHEN** Jupyter server is starting for a project
- **THEN** "Launch Jupyter" button on that project card becomes disabled
- **AND** button displays "Starting..." text or loading spinner
- **AND** user cannot click launch button again until startup completes or fails

### Requirement: Reduced click count to Jupyter

#### Scenario: First-time user path: 1 click to Jupyter
- **WHEN** first-time user opens application with welcome screen
- **THEN** user SHALL reach Jupyter in 1 click: select template → click "create and start"
- **AND** system SHALL automatically create a default project after environment creation
- **AND** system SHALL automatically launch Jupyter without any intermediate steps

#### Scenario: Returning user path: 1 click to Jupyter
- **WHEN** returning user opens application with existing projects
- **THEN** user can reach Jupyter in 1 click: click "Launch Jupyter" on project card
- **AND** system bypasses project selection step

### Requirement: Optimized empty state with quick-start

#### Scenario: Empty state shows simple guidance instead of template cards
- **WHEN** project list is empty (user has deleted all projects)
- **THEN** system SHALL display a simple empty state with a folder icon
- **AND** system SHALL display text "还没有项目"
- **AND** system SHALL display guidance text directing user to the "新建项目" button in the header
- **AND** system SHALL NOT display template cards in the empty state

#### Scenario: Empty state provides clear next step
- **WHEN** user sees empty state
- **THEN** system explicitly references the "新建项目" button as the next action
- **AND** system avoids displaying template selection options

### Requirement: Progress feedback during Jupyter startup
The system SHALL provide clear visual feedback during Jupyter server startup to assure user that action is in progress.

#### Scenario: Loading state displayed on project card
- **WHEN** user clicks launch button and Jupyter is starting
- **THEN** project card shows loading indicator (spinner or progress animation)
- **AND** launch button displays "Starting..." text
- **AND** card remains interactive for other actions (settings, delete)

#### Scenario: Progress message during creation and startup
- **WHEN** user clicks "create and start" in simplified dialog
- **THEN** dialog shows progress message: "Creating project..."
- **AND** after creation, message updates to "Starting Jupyter..."
- **AND** dialog closes automatically when Jupyter is ready

#### Scenario: Error state shown if startup fails
- **WHEN** Jupyter startup fails
- **THEN** system displays error message with specific failure reason
- **AND** system provides "retry" button to attempt launch again
- **AND** launch button returns to enabled state
