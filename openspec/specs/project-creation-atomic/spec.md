## ADDED Requirements

### Requirement: Project name validation
The system SHALL validate that the project name does not already exist in the project list before creating a new project.

#### Scenario: Duplicate project name detection
- **WHEN** user attempts to create a project with a name that already exists (case-insensitive)
- **THEN** system displays error message "项目名称已存在" and prevents creation

#### Scenario: Unique project name allowed
- **WHEN** user attempts to create a project with a name that does not exist in the project list
- **THEN** system allows project creation to proceed

### Requirement: Atomic project creation
The system SHALL ensure that project creation operations are atomic, preventing race conditions when multiple creation requests occur simultaneously.

#### Scenario: Concurrent creation with same name
- **WHEN** two concurrent requests attempt to create projects with the same name
- **THEN** only one project is created and the second request receives an error

#### Scenario: Concurrent creation with different names
- **WHEN** two concurrent requests attempt to create projects with different names
- **THEN** both projects are created successfully without data corruption

### Requirement: File locking for metadata operations
The system SHALL use file locking to ensure exclusive access to project metadata during creation operations.

#### Scenario: Metadata read during creation
- **WHEN** project creation is in progress
- **THEN** other operations reading project metadata wait for the lock to be released

#### Scenario: Metadata write during creation
- **WHEN** project creation is in progress
- **THEN** other operations writing project metadata wait for the lock to be released

### Requirement: Frontend duplicate submission prevention
The system SHALL prevent users from submitting multiple project creation requests simultaneously by disabling the submit button during submission.

#### Scenario: Button disabled during submission
- **WHEN** user clicks "创建" button and submission is in progress
- **THEN** button becomes disabled and shows "创建中..." text

#### Scenario: Button re-enabled after completion
- **WHEN** project creation completes (success or failure)
- **THEN** button becomes enabled again and shows "创建" text

### Requirement: Frontend state management
The system SHALL use immutable state updates to ensure consistent UI state during project creation.

#### Scenario: Error state update
- **WHEN** validation error occurs
- **THEN** error message is displayed without modifying the original state object

#### Scenario: Success state update
- **WHEN** project creation succeeds
- **THEN** dialog closes and project list updates consistently
