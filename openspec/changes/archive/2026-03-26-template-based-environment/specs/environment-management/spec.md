# Environment Management

## ADDED Requirements

### Requirement: Create environment with template source tracking
The system SHALL record the template source when creating a new environment.

#### Scenario: Record template ID
- **WHEN** environment is created from a template
- **THEN** system SHALL store `template_id` field in environment metadata
- **AND** `template_id` SHALL match the template used for creation
- **AND** metadata SHALL be persisted to `~/.pyforge/environments.json`

#### Scenario: Manual environment creation
- **WHEN** environment is created manually (not from template)
- **THEN** `template_id` field SHALL be null or empty
- **AND** environment SHALL function normally without template association

### Requirement: Default environment marking
The system SHALL support marking template-created environments as default.

#### Scenario: Mark template environment as default
- **WHEN** environment is created from template
- **THEN** newly created environment SHALL be marked with `is_default: true`
- **AND** all other existing environments SHALL be marked with `is_default: false`
- **AND** metadata changes SHALL be persisted immediately

#### Scenario: Query default environment
- **WHEN** system queries for default environment
- **THEN** environment with `is_default: true` SHALL be returned
- **AND** if multiple environments have `is_default: true`
- **THEN** most recently created SHALL be returned

### Requirement: Environment metadata extension
The system SHALL extend environment metadata structure to support template tracking.

#### Scenario: Metadata structure
- **WHEN** environment metadata is defined
- **THEN** it SHALL contain `id` field (string)
- **AND** it SHALL contain `name` field (string)
- **AND** it SHALL contain `python_version` field (string)
- **AND** it SHALL contain `path` field (string)
- **AND** it SHALL contain `kernel_name` field (string)
- **AND** it SHALL contain `created_at` field (ISO 8601 datetime)
- **AND** it SHALL contain `is_default` field (boolean)
- **AND** it SHALL contain `template_id` field (string or null)

### Requirement: Environment creation API changes
The system SHALL provide new API for template-based environment creation.

#### Scenario: Create environment from template API
- **WHEN** `create_environment_from_template` command is invoked
- **THEN** system SHALL accept `template_id` parameter
- **AND** system SHALL resolve template by ID
- **AND** system SHALL create environment using template configuration
- **AND** system SHALL mark new environment as default
- **AND** system SHALL return created Environment object

#### Scenario: Backward compatibility
- **WHEN** existing `create_environment` command is used
- **THEN** it SHALL continue to work as before
- **AND** it SHALL NOT mark environment as default
- **AND** it SHALL NOT associate environment with any template
