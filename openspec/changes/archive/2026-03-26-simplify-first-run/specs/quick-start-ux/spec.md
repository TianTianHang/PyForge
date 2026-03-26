## MODIFIED Requirements

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
