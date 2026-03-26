export function WelcomeScreen({
  onCreateEnv,
  envPath,
}: {
  onCreateEnv: () => void;
  envPath?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <h1 className="text-4xl font-bold text-slate-800">Welcome to PyForge</h1>
      <p className="text-lg text-slate-500">开箱即用的 Python 学习环境</p>

      <div className="bg-white rounded-xl p-6 shadow-sm max-w-md w-full">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">首次启动需要准备环境</h3>
        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-green-500">✓</span>创建 Python 虚拟环境
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-green-500">✓</span>安装基础包：numpy, pandas, matplotlib
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-green-500">✓</span>注册 Jupyter 内核
          </li>
        </ul>
        <p className="text-sm text-slate-400 break-all">环境路径: {envPath}</p>
        <p className="text-sm text-amber-500 mt-2">预计时间: 1-3 分钟</p>
      </div>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer shadow-sm"
        onClick={onCreateEnv}
      >
        开始准备环境
      </button>
    </div>
  );
}
