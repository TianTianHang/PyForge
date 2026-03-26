export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
}
