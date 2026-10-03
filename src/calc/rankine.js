/**
 * Pure thermodynamic calculations for the Simple Ideal Rankine Cycle.
 * No React dependencies. All functions return plain objects.
 * Uses IAPWS-IF97 steam property formulations.
 */

import {
  getSaturatedPropertiesByPressure,
  getSuperheatedProperties,
  getSteamProperties,
  validateStateRange,
  IF97_LIMITS
} from './steam.js';

export function validateRankineInputs(inputs) {
  const errors = {};
  const {
    pBoilerMPa = 3,
    pCondKPa = 50,
    t3C = 300,
    mDot = 35
  } = inputs;

  const pCondMPa = pCondKPa / 1000;

  if (pBoilerMPa <= 0) {
    errors.pBoilerMPa = 'Boiler pressure must be greater than 0 MPa.';
  }
  if (pCondKPa <= 0) {
    errors.pCondKPa = 'Condenser pressure must be greater than 0 kPa.';
  }
  if (mDot <= 0) {
    errors.mDot = 'Mass flow rate must be greater than 0 kg/s.';
  }

  // Check physical IF97 limits
  if (pCondMPa < IF97_LIMITS.minPressureMPa) {
    errors.pCondKPa = `Condenser pressure (${pCondKPa} kPa) is below the triple point (0.612 kPa).`;
  }
  if (pBoilerMPa >= IF97_LIMITS.criticalPressureMPa) {
    errors.pBoilerMPa = `Boiler pressure (${pBoilerMPa} MPa) exceeds critical pressure (${IF97_LIMITS.criticalPressureMPa} MPa). Ideal subcritical Rankine cycle requires P < P_critical.`;
  }

  // Pressure limits relation
  if (!errors.pBoilerMPa && !errors.pCondKPa) {
    if (pBoilerMPa <= pCondMPa) {
      errors.pBoilerMPa = `Boiler pressure (${pBoilerMPa} MPa) must be strictly greater than condenser pressure (${pCondMPa.toFixed(4)} MPa / ${pCondKPa} kPa).`;
    }
  }

  // Temperature validation
  if (!errors.pBoilerMPa) {
    try {
      const satBoiler = getSaturatedPropertiesByPressure(pBoilerMPa);
      if (t3C < satBoiler.tC) {
        errors.t3C = `Turbine inlet temperature T₃ (${t3C} °C) must be at least the saturation temperature at P_boiler (${satBoiler.tC.toFixed(2)} °C), otherwise the steam would not be superheated.`;
      }
    } catch (err) {
      errors.pBoilerMPa = err.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Calculates Pump state and work: w_p = v1 * (P_boiler - P_cond)
 */
export function calculatePump(pBoilerMPa, pCondKPa, state1) {
  const pBoilerKPa = pBoilerMPa * 1000;
  const deltaP = pBoilerKPa - pCondKPa; // kPa
  // v1 in m³/kg, deltaP in kPa => kPa * m³/kg = kJ/kg
  const wp = state1.v * deltaP;
  const h2 = state1.h + wp;
  const s2 = state1.s; // isentropic pump
  // Temperature rises slightly during isentropic compression of liquid: dT ~ (wp / cp)
  const cpWater = 4.184; // kJ/kg·K
  const t2C = state1.tC + wp / cpWater;

  return {
    state: 2,
    p: pBoilerKPa,
    pMPa: pBoilerMPa,
    tC: t2C,
    tK: t2C + 273.15,
    h: h2,
    s: s2,
    v: state1.v,
    x: 0,
    phase: 'Compressed liquid',
    wp,
    description: 'Pump outlet / Boiler inlet'
  };
}

/**
 * Calculates Turbine work: w_t = h3 - h4
 */
export function calculateTurbine(state3, state4) {
  const wt = state3.h - state4.h;
  return {
    wt
  };
}

/**
 * Calculates Thermal Efficiency: eta_th = w_net / q_in
 */
export function calculateThermalEfficiency(wNet, qIn) {
  if (qIn <= 0) return 0;
  return wNet / qIn;
}

/**
 * Calculates Net Power Output: P_net = mDot * w_net
 */
export function calculateNetPower(mDot, wNet) {
  const netPowerKW = mDot * wNet;
  const netPowerMW = netPowerKW / 1000;
  return {
    netPowerKW,
    netPowerMW
  };
}

/**
 * Calculates the complete Simple Ideal Rankine Cycle.
 */
export function calculateRankineCycle(inputs) {
  const validation = validateRankineInputs(inputs);
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors
    };
  }

  const {
    pBoilerMPa = 3,
    pCondKPa = 50,
    t3C = 300,
    mDot = 35
  } = inputs;

  const pCondMPa = pCondKPa / 1000;
  const pBoilerKPa = pBoilerMPa * 1000;

  try {
    // 1. Condenser saturation properties
    const satCond = getSaturatedPropertiesByPressure(pCondMPa);
    // Boiler saturation properties (for reference and heating path)
    const satBoiler = getSaturatedPropertiesByPressure(pBoilerMPa);

    // State 1: Saturated liquid at condenser pressure
    const state1 = {
      state: 1,
      p: pCondKPa,
      pMPa: pCondMPa,
      tC: satCond.tC,
      tK: satCond.tK,
      h: satCond.h_f,
      s: satCond.s_f,
      v: satCond.v_f,
      x: 0,
      phase: 'Saturated liquid',
      description: 'Condenser outlet / Pump inlet'
    };

    // State 2: Pump outlet
    const state2 = calculatePump(pBoilerMPa, pCondKPa, state1);
    const wp = state2.wp;

    // State 3: Superheated steam at turbine inlet (P_boiler, T3)
    const steam3 = getSuperheatedProperties(pBoilerMPa, t3C);
    const state3 = {
      state: 3,
      p: pBoilerKPa,
      pMPa: pBoilerMPa,
      tC: t3C,
      tK: t3C + 273.15,
      h: steam3.h,
      s: steam3.s,
      v: steam3.v,
      x: 1.0,
      phase: 'Superheated steam',
      description: 'Boiler outlet / Turbine inlet'
    };

    // State 4: Turbine exit (isentropic expansion: s4 = s3 at pCond)
    const s4 = state3.s;
    let h4, v4, x4, phase4, t4C;

    if (s4 < satCond.s_f) {
      // Subcooled liquid (rare)
      phase4 = 'Compressed liquid';
      x4 = 0;
      h4 = satCond.h_f;
      v4 = satCond.v_f;
      t4C = satCond.tC;
    } else if (s4 <= satCond.s_g) {
      // Two-phase wet mixture
      phase4 = 'Wet mixture';
      x4 = (s4 - satCond.s_f) / satCond.s_fg;
      h4 = satCond.h_f + x4 * satCond.h_fg;
      v4 = satCond.v_f + x4 * satCond.v_fg;
      t4C = satCond.tC;
    } else {
      // Superheated at condenser pressure
      phase4 = 'Superheated steam';
      x4 = 1.0;
      const st4 = getSteamProperties(pCondMPa, s4, 'PS');
      h4 = st4.enthalpy;
      v4 = st4.specificVolume;
      t4C = st4.temperature - 273.15;
    }

    const state4 = {
      state: 4,
      p: pCondKPa,
      pMPa: pCondMPa,
      tC: t4C,
      tK: t4C + 273.15,
      h: h4,
      s: s4,
      v: v4,
      x: x4,
      phase: phase4,
      description: 'Turbine outlet / Condenser inlet'
    };

    // Energy calculations
    const turbine = calculateTurbine(state3, state4);
    const wt = turbine.wt;
    const wNet = wt - wp;
    const qIn = state3.h - state2.h;
    const qOut = state4.h - state1.h;
    const etaTh = calculateThermalEfficiency(wNet, qIn);
    const bwr = (wp / wt) * 100; // Back work ratio (%)

    // Net power
    const power = calculateNetPower(mDot, wNet);

    return {
      isValid: true,
      inputs: { pBoilerMPa, pBoilerKPa, pCondKPa, pCondMPa, t3C, mDot },
      satCond,
      satBoiler,
      state1,
      state2,
      state3,
      state4,
      states: [state1, state2, state3, state4],
      wp,
      wt,
      wNet,
      qIn,
      qOut,
      etaTh,
      bwr,
      netPowerKW: power.netPowerKW,
      netPowerMW: power.netPowerMW
    };
  } catch (err) {
    return {
      isValid: false,
      errors: { general: err.message || 'Error evaluating steam properties.' }
    };
  }
}

/**
 * Calculates comparison for different boiler pressures (e.g. 3, 5, 6 MPa).
 */
export function calculateRankineComparison(inputs, pressures = [3, 5, 6]) {
  const rows = [];
  for (const p of pressures) {
    const res = calculateRankineCycle({ ...inputs, pBoilerMPa: p });
    if (res.isValid) {
      rows.push({
        pBoilerMPa: p,
        pBoilerKPa: p * 1000,
        tSatBoiler: res.satBoiler.tC,
        wt: res.wt,
        wp: res.wp,
        wNet: res.wNet,
        qIn: res.qIn,
        etaTh: res.etaTh,
        etaThPercent: res.etaTh * 100,
        netPowerMW: res.netPowerMW,
        netPowerKW: res.netPowerKW,
        x4: res.state4.x,
        x4Percent: res.state4.x * 100,
        h3: res.state3.h,
        s3: res.state3.s,
        h4: res.state4.h
      });
    }
  }

  // Generate automated commentary
  let comment = '';
  if (rows.length >= 2) {
    const first = rows[0]; // 3 MPa
    const mid = rows.find(r => r.pBoilerMPa === 5) || rows[1];
    const last = rows[rows.length - 1]; // 6 MPa

    const etaGain = last.etaThPercent - first.etaThPercent;
    const powerGain = last.netPowerMW - first.netPowerMW;
    const x4Drop = (first.x4 - last.x4) * 100;
    const wpIncrease = last.wp - first.wp;

    comment = `As boiler pressure is increased from ${first.pBoilerMPa} MPa to ${mid ? mid.pBoilerMPa + ' MPa and ' : ''}${last.pBoilerMPa} MPa while keeping turbine inlet temperature constant at ${inputs.t3C || 300} °C:
1. Thermal efficiency (η_th) increases monotonically from ${first.etaThPercent.toFixed(2)}% (at ${first.pBoilerMPa} MPa) to ${mid ? mid.etaThPercent.toFixed(2) + '% (at 5 MPa) and ' : ''}${last.etaThPercent.toFixed(2)}% (at ${last.pBoilerMPa} MPa), an absolute improvement of +${etaGain.toFixed(2)} percentage points. This is because higher boiler pressure increases the average temperature at which heat is added (T_in,avg).
2. Net power output increases from ${first.netPowerMW.toFixed(2)} MW to ${last.netPowerMW.toFixed(2)} MW (a net gain of +${powerGain.toFixed(2)} MW or +${((powerGain / first.netPowerMW) * 100).toFixed(1)}%) at constant mass flow rate (${inputs.mDot || 35} kg/s).
3. Pump work increases slightly from ${first.wp.toFixed(2)} kJ/kg to ${last.wp.toFixed(2)} kJ/kg (+${wpIncrease.toFixed(2)} kJ/kg), but remains very small compared to the turbine output (back work ratio < 0.8% across all cases).
4. Steam quality at turbine exit (x₄) decreases significantly from ${first.x4Percent.toFixed(1)}% down to ${last.x4Percent.toFixed(1)}% (moisture content increases from ${(100 - first.x4Percent).toFixed(1)}% to ${(100 - last.x4Percent).toFixed(1)}%).
   Engineering Implication: Higher boiler pressure without reheat shifts the turbine expansion line to the left into the two-phase dome, resulting in wetter steam at the turbine exhaust. Because moisture content exceeds 10–12% (dryness fraction drops below 88–90%), this would cause excessive turbine blade erosion and reduced isentropic stage efficiency in practical power plants, demonstrating why modern high-pressure steam plants employ steam superheat and reheat.`;
  }

  return {
    rows,
    comment
  };
}
