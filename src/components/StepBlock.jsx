import React from 'react';
import MathView from './Math.jsx';

/**
 * StepBlock component adhering strictly to the textbook layout:
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
  note
}) {
  return (
    <div className="step-block">
      <div className="step-header">
        <h4 className="step-title">
          {stepNumber ? `Step ${stepNumber} – ${title}` : title}
        </h4>
      </div>
      <p className="step-explanation">{explanation}</p>
      
      {symbolicFormula && (
        <div className="step-line step-symbolic">
          <span className="step-label">Formula:</span>
          <MathView math={symbolicFormula} display={false} />
        </div>
      )}

      {substitutedFormula && (
        <div className="step-line step-substituted">
          <span className="step-label">Substitution:</span>
          <MathView math={substitutedFormula} display={false} />
        </div>
      )}

      {resultFormula && (
        <div className="step-line step-result">
          <span className="step-label">Result:</span>
          <MathView math={resultFormula} display={false} />
        </div>
      )}

      {note && (
        <div className="step-note">
          <small>{note}</small>
        </div>
      )}
    </div>
  );
}
