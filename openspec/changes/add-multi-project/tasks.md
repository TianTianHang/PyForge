## 1. Rust Data Models

- [x] 1.1 Create `src-tauri/src/models/project.rs` with Project and ProjectsMetadata structs
- [x] 1.2 Register project module in `src-tauri/src/models/mod.rs`
- [x] 1.3 Add `projects` and `current_project_id` fields to AppState

## 2. Infrastructure Layer

- [x] 2.1 Add `get_projects_metadata_path()` to `src-tauri/src/infrastructure/paths.rs`
- [x] 2.2 Add `load_projects_metadata()` and `save_projects_metadata()` to metadata.rs
- [x] 2.3 Add project state fields to AppStateWrapper with getter/setter methods

## 3. Domain Layer — Project CRUD

- [x] 3.1 Create `src-tauri/src/domain/project/` module with mod.rs
- [x] 3.2 Implement `create_project()` in creator.rs (validate name, create dir with kernels/ subdir, save metadata)
- [x] 3.3 Implement `list_projects()` in lister.rs (load metadata, filter by dir existence)
- [x] 3.4 Implement `delete_project()` in deleter.rs (protect default, remove dir and metadata, clean up symlinks)

## 4. Domain Layer — Per-Project Kernel Binding

- [x] 4.1 Rework `kernel_links.rs`: replace global symlink logic with per-project binding
  - `bind_kernel_to_project(project_id, env_id)` → symlink in `projects/{project_id}/kernels/pyforge-{env_id}`
  - `unbind_kernel_from_project(project_id, env_id)` → remove symlink
  - `list_project_kernels(project_id)` → list symlinks in project's kernels/ dir
  - `list_unbound_kernels(project_id)` → list global kernels not yet bound to this project
- [x] 4.2 Update `start_jupyter_server`: kernel_dirs only includes `projects/{project_id}/kernels/` (no global kernels/)
- [x] 4.3 Modify `domain/environment/creator.rs`: auto-bind new env's kernel to current project
- [x] 4.4 Modify `domain/environment/deleter.rs`: check all project bindings, block deletion if any project is bound

## 5. Tauri Commands

- [x] 5.1 Create `src-tauri/src/api/project_commands.rs` with create/list/delete commands
- [x] 5.2 Add `bind_kernel(project_id, env_id)` and `unbind_kernel(project_id, env_id)` commands
- [x] 5.3 Add `list_project_kernels(project_id)` and `list_unbound_kernels(project_id)` commands
- [x] 5.4 Modify `start_jupyter` command to accept `project_id` instead of `env_id`
- [x] 5.5 Register all new commands in `src-tauri/src/lib.rs`

## 6. Migration & Startup

- [x] 6.1 Implement `migrate_projects()` (detect existing notebooks, create default project with default env bound)
- [x] 6.2 Update `lib.rs` setup: call `migrate_projects()`, load projects, set state
- [x] 6.3 Pass `projects` and `current_project_id` to frontend via state

## 7. Frontend Types & Hooks

- [x] 7.1 Add `Project` type to `src/types/index.ts`
- [x] 7.2 Add `KernelBinding` type (env_id, kernel_name, is_bound)
- [x] 7.3 Extend `AppState` type with `"select_project"` and `"no_project"` states
- [x] 7.4 Create `src/hooks/useProject.ts` with createProject, listProjects, deleteProject
- [x] 7.5 Create `src/hooks/useKernelBinding.ts` with bindKernel, unbindKernel, listProjectKernels, listUnboundKernels
- [x] 7.6 Modify `useJupyter.ts`: `startJupyter` takes `projectId` instead of `envId`
- [x] 7.7 Modify `useEnvironment.ts`: transition to select_project/no_project after env check; auto-bind to current project on create

## 8. Frontend Components

- [x] 8.1 Create `src/components/ProjectList.tsx` (project cards with select/delete)
- [x] 8.2 Create `src/components/ProjectPanel.tsx` (container with list + create + start)
- [x] 8.3 Create `src/components/CreateProjectDialog.tsx` (name input + env dropdown + "create new env" option)
- [x] 8.4 Create `src/components/ProjectSettings.tsx` (modal: bound kernels list, add kernel, remove kernel, create env, delete project)
- [x] 8.5 Update `src/components/JupyterViewer.tsx`: add project settings button to toolbar
- [x] 8.6 Update `src/App.tsx`: add project state, render ProjectPanel for select_project, wire up ProjectSettings modal

## 9. Cleanup & Integration

- [x] 9.1 Remove unused `EnvironmentSelector.tsx` (dead code)
- [ ] 9.2 Verify full flow: create project → start Jupyter → add kernel at runtime → switch project → stop
