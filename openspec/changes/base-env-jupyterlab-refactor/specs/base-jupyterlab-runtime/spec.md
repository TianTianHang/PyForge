## ADDED Requirements

### Requirement: Create base environment for JupyterLab
The system SHALL create and maintain a dedicated Python environment at `~/.pyforge/base` used exclusively to run JupyterLab and its server.

#### Scenario: Base environment missing on startup
- **WHEN** the application starts and `~/.pyforge/base` does not exist
- **THEN** the system creates the base environment and installs JupyterLab

#### Scenario: Ensure base environment before launching Jupyter
- **WHEN** the user triggers launching Jupyter for any project
- **THEN** the system verifies the base environment exists and is usable before launching

### Requirement: Launch JupyterLab from base environment
The system SHALL launch JupyterLab using the Python executable from `~/.pyforge/base`.

#### Scenario: Successful launch
- **WHEN** the system launches Jupyter
- **THEN** it invokes `python -m jupyter lab` from the base environment with configured arguments
