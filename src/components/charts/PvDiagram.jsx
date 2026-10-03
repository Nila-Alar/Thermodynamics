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
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">P–v Diagram (Air-Standard Diesel Cycle)</h4>
        <span className="chart-subtitle">
          Processes: 1→2 Isentropic compression, 2→3 Isobaric heat addition, 3→4 Isentropic expansion, 4→1 Isochoric heat rejection
        </span>
      </div>

      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              type="number"
              dataKey="v"
              name="Specific Volume"
              unit=" m³/kg"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#333' }}
            >
              <Label
                value="Specific Volume, v (m³/kg)"
                offset={-25}
                position="insideBottom"
                style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="p"
              name="Pressure"
              unit=" kPa"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#333' }}
            >
              <Label
                value="Pressure, P (kPa)"
                angle={-90}
                offset={-30}
                position="insideLeft"
                style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
              />
            </YAxis>
            <Tooltip
              formatter={(value, name) => [
                name === 'Specific Volume' ? `${value} m³/kg` : `${value} kPa`,
                name
              ]}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
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
              wrapperStyle={{ fontSize: 12 }}
            />
            {/* Cycle line connecting points */}
            <Scatter
              name="Diesel Cycle Path"
              data={curveData}
              fill="#1f4e79"
              line={{ stroke: '#1f4e79', strokeWidth: 2.2 }}
              shape={() => null} // Hide dots along curve, keep line
            />
            {/* Highlighted State Points 1, 2, 3, 4 */}
            <Scatter
              name="State Points (1, 2, 3, 4)"
              data={statePoints}
              fill="#c0392b"
              shape="circle"
              line={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-notes">
        <span><strong>1:</strong> BDC (v₁ = {cycleResult.states[0].v.toFixed(4)} m³/kg, P₁ = {cycleResult.states[0].p} kPa)</span>
        <span><strong>2:</strong> TDC (v₂ = {cycleResult.states[1].v.toFixed(4)} m³/kg, P₂ = {cycleResult.states[1].p.toFixed(0)} kPa)</span>
        <span><strong>3:</strong> End of Injection (v₃ = {cycleResult.states[2].v.toFixed(4)} m³/kg, T₃ = {cycleResult.states[2].tK} K)</span>
        <span><strong>4:</strong> Pre-exhaust (v₄ = {cycleResult.states[3].v.toFixed(4)} m³/kg, P₄ = {cycleResult.states[3].p.toFixed(1)} kPa)</span>
      </div>
    </div>
  );
}
