/**
 * Steam property engine powered by IAPWS-IF97 (via verified iapws-if97 formulation).
 * Computes thermodynamic properties of water and steam in the browser.
 * Provides saturation lines, superheated steam, pump states, and T-s diagram paths.
 */

import { solvePT, solvePx, solvePS } from 'iapws-if97';

export const IF97_LIMITS = {
  minPressureMPa: 0.000611657, // Triple point pressure (0.611657 kPa)
  maxPressureMPa: 100.0,        // Upper limit of IF97 regions 1 & 2
  minTemperatureC: 0.01,        // Triple point temperature
  maxTemperatureC: 800.0,       // IF97 standard upper temperature
  criticalPressureMPa: 22.064,  // Critical pressure
  criticalTemperatureC: 373.946 // Critical temperature
};

/**
 * Validates if the given pressure and temperature lie within reliable IF97 limits.
 */
export function validateStateRange(pMPa, tC) {
  if (pMPa === undefined || pMPa === null || isNaN(pMPa) || pMPa <= 0) {
    return { isValid: false, message: 'Pressure must be a positive number.' };
  }
  if (pMPa < IF97_LIMITS.minPressureMPa || pMPa > IF97_LIMITS.maxPressureMPa) {
    return {
      isValid: false,
      message: `Pressure (${(pMPa * 1000).toFixed(1)} kPa) is outside the IAPWS-IF97 data range (0.612 kPa to 100 MPa).`
    };
  }
  if (tC !== undefined && tC !== null && !isNaN(tC)) {
    if (tC < IF97_LIMITS.minTemperatureC || tC > IF97_LIMITS.maxTemperatureC) {
      return {
        isValid: false,
        message: `Temperature (${tC.toFixed(1)} °C) is outside the IAPWS-IF97 range (0.01 °C to 800 °C).`
      };
    }
  }
  return { isValid: true };
}

/**
 * Looks up saturated liquid and vapor properties at a given pressure in MPa.
 */
export function getSaturatedPropertiesByPressure(pMPa) {
  const rangeCheck = validateStateRange(pMPa);
  if (!rangeCheck.isValid) {
    throw new Error(rangeCheck.message);
  }

  if (pMPa >= IF97_LIMITS.criticalPressureMPa) {
    throw new Error(`Pressure ${(pMPa).toFixed(3)} MPa exceeds critical pressure (22.064 MPa).`);
  }

  // Saturated liquid (x = 0)
  const liq = solvePx(pMPa, 0);
  // Saturated vapor (x = 1)
  const vap = solvePx(pMPa, 1);

  const tK = liq.temperature;
  const tC = tK - 273.15;

  return {
    pMPa,
    pKPa: pMPa * 1000,
    tK,
    tC,
    // Liquid properties (f)
    h_f: liq.enthalpy,
    s_f: liq.entropy,
    v_f: liq.specificVolume,
    u_f: liq.internalEnergy,
    cp_f: liq.cp,
    // Vapor properties (g)
    h_g: vap.enthalpy,
    s_g: vap.entropy,
    v_g: vap.specificVolume,
    u_g: vap.internalEnergy,
    cp_g: vap.cp,
    // Evaporation increments (fg)
    h_fg: vap.enthalpy - liq.enthalpy,
    s_fg: vap.entropy - liq.entropy,
    v_fg: vap.specificVolume - liq.specificVolume
  };
}

/**
 * Looks up superheated steam properties at a given pressure (MPa) and temperature (°C).
 */
export function getSuperheatedProperties(pMPa, tC) {
  const rangeCheck = validateStateRange(pMPa, tC);
  if (!rangeCheck.isValid) {
    throw new Error(rangeCheck.message);
  }

  const tK = tC + 273.15;
  const state = solvePT(pMPa, tK);

  return {
    pMPa,
    pKPa: pMPa * 1000,
    tK,
    tC,
    h: state.enthalpy,
    s: state.entropy,
    v: state.specificVolume,
    u: state.internalEnergy,
    cp: state.cp,
    cv: state.cv,
    phase: 'superheated'
  };
}

/**
 * General steam property lookup function as required by specification.
 */
export function getSteamProperties(pMPa, param2, mode = 'PT') {
  if (mode === 'Px') {
    return solvePx(pMPa, param2);
  } else if (mode === 'PS') {
    return solvePS(pMPa, param2);
  } else {
    // Default to PT
    const tC = param2;
    return getSuperheatedProperties(pMPa, tC);
  }
}

/**
 * Pre-computes saturation dome coordinates (s, T) for plotting in Recharts.
 * Yields ~75 points from near triple point up to critical point and down the vapor line.
 */
let cachedDome = null;

