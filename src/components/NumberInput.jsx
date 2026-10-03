import React from 'react';

/**
 * Compact engineering input field with unit label, quick selection buttons, and inline validation.
 */
export default function NumberInput({
  id,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 'any',
  quickValues = [],
  error = null,
  disabled = false
}) {
  const handleInputChange = (e) => {
    const valStr = e.target.value;
    if (valStr === '') {
      onChange('');
      return;
    }
    const parsed = parseFloat(valStr);
    onChange(isNaN(parsed) ? valStr : parsed);
  };

  return (
    <div className={`input-group ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      <div className="input-row">
        <div className="input-wrapper">
          <input
            id={id}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={`number-input-field ${error ? 'input-error' : ''}`}
          />
          {unit && <span className="input-unit">{unit}</span>}
        </div>

        {quickValues && quickValues.length > 0 && (
          <div className="quick-buttons">
            {quickValues.map((qv) => {
              const qvVal = typeof qv === 'object' ? qv.value : qv;
              const qvLabel = typeof qv === 'object' ? qv.label : qv;
              const isActive = Number(value) === Number(qvVal);
              return (
                <button
                  key={qvVal}
                  type="button"
                  className={`quick-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onChange(qvVal)}
                  disabled={disabled}
                >
                  {qvLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <div className="input-error-msg">{error}</div>}
    </div>
  );
}
