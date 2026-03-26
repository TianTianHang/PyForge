import React from 'react';
import { ProjectTemplate } from '../types';

interface QuickStartCardProps {
  template: ProjectTemplate;
  onClick: () => void;
  disabled?: boolean;
}

const QuickStartCard: React.FC<QuickStartCardProps> = ({
  template,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        group p-6 rounded-xl border-2 text-left transition-all duration-200
        ${disabled
          ? 'opacity-50 cursor-not-allowed border-[var(--color-border)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:shadow-lg hover:shadow-[var(--color-accent-glow)]/30 cursor-pointer bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl flex-shrink-0">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
            {template.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {template.useCases.map((useCase, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
              >
                {useCase}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-accent-primary)] font-medium">
            <span>立即开始</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export default QuickStartCard;
