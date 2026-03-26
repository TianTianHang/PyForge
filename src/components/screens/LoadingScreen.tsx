export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-[var(--color-border)] rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent-primary)] rounded-full animate-pulse-glow"></div>
      </div>
      <p className="text-[var(--color-text-secondary)] text-base font-medium">{message}</p>
    </div>
  );
}