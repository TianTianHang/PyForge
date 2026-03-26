## ADDED Requirements

### Requirement: Dynamic UI based on user experience level
The system SHALL adjust which interface elements are shown or hidden based on detected user mode (first-time, beginner, standard).

#### Scenario: First-time mode shows minimal UI
- **WHEN** user mode is "first-time" (zero projects)
- **THEN** system hides environment management controls
- **AND** system hides "advanced settings" in creation dialog (collapsed by default)
- **AND** system shows welcome screen instead of blank project list
- **AND** system shows simplified creation dialog with template selection

#### Scenario: Beginner mode shows balanced UI
- **WHEN** user mode is "beginner" (1-3 projects)
- **THEN** system shows template selection in creation dialog
- **AND** system keeps advanced options collapsed but accessible
- **AND** system shows project list with direct launch buttons
- **AND** system hides complex environment management from primary views

#### Scenario: Standard mode shows full UI
- **WHEN** user mode is "standard" (4+ projects)
- **THEN** system exposes all configuration options by default
- **AND** system shows environment management controls
- **AND** system shows full project creation dialog with all options expanded
- **AND** system provides access to all advanced features

### Requirement: Collapsible advanced options in creation dialog
The system SHALL hide advanced configuration options behind a collapsible section in simplified creation dialog, revealing them only when explicitly requested.

#### Scenario: Advanced options hidden by default
- **WHEN** simplified project creation dialog opens for first-time or beginner user
- **THEN** system shows only project name input and template selection
- **AND** system hides Python version selector, environment dropdown, and custom package inputs
- **AND** system displays "advanced settings" link below primary options

#### Scenario: User expands advanced options
- **WHEN** user clicks "advanced settings" link
- **THEN** system expands section to show all hidden configuration options
- **AND** expanded section includes Python version, environment selection, and custom package inputs
- **AND** "advanced settings" link text changes to "hide advanced settings"

#### Scenario: User collapses advanced options
- **WHEN** user clicks "hide advanced settings" link
- **THEN** system collapses section to hide advanced options
- **AND** system preserves any values user entered in advanced fields
- **AND** link text changes back to "advanced settings"

### Requirement: Environment management hidden for beginners
The system SHALL hide environment creation and management features from first-time and beginner users to reduce cognitive load.

#### Scenario: Environment creation hidden in simplified dialog
- **WHEN** first-time or beginner user views simplified creation dialog
- **THEN** system does not show "create new environment" button
- **AND** system does not show environment selection dropdown
- **AND** system automatically handles environment creation/reuse in background

#### Scenario: Environment list not shown to beginners
- **WHEN** user mode is "first-time" or "beginner"
- **THEN** system does not display environment list or management panel
- **AND** system hides environment-related menu items or tabs
- **AND** system provides no direct access to environment CRUD operations

#### Scenario: Advanced users see environment management
- **WHEN** user mode is "standard" or user manually expands advanced options
- **THEN** system shows environment selection dropdown in creation dialog
- **AND** system shows "create new environment" button
- **AND** system displays environment list or management panel if available

### Requirement: Template selection replaces technical configuration
The system SHALL present template-based selection as the primary configuration method for beginners, hiding Python version and package details.

#### Scenario: Template cards shown instead of dropdown
- **WHEN** first-time or beginner user views creation dialog
- **THEN** system displays templates as visual cards with icons and descriptions
- **AND** system does not show Python version dropdown or package checklist
- **AND** system uses template selection to drive configuration implicitly

#### Scenario: Template description explains use case
- **WHEN** system displays template selection cards
- **THEN** each template card shows beginner-friendly description of use case
- **AND** description avoids technical jargon (e.g., "analyze data" not "numerical computing")
- **AND** system does not expose package list or Python version in card

#### Scenario: Advanced users see both templates and technical options
- **WHEN** user mode is "standard" or advanced options are expanded
- **THEN** system shows template selection alongside technical configuration options
- **AND** user can choose template OR manually configure Python version and packages
- **AND** changing template updates technical fields, but user can override manually

### Requirement: Contextual help and guidance
The system SHALL provide contextual help text and guidance for first-time and beginner users that fades away as user gains experience.

#### Scenario: Helper text shown to beginners
- **WHEN** first-time or beginner user views creation dialog
- **THEN** system shows helper text explaining selected template
- **AND** system shows "using default configuration" message to reassure user
- **AND** helper text uses simple, encouraging language

#### Scenario: Helper text reduced for advanced users
- **WHEN** user mode is "standard"
- **THEN** system minimizes or removes helper text
- **AND** system assumes user understands configuration options
- **AND** system focuses on efficiency rather than guidance

#### Scenario: Progressive hints during first use
- **WHEN** user interacts with a feature for the first time
- **THEN** system may show brief tooltip or hint explaining the feature
- **AND** system does not show the same hint again after user has used the feature
- **AND** hints are dismissible and non-intrusive
