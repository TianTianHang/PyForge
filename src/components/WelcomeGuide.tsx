import React from 'react';
import QuickStartCard from './QuickStartCard';
import { PROJECT_TEMPLATES } from '../constants/templates';

/**
 * WelcomeGuide component props
 * @interface WelcomeGuideProps
 * @property {(templateId: string) => void} onSelectTemplate - Callback when a template card is clicked
 */
interface WelcomeGuideProps {
  onSelectTemplate: (templateId: string) => void;
}

/**
 * WelcomeGuide - First-time user welcome screen
 * Shows when the user has no projects yet
 * Displays branding, friendly greeting, and template quick-start cards
 * Replaces the empty "no projects" message with an actionable welcome screen
 */
const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  onSelectTemplate,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 h-full">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--color-accent-glow)]">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">
            欢迎使用 PyForge
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            选择一个项目模板快速开始，或自定义配置创建你的专属环境
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PROJECT_TEMPLATES.map((template) => (
            <QuickStartCard
              key={template.id}
              template={template}
              onClick={() => onSelectTemplate(template.id)}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-tertiary)] mb-2">
            需要更多帮助？
          </p>
          <a
            href="#"
            className="text-sm text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            了解更多关于 PyForge
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
