/**
 * Number formatting utilities for engineering calculations.
 * Ensures numbers are displayed cleanly to 4 significant figures (or sensible decimal places)
 * and guards against NaN / undefined / Infinity.
 */

export function formatNum(val, sigFigs = 4) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '—';
  }
  const abs = Math.abs(val);
  if (abs === 0) return '0';
  
  // For numbers between 0.001 and 10000, use precision
  if (abs >= 0.001 && abs < 100000) {
    // Check if rounding to sigFigs produces clean number
    const prec = Number(val.toPrecision(sigFigs));
    // If it's an integer or near integer
    if (Number.isInteger(prec)) {
      return prec.toString();
    }
    return prec.toString();
  }
  
  return val.toExponential(sigFigs - 1);
}

export function formatDec(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '—';
  }
  return Number(val).toFixed(decimals);
}

export function formatPercent(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '—';
  }
  return `${(val * 100).toFixed(decimals)}%`;
}

export function round(val, decimals = 4) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
