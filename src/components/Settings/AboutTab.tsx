import React from "react";

const AboutTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Version Info */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">版本信息</h3>
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">应用名称</span>
            <span className="text-sm text-slate-800 font-mono">PyForge</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">版本号</span>
            <span className="text-sm text-slate-800 font-mono">0.1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">构建时间</span>
            <span className="text-sm text-slate-800 font-mono">
              {new Date().toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
      </div>

      {/* Build Information */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">构建信息</h3>
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">前端框架</span>
            <span className="text-sm text-slate-800">React 19</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">后端框架</span>
            <span className="text-sm text-slate-800">Tauri 2.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">开发工具</span>
            <span className="text-sm text-slate-800">Vite 7</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">样式框架</span>
            <span className="text-sm text-slate-800">Tailwind CSS 4</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">包管理</span>
            <span className="text-sm text-slate-800">pnpm</span>
          </div>
        </div>
      </div>

      {/* License */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">许可证</h3>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-3">
            PyForge 使用 MIT 许可证开源
          </p>
          <details className="text-sm text-slate-700">
            <summary className="cursor-pointer hover:text-slate-900">
              查看许可证文本
            </summary>
            <div className="mt-2 p-3 bg-white rounded border border-slate-200 text-xs text-slate-600 whitespace-pre-line">
MIT License

Copyright (c) 2026 PyForge Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
            </div>
          </details>
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">相关链接</h3>
        <div className="space-y-2">
          <a
            href="https://github.com/pyforge/pyforge"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            GitHub 仓库
          </a>
          <a
            href="https://github.com/pyforge/pyforge/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            问题反馈
          </a>
          <a
            href="https://github.com/pyforge/pyforge/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            讨论区
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
