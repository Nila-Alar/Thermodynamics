import { describe, it, expect } from 'vitest';
import {
  calculateRankineCycle,
  calculatePump,
  calculateTurbine,
  calculateThermalEfficiency,
  calculateNetPower,
  calculateRankineComparison,
  validateRankineInputs
} from './rankine.js';

describe('Rankine Cycle Calculations', () => {
  const defaultInputs = {
    pBoilerMPa: 3,
    pCondKPa: 50,
    t3C: 300,
    mDot: 35
  };

  it('computes simple ideal Rankine cycle at 3 MPa correctly', () => {
    const res = calculateRankineCycle(defaultInputs);
    expect(res.isValid).toBe(true);

    // State 1: sat liquid at 50 kPa
    expect(res.state1.p).toBe(50);
    expect(res.state1.tC).toBeCloseTo(81.3, 0);
    expect(res.state1.h).toBeCloseTo(340.5, 0);

    // Pump work: wp = v1 * (P_boiler - P_cond)
    // wp ≈ 0.00103 * (3000 - 50) ≈ 3.04 kJ/kg
    expect(res.wp).toBeCloseTo(3.04, 1);
    expect(res.state2.h).toBeCloseTo(res.state1.h + res.wp, 4);

    // State 3: superheated steam at 3 MPa, 300 C
    expect(res.state3.h).toBeCloseTo(2994.35, 1);
    expect(res.state3.s).toBeCloseTo(6.5412, 2);

    // State 4: isentropic turbine exit
    expect(res.state4.x).toBeGreaterThan(0.8);
    expect(res.state4.x).toBeLessThan(0.9);
    expect(res.state4.phase).toBe('Wet mixture');
    expect(res.state4.h).toBeCloseTo(2272.4, 0);

    // Work & Efficiency
    expect(res.wt).toBeCloseTo(721.95, 0);
    expect(res.wNet).toBeCloseTo(718.91, 0);
    expect(res.etaTh).toBeCloseTo(0.2712, 2); // ~27.12%

    // Net power: 35 * 718.91 ≈ 25.16 MW
    expect(res.netPowerMW).toBeCloseTo(25.16, 1);
  });

  it('verifies that changing mDot changes ONLY the power, not specific work or efficiency', () => {
    const res35 = calculateRankineCycle({ ...defaultInputs, mDot: 35 });
    const res70 = calculateRankineCycle({ ...defaultInputs, mDot: 70 });

    expect(res35.wNet).toBeCloseTo(res70.wNet, 8);
    expect(res35.etaTh).toBeCloseTo(res70.etaTh, 8);
    expect(res35.wp).toBeCloseTo(res70.wp, 8);
    expect(res35.wt).toBeCloseTo(res70.wt, 8);
    expect(res70.netPowerMW).toBeCloseTo(res35.netPowerMW * 2, 4);
  });

  it('evaluates comparison at 3, 5, and 6 MPa with correct trends and no NaN', () => {
    const comparison = calculateRankineComparison(defaultInputs, [3, 5, 6]);
    expect(comparison.rows.length).toBe(3);

    const [row3, row5, row6] = comparison.rows;

    // Efficiency increases with boiler pressure
    expect(row3.etaThPercent).toBeLessThan(row5.etaThPercent);
    expect(row5.etaThPercent).toBeLessThan(row6.etaThPercent);

    // Net power increases
    expect(row3.netPowerMW).toBeLessThan(row5.netPowerMW);
    expect(row5.netPowerMW).toBeLessThan(row6.netPowerMW);

    // Dryness fraction x4 falls (more moisture at exhaust)
    expect(row3.x4).toBeGreaterThan(row5.x4);
    expect(row5.x4).toBeGreaterThan(row6.x4);

    // Pump work increases with boiler pressure
    expect(row3.wp).toBeLessThan(row5.wp);
    expect(row5.wp).toBeLessThan(row6.wp);

    // Check values match calculated physics
    expect(row3.etaThPercent).toBeCloseTo(27.12, 1);
    expect(row5.etaThPercent).toBeCloseTo(29.66, 1);
    expect(row6.etaThPercent).toBeCloseTo(30.48, 1);

    expect(comparison.comment).toContain('moisture');
  });

  it('validates T3 >= T_sat(P_boiler) and displays informative message', () => {
    // At 3 MPa, T_sat is ~233.86 C. Setting T3 = 200 C is invalid for superheated cycle
    const invalid = validateRankineInputs({ ...defaultInputs, t3C: 200 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.t3C).toContain('must be at least the saturation temperature');
    expect(invalid.errors.t3C).toContain('steam would not be superheated');
  });

  it('validates P_boiler > P_cond', () => {
    const invalid = validateRankineInputs({ pBoilerMPa: 0.04, pCondKPa: 50 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.pBoilerMPa).toBeDefined();
  });
});
