export function ErrorScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <h2 className="text-2xl font-semibold text-red-500">出现错误</h2>
      <p className="bg-red-50 text-red-600 px-6 py-4 rounded-lg border border-red-200 max-w-lg w-full text-center break-words">{error}</p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer shadow-sm"
        onClick={onRetry}
      >
        重试
      </button>
    </div>
  );
}
