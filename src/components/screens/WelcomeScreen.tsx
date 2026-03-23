export function WelcomeScreen({
  onCreateEnv,
  envPath,
}: {
  onCreateEnv: () => void;
  envPath?: string;
}) {
  return (
    <div className="welcome-screen">
      <h1>Welcome to PyForge</h1>
      <p>开箱即用的 Python 学习环境</p>

      <div className="welcome-info">
        <h3>首次启动需要准备环境</h3>
        <ul>
          <li>创建 Python 虚拟环境</li>
          <li>安装基础包：numpy, pandas, matplotlib</li>
          <li>注册 Jupyter 内核</li>
        </ul>
        <p className="env-path">环境路径: {envPath}</p>
        <p className="estimated-time">预计时间: 1-3 分钟</p>
      </div>

      <button className="primary-button" onClick={onCreateEnv}>
        开始准备环境
      </button>
    </div>
  );
}