export function getSaturationDomePoints(numSamplePressures = 70) {
  if (cachedDome) return cachedDome;

  const points = [];
  const minP = 0.001; // 1 kPa (approx 7 °C)
  const maxP = 22.0;  // 22 MPa (near critical 22.064 MPa)

  // Logarithmic spacing of pressures for smooth dome curvature
  const logMin = Math.log10(minP);
  const logMax = Math.log10(maxP);
  const step = (logMax - logMin) / (numSamplePressures - 1);

  const liquidBranch = [];
  const vaporBranch = [];

  for (let i = 0; i < numSamplePressures; i++) {
    const p = Math.pow(10, logMin + i * step);
    try {
      const liq = solvePx(p, 0);
      const vap = solvePx(p, 1);
      const tC = liq.temperature - 273.15;

      liquidBranch.push({
        s: Number(liq.entropy.toFixed(4)),
        tC: Number(tC.toFixed(2)),
        type: 'liquid',
        p: Number(p.toFixed(4))
      });

      vaporBranch.push({
        s: Number(vap.entropy.toFixed(4)),
        tC: Number(tC.toFixed(2)),
        type: 'vapor',
        p: Number(p.toFixed(4))
      });
    } catch {
      // Near boundary edge
    }
  }

  // Add critical point at apex
  const critPoint = {
    s: 4.412,
    tC: 373.95,
    type: 'critical',
    p: 22.064
  };

  // Combine: liquid branch (bottom to top), critical point, vapor branch (top to bottom)
  cachedDome = [
    ...liquidBranch,
    critPoint,
    ...vaporBranch.reverse()
  ];

  return cachedDome;
}

/**
 * Generates isobar curve points on T-s diagram for liquid heating and superheating.
 */
export function getRankineCycleTsPoints(cycleResult, numSteps = 25) {
  if (!cycleResult || !cycleResult.isValid) return [];
  const { state1, state2, state3, state4, pBoilerMPa, pCondMPa } = cycleResult;

  const points = [];

  // State 1: Saturated liquid at condenser pressure
  points.push({
    s: state1.s,
    tC: state1.tC,
    label: '1',
    description: '1: Condenser outlet / Pump inlet (Sat. liquid)'
  });

  // State 2: Compressed liquid at boiler pressure (pump exit)
  points.push({
    s: state2.s,
    tC: state2.tC,
    label: '2',
    description: '2: Pump outlet / Boiler inlet'
  });

  // Process 2 -> 2' (sensible heating of liquid in boiler at pBoiler up to T_sat)
  const satBoiler = cycleResult.satBoiler;
  const t2 = state2.tC;
  const tSatBoiler = satBoiler.tC;
  const s2 = state2.s;
  const sSatLiq = satBoiler.s_f;

  for (let i = 1; i < numSteps; i++) {
    const frac = i / numSteps;
    const t = t2 + frac * (tSatBoiler - t2);
    // entropy rises logarithmically s = s2 + c_p * ln(T/T2)
    const s = s2 + frac * (sSatLiq - s2);
    points.push({ s, tC: t, process: 'Sensible heating' });
  }

  // State 2': Saturated liquid at boiler pressure
  points.push({
    s: sSatLiq,
    tC: tSatBoiler,
    label: "2'",
    description: "2': Saturated liquid at boiler pressure"
  });

  // Process 2' -> 2'' (isothermal boiling / evaporation across saturation dome)
  const sSatVap = satBoiler.s_g;
  points.push({
    s: sSatVap,
    tC: tSatBoiler,
    label: "2''",
    description: "2'': Saturated vapor at boiler pressure"
  });

  // Process 2'' -> 3 (superheating in boiler at pBoiler up to T3)
  const t3 = state3.tC;
  const s3 = state3.s;
  for (let i = 1; i < numSteps; i++) {
    const frac = i / numSteps;
    const t = tSatBoiler + frac * (t3 - tSatBoiler);
    const s = sSatVap + frac * (s3 - sSatVap);
    points.push({ s, tC: t, process: 'Superheating' });
  }

  // State 3: Superheated steam at turbine inlet
  points.push({
    s: state3.s,
    tC: state3.tC,
    label: '3',
    description: '3: Turbine inlet (Superheated steam)'
  });

  // Process 3 -> 4: Isentropic expansion in turbine (vertical line on T-s diagram: s4 = s3)
  // Drops from T3 down to T4 (which is T_sat at pCond)
  points.push({
    s: state4.s,
    tC: state4.tC,
    label: '4',
    description: `4: Turbine exit (x = ${(state4.x * 100).toFixed(1)}%)`
  });

  // Process 4 -> 1: Condensation at constant condenser pressure and temperature
  // Horizontal line from s4 back to s1
  points.push({
    s: state1.s,
    tC: state1.tC,
    process: 'Condensation'
  });

  return points;
}
