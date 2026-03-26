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
The system SHALL minimize the number of user interactions required to go from application launch to JupyterLab interface.

#### Scenario: First-time user path: 2 clicks to Jupyter
- **WHEN** first-time user opens application with welcome screen
- **THEN** user can reach Jupyter in 2 clicks: select template → click "create and start"
- **AND** system creates project and launches Jupyter without intermediate steps

#### Scenario: Returning user path: 1 click to Jupyter
- **WHEN** returning user opens application with existing projects
- **THEN** user can reach Jupyter in 1 click: click "Launch Jupyter" on project card
- **AND** system bypasses project selection step

#### Scenario: No intermediate confirmation dialogs
- **WHEN** user clicks launch button or "create and start"
- **THEN** system proceeds directly to action without confirmation dialog
- **AND** system shows progress indicator instead of modal confirmation

### Requirement: Optimized empty state with quick-start
The system SHALL replace blank empty state with actionable quick-start options that guide users to create their first project.

#### Scenario: Empty state shows welcome guide instead of blank
- **WHEN** project list is empty
- **THEN** system displays welcome guide with application branding
- **AND** system shows 3-4 template cards for immediate project creation
- **AND** system does not display empty "no projects" message without action

#### Scenario: Quick-start cards link to creation
- **WHEN** user views empty state welcome guide
- **THEN** each template card is clickable
- **AND** clicking a card opens simplified creation dialog with that template pre-selected
- **AND** project name input is auto-focused for immediate entry

#### Scenario: Empty state provides clear next step
- **WHEN** user sees empty state
- **THEN** system explicitly shows "create your first project" call-to-action
- **AND** system avoids generic "no projects" message
- **AND** primary action button is visually prominent

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
