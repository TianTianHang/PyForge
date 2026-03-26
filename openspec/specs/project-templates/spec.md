## ADDED Requirements

### Requirement: Project template data structure
The system SHALL define a project template structure that contains name, description, icon, Python version, package list, and use case information.

#### Scenario: Template contains all required fields
- **WHEN** system defines a project template
- **THEN** template includes unique id, display name, description, icon identifier
- **AND** template includes default Python version (e.g., "3.12")
- **AND** template includes list of packages to pre-install (e.g., ["numpy", "pandas"])
- **AND** template includes list of recommended use cases (e.g., ["data analysis", "visualization"])

#### Scenario: Template icons are visually distinct
- **WHEN** system displays multiple templates
- **THEN** each template uses a unique icon identifier for visual differentiation
- **AND** icons are selected from standard icon library (Lucide, Heroicons, or equivalent)

### Requirement: Predefined template catalog
The system SHALL provide a catalog of predefined project templates covering common Python learning scenarios.

#### Scenario: Data science template available
- **WHEN** user views template catalog
- **THEN** system includes "data-science" template
- **AND** template includes numpy, pandas, matplotlib, ipykernel packages
- **AND** template description emphasizes data analysis and visualization use cases

#### Scenario: Machine learning template available
- **WHEN** user views template catalog
- **THEN** system includes "machine-learning" template
- **AND** template includes numpy, pandas, scikit-learn, ipykernel packages
- **AND** template description emphasizes ML model training and evaluation use cases

#### Scenario: Web development template available
- **WHEN** user views template catalog
- **THEN** system includes "web-development" template
- **AND** template includes flask, requests, ipykernel packages
- **AND** template description emphasizes API development and web scraping use cases

#### Scenario: General learning template available
- **WHEN** user views template catalog
- **THEN** system includes "general-learning" template
- **AND** template includes ipykernel, jupyterlab packages
- **AND** template description emphasizes general Python programming and learning

### Requirement: Template selection in creation dialog
The system SHALL allow users to select a project template during project creation, which auto-fills technical configuration.

#### Scenario: Template selection updates hidden configuration
- **WHEN** user selects a different template in creation dialog
- **THEN** system updates hidden Python version field to template's default
- **AND** system updates hidden package list to template's packages
- **AND** system does not show these changes to user in simplified mode

#### Scenario: Default template pre-selected
- **WHEN** simplified project creation dialog opens
- **THEN** system pre-selects "general-learning" template by default
- **AND** system visually highlights the selected template card

#### Scenario: Template descriptions guide selection
- **WHEN** user views template selection cards
- **THEN** each card shows template name, icon, and use case description
- **AND** description uses beginner-friendly language (e.g., "analyze data" not "numerical computing")

### Requirement: Template-based environment configuration
The system SHALL create or reuse environment based on selected template's configuration when project is created.

#### Scenario: New environment created from template
- **WHEN** user creates project with selected template and no matching environment exists
- **THEN** system creates new environment with template's Python version
- **AND** system installs template's package list in the new environment
- **AND** system links project to the newly created environment

#### Scenario: Existing environment reused if compatible
- **WHEN** user creates project with selected template and environment with matching Python version and packages exists
- **THEN** system reuses existing environment instead of creating duplicate
- **AND** system links project to the existing environment

#### Scenario: Template packages installed in background
- **WHEN** project creation is in progress with template
- **THEN** system displays "setting up environment" progress message
- **AND** system does not show individual package installation details to beginner user
