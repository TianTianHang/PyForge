export interface Environment {
  id: string;
  name: string;
  python_version: string;
  path: string;
  kernel_name: string;
  created_at: string;
  is_default: boolean;
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
