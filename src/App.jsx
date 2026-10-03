import React, { useState, useMemo } from 'react';
import './App.css';
import MathView from './components/Math.jsx';
import StepBlock from './components/StepBlock.jsx';
import StateTable from './components/StateTable.jsx';
import NumberInput from './components/NumberInput.jsx';
import PvDiagram from './components/charts/PvDiagram.jsx';
import DieselParamChart from './components/charts/DieselParamChart.jsx';
import RankineTsDiagram from './components/charts/RankineTsDiagram.jsx';
import RankineParamChart from './components/charts/RankineParamChart.jsx';
import {
  calculateDieselCycle,
  calculateDieselComparison,
  validateDieselInputs
} from './calc/diesel.js';
import {
  calculateRankineCycle,
  calculateRankineComparison,
  validateRankineInputs
} from './calc/rankine.js';
import { formatNum, formatDec, formatPercent } from './calc/format.js';
import { DIESEL_CODE_TEMPLATES, RANKINE_CODE_TEMPLATES } from './calc/codeTemplates.js';

export default function App() {
  // --------------------------------------------------------------------------
  // QUESTION 1 STATE: DIESEL CYCLE
  // --------------------------------------------------------------------------
  const [dieselInputs, setDieselInputs] = useState({
    r: 20,
    p1: 95,
    t1C: 20,
    t3: 2500,
    cp: 1.005,
    cv: 0.718,
    R: 0.287,
    mDot: 95
  });

  const [dieselSolOpen, setDieselSolOpen] = useState(true);
  const [dieselLang, setDieselLang] = useState('python');

  const dieselValidation = useMemo(
    () => validateDieselInputs(dieselInputs),
    [dieselInputs]
  );

  const dieselResult = useMemo(() => {
    if (!dieselValidation.isValid) return null;
    return calculateDieselCycle(dieselInputs);
  }, [dieselInputs, dieselValidation]);

  const dieselComparison = useMemo(() => {
    return calculateDieselComparison(dieselInputs, [20, 19, 18, 17, 16, 15]);
  }, [dieselInputs]);

  // --------------------------------------------------------------------------
  // QUESTION 2 STATE: RANKINE CYCLE
  // --------------------------------------------------------------------------
  const [rankineInputs, setRankineInputs] = useState({
    pBoilerMPa: 3,
    pCondKPa: 50,
    t3C: 300,
    mDot: 35
  });

  const [rankineSolOpen, setRankineSolOpen] = useState(true);
  const [rankineLang, setRankineLang] = useState('python');

  const rankineValidation = useMemo(
    () => validateRankineInputs(rankineInputs),
    [rankineInputs]
  );

  const rankineResult = useMemo(() => {
    if (!rankineValidation.isValid) return null;
    return calculateRankineCycle(rankineInputs);
  }, [rankineInputs, rankineValidation]);

  const rankineComparison = useMemo(() => {
    return calculateRankineComparison(rankineInputs, [3, 5, 6]);
  }, [rankineInputs]);

  // --------------------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATIONS
  // --------------------------------------------------------------------------
  const dieselStateColumns = [
    { header: 'State', accessor: 'state', align: 'left', isMath: false },
    { mathHeader: 'P', unit: 'kPa', accessor: 'p', decimals: 1 },
    { mathHeader: 'T', unit: 'K', accessor: 'tK', decimals: 1 },
    { mathHeader: 'T', unit: '°C', accessor: 'tC', decimals: 1 },
    { mathHeader: 'v', unit: 'm³/kg', accessor: 'v', sigFigs: 4 },
    { header: 'Description', accessor: 'description', align: 'left' }
  ];

  const dieselCompColumns = [
    { mathHeader: 'r', accessor: 'r', align: 'left' },
    { mathHeader: 'T_2', unit: 'K', accessor: 't2', decimals: 1 },
    { mathHeader: 'P_2', unit: 'kPa', accessor: 'p2', decimals: 0 },
    { mathHeader: 'r_c', accessor: 'rc', decimals: 3 },
    { mathHeader: 'q_{\\text{in}}', unit: 'kJ/kg', accessor: 'qIn', decimals: 1 },
    { mathHeader: 'q_{\\text{out}}', unit: 'kJ/kg', accessor: 'qOut', decimals: 1 },
    { mathHeader: 'w_{\\text{net}}', unit: 'kJ/kg', accessor: 'wNet', decimals: 1 },
    {
      mathHeader: '\\eta_{\\text{th}}',
      unit: '%',
      accessor: 'etaThPercent',
      decimals: 2
    },
    { mathHeader: '\\text{MEP}', unit: 'kPa', accessor: 'mep', decimals: 1 }
  ];

  const rankineStateColumns = [
    { header: 'State', accessor: 'state', align: 'left' },
    { mathHeader: 'P', unit: 'kPa', accessor: 'p', decimals: 1 },
    { mathHeader: 'T', unit: '°C', accessor: 'tC', decimals: 1 },
    { mathHeader: 'h', unit: 'kJ/kg', accessor: 'h', decimals: 1 },
    { mathHeader: 's', unit: 'kJ/kg·K', accessor: 's', decimals: 4 },
    { mathHeader: 'v', unit: 'm³/kg', accessor: 'v', sigFigs: 4 },
    {
      mathHeader: 'x',
      accessor: 'x',
      formatter: (val, row) => (row.phase === 'Wet mixture' ? formatDec(val, 4) : '—')
    },
    { header: 'Phase', accessor: 'phase', align: 'left' }
  ];

  const rankineCompColumns = [
    { mathHeader: 'P_{\\text{boiler}}', unit: 'MPa', accessor: 'pBoilerMPa', align: 'left' },
    { mathHeader: 'T_{\\text{sat}}', unit: '°C', accessor: 'tSatBoiler', decimals: 2 },
    { mathHeader: 'w_t', unit: 'kJ/kg', accessor: 'wt', decimals: 1 },
    { mathHeader: 'w_p', unit: 'kJ/kg', accessor: 'wp', decimals: 2 },
    { mathHeader: 'w_{\\text{net}}', unit: 'kJ/kg', accessor: 'wNet', decimals: 1 },
    { mathHeader: '\\eta_{\\text{th}}', unit: '%', accessor: 'etaThPercent', decimals: 2 },
    { mathHeader: 'P_{\\text{net}}', unit: 'MW', accessor: 'netPowerMW', decimals: 2 },
    { mathHeader: 'x_4', unit: '%', accessor: 'x4Percent', decimals: 1 }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1 className="course-title">BAMEE203 – Thermodynamics and Thermal Systems</h1>
        <h2 className="assignment-subtitle">Assignment II – SET A</h2>
        <div className="student-info">Student: 25BME1038 – NILA S</div>
      </header>

      {/* ================================================================== */}
      {/* QUESTION 1: AIR-STANDARD DIESEL CYCLE */}
      {/* ================================================================== */}
      <section className="question-section">
        <h2 className="question-title">Question 1 – Ideal Diesel Cycle</h2>

        <h3 className="section-heading">Question</h3>
        <div className="question-box">
          <p>
            An ideal diesel engine has a compression ratio of 20 and uses air as the working fluid.
            The state of air at the beginning of the compression process is 95 kPa and 20°C. If the
            maximum temperature in the cycle is not to exceed a certain value (refer the column) K,
            determine (a) the thermal efficiency and (b) the mean effective pressure. Assume
            constant specific heats for air at room temperature.
          </p>
          <p>
            Develop a Software program for the above, if you vary the compression ratio as 19, 18, 17,
            16 and 15, what are the implications on the above. Comment. Use PYTHON, MATLAB, C, C++.
            Plot the necessary graphs.
          </p>
        </div>

        <h3 className="section-heading">Answer</h3>

        <div className="given-required-grid">
          <div className="given-box">
            <h4>Given Parameters</h4>
            <ul>
              <li>
                Compression ratio: <MathView math="r = 20" />
              </li>
              <li>
                Initial pressure: <MathView math="P_1 = 95\text{ kPa}" />
              </li>
              <li>
                Initial temperature: <MathView math="T_1 = 20^\circ\text{C} = 293.15\text{ K}" />
              </li>
              <li>
                Peak cycle temperature: <MathView math="T_3 = 2500\text{ K}" />
              </li>
              <li>
                Specific heats of air: <MathView math="c_p = 1.005\text{ kJ/kg}\cdot\text{K}" />,{' '}
                <MathView math="c_v = 0.718\text{ kJ/kg}\cdot\text{K}" />
              </li>
              <li>
                Gas constant: <MathView math="R = 0.287\text{ kJ/kg}\cdot\text{K}" />,{' '}
                <MathView math="\gamma = c_p/c_v \approx 1.40" />
              </li>
              <li>
                Air mass flow rate: <MathView math="\dot{m} = 95\text{ kg/s}" />
              </li>
            </ul>
          </div>

          <div className="required-box">
            <h4>Required Outputs</h4>
            <ul>
              <li>
                (a) Thermal efficiency of the cycle: <MathView math="\eta_{\text{th}}" />
              </li>
              <li>
                (b) Mean effective pressure: <MathView math="\text{MEP}" />
              </li>
              <li>
                Complete state table for States 1, 2, 3, and 4
              </li>
              <li>
                Implications of varying compression ratio <MathView math="r \in \{20, 19, 18, 17, 16, 15\}" />
              </li>
              <li>
                Thermodynamic <MathView math="P\text{--}v" /> diagram & parametric comparison curves
              </li>
            </ul>
          </div>
        </div>

        {/* Input Parameters Section */}
        <h3 className="section-heading">Cycle Inputs</h3>
        <div className="input-grid">
          <NumberInput
            id="q1-r"
            label="Compression ratio (r)"
            value={dieselInputs.r}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, r: val }))}
            min={1.01}
            max={50}
            step={0.5}
            quickValues={[20, 19, 18, 17, 16, 15]}
            error={dieselValidation.errors.r}
          />
          <NumberInput
            id="q1-p1"
            label="Initial Pressure (P₁)"
            unit="kPa"
            value={dieselInputs.p1}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, p1: val }))}
            min={1}
            step={1}
            quickValues={[95, 100, 101.3]}
            error={dieselValidation.errors.p1}
          />
          <NumberInput
            id="q1-t1"
            label="Initial Temperature (T₁)"
            unit="°C"
            value={dieselInputs.t1C}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, t1C: val }))}
            min={-50}
            max={200}
            step={1}
            quickValues={[20, 25, 15]}
            error={dieselValidation.errors.t1C}
          />
          <NumberInput
            id="q1-t3"
            label="Maximum Temperature (T₃)"
            unit="K"
            value={dieselInputs.t3}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, t3: val }))}
            min={500}
            max={4000}
            step={50}
            quickValues={[2500, 2200, 2800]}
            error={dieselValidation.errors.t3}
          />
          <NumberInput
            id="q1-cp"
            label="Specific Heat (cp)"
            unit="kJ/kg·K"
            value={dieselInputs.cp}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, cp: val }))}
            step={0.001}
            quickValues={[1.005]}
            error={dieselValidation.errors.cp}
          />
          <NumberInput
            id="q1-cv"
            label="Specific Heat (cv)"
            unit="kJ/kg·K"
            value={dieselInputs.cv}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, cv: val }))}
            step={0.001}
            quickValues={[0.718]}
            error={dieselValidation.errors.cv}
          />
          <NumberInput
            id="q1-R"
            label="Gas Constant (R)"
            unit="kJ/kg·K"
            value={dieselInputs.R}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, R: val }))}
            step={0.001}
            quickValues={[0.287]}
            error={dieselValidation.errors.R}
          />
          <NumberInput
            id="q1-mdot"
            label="Mass Flow Rate (ṁ)"
            unit="kg/s"
            value={dieselInputs.mDot}
            onChange={(val) => setDieselInputs((prev) => ({ ...prev, mDot: val }))}
            step={1}
            quickValues={[95]}
            error={dieselValidation.errors.mDot}
          />
        </div>

        {/* Validation Error Banner */}
        {!dieselValidation.isValid && (
          <div className="error-banner">
            <strong>Input Error: </strong>
            {Object.values(dieselValidation.errors)[0]}
          </div>
        )}

        {/* Solution Details (Rendered if valid) */}
        {dieselResult && (
          <>
            <h3 className="section-heading">State Properties</h3>
            <StateTable
              columns={dieselStateColumns}
              data={dieselResult.states}
              caption="Air-Standard Diesel Cycle State Table (computed dynamically)"
            />

            {/* Collapsible Step-by-Step Solution */}
            <div className="solution-collapsible">
              <div
                className="collapsible-header"
                onClick={() => setDieselSolOpen((prev) => !prev)}
              >
                <span className="collapsible-title">
                  Step-by-Step Mathematical Derivation (Question 1)
                </span>
                <button type="button" className="collapsible-toggle-btn">
                  {dieselSolOpen ? '▲ Hide Calculation' : '▼ Show Calculation'}
                </button>
              </div>

              {dieselSolOpen && (
                <div className="collapsible-content">
                  {/* Step 1 */}
                  <StepBlock
                    stepNumber={1}
                    title="Specific volume at State 1 (BDC)"
                    explanation="Air behaves as an ideal gas at the beginning of compression, so its specific volume is determined by the ideal gas equation of state."
                    symbolicFormula="v_1 = \frac{R \cdot T_1}{P_1}"
                    substitutedFormula={`v_1 = \\frac{${dieselResult.inputs.R}\\text{ kJ/kg}\\cdot\\text{K} \\times ${formatDec(dieselResult.inputs.t1K, 2)}\\text{ K}}{${dieselResult.inputs.p1}\\text{ kPa}}`}
                    resultFormula={`\\mathbf{v_1 = ${formatNum(dieselResult.states[0].v, 4)}\\text{ m}^3/\\text{kg}}`}
                  />

                  {/* Step 2 */}
                  <StepBlock
                    stepNumber={2}
                    title="Specific volume, temperature, and pressure at State 2 (TDC)"
                    explanation="Process 1→2 is isentropic compression, so volume is reduced by the compression ratio r, while temperature and pressure rise according to the isentropic relations."
                    symbolicFormula="v_2 = \frac{v_1}{r}, \quad T_2 = T_1 \cdot r^{\gamma - 1}, \quad P_2 = P_1 \cdot r^\gamma"
                    substitutedFormula={`v_2 = \\frac{${formatNum(dieselResult.states[0].v, 4)}}{${dieselResult.inputs.r}} = ${formatNum(dieselResult.states[1].v, 4)}\\text{ m}^3/\\text{kg}; \\quad T_2 = ${formatDec(dieselResult.inputs.t1K, 2)} \\times ${dieselResult.inputs.r}^{${formatDec(dieselResult.inputs.gamma - 1, 4)}}; \\quad P_2 = ${dieselResult.inputs.p1} \\times ${dieselResult.inputs.r}^{${formatDec(dieselResult.inputs.gamma, 4)}}`}
                    resultFormula={`\\mathbf{v_2 = ${formatNum(dieselResult.states[1].v, 4)}\\text{ m}^3/\\text{kg}}, \\quad \\mathbf{T_2 = ${formatDec(dieselResult.states[1].tK, 2)}\\text{ K}}, \\quad \\mathbf{P_2 = ${formatDec(dieselResult.states[1].p, 1)}\\text{ kPa}}`}
                    note={`Specific heat ratio \\gamma = c_p/c_v = ${dieselResult.inputs.cp}/${dieselResult.inputs.cv} = ${formatDec(dieselResult.inputs.gamma, 4)}.`}
                  />

                  {/* Step 3 */}
                  <StepBlock
                    stepNumber={3}
                    title="Cutoff ratio and specific volume at State 3"
                    explanation="Process 2→3 is constant-pressure heat addition (fuel injection), so P₃ = P₂. The cut-off ratio r_c describes the cylinder volume expansion during combustion."
                    symbolicFormula="P_3 = P_2, \quad r_c = \frac{v_3}{v_2} = \frac{T_3}{T_2}, \quad v_3 = \frac{R \cdot T_3}{P_3} = v_2 \cdot r_c"
                    substitutedFormula={`r_c = \\frac{${dieselResult.inputs.t3}\\text{ K}}{${formatDec(dieselResult.states[1].tK, 2)}\\text{ K}}; \\quad v_3 = ${formatNum(dieselResult.states[1].v, 4)}\\text{ m}^3/\\text{kg} \\times ${formatDec(dieselResult.rc, 4)}`}
                    resultFormula={`\\mathbf{r_c = ${formatDec(dieselResult.rc, 4)}}, \\quad \\mathbf{P_3 = ${formatDec(dieselResult.states[2].p, 1)}\\text{ kPa}}, \\quad \\mathbf{v_3 = ${formatNum(dieselResult.states[2].v, 4)}\\text{ m}^3/\\text{kg}}`}
                  />

                  {/* Step 4 */}
                  <StepBlock
                    stepNumber={4}
                    title="Temperature and pressure at State 4 (End of expansion)"
                    explanation="Process 3→4 is isentropic expansion until the piston reaches BDC where v₄ = v₁. The expansion ratio is r_e = v₄/v₃ = r/r_c."
                    symbolicFormula="v_4 = v_1, \quad T_4 = T_3 \cdot \left(\frac{r_c}{r}\right)^{\gamma - 1}, \quad P_4 = P_3 \cdot \left(\frac{v_3}{v_4}\right)^\gamma"
                    substitutedFormula={`T_4 = ${dieselResult.inputs.t3}\\text{ K} \\times \\left(\\frac{${formatDec(dieselResult.rc, 4)}}{${dieselResult.inputs.r}}\\right)^{${formatDec(dieselResult.inputs.gamma - 1, 4)}}; \\quad P_4 = ${formatDec(dieselResult.states[2].p, 1)} \\times \\left(\\frac{${formatNum(dieselResult.states[2].v, 4)}}{${formatNum(dieselResult.states[0].v, 4)}}\\right)^{${formatDec(dieselResult.inputs.gamma, 4)}}`}
                    resultFormula={`\\mathbf{T_4 = ${formatDec(dieselResult.states[3].tK, 2)}\\text{ K}}, \\quad \\mathbf{P_4 = ${formatDec(dieselResult.states[3].p, 1)}\\text{ kPa}}, \\quad \\mathbf{v_4 = ${formatNum(dieselResult.states[3].v, 4)}\\text{ m}^3/\\text{kg}}`}
                  />

                  {/* Step 5 */}
                  <StepBlock
                    stepNumber={5}
                    title="Heat added to the cycle (q_in)"
                    explanation="Heat is supplied at constant pressure during fuel combustion between State 2 and State 3."
                    symbolicFormula="q_{\\text{in}} = c_p (T_3 - T_2)"
                    substitutedFormula={`q_{\\text{in}} = ${dieselResult.inputs.cp}\\text{ kJ/kg}\\cdot\\text{K} \\times (${dieselResult.inputs.t3} - ${formatDec(dieselResult.states[1].tK, 2)})\\text{ K}`}
                    resultFormula={`\\mathbf{q_{\\text{in}} = ${formatDec(dieselResult.qIn, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 6 */}
                  <StepBlock
                    stepNumber={6}
                    title="Heat rejected from the cycle (q_out)"
                    explanation="Heat is rejected at constant volume during blowdown between State 4 and State 1."
                    symbolicFormula="q_{\\text{out}} = c_v (T_4 - T_1)"
                    substitutedFormula={`q_{\\text{out}} = ${dieselResult.inputs.cv}\\text{ kJ/kg}\\cdot\\text{K} \\times (${formatDec(dieselResult.states[3].tK, 2)} - ${formatDec(dieselResult.inputs.t1K, 2)})\\text{ K}`}
                    resultFormula={`\\mathbf{q_{\\text{out}} = ${formatDec(dieselResult.qOut, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 7 */}
                  <StepBlock
                    stepNumber={7}
                    title="Net specific work output (w_net)"
                    explanation="By the first law of thermodynamics for a cyclic heat engine, net work output equals net heat added."
                    symbolicFormula="w_{\\text{net}} = q_{\\text{in}} - q_{\\text{out}}"
                    substitutedFormula={`w_{\\text{net}} = ${formatDec(dieselResult.qIn, 2)}\\text{ kJ/kg} - ${formatDec(dieselResult.qOut, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{w_{\\text{net}} = ${formatDec(dieselResult.wNet, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 8 */}
                  <StepBlock
                    stepNumber={8}
                    title="Thermal efficiency of the cycle (η_th)"
                    explanation="Thermal efficiency represents the fraction of heat supplied that is converted into net mechanical work."
                    symbolicFormula="\eta_{\\text{th}} = \frac{w_{\\text{net}}}{q_{\\text{in}}} = 1 - \frac{1}{r^{\\gamma - 1}} \cdot \left[\frac{r_c^\\gamma - 1}{\\gamma (r_c - 1)}\right]"
                    substitutedFormula={`\\eta_{\\text{th}} = \\frac{${formatDec(dieselResult.wNet, 2)}\\text{ kJ/kg}}{${formatDec(dieselResult.qIn, 2)}\\text{ kJ/kg}} = 1 - \\frac{1}{${dieselResult.inputs.r}^{${formatDec(dieselResult.inputs.gamma - 1, 4)}}} \\cdot \\left[\\frac{${formatDec(dieselResult.rc, 4)}^{${formatDec(dieselResult.inputs.gamma, 4)}} - 1}{${formatDec(dieselResult.inputs.gamma, 4)} (${formatDec(dieselResult.rc, 4)} - 1)}\\right]`}
                    resultFormula={`\\mathbf{\\eta_{\\text{th}} = ${formatPercent(dieselResult.etaTh, 2)}} \\quad (\\text{Closed-form check: } ${formatPercent(dieselResult.etaThClosed, 2)})`}
                    note="Both the energy balance definition and the closed-form Diesel efficiency formula yield identical results."
                  />

                  {/* Step 9 */}
                  <StepBlock
                    stepNumber={9}
                    title="Mean effective pressure (MEP)"
                    explanation="Mean effective pressure is the fictitious constant pressure that, if acting on the piston during the power stroke, would produce the same net work."
                    symbolicFormula="\text{MEP} = \frac{w_{\\text{net}}}{v_1 - v_2}"
                    substitutedFormula={`\\text{MEP} = \\frac{${formatDec(dieselResult.wNet, 2)}\\text{ kJ/kg}}{(${formatNum(dieselResult.states[0].v, 4)} - ${formatNum(dieselResult.states[1].v, 4)})\\text{ m}^3/\\text{kg}}`}
                    resultFormula={`\\mathbf{\\text{MEP} = ${formatDec(dieselResult.mep, 2)}\\text{ kPa}}`}
                    note={`Displacement volume v₁ - v₂ = ${formatNum(dieselResult.displacementVolume, 4)} m³/kg.`}
                  />

                  {/* Step 10 */}
                  <StepBlock
                    stepNumber={10}
                    title="Total net power output (P_net)"
                    explanation="Total power output is the product of air mass flow rate and specific net work output."
                    symbolicFormula="P_{\\text{net}} = \dot{m} \cdot w_{\\text{net}}"
                    substitutedFormula={`P_{\\text{net}} = ${dieselResult.inputs.mDot}\\text{ kg/s} \\times ${formatDec(dieselResult.wNet, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{P_{\\text{net}} = ${formatDec(dieselResult.netPowerKW, 1)}\\text{ kW}} = \\mathbf{${formatDec(dieselResult.netPowerMW, 3)}\\text{ MW}}`}
                  />
                </div>
              )}
            </div>

            {/* Final Answer Box */}
            <div className="final-answer-box">
              <h3 className="final-answer-title">Final Answer (Question 1)</h3>
              <div className="final-answer-line">
                <strong>(a) Thermal efficiency of the cycle: </strong>
                <MathView math={`\\eta_{\\text{th}} = ${formatPercent(dieselResult.etaTh, 2)}`} />
              </div>
              <div className="final-answer-line">
                <strong>(b) Mean effective pressure: </strong>
                <MathView math={`\\text{MEP} = ${formatDec(dieselResult.mep, 2)}\\text{ kPa}`} />
              </div>
              <div className="final-answer-line">
                <small>
                  At <MathView math={`r = ${dieselResult.inputs.r}`} />, net work is{' '}
                  <MathView math={`w_{\\text{net}} = ${formatDec(dieselResult.wNet, 2)}\\text{ kJ/kg}`} />, and total net power output is{' '}
                  <MathView math={`P_{\\text{net}} = ${formatDec(dieselResult.netPowerMW, 2)}\\text{ MW}`} />.
                </small>
              </div>
            </div>

            {/* Graphs for Question 1 */}
            <h3 className="section-heading">Thermodynamic P–v Diagram</h3>
            <PvDiagram cycleResult={dieselResult} />

            {/* Parametric Study Section */}
            <h3 className="section-heading">Effect of Varying Compression Ratio (r = 20, 19, 18, 17, 16, 15)</h3>
            <StateTable
              columns={dieselCompColumns}
              data={dieselComparison.rows}
              caption="Parametric comparison across compression ratios r = 20 down to 15"
            />

            <DieselParamChart
              comparisonData={dieselComparison.rows}
              currentR={dieselResult.inputs.r}
              currentEtaTh={dieselResult.etaTh}
              currentMep={dieselResult.mep}
            />

            {/* Engineering Comment */}
            <h3 className="section-heading">Comment</h3>
            <div className="comment-box">
              <div className="comment-title">Thermodynamic Analysis & Engineering Implications</div>
              <p>{dieselComparison.comment}</p>
            </div>

            {/* Multi-language code reference */}
            <div className="code-section">
              <div className="code-header">
                <button
                  type="button"
                  className={`code-tab-btn ${dieselLang === 'python' ? 'active' : ''}`}
                  onClick={() => setDieselLang('python')}
                >
                  PYTHON
                </button>
                <button
                  type="button"
                  className={`code-tab-btn ${dieselLang === 'matlab' ? 'active' : ''}`}
                  onClick={() => setDieselLang('matlab')}
                >
                  MATLAB
                </button>
                <button
                  type="button"
                  className={`code-tab-btn ${dieselLang === 'c' ? 'active' : ''}`}
                  onClick={() => setDieselLang('c')}
                >
                  C
                </button>
                <button
                  type="button"
                  className={`code-tab-btn ${dieselLang === 'cpp' ? 'active' : ''}`}
                  onClick={() => setDieselLang('cpp')}
                >
                  C++
                </button>
              </div>
              <div className="code-content">
                <pre>{DIESEL_CODE_TEMPLATES[dieselLang]}</pre>
              </div>
            </div>
          </>
        )}
      </section>

      <hr className="question-divider" />

      {/* ================================================================== */}
      {/* QUESTION 2: SIMPLE IDEAL RANKINE CYCLE */}
      {/* ================================================================== */}
      <section className="question-section">
        <h2 className="question-title">Question 2 – Simple Ideal Rankine Cycle</h2>

        <h3 className="section-heading">Question</h3>
        <div className="question-box">
          <p>
            A steam power plant operates on a simple ideal Rankine cycle between the pressure limits
            of 3 MPa and 50 kPa. The temperature of the steam at the turbine inlet is 300°C, and the
            mass flow rate of steam through the cycle is 35 kg/s. Show the cycle on a T-s diagram
            with respect to saturation lines, and determine (a) the thermal efficiency of the cycle
            and (b) the net power output of the power plant.
          </p>
          <p>
            Develop a software program for the same, if the upper pressure limit is increased to 5
            MPa and 6 MPa respectively.
          </p>
        </div>

        <h3 className="section-heading">Answer</h3>

        <div className="given-required-grid">
          <div className="given-box">
            <h4>Given Parameters</h4>
            <ul>
              <li>
                Boiler upper pressure limit: <MathView math="P_{\text{boiler}} = 3\text{ MPa} = 3000\text{ kPa}" />
              </li>
              <li>
                Condenser lower pressure limit: <MathView math="P_{\text{cond}} = 50\text{ kPa} = 0.05\text{ MPa}" />
              </li>
              <li>
                Turbine inlet temperature: <MathView math="T_3 = 300^\circ\text{C}" />
              </li>
              <li>
                Steam mass flow rate: <MathView math="\dot{m} = 35\text{ kg/s}" />
              </li>
              <li>
                Steam formulation engine: IAPWS-IF97 standards
              </li>
            </ul>
          </div>

          <div className="required-box">
            <h4>Required Outputs</h4>
            <ul>
              <li>
                (a) Thermal efficiency of the cycle: <MathView math="\eta_{\text{th}}" />
              </li>
              <li>
                (b) Net power output of the plant: <MathView math="P_{\text{net}}\text{ (MW and kW)}" />
              </li>
              <li>
                Complete state table for States 1, 2, 3, and 4
              </li>
              <li>
                <MathView math="T\text{--}s" /> diagram plotted with respect to the saturation dome
              </li>
              <li>
                Parametric comparison when upper pressure is increased to 5 MPa and 6 MPa
              </li>
            </ul>
          </div>
        </div>

        {/* Rankine Inputs */}
        <h3 className="section-heading">Cycle Inputs</h3>
        <div className="input-grid">
          <NumberInput
            id="q2-pboiler"
            label="Boiler Pressure (P_boiler)"
            unit="MPa"
            value={rankineInputs.pBoilerMPa}
            onChange={(val) => setRankineInputs((prev) => ({ ...prev, pBoilerMPa: val }))}
            min={0.1}
            max={22.0}
            step={0.5}
            quickValues={[
              { label: '3 MPa', value: 3 },
              { label: '5 MPa', value: 5 },
              { label: '6 MPa', value: 6 }
            ]}
            error={rankineValidation.errors.pBoilerMPa}
          />

          <NumberInput
            id="q2-pcond"
            label="Condenser Pressure (P_cond)"
            unit="kPa"
            value={rankineInputs.pCondKPa}
            onChange={(val) => setRankineInputs((prev) => ({ ...prev, pCondKPa: val }))}
            min={1}
            max={500}
            step={5}
            quickValues={[
              { label: '50 kPa', value: 50 },
              { label: '10 kPa', value: 10 },
              { label: '100 kPa', value: 100 }
            ]}
            error={rankineValidation.errors.pCondKPa}
          />

          <NumberInput
            id="q2-t3"
            label="Turbine Inlet Temperature (T₃)"
            unit="°C"
            value={rankineInputs.t3C}
            onChange={(val) => setRankineInputs((prev) => ({ ...prev, t3C: val }))}
            min={100}
            max={800}
            step={10}
            quickValues={[
              { label: '300 °C', value: 300 },
              { label: '350 °C', value: 350 },
              { label: '400 °C', value: 400 }
            ]}
            error={rankineValidation.errors.t3C}
          />

          <NumberInput
            id="q2-mdot"
            label="Steam Mass Flow Rate (ṁ)"
            unit="kg/s"
            value={rankineInputs.mDot}
            onChange={(val) => setRankineInputs((prev) => ({ ...prev, mDot: val }))}
            min={0.1}
            max={500}
            step={1}
            quickValues={[
              { label: '35 kg/s', value: 35 },
              { label: '50 kg/s', value: 50 }
            ]}
            error={rankineValidation.errors.mDot}
          />
        </div>

        {/* Validation Error Banner */}
        {!rankineValidation.isValid && (
          <div className="error-banner">
            <strong>Input Error: </strong>
            {Object.values(rankineValidation.errors)[0]}
          </div>
        )}

        {/* Rankine Solution Results */}
        {rankineResult && (
          <>
            <h3 className="section-heading">State Properties</h3>
            <StateTable
              columns={rankineStateColumns}
              data={rankineResult.states}
              caption="Simple Ideal Rankine Cycle State Table (IAPWS-IF97 property lookups)"
            />

            {/* Collapsible Step-by-Step Solution */}
            <div className="solution-collapsible">
              <div
                className="collapsible-header"
                onClick={() => setRankineSolOpen((prev) => !prev)}
              >
                <span className="collapsible-title">
                  Step-by-Step Mathematical Derivation (Question 2)
                </span>
                <button type="button" className="collapsible-toggle-btn">
                  {rankineSolOpen ? '▲ Hide Calculation' : '▼ Show Calculation'}
                </button>
              </div>

              {rankineSolOpen && (
                <div className="collapsible-content">
                  {/* Step 1 */}
                  <StepBlock
                    stepNumber={1}
                    title="Properties of saturated liquid at condenser exit (State 1)"
                    explanation="The working fluid leaves the condenser as a saturated liquid at the condenser pressure. Properties are obtained from IAPWS-IF97 saturation tables."
                    symbolicFormula="h_1 = h_f(P_{\\text{cond}}), \\quad s_1 = s_f(P_{\\text{cond}}), \\quad v_1 = v_f(P_{\\text{cond}})"
                    substitutedFormula={`\\text{At } P_{\\text{cond}} = ${rankineResult.inputs.pCondKPa}\\text{ kPa}: \\quad T_{\\text{sat}} = ${formatDec(rankineResult.satCond.tC, 2)}^\\circ\\text{C}, \\quad h_f = ${formatDec(rankineResult.state1.h, 2)}\\text{ kJ/kg}, \\quad s_f = ${formatDec(rankineResult.state1.s, 4)}\\text{ kJ/kg}\\cdot\\text{K}, \\quad v_f = ${formatNum(rankineResult.state1.v, 5)}\\text{ m}^3/\\text{kg}`}
                    resultFormula={`\\mathbf{h_1 = ${formatDec(rankineResult.state1.h, 2)}\\text{ kJ/kg}}, \\quad \\mathbf{s_1 = ${formatDec(rankineResult.state1.s, 4)}\\text{ kJ/kg}\\cdot\\text{K}}, \\quad \\mathbf{v_1 = ${formatNum(rankineResult.state1.v, 5)}\\text{ m}^3/\\text{kg}}`}
                    note="Data source: IAPWS-IF97 formulation evaluated in browser."
                  />

                  {/* Step 2 */}
                  <StepBlock
                    stepNumber={2}
                    title="Pump work and enthalpy at boiler inlet (State 2)"
                    explanation="The feed pump compresses incompressible liquid water isentropically from condenser pressure to boiler pressure. Pump work is computed from specific volume and pressure differential."
                    symbolicFormula="w_p = v_1 (P_{\\text{boiler}} - P_{\\text{cond}}), \\quad h_2 = h_1 + w_p, \\quad s_2 = s_1"
                    substitutedFormula={`w_p = ${formatNum(rankineResult.state1.v, 5)}\\text{ m}^3/\\text{kg} \\times (${rankineResult.inputs.pBoilerKPa} - ${rankineResult.inputs.pCondKPa})\\text{ kPa} = ${formatDec(rankineResult.wp, 2)}\\text{ kJ/kg}; \\quad h_2 = ${formatDec(rankineResult.state1.h, 2)} + ${formatDec(rankineResult.wp, 2)}`}
                    resultFormula={`\\mathbf{w_p = ${formatDec(rankineResult.wp, 2)}\\text{ kJ/kg}}, \\quad \\mathbf{h_2 = ${formatDec(rankineResult.state2.h, 2)}\\text{ kJ/kg}}, \\quad \\mathbf{s_2 = ${formatDec(rankineResult.state2.s, 4)}\\text{ kJ/kg}\\cdot\\text{K}}`}
                    note="Unit conversion: 1 kPa × m³/kg = 1 kN/m² × m³/kg = 1 kJ/kg."
                  />

                  {/* Step 3 */}
                  <StepBlock
                    stepNumber={3}
                    title="Superheated steam properties at turbine inlet (State 3)"
                    explanation="Steam enters the turbine at the boiler pressure and high temperature. Enthalpy and entropy are evaluated using IAPWS-IF97 Region 2 superheated steam formulations."
                    symbolicFormula="h_3 = h(P_{\\text{boiler}}, T_3), \\quad s_3 = s(P_{\\text{boiler}}, T_3)"
                    substitutedFormula={`\\text{At } P_{\\text{boiler}} = ${rankineResult.inputs.pBoilerMPa}\\text{ MPa (${rankineResult.inputs.pBoilerKPa} kPa)} \\text{ and } T_3 = ${rankineResult.inputs.t3C}^\\circ\\text{C}:`}
                    resultFormula={`\\mathbf{h_3 = ${formatDec(rankineResult.state3.h, 2)}\\text{ kJ/kg}}, \\quad \\mathbf{s_3 = ${formatDec(rankineResult.state3.s, 4)}\\text{ kJ/kg}\\cdot\\text{K}}`}
                    note={`Saturation temperature at ${rankineResult.inputs.pBoilerMPa} MPa is ${formatDec(rankineResult.satBoiler.tC, 2)} °C; degree of superheat is ${(rankineResult.inputs.t3C - rankineResult.satBoiler.tC).toFixed(1)} °C.`}
                  />

                  {/* Step 4 */}
                  <StepBlock
                    stepNumber={4}
                    title="Turbine expansion and exhaust state (State 4)"
                    explanation="Steam expands isentropically through the turbine to condenser pressure: s₄ = s₃. We verify that s_f < s₄ < s_g, confirming a two-phase wet mixture, and compute the dryness fraction x₄."
                    symbolicFormula="s_4 = s_3, \\quad x_4 = \\frac{s_4 - s_f}{s_{fg}}, \\quad h_4 = h_f + x_4 \\cdot h_{fg}"
                    substitutedFormula={`s_4 = ${formatDec(rankineResult.state4.s, 4)}\\text{ kJ/kg}\\cdot\\text{K}; \\quad x_4 = \\frac{${formatDec(rankineResult.state4.s, 4)} - ${formatDec(rankineResult.satCond.s_f, 4)}}{${formatDec(rankineResult.satCond.s_fg, 4)}}; \\quad h_4 = ${formatDec(rankineResult.satCond.h_f, 2)} + ${formatDec(rankineResult.state4.x, 4)} \\times ${formatDec(rankineResult.satCond.h_fg, 2)}`}
                    resultFormula={`\\mathbf{x_4 = ${formatPercent(rankineResult.state4.x, 2)}} \\quad (${formatDec(rankineResult.state4.x, 4)}), \\quad \\mathbf{h_4 = ${formatDec(rankineResult.state4.h, 2)}\\text{ kJ/kg}}`}
                    note={`At 50 kPa: s_f = ${formatDec(rankineResult.satCond.s_f, 4)}, s_g = ${formatDec(rankineResult.satCond.s_g, 4)}, h_fg = ${formatDec(rankineResult.satCond.h_fg, 2)} kJ/kg.`}
                  />

                  {/* Step 5 */}
                  <StepBlock
                    stepNumber={5}
                    title="Heat supplied in boiler (q_in)"
                    explanation="Heat is transferred to the working fluid at constant boiler pressure between State 2 (compressed liquid) and State 3 (superheated steam)."
                    symbolicFormula="q_{\\text{in}} = h_3 - h_2"
                    substitutedFormula={`q_{\\text{in}} = ${formatDec(rankineResult.state3.h, 2)}\\text{ kJ/kg} - ${formatDec(rankineResult.state2.h, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{q_{\\text{in}} = ${formatDec(rankineResult.qIn, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 6 */}
                  <StepBlock
                    stepNumber={6}
                    title="Turbine work output (w_t)"
                    explanation="The specific work developed by the turbine during isentropic expansion."
                    symbolicFormula="w_t = h_3 - h_4"
                    substitutedFormula={`w_t = ${formatDec(rankineResult.state3.h, 2)}\\text{ kJ/kg} - ${formatDec(rankineResult.state4.h, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{w_t = ${formatDec(rankineResult.wt, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 7 */}
                  <StepBlock
                    stepNumber={7}
                    title="Pump work consumed (w_p)"
                    explanation="The specific mechanical work consumed by the boiler feedwater pump."
                    symbolicFormula="w_p = h_2 - h_1 = v_1 (P_{\\text{boiler}} - P_{\\text{cond}})"
                    substitutedFormula={`w_p = ${formatDec(rankineResult.state2.h, 2)}\\text{ kJ/kg} - ${formatDec(rankineResult.state1.h, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{w_p = ${formatDec(rankineResult.wp, 2)}\\text{ kJ/kg}}`}
                  />

                  {/* Step 8 */}
                  <StepBlock
                    stepNumber={8}
                    title="Net specific work output (w_net)"
                    explanation="The net work produced by the cycle is turbine output minus pump input."
                    symbolicFormula="w_{\\text{net}} = w_t - w_p"
                    substitutedFormula={`w_{\\text{net}} = ${formatDec(rankineResult.wt, 2)}\\text{ kJ/kg} - ${formatDec(rankineResult.wp, 2)}\\text{ kJ/kg}`}
                    resultFormula={`\\mathbf{w_{\\text{net}} = ${formatDec(rankineResult.wNet, 2)}\\text{ kJ/kg}}`}
                    note={`Back work ratio BWR = (w_p / w_t) × 100% = ${formatDec(rankineResult.bwr, 2)}%.`}
                  />

                  {/* Step 9 */}
                  <StepBlock
                    stepNumber={9}
                    title="Thermal efficiency of the cycle (η_th)"
                    explanation="Thermal efficiency is the ratio of net work produced to heat supplied in the steam boiler."
                    symbolicFormula="\eta_{\\text{th}} = \frac{w_{\\text{net}}}{q_{\\text{in}}} = \frac{w_t - w_p}{h_3 - h_2}"
                    substitutedFormula={`\\eta_{\\text{th}} = \\frac{${formatDec(rankineResult.wNet, 2)}\\text{ kJ/kg}}{${formatDec(rankineResult.qIn, 2)}\\text{ kJ/kg}}`}
                    resultFormula={`\\mathbf{\\eta_{\\text{th}} = ${formatPercent(rankineResult.etaTh, 2)}} \\quad (${formatDec(rankineResult.etaTh, 4)})`}
                  />

                  {/* Step 10 */}
                  <StepBlock
                    stepNumber={10}
                    title="Net power output of the power plant (P_net)"
                    explanation="The net electrical/mechanical power generated is calculated by multiplying steam mass flow rate by net specific work."
                    symbolicFormula="P_{\\text{net}} = \dot{m} \cdot w_{\\text{net}}"
                    substitutedFormula={`P_{\\text{net}} = ${rankineResult.inputs.mDot}\\text{ kg/s} \\times ${formatDec(rankineResult.wNet, 2)}\\text{ kJ/kg} = ${formatDec(rankineResult.netPowerKW, 1)}\\text{ kW}`}
                    resultFormula={`\\mathbf{P_{\\text{net}} = ${formatDec(rankineResult.netPowerMW, 2)}\\text{ MW}} \\quad (${formatDec(rankineResult.netPowerKW, 1)}\\text{ kW})`}
                  />
                </div>
              )}
            </div>

            {/* Final Answer Box */}
            <div className="final-answer-box">
              <h3 className="final-answer-title">Final Answer (Question 2)</h3>
              <div className="final-answer-line">
                <strong>(a) Thermal efficiency of the cycle: </strong>
                <MathView math={`\\eta_{\\text{th}} = ${formatPercent(rankineResult.etaTh, 2)}`} />
              </div>
              <div className="final-answer-line">
                <strong>(b) Net power output of the power plant: </strong>
                <MathView math={`P_{\\text{net}} = ${formatDec(rankineResult.netPowerMW, 2)}\\text{ MW}`} />{' '}
                <small>({formatDec(rankineResult.netPowerKW, 1)} kW)</small>
              </div>
              <div className="final-answer-line">
                <small>
                  Operating between {rankineResult.inputs.pBoilerMPa} MPa and {rankineResult.inputs.pCondKPa} kPa with{' '}
                  <MathView math={`\\dot{m} = ${rankineResult.inputs.mDot}\\text{ kg/s}`} />: turbine work is{' '}
                  <MathView math={`w_t = ${formatDec(rankineResult.wt, 2)}\\text{ kJ/kg}`} />, pump work is{' '}
                  <MathView math={`w_p = ${formatDec(rankineResult.wp, 2)}\\text{ kJ/kg}`} />, and exhaust dryness fraction is{' '}
                  <MathView math={`x_4 = ${formatPercent(rankineResult.state4.x, 2)}`} />.
                </small>
              </div>
            </div>

            {/* T-s Diagram */}
            <h3 className="section-heading">T–s Diagram with Saturation Lines</h3>
            <RankineTsDiagram cycleResult={rankineResult} showReferenceCycles={true} />

            {/* Parametric Study Section */}
            <h3 className="section-heading">Effect of Varying Upper Boiler Pressure (3 MPa, 5 MPa, 6 MPa)</h3>
            <StateTable
              columns={rankineCompColumns}
              data={rankineComparison.rows}
              caption="Rankine cycle performance comparison across boiler pressures: 3 MPa, 5 MPa, and 6 MPa"
            />

            <RankineParamChart
              comparisonData={rankineComparison.rows}
              currentP={rankineResult.inputs.pBoilerMPa}
              currentEtaTh={rankineResult.etaTh}
              currentPowerMW={rankineResult.netPowerMW}
            />

            {/* Engineering Comment */}
            <h3 className="section-heading">Comment</h3>
            <div className="comment-box">
              <div className="comment-title">Thermodynamic Analysis & Turbine Exhaust Implications</div>
              <p>{rankineComparison.comment}</p>
            </div>

            {/* Code Reference Section */}
            <div className="code-section">
              <div className="code-header">
                <button
                  type="button"
                  className={`code-tab-btn ${rankineLang === 'python' ? 'active' : ''}`}
                  onClick={() => setRankineLang('python')}
                >
                  PYTHON (pyXSteam / IAPWS)
                </button>
              </div>
              <div className="code-content">
                <pre>{RANKINE_CODE_TEMPLATES[rankineLang]}</pre>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
