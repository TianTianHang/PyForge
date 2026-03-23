export function ProgressScreen({ message }: { message: string }) {
  return (
    <div className="progress-screen">
      <div className="progress-content">
        <div className="spinner"></div>
        <h2>正在准备环境</h2>
        <p className="progress-message">{message}</p>
        <div className="progress-steps">
          <div className={`step ${message.includes("虚拟环境") ? "active" : ""}`}>
            <span className="step-icon">1</span>
            <span>创建虚拟环境</span>
          </div>
          <div className={`step ${message.includes("安装") ? "active" : ""}`}>
            <span className="step-icon">2</span>
            <span>安装基础包</span>
          </div>
          <div className={`step ${message.includes("注册") ? "active" : ""}`}>
            <span className="step-icon">3</span>
            <span>注册 Jupyter 内核</span>
          </div>
        </div>
      </div>
    </div>
  );
}
