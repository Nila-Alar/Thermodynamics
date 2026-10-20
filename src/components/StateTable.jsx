import React from 'react';
import { formatNum, formatDec } from '../calc/format.js';
import MathView from './Math.jsx';

/**
 * Renders state badges with distinct theme colors based on phase or state number.
 */
function renderCustomCell(val, row, col) {
  if (col.accessor === 'phase' && typeof val === 'string') {
    let badgeClass = 'phase-default';
    if (val.includes('Saturated liquid')) badgeClass = 'phase-sat-liq';
    else if (val.includes('Compressed liquid')) badgeClass = 'phase-comp-liq';
    else if (val.includes('Superheated')) badgeClass = 'phase-superheated';
    else if (val.includes('Wet mixture')) badgeClass = 'phase-wet-mix';
    return <span className={`table-badge ${badgeClass}`}>{val}</span>;
  }

  if (col.accessor === 'state' && typeof val === 'number') {
    return <span className={`state-num-badge state-num-${val}`}>{val}</span>;
  }

  return null;
}

/**
 * Colorful, modern engineering table with responsive horizontal scroll wrapper.
 */
export default function StateTable({ columns, data, caption, theme = 'diesel' }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={`table-wrapper table-theme-${theme}`}>
      {caption && <div className="table-caption">{caption}</div>}
      <table className="engineering-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={col.align === 'left' ? 'text-left' : 'text-right'}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.mathHeader ? <MathView math={col.mathHeader} /> : col.header}
                {col.unit && <span className="header-unit"> ({col.unit})</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className={`table-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`}>
              {columns.map((col, colIdx) => {
                const rawVal = row[col.accessor];
                const customBadge = renderCustomCell(rawVal, row, col);
                if (customBadge) {
                  return (
                    <td key={colIdx} className={col.align === 'left' ? 'text-left' : 'text-right'}>
                      {customBadge}
                    </td>
                  );
                }

                let displayVal = rawVal;
                if (col.formatter) {
                  displayVal = col.formatter(rawVal, row);
                } else if (typeof rawVal === 'number') {
                  displayVal = col.decimals !== undefined ? formatDec(rawVal, col.decimals) : formatNum(rawVal, col.sigFigs || 4);
                }

                return (
                  <td
                    key={colIdx}
                    className={col.align === 'left' ? 'text-left' : 'text-right'}
                  >
                    {col.isMath ? <MathView math={displayVal} /> : displayVal}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
