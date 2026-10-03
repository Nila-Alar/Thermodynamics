/**
 * Pure thermodynamic calculations for the Ideal Air-Standard Diesel Cycle.
 * No React dependencies. All functions return plain objects.
 */

export function validateDieselInputs(inputs) {
  const errors = {};
  const {
    r = 20,
    p1 = 95,
    t1C = 20,
    t3 = 2500,
    cp = 1.005,
    cv = 0.718,
    R = 0.287,
    mDot = 95
  } = inputs;

  if (r <= 1) {
    errors.r = 'Compression ratio r must be greater than 1.';
  }
  if (p1 <= 0) {
    errors.p1 = 'Initial pressure P₁ must be greater than 0 kPa.';
  }
  if (t1C <= -273.15) {
    errors.t1C = 'Initial temperature T₁ must be greater than absolute zero (-273.15 °C).';
  }
  if (cp <= 0) {
    errors.cp = 'Specific heat cp must be positive.';
  }
  if (cv <= 0) {
    errors.cv = 'Specific heat cv must be positive.';
  }
  if (cp <= cv) {
    errors.cp = 'Specific heat cp must be greater than cv.';
  }
  if (R <= 0) {
    errors.R = 'Gas constant R must be positive.';
  }
  if (mDot <= 0) {
    errors.mDot = 'Mass flow rate must be positive.';
  }

  // Check temperature after compression vs T3
  if (!errors.r && !errors.t1C && !errors.cp && !errors.cv) {
    const t1K = t1C + 273.15;
    const gamma = cp / cv;
    const t2 = t1K * Math.pow(r, gamma - 1);
    if (t3 <= t2) {
      errors.t3 = `Maximum temperature must be higher than the temperature after compression (${t2.toFixed(1)} K), so no heat is added.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function calculateDieselState1(inputs) {
  const { p1 = 95, t1C = 20, R = 0.287 } = inputs;
  const t1K = t1C + 273.15;
  const v1 = (R * t1K) / p1; // m³/kg
  return {
    state: 1,
    p: p1,
    tK: t1K,
    tC: t1C,
    v: v1,
    description: 'Beginning of isentropic compression (BDC)'
  };
}

export function calculateDieselState2(s1, inputs) {
  const { r = 20, cp = 1.005, cv = 0.718 } = inputs;
  const gamma = cp / cv;
  const v2 = s1.v / r;
  const t2K = s1.tK * Math.pow(r, gamma - 1);
  const p2 = s1.p * Math.pow(r, gamma);
  return {
    state: 2,
    p: p2,
    tK: t2K,
    tC: t2K - 273.15,
    v: v2,
    description: 'End of isentropic compression (TDC)'
  };
}

export function calculateDieselState3(s2, inputs) {
  const { t3 = 2500, R = 0.287 } = inputs;
  const p3 = s2.p; // constant pressure
  const rc = t3 / s2.tK; // cutoff ratio rc = T3 / T2 = v3 / v2
  const v3 = (R * t3) / p3;
  return {
    state: 3,
    p: p3,
    tK: t3,
    tC: t3 - 273.15,
    v: v3,
    rc,
    description: 'End of constant-pressure heat addition'
  };
}

export function calculateDieselState4(s3, s1, inputs) {
  const { r = 20, cp = 1.005, cv = 0.718 } = inputs;
  const gamma = cp / cv;
  const v4 = s1.v; // constant volume back to BDC
  const expansionRatio = r / s3.rc; // v4 / v3
  const t4K = s3.tK * Math.pow(1 / expansionRatio, gamma - 1);
  const p4 = s3.p * Math.pow(s3.v / v4, gamma);
  return {
    state: 4,
    p: p4,
    tK: t4K,
    tC: t4K - 273.15,
    v: v4,
    expansionRatio,
    description: 'End of isentropic expansion (BDC)'
  };
}

export function calculateDieselCycle(inputs) {
  const validation = validateDieselInputs(inputs);
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors
    };
  }

  const {
    r = 20,
    p1 = 95,
    t1C = 20,
    t3 = 2500,
    cp = 1.005,
    cv = 0.718,
    R = 0.287,
    mDot = 95
  } = inputs;

  const gamma = cp / cv;

  // Compute 4 states sequentially
  const state1 = calculateDieselState1({ p1, t1C, R });
  const state2 = calculateDieselState2(state1, { r, cp, cv });
  const state3 = calculateDieselState3(state2, { t3, R });
  const state4 = calculateDieselState4(state3, state1, { r, cp, cv });

  const rc = state3.rc;

  // Energy transfers (kJ/kg)
  const qIn = cp * (state3.tK - state2.tK);
  const qOut = cv * (state4.tK - state1.tK);
  const wNet = qIn - qOut;

  // Thermal efficiency
  const etaTh = wNet / qIn;

  // Closed-form Diesel efficiency check
  const etaThClosed = 1 - (1 / Math.pow(r, gamma - 1)) * ((Math.pow(rc, gamma) - 1) / (gamma * (rc - 1)));

  // Mean Effective Pressure (MEP)
  const displacementVolume = state1.v - state2.v;
  const mep = wNet / displacementVolume; // kPa

  // Optional power output (kW & MW)
  const netPowerKW = mDot * wNet;
  const netPowerMW = netPowerKW / 1000;

  return {
    isValid: true,
    inputs: { r, p1, t1C, t1K: state1.tK, t3, cp, cv, R, gamma, mDot },
    states: [state1, state2, state3, state4],
    rc,
    qIn,
    qOut,
    wNet,
    etaTh,
    etaThClosed,
    displacementVolume,
    mep,
    netPowerKW,
    netPowerMW
  };
}

export function calculateDieselComparison(inputs, ratios = [20, 19, 18, 17, 16, 15]) {
  const rows = [];
  for (const r of ratios) {
    const res = calculateDieselCycle({ ...inputs, r });
    if (res.isValid) {
      rows.push({
        r,
        t2: res.states[1].tK,
        p2: res.states[1].p,
        rc: res.rc,
        qIn: res.qIn,
        qOut: res.qOut,
        wNet: res.wNet,
        etaTh: res.etaTh,
        etaThPercent: res.etaTh * 100,
        mep: res.mep,
        t4: res.states[3].tK,
        p4: res.states[3].p
      });
    }
  }

  // Generate automated commentary comparing first and last ratio
  let comment = '';
  if (rows.length >= 2) {
    const first = rows[0]; // e.g. r=20
    const last = rows[rows.length - 1]; // e.g. r=15

    const etaDiff = last.etaThPercent - first.etaThPercent;
    const mepDiff = last.mep - first.mep;
    const t2Diff = last.t2 - first.t2;
    const p2Diff = last.p2 - first.p2;
    const rcDiff = last.rc - first.rc;

    const etaTrend = etaDiff < 0 ? 'decreases' : 'increases';
    const mepTrend = mepDiff < 0 ? 'decreases' : 'increases';
    const t2Trend = t2Diff < 0 ? 'drops' : 'rises';
    const p2Trend = p2Diff < 0 ? 'drops' : 'rises';
    const rcTrend = rcDiff > 0 ? 'increases' : 'decreases';

    comment = `As the compression ratio (r) is decreased from ${first.r} to ${last.r}:
1. End-of-compression temperature (T₂) ${t2Trend} from ${first.t2.toFixed(1)} K to ${last.t2.toFixed(1)} K, and pressure (P₂) ${p2Trend} from ${first.p2.toFixed(0)} kPa to ${last.p2.toFixed(0)} kPa.
2. Because T₂ is lower while peak temperature T₃ remains constant at ${inputs.t3 || 2500} K, the cut-off ratio (r_c = T₃/T₂) ${rcTrend} from ${first.rc.toFixed(3)} to ${last.rc.toFixed(3)}, prolonging the fuel injection duration.
3. Thermal efficiency (η_th) ${etaTrend} monotonically from ${first.etaThPercent.toFixed(2)}% to ${last.etaThPercent.toFixed(2)}% (a drop of ${Math.abs(etaDiff).toFixed(2)} percentage points), confirming the thermodynamic principle that higher compression ratios yield higher cycle efficiencies.
4. Mean effective pressure (MEP) ${mepTrend} from ${first.mep.toFixed(1)} kPa to ${last.mep.toFixed(1)} kPa (a reduction of ${Math.abs(mepDiff).toFixed(1)} kPa or ${Math.abs((mepDiff / first.mep) * 100).toFixed(1)}%), indicating that lower compression ratios deliver less specific work output per unit cylinder displacement.`;
  }

  return {
    rows,
    comment
  };
}

/**
 * Generates smooth curves for the P-v diagram of the Diesel cycle.
 */
export function generateDieselPvPoints(cycleResult, numPointsPerCurve = 35) {
  if (!cycleResult || !cycleResult.isValid) return [];
  const { states, inputs } = cycleResult;
  const [s1, s2, s3, s4] = states;
  const gamma = inputs.gamma;

  const points = [];

  // Process 1 -> 2: Isentropic compression: P * v^gamma = P1 * v1^gamma
  // v goes from v1 down to v2
  for (let i = 0; i <= numPointsPerCurve; i++) {
    const fraction = i / numPointsPerCurve;
    // geometric spacing for smooth curve
    const v = s1.v * Math.pow(s2.v / s1.v, fraction);
    const p = s1.p * Math.pow(s1.v / v, gamma);
    points.push({
      v,
      p,
      process: '1-2 Compression',
      label: i === 0 ? '1' : i === numPointsPerCurve ? '2' : undefined
    });
  }

  // Process 2 -> 3: Constant-pressure heat addition: P = P2, v goes from v2 to v3
  for (let i = 1; i <= numPointsPerCurve; i++) {
    const fraction = i / numPointsPerCurve;
    const v = s2.v + fraction * (s3.v - s2.v);
    const p = s2.p;
    points.push({
      v,
      p,
      process: '2-3 Combustion',
      label: i === numPointsPerCurve ? '3' : undefined
    });
  }

  // Process 3 -> 4: Isentropic expansion: P * v^gamma = P3 * v3^gamma
  // v goes from v3 up to v4 (= v1)
  for (let i = 1; i <= numPointsPerCurve; i++) {
    const fraction = i / numPointsPerCurve;
    const v = s3.v * Math.pow(s4.v / s3.v, fraction);
    const p = s3.p * Math.pow(s3.v / v, gamma);
    points.push({
      v,
      p,
      process: '3-4 Expansion',
      label: i === numPointsPerCurve ? '4' : undefined
    });
  }

  // Process 4 -> 1: Constant-volume heat rejection: v = v1, P goes from P4 down to P1
  for (let i = 1; i <= numPointsPerCurve; i++) {
    const fraction = i / numPointsPerCurve;
    const v = s1.v;
    const p = s4.p - fraction * (s4.p - s1.p);
    points.push({
      v,
      p,
      process: '4-1 Heat Rejection'
    });
  }

  return points;
}
