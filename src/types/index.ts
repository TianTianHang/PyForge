export interface Environment {
  id: string;
  name: string;
  python_version: string;
  path: string;
  kernel_name: string;
  created_at: string;
  is_default: boolean;
}

export interface InstalledPackage {
  name: string;
  version: string;
}

export type AppState =
  | "checking"
  | "initializing"
  | "select_env"
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
