export function ErrorScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="error-screen">
      <h2>出现错误</h2>
      <p className="error-message">{error}</p>
      <button className="primary-button" onClick={onRetry}>
        重试
      </button>
    </div>
  );
}
