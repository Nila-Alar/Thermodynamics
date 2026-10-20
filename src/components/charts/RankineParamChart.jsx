import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  Label
} from 'recharts';

export default function RankineParamChart({ comparisonData, currentP, currentEtaTh, currentPowerMW }) {
  if (!comparisonData || comparisonData.length === 0) return null;

  const chartData = [...comparisonData].sort((a, b) => a.pBoilerMPa - b.pBoilerMPa);

  return (
    <div className="charts-grid-2">
      {/* Chart 1: Thermal Efficiency vs Boiler Pressure */}
      <div className="chart-card chart-theme-rankine">
        <div className="chart-header">
          <div className="chart-badge-title">
            <span className="chart-pill chart-pill-blue">EFFICIENCY</span>
            <h4 className="chart-title">η_th vs Boiler Pressure (P_boiler)</h4>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#bae6fd" opacity={0.6} />
              <XAxis dataKey="pBoilerMPa" tick={{ fontSize: 12, fill: '#4b5563' }}>
                <Label
                  value="Boiler Pressure, P_boiler (MPa)"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#0369a1', fontSize: 12, fontWeight: 600 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit="%"
                tick={{ fontSize: 12, fill: '#4b5563' }}
              >
                <Label
                  value="Efficiency, η_th (%)"
                  angle={-90}
                  offset={-10}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#0369a1', fontSize: 12, fontWeight: 600 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)}%`, 'Thermal Efficiency (η_th)']}
                labelFormatter={(label) => `Boiler Pressure = ${label} MPa`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #0284c7', boxShadow: '0 4px 12px rgba(2,132,199,0.15)' }}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="etaThPercent"
                name="η_th (%)"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              {currentP !== undefined && currentEtaTh !== undefined && (
                <ReferenceDot
                  x={currentP}
                  y={currentEtaTh * 100}
                  r={8}
                  fill="#d946ef"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Net Power Output vs Boiler Pressure */}
      <div className="chart-card chart-theme-rankine">
        <div className="chart-header">
          <div className="chart-badge-title">
            <span className="chart-pill chart-pill-purple">POWER OUTPUT</span>
            <h4 className="chart-title">Net Power (P_net) vs P_boiler</h4>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" opacity={0.6} />
              <XAxis dataKey="pBoilerMPa" tick={{ fontSize: 12, fill: '#4b5563' }}>
                <Label
                  value="Boiler Pressure, P_boiler (MPa)"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#6b21a8', fontSize: 12, fontWeight: 600 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit=" MW"
                tick={{ fontSize: 12, fill: '#4b5563' }}
              >
                <Label
                  value="Net Power (MW)"
                  angle={-90}
                  offset={-15}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#6b21a8', fontSize: 12, fontWeight: 600 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)} MW`, 'Net Power Output']}
                labelFormatter={(label) => `Boiler Pressure = ${label} MPa`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #7c3aed', boxShadow: '0 4px 12px rgba(124,58,237,0.15)' }}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="netPowerMW"
                name="Net Power (MW)"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              {currentP !== undefined && currentPowerMW !== undefined && (
                <ReferenceDot
                  x={currentP}
                  y={currentPowerMW}
                  r={8}
                  fill="#d946ef"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
