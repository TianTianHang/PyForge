export function WelcomeScreen({
  onCreateEnv,
  envPath,
}: {
  onCreateEnv: () => void;
  envPath?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-8 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">PyForge</h1>
        <p className="text-lg text-[var(--color-text-secondary)]">开箱即用的 Python 学习环境</p>
      </div>

      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)] max-w-md w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">首次启动需要准备环境</h3>
        <ul className="space-y-3 mb-4">
          <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
            <span className="w-5 h-5 rounded bg-[var(--color-success-muted)] flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            创建 Python 虚拟环境
          </li>
          <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
            <span className="w-5 h-5 rounded bg-[var(--color-success-muted)] flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            安装基础包：numpy, pandas, matplotlib
          </li>
          <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
            <span className="w-5 h-5 rounded bg-[var(--color-success-muted)] flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            注册 Jupyter 内核
          </li>
        </ul>
        <p className="text-sm text-[var(--color-text-tertiary)] font-mono break-words">环境路径: {envPath}</p>
        <p className="text-sm text-[var(--color-warning)] mt-3">预计时间: 1-3 分钟</p>
      </div>

      <button
        className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white px-8 py-3 rounded-lg font-medium transition-all cursor-pointer shadow-lg shadow-[var(--color-accent-glow)] hover:shadow-xl hover:scale-105"
        onClick={onCreateEnv}
      >
        开始准备环境
      </button>
    </div>
  );
}