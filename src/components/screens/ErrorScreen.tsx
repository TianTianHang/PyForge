export function ErrorScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-error-muted)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-error)]">出现错误</h2>
      </div>

      <div className="bg-[var(--color-bg-secondary)] text-[var(--color-error)] px-6 py-4 rounded-xl border border-[var(--color-error)] max-w-lg w-full text-center break-words">
        {error}
      </div>

      <button
        className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white px-8 py-3 rounded-lg font-medium transition-all cursor-pointer shadow-lg shadow-[var(--color-accent-glow)] hover:shadow-xl"
        onClick={onRetry}
      >
        重试
      </button>
    </div>
  );
}