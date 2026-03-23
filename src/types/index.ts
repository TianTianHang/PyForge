export type AppState =
  | "checking"
  | "no_env"
  | "creating_env"
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
