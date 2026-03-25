## ADDED Requirements

### Requirement: Exclude JupyterLab from default environment packages
The system SHALL create the default environment without installing JupyterLab, while preserving the current scientific Python base packages and ipykernel.

#### Scenario: Create default environment
- **WHEN** the system creates the default environment
- **THEN** it installs `numpy`, `pandas`, `matplotlib`, and `ipykernel`
- **AND** it does not install `jupyterlab`

### Requirement: Exclude JupyterLab from new environment packages
The system SHALL create new user environments without installing JupyterLab unless explicitly requested by future changes.

#### Scenario: Create a new environment
- **WHEN** the user creates a new environment with the standard package flow
- **THEN** the system installs the selected scientific and kernel packages
- **AND** it does not include `jupyterlab` in the default package list
