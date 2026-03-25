# Launcher 已知问题记录

> 记录日期：2025-07-23
> 相关文件：`src-tauri/src/domain/jupyter/launcher.rs`

## 问题清单

| # | 严重程度 | 问题 | 当前状态 |
|---|---------|------|---------|
| 1 | 中 | Child handle 丢失，无法主动关闭 Jupyter 进程 | 功能正常，需设计改进 |
| 2 | 低 | 健康检查每次 spawn curl 进程，效率低 | 功能正常，可优化 |

---

## 1. Child handle 丢失

### 现象

`start_jupyter_server` 函数创建 child process 后，未将 `Child` handle 存储或返回：

```rust
// launcher.rs:46-48
let child = child_cmd
    .spawn()
    .map_err(|e| format!("启动 Jupyter 失败: {}", e))?;

let _pid = child.id();  // 拿到 pid 但 child 随后被 drop
```

函数返回后 `child` 被 drop。在某些平台上 drop `tokio::process::Child` 会尝试调用 `wait()`，可能导致 Jupyter 进程被意外终止。

### 当前为何正常

- tokio 的 `Child` drop 不主动 kill 子进程
- Jupyter 由 init/systemd 收养后继续运行

### 改进方向

需要一个进程管理模块，持有所有 Jupyter child handle，支持：
- 启动/停止/重启 Jupyter
- 窗口关闭时优雅退出
- 进程异常退出时自动重启

---

## 2. 健康检查效率

### 现象

健康检查循环中每次迭代 spawn 一个 curl 进程：

```rust
// launcher.rs:62-65
let check = Command::new("curl")
    .args(["-s", "-o", "/dev/null", "-w", "%{http_code}", &format!("http://127.0.0.1:{}/api", config.port)])
    .output()
    .await;
```

每 500ms 检查一次，最多 60 次（30 秒），可能创建 60 个 curl 进程。

### 改进方向

使用 HTTP 客户端库（如 `reqwest`）替代 curl，避免进程创建开销。但依赖了 Tauri 是否已引入 reqwest（需确认 `Cargo.toml`）。
