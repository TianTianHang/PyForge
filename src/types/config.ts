/**
 * Configuration types for PyForge settings
 */

/**
 * Python download strategy
 */
export type PythonDownloadStrategy = "automatic" | "manual" | "never";

/**
 * PyPI mirror source configuration
 */
export interface SourceConfig {
  pypi_mirror: string;
  python_install_mirror?: string;
}

/**
 * Python configuration
 */
export interface PythonConfig {
  default_version: string;
  download_strategy: PythonDownloadStrategy;
}

/**
 * Paths configuration
 */
export interface PathsConfig {
  data_dir?: string;
}

/**
 * Jupyter configuration
 */
export interface JupyterConfig {
  port_range_start: number;
  port_range_end: number;
  timeout_secs: number;
}

/**
 * Default packages configuration
 */
export interface DefaultsConfig {
  packages: string[];
}

/**
 * Main application configuration
 */
export interface AppConfig {
  sources: SourceConfig;
  python: PythonConfig;
  paths: PathsConfig;
  jupyter: JupyterConfig;
  defaults: DefaultsConfig;
}

/**
 * Directory validation result
 */
export interface ValidationResult {
  is_valid: boolean;
  is_writable: boolean;
  error?: string;
}

/**
 * Migration progress information
 */
export interface MigrationProgress {
  step: string;
  total_steps: number;
  current_step: number;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  error?: string;
}
