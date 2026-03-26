import React from 'react';
import { PROJECT_TEMPLATES } from '../constants/templates';

/**
 * TemplateSelector component props
 * @interface TemplateSelectorProps
 * @property {string} selectedTemplate - ID of the currently selected template
 * @property {(templateId: string) => void} onTemplateSelect - Callback when a template is selected
 * @property {boolean} [disabled=false] - Whether selection is disabled
 */
interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  disabled?: boolean;
}

/**
 * TemplateSelector - Card-based template selection UI
 * Displays available project templates in a 2-column grid layout
 * Used in the simplified project creation dialog for beginners
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
        选择项目模板
      </label>
      <div className="grid grid-cols-2 gap-3">
        {PROJECT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            disabled={disabled}
            onClick={() => onTemplateSelect(template.id)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all duration-200
              ${selectedTemplate === template.id
                ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 shadow-md shadow-[var(--color-accent-glow)]/50'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold mb-1 ${
                  selectedTemplate === template.id
                    ? 'text-[var(--color-accent-primary)]'
                    : 'text-[var(--color-text-primary)]'
                }`}>
                  {template.name}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-2">
                  {template.description}
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.useCases.slice(0, 2).map((useCase, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
                    >
                      {useCase}
                    </span>
                  ))}
                  {template.useCases.length > 2 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                      +{template.useCases.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
