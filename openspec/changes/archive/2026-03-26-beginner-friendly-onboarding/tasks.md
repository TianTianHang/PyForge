## 1. Data Structure and Core Types

- [x] 1.1 Define `ProjectTemplate` TypeScript interface in `src/types/index.ts`
- [x] 1.2 Create template configuration constant with 4 initial templates (data-science, machine-learning, web-development, general-learning) in `src/constants/templates.ts`
- [x] 1.3 Define `UserMode` type union (first-time | beginner | standard) in `src/types/index.ts`

## 2. New Component Creation

- [x] 2.1 Create `TemplateSelector.tsx` component with card-based template selection UI
- [x] 2.2 Create `QuickStartCard.tsx` component for welcome screen template cards
- [x] 2.3 Create `WelcomeGuide.tsx` component for first-time user welcome screen
- [x] 2.4 Add proper TypeScript types and props interfaces for all new components

## 3. User Mode Detection

- [x] 3.1 Implement `calculateUserMode` function in `ProjectPanel.tsx` based on `projects.length`
- [x] 3.2 Add localStorage check for first-time visit flag in `ProjectPanel.tsx` effect
- [x] 3.3 Set first-time visit flag in localStorage when first project is created
- [x] 3.4 Pass userMode prop to child components for conditional rendering

## 4. Project Creation Dialog Refactor

- [x] 4.1 Add template selection state to `CreateProjectDialog.tsx`
- [x] 4.2 Integrate `TemplateSelector` component into simplified dialog view
- [x] 4.3 Implement collapsible "advanced settings" section with show/hide toggle
- [x] 4.4 Update form validation to require only name + template in simplified mode
- [x] 4.5 Add "创建并开始" button that auto-launches Jupyter after creation
- [x] 4.6 Implement template-based configuration (auto-fill Python version and packages)
- [x] 4.7 Add loading state during Jupyter startup with "启动中..." text
- [x] 4.8 Update error handling to support both simplified and advanced creation flows

## 5. Project List Interaction Optimization

- [x] 5.1 Remove `currentProjectId` selection state visual highlighting from `ProjectList.tsx`
- [x] 5.2 Add permanent "启动 Jupyter" button to each project card top-right corner
- [x] 5.3 Update card click handler to show settings/details instead of selection
- [x] 5.4 Implement disabled state for launch button during Jupyter startup
- [x] 5.5 Add visual loading indicator on project card during startup
- [x] 5.6 Update card styling to emphasize launch button as primary action

## 6. Empty State Optimization

- [x] 6.1 Create welcome screen layout with branding and friendly greeting in `WelcomeGuide.tsx`
- [x] 6.2 Display 3-4 template cards in welcome screen using `QuickStartCard` components
- [x] 6.3 Add click handler to template cards that opens simplified creation dialog with pre-selected template
- [x] 6.4 Add "learn more" link placeholder (optional) to welcome screen
- [x] 6.5 Replace empty "no projects" message in `ProjectPanel` with `WelcomeGuide` component

## 7. Progressive Disclosure Implementation

- [x] 7.1 Conditionally hide environment management controls for first-time and beginner users
- [x] 7.2 Show advanced options collapsed by default in creation dialog
- [x] 7.3 Implement expand/collapse animation for advanced settings section
- [x] 7.4 Add helper text and tooltips for beginners (e.g., "using default configuration")
- [x] 7.5 Reduce helper text for standard users (4+ projects)

## 8. Integration and State Management

- [x] 8.1 Integrate user mode detection in `ProjectPanel` with conditional component rendering
- [x] 8.2 Connect template selection to project creation flow (pass template data to creation handler)
- [x] 8.3 Update `useProject` hook to support template-based project creation (frontend only, no backend changes needed)
- [x] 8.4 Implement auto-launch Jupyter logic after successful project creation
- [x] 8.5 Add proper cleanup and error recovery for failed launches

## 9. Testing and Validation

- [ ] 9.1 Manual test: First-time user flow (welcome → template → create → Jupyter)
- [ ] 9.2 Manual test: Returning user flow (direct launch button)
- [ ] 9.3 Manual test: Advanced user flow (expand options → manual config → create)
- [ ] 9.4 Manual test: Error states (duplicate name, creation failure, Jupyter startup failure)
- [ ] 9.5 Manual test: User mode progression (0 → 1 → 4 projects)
- [ ] 9.6 Verify backward compatibility (existing advanced options still work)
- [ ] 9.7 Test collapsible advanced options (expand → modify → collapse → submit)
- [ ] 9.8 Verify template configuration correctly creates/reuses environment

## 10. Polish and Documentation

- [ ] 10.1 Ensure consistent styling with existing design system (colors, spacing, typography)
- [ ] 10.2 Add proper focus states for keyboard navigation
- [ ] 10.3 Verify accessibility (ARIA labels, keyboard support, screen reader text)
- [x] 10.4 Add inline comments explaining user mode logic and template flow
- [x] 10.5 Update component props TypeScript interfaces with JSDoc comments
- [ ] 10.6 Verify no console errors or warnings during all user flows
