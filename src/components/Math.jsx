import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Robust KaTeX wrapper component for textbook math rendering.
 * Renders LaTeX formulas to HTML string.
 * Falls back to HTML <sub>/<sup> or plain text if KaTeX rendering fails.
 */
export default function MathView({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false
      });
    } catch (e) {
      console.error('KaTeX rendering error for:', math, e);
      // Fallback
      return null;
    }
  }, [math, display]);

  if (html === null) {
    // Graceful fallback to HTML span
    return (
      <span className={`math-fallback ${className}`}>
        {math}
      </span>
    );
  }

  const Tag = display ? 'div' : 'span';

  return (
    <Tag
      className={`math-rendered ${display ? 'math-display' : 'math-inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
