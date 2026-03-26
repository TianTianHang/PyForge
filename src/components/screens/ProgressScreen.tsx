export function ProgressScreen({ message }: { message: string }) {
  const steps = [
    { id: 1, label: "创建虚拟环境", check: "虚拟环境" },
    { id: 2, label: "安装基础包", check: "安装" },
    { id: 3, label: "注册 Jupyter 内核", check: "注册" }
  ];

  const currentStep = steps.findIndex(step => message.includes(step.check));

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-8 max-w-lg w-full">
        <div className="flex flex-col items-center gap-4 animate-slide-down">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">正在准备环境</h2>
          <p className="text-[var(--color-accent-primary)] font-medium animate-pulse-soft">{message}</p>
        </div>

        <div className="w-full bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)] animate-fade-in" style={{ animationDelay: '150ms' }}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center gap-4 py-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-[var(--color-accent-primary)] text-white shadow-lg shadow-[var(--color-accent-glow)] scale-110' : isCompleted ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`}>
                  {isCompleted ? '✓' : step.id}
                </span>
                <span className={`text-base transition-colors duration-200 ${isActive || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="ml-auto text-xs text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2 py-1 rounded animate-pulse-soft">
                    进行中
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-[var(--color-text-tertiary)]">预计时间: 1-3 分钟</p>
        </div>
      </div>
    </div>
  );
}