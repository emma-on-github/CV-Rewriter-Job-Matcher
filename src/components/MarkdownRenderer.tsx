import React from 'react';

interface MarkdownRendererProps {
  markdown: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  if (!markdown) return null;

  // Render markdown lines cleanly
  const lines = markdown.split('\n');

  return (
    <div className="cv-document font-sans text-slate-800 dark:text-slate-200 leading-relaxed text-sm space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // H1 Heading
        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={idx}
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-700 pb-1.5 tracking-tight uppercase"
            >
              {renderInlineStyles(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // H2 Heading
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-700/80 pb-1 pt-3 tracking-wide uppercase flex items-center"
            >
              {renderInlineStyles(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // H3 Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-sm font-semibold text-slate-800 dark:text-slate-100 pt-2 flex items-center justify-between"
            >
              {renderInlineStyles(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // Bullet Point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500 font-bold select-none leading-5">•</span>
              <span className="flex-1 leading-normal">{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Handles bold (**text**), italics (*text*), code (`text`), and token highlights ([TOKEN])
 */
function renderInlineStyles(text: string): React.ReactNode[] {
  // Regex to match tokens like [TOKEN] or bold **text**
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[A-Z0-9_-]+\])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.endsWith(']')) {
      // Anonymous token or restored token
      parts.push(
        <span
          key={match.index}
          className="inline-block px-1 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold"
        >
          {token}
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
