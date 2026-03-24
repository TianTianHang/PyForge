## 1. Rust Data Models

- [ ] 1.1 Create `src-tauri/src/models/project.rs` with Project and ProjectsMetadata structs
- [ ] 1.2 Register project module in `src-tauri/src/models/mod.rs`
- [ ] 1.3 Add `projects` and `current_project_id` fields to AppState

## 2. Infrastructure Layer

- [ ] 2.1 Add `get_projects_metadata_path()` to `src-tauri/src/infrastructure/paths.rs`
- [ ] 2.2 Add `load_projects_metadata()` and `save_projects_metadata()` to metadata.rs
- [ ] 2.3 Add project state fields to AppStateWrapper with getter/setter methods

## 3. Domain Layer — Project CRUD

- [ ] 3.1 Create `src-tauri/src/domain/project/` module with mod.rs
- [ ] 3.2 Implement `create_project()` in creator.rs (validate name, create dir, save metadata)
- [ ] 3.3 Implement `list_projects()` in lister.rs (load metadata, filter by dir existence)
- [ ] 3.4 Implement `delete_project()` in deleter.rs (protect default, remove dir and metadata)

## 4. Tauri Commands

- [ ] 4.1 Create `src-tauri/src/api/project_commands.rs` with create/list/delete commands
- [ ] 4.2 Modify `start_jupyter` command to accept `project_id` instead of `env_id`
- [ ] 4.3 Register new commands in `src-tauri/src/lib.rs`

## 5. Migration & Startup

- [ ] 5.1 Implement `migrate_projects()` (detect existing notebooks, create default project)
- [ ] 5.2 Update `lib.rs` setup: call `migrate_projects()`, load projects, set state
- [ ] 5.3 Pass `projects` and `current_project_id` to frontend via state

## 6. Frontend Types & Hooks

- [ ] 6.1 Add `Project` type to `src/types/index.ts`
- [ ] 6.2 Extend `AppState` type with `"select_project"` and `"no_project"` states
- [ ] 6.3 Create `src/hooks/useProject.ts` with createProject, listProjects, deleteProject
- [ ] 6.4 Modify `useJupyter.ts`: `startJupyter` takes `projectId` instead of `envId`
- [ ] 6.5 Modify `useEnvironment.ts`: transition to select_project/no_project after env check

## 7. Frontend Components

- [ ] 7.1 Create `src/components/CreateProjectDialog.tsx` (name input + env dropdown)
- [ ] 7.2 Create `src/components/ProjectList.tsx` (project cards with select/delete)
- [ ] 7.3 Create `src/components/ProjectPanel.tsx` (container with list + create + start)
- [ ] 7.4 Update `src/App.tsx`: add project state, render ProjectPanel for select_project

## 8. Cleanup & Integration

- [ ] 8.1 Remove unused `EnvironmentSelector.tsx` (dead code)
- [ ] 8.2 Verify full flow: create project → start Jupyter → switch project → stop
