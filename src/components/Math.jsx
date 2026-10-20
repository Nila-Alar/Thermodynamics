import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Sanitizes LaTeX input strings before passing them to KaTeX:
 * 1. Escapes unescaped % signs so they do not comment out the rest of the LaTeX line.
 * 2. Restores control characters like form feed (\x0c from \f) or tab (\t from \text) that occur in JS template strings.
 * 3. Encloses Greek-letter superscripts like ^\gamma in braces ^{ \gamma }.
 */
function sanitizeLatex(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str;

  // Restore control characters accidentally created by unescaped backslashes in JS literals
  // \x0c is Form Feed from \f (e.g. \frac)
  s = s.replace(/\x0crac/g, '\\frac');
  s = s.replace(/\x0c/g, '\\f');
  // \t is Tab from \t (e.g. \text)
  s = s.replace(/\text/g, '\\text');
  // \r followed by _ or c (e.g. \r_c)
  s = s.replace(/\r_c/g, '\\r_c');

  // Fix unescaped % (replace % not preceded by \)
  s = s.replace(/(^|[^\\])%/g, (match, prefix) => prefix + '\\%');

  // Fix ^\gamma or ^gamma to ^{\gamma}
  s = s.replace(/\^(\\?[a-zA-Z]+)(?![a-zA-Z0-9_{])/g, '^{$1}');

  return s;
}

/**
 * Robust KaTeX wrapper component for textbook math rendering.
 * Renders LaTeX formulas to HTML string without errors or red fallback text.
 */
export default function MathView({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    const sanitized = sanitizeLatex(math);

    try {
      // First try strict rendering of the sanitized string
      return katex.renderToString(sanitized, {
        displayMode: display,
        throwOnError: true
      });
    } catch {
      // If error occurs, try permissive mode
      try {
        const permissive = katex.renderToString(sanitized, {
          displayMode: display,
          throwOnError: false,
          strict: false
        });
        // If it resulted in an ugly red katex-error span, fall back to plain formatted text
        if (permissive.includes('katex-error')) {
          return null;
        }
        return permissive;
      } catch {
        return null;
      }
    }
  }, [math, display]);

  if (html === null) {
    // Graceful, clean text fallback if KaTeX ever fails
    const cleanText = String(math).replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\\quad/g, '  ')
      .replace(/\\eta/g, 'η')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2');

    return (
      <span className={`math-fallback ${className}`}>
        {cleanText}
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
