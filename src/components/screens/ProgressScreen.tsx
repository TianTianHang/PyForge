export function ProgressScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-slate-800">正在准备环境</h2>
        <p className="text-blue-500 font-medium">{message}</p>
        <div className="w-full bg-white rounded-xl p-6 shadow-sm">
          <div className={`flex items-center gap-4 py-3 transition-colors ${message.includes("虚拟环境") ? "text-slate-800" : "text-slate-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${message.includes("虚拟环境") ? "bg-blue-500 text-white" : "bg-slate-200"}`}>1</span>
            <span>创建虚拟环境</span>
          </div>
          <div className={`flex items-center gap-4 py-3 transition-colors ${message.includes("安装") ? "text-slate-800" : "text-slate-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${message.includes("安装") ? "bg-blue-500 text-white" : "bg-slate-200"}`}>2</span>
            <span>安装基础包</span>
          </div>
          <div className={`flex items-center gap-4 py-3 transition-colors ${message.includes("注册") ? "text-slate-800" : "text-slate-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${message.includes("注册") ? "bg-blue-500 text-white" : "bg-slate-200"}`}>3</span>
            <span>注册 Jupyter 内核</span>
          </div>
        </div>
      </div>
    </div>
  );
}
