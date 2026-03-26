# Template Selection UI

## Requirements

### Requirement: Show template selection on first launch
The system SHALL display template selection interface when application is launched with no existing environments.

#### Scenario: First launch detection
- **WHEN** application starts
- **AND** environment list is empty (length === 0)
- **THEN** system SHALL display template selection screen
- **AND** template selection SHALL replace default environment creation flow

#### Scenario: Skip template selection with existing environments
- **WHEN** application starts
- **AND** one or more environments already exist
- **THEN** system SHALL NOT display template selection screen
- **AND** system SHALL proceed directly to project selection screen

### Requirement: Display template cards
The system SHALL display templates as interactive cards with visual hierarchy.

#### Scenario: Template card layout
- **WHEN** template selection screen is displayed
- **THEN** system SHALL show 4 template cards in a grid layout
- **AND** each card SHALL display template icon (emoji) at the top
- **AND** each card SHALL display template display name
- **AND** each card SHALL display template description
- **AND** each card SHALL display first 3 dependencies as preview badges
- **AND** each card SHALL display use case tags

#### Scenario: Template card interaction
- **WHEN** user clicks on a template card
- **THEN** card SHALL show selected state (visual highlight)
- **AND** "创建并开始" button SHALL become enabled
- **AND** selected template SHALL be stored in component state

#### Scenario: Template selection feedback
- **WHEN** a template is selected
- **THEN** previously selected template SHALL be deselected
- **AND** only one template SHALL be selected at a time

### Requirement: Show creation progress
The system SHALL display progress feedback during environment creation from template.

#### Scenario: Creation button state
- **WHEN** no template is selected
- **THEN** "创建并开始" button SHALL be disabled
- **AND** button text SHALL be "创建并开始"

#### Scenario: Creation in progress
- **WHEN** user clicks "创建并开始" button with selected template
- **THEN** button SHALL become disabled
- **AND** button text SHALL change to "创建中..."
- **AND** loading spinner SHALL be displayed

#### Scenario: Show progress screen
- **WHEN** environment creation starts
- **THEN** system SHALL display ProgressScreen component
- **AND** progress messages SHALL show creation stages:
  - "正在创建虚拟环境 (<template-name>)..."
  - "正在安装基础包 (<package list>)..."
  - "正在注册 Jupyter 内核 (<template-name>)..."
- **AND** progress screen SHALL use existing step indicator (3 steps)

#### Scenario: Creation completion
- **WHEN** environment creation completes successfully
- **THEN** system SHALL close template selection screen
- **AND** system SHALL navigate to project selection screen
- **AND** success message SHALL NOT be displayed (seamless transition)

#### Scenario: Creation failure
- **WHEN** environment creation fails
- **THEN** system SHALL display error message
- **AND** system SHALL return to template selection screen
- **AND** template selection SHALL be preserved (user can retry)

### Requirement: Template information display
The system SHALL provide sufficient information for users to choose between templates.

#### Scenario: Dependency preview
- **WHEN** template card is displayed
- **THEN** first 3 dependencies SHALL be shown as badges
- **AND** if more than 3 dependencies exist
- **AND** badge "+N" SHALL be shown (where N is remaining count)

#### Scenario: Use case display
- **WHEN** template card is displayed
- **THEN** all use cases from template SHALL be shown as tags
- **AND** tags SHALL be displayed in a compact format

#### Scenario: Visual differentiation
- **WHEN** templates are displayed
- **THEN** each template SHALL have distinct icon (emoji)
- **AND** icons SHALL be large and visually prominent
- **AND** color coding SHALL NOT be used (rely on icons and text)

### Requirement: Keyboard navigation
The system SHALL support keyboard navigation for template selection.

#### Scenario: Tab navigation
- **WHEN** user presses Tab key
- **THEN** focus SHALL move to next template card
- **AND** focus SHALL wrap from last card to first card

#### Scenario: Card selection via keyboard
- **WHEN** a template card has focus
- **AND** user presses Enter or Space key
- **THEN** template SHALL be selected
- **AND** visual feedback SHALL match click interaction

#### Scenario: Button activation
- **WHEN** "创建并开始" button has focus
- **AND** user presses Enter key
- **AND** a template is selected
- **THEN** environment creation SHALL start

### Requirement: Responsive layout
The system SHALL display template selection interface appropriately across different screen sizes.

#### Scenario: Large screen layout
- **WHEN** screen width is >= 1024px
- **THEN** template cards SHALL be displayed in 2 columns
- **AND** cards SHALL have maximum width of 400px

#### Scenario: Small screen layout
- **WHEN** screen width is < 1024px
- **THEN** template cards SHALL be displayed in single column
- **AND** cards SHALL fill available width

### Requirement: Screen title and description
The system SHALL provide clear context for template selection screen.

#### Scenario: Welcome message
- **WHEN** template selection screen is displayed
- **THEN** screen SHALL show title "欢迎使用 PyForge"
- **AND** screen SHALL show subtitle "选择一个环境模板开始："
- **AND** title and subtitle SHALL be centered at top of screen

#### Scenario: Help information
- **WHEN** template selection screen is displayed
- **THEN** brief help text SHALL NOT be displayed
- **AND** template cards SHALL be self-explanatory
