import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label
} from 'recharts';
import { generateDieselPvPoints } from '../../calc/diesel.js';

export default function PvDiagram({ cycleResult }) {
  const { curveData, statePoints } = useMemo(() => {
    if (!cycleResult || !cycleResult.isValid) {
      return { curveData: [], statePoints: [] };
    }

    const curve = generateDieselPvPoints(cycleResult, 30);
    const states = cycleResult.states.map((st) => ({
      v: Number(st.v.toFixed(5)),
      p: Number(st.p.toFixed(1)),
      label: `State ${st.state}`,
      desc: st.description
    }));

    const formattedCurve = curve.map((pt) => ({
      v: Number(pt.v.toFixed(5)),
      p: Number(pt.p.toFixed(1)),
      process: pt.process
    }));

    return { curveData: formattedCurve, statePoints: states };
  }, [cycleResult]);

  if (!cycleResult || !cycleResult.isValid) return null;

  return (
    <div className="chart-card chart-theme-diesel">
      <div className="chart-header">
        <div className="chart-badge-title">
          <span className="chart-pill chart-pill-diesel">DIESEL CYCLE</span>
          <h4 className="chart-title">P–v Diagram (Air-Standard Ideal Diesel Cycle)</h4>
        </div>
        <span className="chart-subtitle">
          Processes: 1→2 Isentropic compression, 2→3 Isobaric heat addition, 3→4 Isentropic expansion, 4→1 Isochoric heat rejection
        </span>
      </div>

      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" opacity={0.6} />
            <XAxis
              type="number"
              dataKey="v"
              name="Specific Volume"
              unit=" m³/kg"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#4b5563' }}
            >
              <Label
                value="Specific Volume, v (m³/kg)"
                offset={-25}
                position="insideBottom"
                style={{ textAnchor: 'middle', fill: '#9a3412', fontSize: 13, fontWeight: 600 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="p"
              name="Pressure"
              unit=" kPa"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#4b5563' }}
            >
              <Label
                value="Pressure, P (kPa)"
                angle={-90}
                offset={-30}
                position="insideLeft"
                style={{ textAnchor: 'middle', fill: '#9a3412', fontSize: 13, fontWeight: 600 }}
              />
            </YAxis>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip tooltip-diesel">
                      {data.label && <div className="tooltip-title">{data.label}: {data.desc}</div>}
                      {data.process && <div className="tooltip-title">{data.process}</div>}
                      <div>P: <strong>{data.p} kPa</strong></div>
                      <div>v: <strong>{data.v} m³/kg</strong></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
            />
            {/* Cycle line connecting points */}
            <Scatter
              name="Diesel Cycle Path (1→2→3→4→1)"
              data={curveData}
              fill="#ea580c"
              line={{ stroke: '#ea580c', strokeWidth: 3 }}
              shape={() => null}
            />
            {/* Highlighted State Points 1, 2, 3, 4 */}
            <Scatter
              name="State Points (1, 2, 3, 4)"
              data={statePoints}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={2}
              shape="circle"
              line={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-notes notes-diesel">
        <span className="state-badge-pill state-pill-1">State 1 (BDC): v₁ = {cycleResult.states[0].v.toFixed(4)} m³/kg, P₁ = {cycleResult.states[0].p} kPa</span>
        <span className="state-badge-pill state-pill-2">State 2 (TDC): v₂ = {cycleResult.states[1].v.toFixed(4)} m³/kg, P₂ = {cycleResult.states[1].p.toFixed(0)} kPa</span>
        <span className="state-badge-pill state-pill-3">State 3 (End Injection): v₃ = {cycleResult.states[2].v.toFixed(4)} m³/kg, T₃ = {cycleResult.states[2].tK} K</span>
        <span className="state-badge-pill state-pill-4">State 4 (Exhaust): v₄ = {cycleResult.states[3].v.toFixed(4)} m³/kg, P₄ = {cycleResult.states[3].p.toFixed(1)} kPa</span>
      </div>
    </div>
  );
}
