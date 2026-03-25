## 1. Base environment and paths

- [x] 1.1 Implement `get_base_env_dir()` and `get_kernel_store_dir()` helpers in infrastructure module (e.g., `~/.pyforge/base` and `~/.pyforge/kernels`).
- [x] 1.2 Implement `ensure_base_env()` that creates the base environment and installs JupyterLab if it does not exist.
- [x] 1.3 Wire `ensure_base_env()` into the Jupyter launch flow so it runs before starting Jupyter for any project.

## 2. Environment creation changes

- [x] 2.1 Update default environment creation to remove `jupyterlab` from the package list while keeping scientific packages and `ipykernel`.
- [x] 2.2 Update generic environment creation to ensure new environments do not install `jupyterlab` by default.

## 3. Kernel registration and storage

- [x] 3.1 Replace `ipykernel install --user` with logic that writes kernelspecs to `~/.pyforge/kernels/pyforge-<env-id>/kernel.json`.
- [x] 3.2 Ensure the generated `kernel.json` correctly references the environment's Python executable and display name.
- [x] 3.3 Implement kernel unregistration that removes the corresponding directory under `~/.pyforge/kernels/`.

## 4. Project kernel linking

- [x] 4.1 Define project kernel directory helper (e.g., `~/.pyforge/projects/<project-id>/kernels`).
- [x] 4.2 Implement logic to create links from project kernel directories to global kernels (e.g., `pyforge-default -> ~/.pyforge/kernels/pyforge-default`).
- [x] 4.3 Ensure that project creation/binding flow establishes the required kernel links.
- [x] 4.4 On environment or project deletion, clean up corresponding links and global kernel directories as needed.

## 5. Jupyter launch refactor

- [x] 5.1 Add `get_base_jupyter_path()` to resolve the JupyterLab executable in the base environment.
- [x] 5.2 Update Jupyter launcher to always use the base environment's JupyterLab (python -m jupyter lab).
- [x] 5.3 Add `--notebook-dir` and `--KernelSpecManager.kernel_dirs` arguments so Jupyter uses the project's notebook directory and project/global kernel directories.

## 6. Documentation updates

- [x] 6.1 Update architecture documentation to describe the base environment, global kernel store, and project kernel links.
- [x] 6.2 Update any existing environment/Jupyter docs to reflect that only the base environment installs JupyterLab and that user environments are kernel-only.
