## 1. Backend Template Infrastructure

- [x] 1.1 Add `toml` crate dependency to `src-tauri/Cargo.toml`
- [x] 1.2 Create `src-tauri/src/models/template.rs` with Template, PyProjectToml, and related structs
- [x] 1.3 Create `src-tauri/src/templates/mod.rs` module with template loading functions
- [x] 1.4 Implement `parse_template()` function to parse pyproject.toml content
- [x] 1.5 Implement `extract_python_version()` helper function
- [x] 1.6 Implement `get_builtin_templates()` function using `include_str!` macro

## 2. Template Definition Files

- [x] 2.1 Create `src-tauri/templates/` directory
- [x] 2.2 Create `data-science.toml` template with numpy, pandas, matplotlib, ipykernel
- [x] 2.3 Create `machine-learning.toml` template with numpy, pandas, scikit-learn, ipykernel
- [x] 2.4 Create `web-development.toml` template with flask, requests, ipykernel
- [x] 2.5 Create `general-learning.toml` template with ipykernel, jupyterlab
- [x] 2.6 Verify all TOML files are valid and include required `[tool.pyforge]` section

## 3. Backend API Implementation

- [x] 3.1 Create `src-tauri/src/api/template_commands.rs` module
- [x] 3.2 Implement `list_templates` Tauri command to return all built-in templates
- [x] 3.3 Modify `src-tauri/src/api/env_commands.rs` to import template module
- [x] 3.4 Implement `create_environment_from_template` Tauri command
- [x] 3.5 Add logic to mark newly created environment as `is_default: true`
- [x] 3.6 Add logic to set all other environments' `is_default` to `false`
- [x] 3.7 Add `template_id` field to environment metadata when creating from template
- [x] 3.8 Register new commands in `src-tauri/src/lib.rs` (list_templates, create_environment_from_template)

## 4. Frontend Template Selection UI

- [x] 4.1 Create `src/components/TemplateSelectionScreen.tsx` component
- [x] 4.2 Implement template card grid layout with 2-column responsive design
- [x] 4.3 Implement template card component with icon, name, description, dependencies preview
- [x] 4.4 Add template selection state management (selected template ID)
- [x] 4.5 Implement "创建并开始" button with disabled/enabled states
- [x] 4.6 Add loading state during creation (button text change, spinner)
- [x] 4.7 Add keyboard navigation support (Tab, Enter, Space)
- [x] 4.8 Add TypeScript types for Template interface in `src/types/index.ts`

## 5. Frontend Integration

- [x] 5.1 Modify `src/App.tsx` to check `environments.length === 0` on initialization
- [x] 5.2 Add `showTemplateSelection` state to App component
- [x] 5.3 Conditionally render `TemplateSelectionScreen` when no environments exist
- [x] 5.4 Call `list_templates` API on component mount to load template list
- [x] 5.5 Call `create_environment_from_template` API when user selects template
- [x] 5.6 Handle creation success: close template screen, navigate to project selection
- [x] 5.7 Handle creation error: display error message, return to template selection
- [x] 5.8 Verify ProgressScreen displays correctly during environment creation

## 6. Testing and Validation

- [ ] 6.1 Manual test: Clean install (delete `~/.pyforge/env/`) and launch application
- [ ] 6.2 Verify template selection screen appears on first launch
- [ ] 6.3 Test template selection: click each template, verify selection state
- [ ] 6.4 Test environment creation: select "data-science", click "创建并开始"
- [ ] 6.5 Verify environment created at `~/.pyforge/env/data-science/`
- [ ] 6.6 Verify `is_default: true` is set in environment metadata
- [ ] 6.7 Verify all packages from template are installed (numpy, pandas, matplotlib, ipykernel)
- [ ] 6.8 Test Jupyter kernel launches correctly with created environment
- [ ] 6.9 Verify navigation to project selection screen after creation
- [ ] 6.10 Test error handling: simulate creation failure, verify error message shown
- [ ] 6.11 Test keyboard navigation: Tab through cards, Enter to select
- [ ] 6.12 Test responsive layout: resize window, verify single-column layout on small screens

## 7. Polish and Documentation

- [x] 7.1 Add inline comments to template parsing logic
- [x] 7.2 Add JSDoc comments to TemplateSelectionScreen component
- [x] 7.3 Verify consistent styling with existing design system
- [x] 7.4 Check for TypeScript compilation errors
- [x] 7.5 Check for Rust compilation warnings
- [x] 7.6 Verify no console errors during template selection flow
- [x] 7.7 Update CHANGELOG with template system changes
