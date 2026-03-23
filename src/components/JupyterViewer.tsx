export function JupyterViewer({
  url,
  onStop,
}: {
  url: string;
  onStop: () => void;
}) {
  return (
    <div className="jupyter-viewer">
      <div className="jupyter-toolbar">
        <span className="toolbar-title">PyForge</span>
        <button className="toolbar-button" onClick={onStop}>
          停止
        </button>
      </div>
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
