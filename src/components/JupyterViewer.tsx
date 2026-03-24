import { Environment } from "../types";

export function JupyterViewer({
  url,
  onStop,
  environment,
}: {
  url: string;
  onStop: () => void;
  environment?: Environment | null;
}) {
  return (
    <div className="jupyter-viewer">
      <div className="jupyter-toolbar">
        <span className="toolbar-title">
          PyForge {environment && `- ${environment.name}`}
        </span>
        <button className="toolbar-button" onClick={onStop}>
          停止
        </button>
      </div>
      {environment && (
        <div className="environment-info">
          Python {environment.python_version} | 内核: {environment.kernel_name}
        </div>
      )}
      <iframe
        src={url}
        className="jupyter-iframe"
        title="JupyterLab"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
