import React from 'react';
import { formatNum, formatDec } from '../calc/format.js';
import MathView from './Math.jsx';

/**
 * Clean, standard engineering table with 1px border, right-aligned numbers, and horizontal scroll wrapper.
 */
export default function StateTable({ columns, data, caption }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="table-wrapper">
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
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => {
                const rawVal = row[col.accessor];
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
