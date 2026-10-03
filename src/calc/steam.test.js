import { describe, it, expect } from 'vitest';
import {
  getSaturatedPropertiesByPressure,
  getSuperheatedProperties,
  getSaturationDomePoints,
  validateStateRange
} from './steam.js';

describe('Steam Property Engine (IAPWS-IF97)', () => {
  it('verifies saturated water properties at 50 kPa within 0.1% of benchmark', () => {
    // 50 kPa = 0.05 MPa
    const sat50 = getSaturatedPropertiesByPressure(0.05);

    // Benchmark: T_sat ≈ 81.3 °C
    const relDiffT = Math.abs(sat50.tC - 81.3) / 81.3;
    expect(relDiffT).toBeLessThan(0.002); // 81.32 vs 81.3 is < 0.03%

    // Benchmark: h_f ≈ 340.5 kJ/kg
    const relDiffHf = Math.abs(sat50.h_f - 340.5) / 340.5;
    expect(relDiffHf).toBeLessThan(0.001); // < 0.1%

    // Benchmark: h_fg ≈ 2304.7 kJ/kg
    const relDiffHfg = Math.abs(sat50.h_fg - 2304.7) / 2304.7;
    expect(relDiffHfg).toBeLessThan(0.001); // < 0.1%

    // Benchmark: s_f ≈ 1.091 kJ/kg·K
    const relDiffSf = Math.abs(sat50.s_f - 1.091) / 1.091;
    expect(relDiffSf).toBeLessThan(0.001); // < 0.1%

    // Benchmark: v_f ≈ 0.00103 m³/kg
    const relDiffVf = Math.abs(sat50.v_f - 0.00103) / 0.00103;
    expect(relDiffVf).toBeLessThan(0.001); // < 0.1%
  });

  it('verifies superheated steam at 3 MPa and 300 °C within 0.1% of benchmark', () => {
    const steam3 = getSuperheatedProperties(3.0, 300);

    // Benchmark: h ≈ 2994 kJ/kg
    const relDiffH = Math.abs(steam3.h - 2994) / 2994;
    expect(relDiffH).toBeLessThan(0.001); // 2994.35 vs 2994 is < 0.02%

    // Benchmark: s ≈ 6.541 kJ/kg·K
    const relDiffS = Math.abs(steam3.s - 6.541) / 6.541;
    expect(relDiffS).toBeLessThan(0.001); // 6.5412 vs 6.541 is < 0.004%
  });

  it('generates saturation dome points with more than 60 points and valid ranges', () => {
    const dome = getSaturationDomePoints();
    expect(dome.length).toBeGreaterThanOrEqual(60);

    for (const pt of dome) {
      expect(pt.s).toBeGreaterThan(0);
      expect(pt.tC).toBeGreaterThan(0);
      expect(isNaN(pt.s)).toBe(false);
      expect(isNaN(pt.tC)).toBe(false);
    }
  });

  it('validates state ranges and refuses out-of-range pressures', () => {
    const tooLow = validateStateRange(0.0001); // below triple point
    expect(tooLow.isValid).toBe(false);

    const tooHigh = validateStateRange(250); // above 100 MPa
    expect(tooHigh.isValid).toBe(false);

    const valid = validateStateRange(3.0, 300);
    expect(valid.isValid).toBe(true);
  });
});
