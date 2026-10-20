import React from 'react';
import MathView from './Math.jsx';

/**
 * StepBlock component adhering strictly to textbook layout with modern colorful styling:
 * 1. Title: e.g. "Step 2 – Temperature at the end of compression"
 * 2. Description: One plain sentence saying what is being done and why
 * 3. Formula in symbols (KaTeX)
 * 4. Formula with numbers substituted (units visible) (KaTeX)
 * 5. Bold result line with unit (KaTeX)
 */
export default function StepBlock({
  stepNumber,
  title,
  explanation,
  symbolicFormula,
  substitutedFormula,
  resultFormula,
  note,
  theme = 'diesel'
}) {
  return (
    <div className={`step-block step-theme-${theme}`}>
      <div className="step-header">
        <span className="step-number-pill">{stepNumber || '•'}</span>
        <h4 className="step-title">
          {stepNumber ? `Step ${stepNumber} – ${title}` : title}
        </h4>
      </div>
      <p className="step-explanation">{explanation}</p>
      
      {symbolicFormula && (
        <div className="step-line step-symbolic">
          <span className="step-label step-label-formula">Formula</span>
          <div className="step-math-box">
            <MathView math={symbolicFormula} display={false} />
          </div>
        </div>
      )}

      {substitutedFormula && (
        <div className="step-line step-substituted">
          <span className="step-label step-label-sub">Substitution</span>
          <div className="step-math-box">
            <MathView math={substitutedFormula} display={false} />
          </div>
        </div>
      )}

      {resultFormula && (
        <div className="step-line step-result">
          <span className="step-label step-label-result">Result</span>
          <div className="step-math-box step-math-result">
            <MathView math={resultFormula} display={false} />
          </div>
        </div>
      )}

      {note && (
        <div className="step-note">
          <span className="step-note-icon">💡 Note:</span>
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
