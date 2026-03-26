# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PyForge is a desktop Python development environment built with Tauri. It provides an out-of-the-box Jupyter Notebook experience with bundled Python environments, targeting zero-configuration setup for Python learners.

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 7
- **Backend**: Rust (Tauri 2.0)
- **Package Manager**: pnpm
- **Python Environment**: uv (bundled for environment management)
- **Embedded Tools**: Jupyter Notebook/Lab (loaded via WebView)
- Environment Management: The entire development environment must be activated using `nix develop` to ensure dependency consistency and zero-configuration setup.
## Common Commands

```bash
# Install dependencies
pnpm install

# Start development server (with hot reload)
pnpm tauri dev

# Build production app
pnpm tauri build

# Build only the frontend
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
├── src/                    # Frontend React source
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   └── assets/            # Static assets
├── src-tauri/             # Rust backend (Tauri)
│   ├── src/
│   │   ├── lib.rs         # Main library with Tauri commands
│   │   └── main.rs        # Binary entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── docs/                  # Architecture documentation (Chinese)
│   ├── architecture.md    # System architecture overview
│   ├── development-roadmap.md
│   └── file-system-solution.md
└── vite.config.ts         # Vite configuration (port 1420)
```

## Architecture

### Frontend-Backend Communication

Frontend invokes Rust commands using Tauri's `invoke` API:

```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("greet", { name: "World" });
```

Rust commands are defined in `src-tauri/src/lib.rs` with the `#[tauri::command]` attribute:

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

### Key Components (MVP)

1. **Environment Manager**: Creates default Python environment using uv
   - Location: `~/.pyforge/env/`
   - Pre-installed: numpy, pandas, matplotlib, ipykernel

2. **Jupyter Server Manager**: Controls Jupyter Server lifecycle
   - Auto-detects available ports
   - Generates authentication tokens
   - Serves from `~/.pyforge/project/`

3. **WebView Integration**: Embeds JupyterLab interface
   - Jupyter runs inside Tauri WebView
   - Cross-origin handling configured

### Startup Flow

1. Check if default Python environment exists (`~/.pyforge/env/`)
2. If not exists: Show progress UI → Create venv via uv → Install packages → Register Jupyter kernel
3. Start Jupyter Server on available port
4. Load JupyterLab URL in WebView

### Paths

- **Project directory**: `~/.pyforge/project/` (Jupyter notebook-dir)
- **Environment directory**: `~/.pyforge/env/`
- **Config/Database**: `~/.pyforge/` (SQLite for code history, user settings)

## Development Notes

- Vite dev server runs on port 1420 (strict, will fail if unavailable)
- Tauri watches for changes in `src/` but ignores `src-tauri/`
- The `lib.rs` crate name is `pyforge_lib` (not `pyforge`) to avoid Windows naming conflicts
- Mobile entry point is configured in `lib.rs` via `#[cfg_attr(mobile, tauri::mobile_entry_point)]`
