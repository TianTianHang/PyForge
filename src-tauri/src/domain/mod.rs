pub mod environment;
pub mod jupyter;
pub mod project;

// Explicit re-exports to avoid ambiguous glob re-exports
pub use environment::{
    create_default_environment, create_environment, CreateProgress,
    delete_environment,
    register_jupyter_kernel, unregister_kernel,
    bind_kernel_to_project, is_kernel_bound_to_any_project,
    list_project_kernels, list_unbound_kernels,
    unbind_kernel_from_project,
    list_environments,
    check_env_exists, verify_environment,
};
pub use jupyter::JupyterServer;
pub use project::{
    create_project, delete_project, list_projects,
};
