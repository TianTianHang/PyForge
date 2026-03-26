# Testing Guide: Fix Project Creation Intermittent Issues

This guide provides step-by-step instructions for testing the fixes to the project creation functionality.

## Prerequisites

1. Start the development environment:
   ```bash
   nix develop
   pnpm tauri dev
   ```

2. Ensure you have at least one Python environment created before testing.

## Test Cases

### 3.1 Test Frontend Validation with Duplicate Project Names

**Objective**: Verify that the frontend correctly validates duplicate project names.

**Steps**:
1. Create a project with the name "TestProject"
2. Try to create another project with the same name "TestProject"
3. Expected: Error message "项目名称已存在" should be displayed
4. Try to create a project with a different case "testproject"
5. Expected: Error message should still appear (case-insensitive check)
6. Try to create a project with a unique name
7. Expected: Project creation should proceed

**Expected Result**: Validation correctly identifies duplicate project names (case-insensitive).

### 3.2 Test Frontend Duplicate Submission Prevention

**Objective**: Verify that users cannot submit duplicate project creation requests.

**Steps**:
1. Click the "新建项目" button
2. Fill in project name and select an environment
3. Click the "创建" button
4. Observe the button state
5. Expected: Button should show "创建中..." and be disabled
6. Try to click the button again while it's in the submitting state
7. Expected: No action should occur (clicks are ignored)
8. Wait for project creation to complete
9. Expected: Button should return to "创建" state and be enabled again

**Expected Result**: Users cannot submit duplicate requests, and the button clearly indicates the submitting state.

### 3.3 Test Backend Atomic Operations with File Locking

**Objective**: Verify that backend file operations are atomic and thread-safe.

**Steps**:
1. Open the application logs/debug console
2. Create a new project
3. Observe the log messages for "带文件锁" (with file lock)
4. Expected: Logs should show that metadata operations use file locking
5. During project creation, the file should be locked
6. Expected: No other operation should be able to modify the metadata file simultaneously

**Expected Result**: Backend uses file locking for atomic metadata operations.

### 3.4 Test Concurrent Project Creation Scenarios

**Objective**: Verify that concurrent project creation requests are handled correctly.

**Method A: Manual Testing (Single Window)**
1. Open the application
2. Quickly create two projects with the same name
3. Expected: First creation should succeed, second should fail with "项目名称已存在"
4. Create two projects with different names in quick succession
5. Expected: Both should be created successfully

**Method B: Multi-Window Testing**
1. Launch two instances of the application (if supported)
2. In both windows, try to create projects with the same name simultaneously
3. Expected: One should succeed, the other should fail
4. Try creating projects with different names simultaneously
5. Expected: Both should be created successfully without corruption

**Expected Result**: Concurrent requests are handled safely without data corruption.

### 3.5 Verify Existing Project List and Delete Functionality

**Objective**: Ensure that the changes don't break existing functionality.

**Steps**:
1. Create multiple projects
2. Verify that all projects appear in the project list
3. Expected: All created projects should be visible
4. Select a project from the list
5. Expected: Project should be selected correctly
6. Click the delete button for a project
7. Expected: Project should be deleted successfully
8. Refresh the application
9. Expected: Deleted projects should not reappear

**Expected Result**: Existing functionality (listing, selecting, deleting) works correctly.

## Regression Testing

### Environment Management
1. Create a new environment
2. Verify that environment creation still works
3. Delete an environment
4. Verify that environment deletion still works

### Jupyter Integration
1. Select a project
2. Click "启动 Jupyter"
3. Expected: Jupyter should start correctly
4. Verify that Jupyter interface loads

### Settings
1. Click the "设置" button
2. Modify some settings
3. Expected: Settings should be saved and loaded correctly

## Known Issues and Limitations

1. File locking timeout is set to 5 seconds - if the metadata file is locked for longer, operations will fail
2. The current implementation only locks the project metadata file, not the environment metadata file
3. Concurrent testing requires multiple application instances or rapid sequential operations

## Success Criteria

All test cases pass with the expected results. The application should:
- Correctly validate duplicate project names
- Prevent duplicate submissions
- Use file locking for atomic operations
- Handle concurrent requests safely
- Maintain all existing functionality

## Troubleshooting

**Issue**: File lock timeout errors
- **Solution**: Check for other processes that might be holding the metadata file lock
- **Solution**: Increase the timeout in `acquire_projects_lock()` if needed

**Issue**: TypeScript compilation errors
- **Solution**: Run `npx tsc --noEmit` to check for type errors
- **Solution**: Ensure all components pass the required props

**Issue**: Project creation fails silently
- **Solution**: Check the browser console for error messages
- **Solution**: Check the Tauri/Rust logs for backend errors
