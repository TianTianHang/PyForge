export interface Environment {
  id: string;
  name: string;
  python_version: string;
  path: string;
  kernel_name: string;
  created_at: string;
  is_default: boolean;
  template_id?: string | null;
}

export interface Project {
  id: string;
  name: string;
  env_id: string;
  path: string;
  created_at: string;
  is_default: boolean;
}

export interface KernelBinding {
  env_id: string;
  kernel_name: string;
  is_bound: boolean;
}

export interface KernelBindingInfo {
  env_id: string;
  kernel_name: string;
  bound_to_projects: string[];
}

export type AppState =
  | "checking"
  | "initializing"
  | "select_env"
  | "select_project"
  | "no_project"
  | "starting_jupyter"
  | "ready"
  | "error";

export interface EnvStatus {
  exists: boolean;
  path: string;
}

export interface JupyterInfo {
  port: number;
  token: string;
  url: string;
  notebook_dir: string;
}

export interface InstalledPackage {
  name: string;
  version: string;
}

/**
 * Project template configuration for beginner-friendly onboarding
 * Templates provide pre-configured environments based on use cases
 */
export interface ProjectTemplate {
  /** Unique template identifier */
  id: string;
  /** Display name for the template */
  name: string;
  /** Brief description of the template's purpose */
  description: string;
  /** Emoji icon for visual identification */
  icon: string;
  /** Default Python version for this template */
  pythonVersion: string;
  /** Pre-installed packages for this template */
  packages: string[];
  /** Example use cases displayed to users */
  useCases: string[];
}

export interface Template {
  id: string;
  display_name: string;
  description: string;
  icon: string;
  dependencies: string[];
  use_cases: string[];
  requires_python: string;
}

/**
 * User experience mode based on project count and visit history
 * - first-time: No projects created, first visit
 * - beginner: 1-3 projects, still learning
 * - standard: 4+ projects, experienced user
 */
export type UserMode = 'first-time' | 'beginner' | 'standard';

// Export config types
export type {
  AppConfig,
  SourceConfig,
  PythonConfig,
  PathsConfig,
  JupyterConfig,
  DefaultsConfig,
  ValidationResult,
  MigrationProgress,
  MigrationResult,
  PythonDownloadStrategy,
} from "./config";
