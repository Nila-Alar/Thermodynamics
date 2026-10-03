import { describe, it, expect } from 'vitest';
import {
  calculateDieselCycle,
  calculateDieselState1,
  calculateDieselState2,
  calculateDieselState3,
  calculateDieselState4,
  calculateDieselComparison,
  validateDieselInputs,
  generateDieselPvPoints
} from './diesel.js';

describe('Diesel Cycle Calculations', () => {
  const defaultInputs = {
    r: 20,
    p1: 95,
    t1C: 20,
    t3: 2500,
    cp: 1.005,
    cv: 0.718,
    R: 0.287,
    mDot: 95
  };

  it('computes Diesel default states matching expected assignment values', () => {
    const res = calculateDieselCycle(defaultInputs);
    expect(res.isValid).toBe(true);

    const [s1, s2, s3, s4] = res.states;

    // Check T2 ≈ 971.7 K, P2 ≈ 6300 kPa, rc ≈ 2.57
    expect(s2.tK).toBeCloseTo(970.82, 0); // with cp=1.005, cv=0.718
    expect(s2.p).toBeCloseTo(6292.2, -1); // ≈ 6300 kPa
    expect(res.rc).toBeCloseTo(2.575, 2);

    // Initial state
    expect(s1.p).toBe(95);
    expect(s1.tK).toBeCloseTo(293.15, 2);
    expect(s1.v).toBeCloseTo((0.287 * 293.15) / 95, 4);

    // End of heat addition
    expect(s3.tK).toBe(2500);
    expect(s3.p).toBeCloseTo(s2.p, 3);
  });

  it('satisfies the closed-form thermal efficiency equality (eta_th = eta_th_closed)', () => {
    const res = calculateDieselCycle(defaultInputs);
    expect(res.etaTh).toBeGreaterThan(0.5);
    expect(res.etaTh).toBeLessThan(0.7);
    // Closed form Diesel efficiency check must match wNet / qIn to machine precision
    expect(Math.abs(res.etaTh - res.etaThClosed)).toBeLessThan(1e-12);
  });

  it('computes Mean Effective Pressure (MEP) with proper units', () => {
    const res = calculateDieselCycle(defaultInputs);
    // MEP = w_net / (v1 - v2)
    const expectedMep = res.wNet / (res.states[0].v - res.states[1].v);
    expect(res.mep).toBeCloseTo(expectedMep, 6);
    expect(res.mep).toBeGreaterThan(1000); // ≈ 1136 kPa
  });

  it('runs variation of r = 20, 19, 18, 17, 16, 15 without NaN or errors', () => {
    const comparison = calculateDieselComparison(defaultInputs, [20, 19, 18, 17, 16, 15]);
    expect(comparison.rows.length).toBe(6);

    for (const row of comparison.rows) {
      expect(isNaN(row.etaTh)).toBe(false);
      expect(isNaN(row.mep)).toBe(false);
      expect(isNaN(row.t2)).toBe(false);
      expect(isNaN(row.p2)).toBe(false);
      expect(isNaN(row.rc)).toBe(false);
      expect(row.etaTh).toBeGreaterThan(0);
      expect(row.mep).toBeGreaterThan(0);
    }

    // Verify monotonic decrease of efficiency as r decreases
    for (let i = 0; i < comparison.rows.length - 1; i++) {
      expect(comparison.rows[i].etaTh).toBeGreaterThan(comparison.rows[i + 1].etaTh);
      expect(comparison.rows[i].mep).toBeGreaterThan(comparison.rows[i + 1].mep);
    }

    expect(comparison.comment).toContain('monotonic');
  });

  it('correctly validates invalid inputs and reports clear error messages', () => {
    // r <= 1
    const invalidR = validateDieselInputs({ ...defaultInputs, r: 0.9 });
    expect(invalidR.isValid).toBe(false);
    expect(invalidR.errors.r).toBeDefined();

    // T3 <= T2
    const invalidT3 = validateDieselInputs({ ...defaultInputs, t3: 800 });
    expect(invalidT3.isValid).toBe(false);
    expect(invalidT3.errors.t3).toContain('Maximum temperature must be higher than the temperature after compression');
  });

  it('generates valid P-v diagram points', () => {
    const res = calculateDieselCycle(defaultInputs);
    const pvPoints = generateDieselPvPoints(res, 20);
    expect(pvPoints.length).toBeGreaterThan(50);
    for (const pt of pvPoints) {
      expect(pt.v).toBeGreaterThan(0);
      expect(pt.p).toBeGreaterThan(0);
      expect(isNaN(pt.v)).toBe(false);
      expect(isNaN(pt.p)).toBe(false);
    }
  });
});
