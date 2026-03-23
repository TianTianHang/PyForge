{
  description = "PyForge - Desktop Python development environment with Tauri";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ rust-overlay.overlays.default ];
        };

        # Rust toolchain for Tauri 2.0
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rustfmt" "clippy" ];
        };

        # Node.js with pnpm
        nodejs = pkgs.nodejs_22;
        pnpm = pkgs.pnpm;

        # Tauri dependencies
        tauriDeps = with pkgs; [
          # WebKit for Tauri WebView
          webkitgtk_4_1
          # System libraries
          libsoup_3
          libdbusmenu-gtk3
          libappindicator-gtk3
          librsvg
          # OpenSSL
          openssl
          # Additional build dependencies
          pkg-config
          glib
          gtk3
          cairo
          gobject-introspection
        ];

        # Python with uv
        python = pkgs.python312;
        uv = pkgs.uv;

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Rust toolchain
            rustToolchain
            # Node.js and pnpm
            nodejs
            pnpm
            # Python and uv
            python
            uv
            # Tauri system dependencies
          ] ++ tauriDeps;

          # Environment variables
          env = {
            # Ensure pnpm uses the nix-provided node
            PNPM_HOME = "${pkgs.pnpm}/bin";

            # Rust configuration
            RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";

            # GTK_IM_MODULE to avoid input method issues
            GTK_IM_MODULE = "ibus";

            # XDG settings
            XDG_DATA_DIRS = "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}";
          };

          # Shell hooks
          shellHook = ''
            echo "PyForge Development Environment"
            echo "================================"
            echo ""
            echo "Available commands:"
            echo "  pnpm install     - Install frontend dependencies"
            echo "  pnpm tauri dev   - Start development server"
            echo "  pnpm tauri build - Build production app"
            echo ""
            echo "Environment info:"
            echo "  Rust: $(rustc --version)"
            echo "  Node: $(node --version)"
            echo "  pnpm: $(pnpm --version)"
            echo "  Python: $(python --version)"
            echo "  uv: $(uv --version)"
          '';
        };

        # Formatter check
        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
