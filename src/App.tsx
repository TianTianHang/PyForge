import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// ============================================================================
// 类型定义
// ============================================================================

type AppState =
  | "checking"
  | "no_env"
  | "creating_env"
  | "starting_jupyter"
  | "ready"
  | "error";

interface EnvStatus {
  exists: boolean;
  path: string;
}

interface JupyterInfo {
  port: number;
  token: string;
  url: string;
  notebook_dir: string;
}

// ============================================================================
// 主组件
// ============================================================================

function App() {
  const [appState, setAppState] = useState<AppState>("checking");
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [jupyterInfo, setJupyterInfo] = useState<JupyterInfo | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // 初始化：检查环境状态
  useEffect(() => {
    checkEnvironment();
  }, []);

  // 监听环境创建进度事件
  useEffect(() => {
    const unlisten = listen<string>("env-progress", (event) => {
      setProgressMessage(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 检查环境状态
  const checkEnvironment = async () => {
    try {
      setAppState("checking");
      const status = await invoke<EnvStatus>("check_env");
      setEnvStatus(status);

      if (status.exists) {
        // 环境已存在，直接启动 Jupyter
        await startJupyter();
      } else {
        setAppState("no_env");
      }
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  };

  // 创建环境
  const createEnvironment = async () => {
    try {
      setAppState("creating_env");
      setProgressMessage("正在准备环境...");

      await invoke<string>("create_env");

      // 环境创建成功，启动 Jupyter
      await startJupyter();
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  };

  // 启动 Jupyter
  const startJupyter = async () => {
    try {
      setAppState("starting_jupyter");
      setProgressMessage("正在启动 Jupyter Server...");

      const info = await invoke<JupyterInfo>("start_jupyter");
      setJupyterInfo(info);
      setAppState("ready");
    } catch (err) {
      setError(err as string);
      setAppState("error");
    }
  };

  // 停止 Jupyter
  const stopJupyter = async () => {
    try {
      await invoke<string>("stop_jupyter");
      setJupyterInfo(null);
      setAppState("no_env");
    } catch (err) {
      console.error("停止 Jupyter 失败:", err);
    }
  };

  // 重试
  const retry = () => {
    setError(null);
    checkEnvironment();
  };

  // 渲染内容
  const renderContent = () => {
    switch (appState) {
      case "checking":
        return <LoadingScreen message="正在检查环境..." />;

      case "no_env":
        return (
          <WelcomeScreen
            onCreateEnv={createEnvironment}
            envPath={envStatus?.path}
          />
        );

      case "creating_env":
        return <ProgressScreen message={progressMessage} />;

      case "starting_jupyter":
        return <LoadingScreen message={progressMessage} />;

      case "ready":
        return jupyterInfo ? (
          <JupyterViewer
            url={jupyterInfo.url}
            onStop={stopJupyter}
          />
        ) : null;

      case "error":
        return <ErrorScreen error={error} onRetry={retry} />;
    }
  };

  return <div className="app">{renderContent()}</div>;
}

// ============================================================================
// 子组件
// ============================================================================

// 加载屏幕
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

// 欢迎屏幕（环境不存在时）
function WelcomeScreen({
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

// 进度屏幕（创建环境中）
function ProgressScreen({ message }: { message: string }) {
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

// Jupyter 查看器（嵌入 iframe）
function JupyterViewer({
  url,
  onStop,
}: {
  url: string;
  onStop: () => void;
}) {
  return (
    <div className="jupyter-viewer">
      <div className="jupyter-toolbar">
        <span className="toolbar-title">PyForge</span>
        <button className="toolbar-button" onClick={onStop}>
          停止
        </button>
      </div>
      <iframe
        src={url}
        className="jupyter-iframe"
        title="JupyterLab"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

// 错误屏幕
function ErrorScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="error-screen">
      <h2>出现错误</h2>
      <p className="error-message">{error}</p>
      <button className="primary-button" onClick={onRetry}>
        重试
      </button>
    </div>
  );
}

export default App;
