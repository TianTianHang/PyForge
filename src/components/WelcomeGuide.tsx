import React from 'react';

/**
 * WelcomeGuide - Empty state shown when user has no projects
 * Displays a simple prompt to create a new project via the top-right button
 */
const WelcomeGuide: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 h-full">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          还没有项目
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          点击右上角「新建项目」按钮创建你的第一个项目
        </p>
      </div>
    </div>
  );
};

export default WelcomeGuide;
