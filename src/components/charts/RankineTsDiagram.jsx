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
import { getSaturationDomePoints, getRankineCycleTsPoints } from '../../calc/steam.js';
import { calculateRankineCycle } from '../../calc/rankine.js';

export default function RankineTsDiagram({ cycleResult, showReferenceCycles = true }) {
  const { domeData, cycleData, statePoints, refCycles } = useMemo(() => {
    const dome = getSaturationDomePoints();

    if (!cycleResult || !cycleResult.isValid) {
      return { domeData: dome, cycleData: [], statePoints: [], refCycles: [] };
    }

    const cyclePath = getRankineCycleTsPoints(cycleResult, 20);

    const states = [
      {
        s: Number(cycleResult.state1.s.toFixed(4)),
        tC: Number(cycleResult.state1.tC.toFixed(2)),
        label: '1',
        desc: 'Condenser exit / Pump inlet (Sat. liquid)'
      },
      {
        s: Number(cycleResult.state2.s.toFixed(4)),
        tC: Number(cycleResult.state2.tC.toFixed(2)),
        label: '2',
        desc: 'Pump exit (Compressed liquid)'
      },
      {
        s: Number(cycleResult.satBoiler.s_f.toFixed(4)),
        tC: Number(cycleResult.satBoiler.tC.toFixed(2)),
        label: "2'",
        desc: 'Boiler sat. liquid (onset of boiling)'
      },
      {
        s: Number(cycleResult.satBoiler.s_g.toFixed(4)),
        tC: Number(cycleResult.satBoiler.tC.toFixed(2)),
        label: "2''",
        desc: 'Boiler sat. vapor (complete evaporation)'
      },
      {
        s: Number(cycleResult.state3.s.toFixed(4)),
        tC: Number(cycleResult.state3.tC.toFixed(2)),
        label: '3',
        desc: `Turbine inlet (${cycleResult.inputs.t3C} °C, Superheated)`
      },
      {
        s: Number(cycleResult.state4.s.toFixed(4)),
        tC: Number(cycleResult.state4.tC.toFixed(2)),
        label: '4',
        desc: `Turbine exhaust (x₄ = ${(cycleResult.state4.x * 100).toFixed(1)}%)`
      }
    ];

    // Reference cycles for comparison: 3, 5, 6 MPa
    const refLines = [];
    if (showReferenceCycles) {
      const pressures = [3, 5, 6];
      for (const p of pressures) {
        if (p !== cycleResult.inputs.pBoilerMPa) {
          const refRes = calculateRankineCycle({
            ...cycleResult.inputs,
            pBoilerMPa: p
          });
          if (refRes.isValid) {
            const path = getRankineCycleTsPoints(refRes, 15);
            refLines.push({
              pressure: p,
              data: path.map((pt) => ({ s: pt.s, tC: pt.tC }))
            });
          }
        }
      }
    }

    return {
      domeData: dome,
      cycleData: cyclePath.map((pt) => ({ s: pt.s, tC: pt.tC, process: pt.process })),
      statePoints: states,
      refCycles: refLines
    };
  }, [cycleResult, showReferenceCycles]);

  if (!cycleResult || !cycleResult.isValid) return null;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">T–s Diagram with IAPWS-IF97 Saturation Dome</h4>
        <span className="chart-subtitle">
          Processes: 1→2 Isentropic pumping, 2→3 Constant-pressure heating & superheating, 3→4 Isentropic expansion, 4→1 Constant-pressure condensation
        </span>
      </div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 35 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              type="number"
              dataKey="s"
              name="Specific Entropy"
              unit=" kJ/kg·K"
              domain={[0, 9.5]}
              tick={{ fontSize: 12, fill: '#333' }}
            >
              <Label
                value="Specific Entropy, s (kJ/kg·K)"
                offset={-25}
                position="insideBottom"
                style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="tC"
              name="Temperature"
              unit=" °C"
              domain={[0, 420]}
              tick={{ fontSize: 12, fill: '#333' }}
            >
              <Label
                value="Temperature, T (°C)"
                angle={-90}
                offset={-20}
                position="insideLeft"
                style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
              />
            </YAxis>

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      {data.label && <div className="tooltip-title">State {data.label}: {data.desc}</div>}
                      {data.type && <div className="tooltip-title">Saturation Dome ({data.type})</div>}
                      {data.process && <div className="tooltip-title">{data.process}</div>}
                      <div>T: <strong>{Number(data.tC).toFixed(1)} °C</strong></div>
                      <div>s: <strong>{Number(data.s).toFixed(4)} kJ/kg·K</strong></div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />

            {/* Saturation Dome */}
            <Scatter
              name="Saturation Dome (IF97)"
              data={domeData}
              fill="#7f8c8d"
              line={{ stroke: '#7f8c8d', strokeWidth: 1.8, strokeDasharray: '4 3' }}
              shape={() => null}
            />

            {/* Optional reference comparison cycles */}
            {refCycles.map((ref) => (
              <Scatter
                key={ref.pressure}
                name={`Rankine Cycle (${ref.pressure} MPa)`}
                data={ref.data}
                fill="#bdc3c7"
                line={{ stroke: '#95a5a6', strokeWidth: 1.2, strokeDasharray: '2 2' }}
                shape={() => null}
              />
            ))}

            {/* Current Active Rankine Cycle Path */}
            <Scatter
              name={`Active Cycle (${cycleResult.inputs.pBoilerMPa} MPa)`}
              data={cycleData}
              fill="#1f4e79"
              line={{ stroke: '#1f4e79', strokeWidth: 2.5 }}
              shape={() => null}
            />

            {/* State Points */}
            <Scatter
              name="Cycle States (1, 2, 2', 2'', 3, 4)"
              data={statePoints}
              fill="#c0392b"
              shape="circle"
              line={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-notes">
        <span><strong>1:</strong> Condenser Exit ({cycleResult.state1.tC.toFixed(1)} °C, s₁ = {cycleResult.state1.s.toFixed(4)})</span>
        <span><strong>2:</strong> Pump Exit ({cycleResult.state2.tC.toFixed(1)} °C, s₂ = {cycleResult.state2.s.toFixed(4)})</span>
        <span><strong>2'→2'':</strong> Boiling at {cycleResult.satBoiler.tC.toFixed(1)} °C</span>
        <span><strong>3:</strong> Superheated Steam ({cycleResult.state3.tC.toFixed(1)} °C, s₃ = {cycleResult.state3.s.toFixed(4)})</span>
        <span><strong>4:</strong> Turbine Exit ({cycleResult.state4.tC.toFixed(1)} °C, x₄ = {(cycleResult.state4.x * 100).toFixed(1)}%)</span>
      </div>
    </div>
  );
}
