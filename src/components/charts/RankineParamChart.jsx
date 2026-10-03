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
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">Thermal Efficiency (η_th) vs Boiler Pressure (P_boiler)</h4>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="pBoilerMPa" tick={{ fontSize: 12, fill: '#333' }}>
                <Label
                  value="Boiler Pressure, P_boiler (MPa)"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit="%"
                tick={{ fontSize: 12, fill: '#333' }}
              >
                <Label
                  value="Efficiency, η_th (%)"
                  angle={-90}
                  offset={-10}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)}%`, 'Thermal Efficiency (η_th)']}
                labelFormatter={(label) => `Boiler Pressure = ${label} MPa`}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="etaThPercent"
                name="η_th (%)"
                stroke="#1f4e79"
                strokeWidth={2.2}
                dot={{ r: 4, fill: '#1f4e79' }}
                activeDot={{ r: 6 }}
              />
              {currentP !== undefined && currentEtaTh !== undefined && (
                <ReferenceDot
                  x={currentP}
                  y={currentEtaTh * 100}
                  r={7}
                  fill="#c0392b"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Net Power Output vs Boiler Pressure */}
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">Net Power Output (P_net) vs Boiler Pressure (P_boiler)</h4>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="pBoilerMPa" tick={{ fontSize: 12, fill: '#333' }}>
                <Label
                  value="Boiler Pressure, P_boiler (MPa)"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit=" MW"
                tick={{ fontSize: 12, fill: '#333' }}
              >
                <Label
                  value="Net Power (MW)"
                  angle={-90}
                  offset={-15}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)} MW`, 'Net Power Output']}
                labelFormatter={(label) => `Boiler Pressure = ${label} MPa`}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="netPowerMW"
                name="Net Power (MW)"
                stroke="#d35400"
                strokeWidth={2.2}
                dot={{ r: 4, fill: '#d35400' }}
                activeDot={{ r: 6 }}
              />
              {currentP !== undefined && currentPowerMW !== undefined && (
                <ReferenceDot
                  x={currentP}
                  y={currentPowerMW}
                  r={7}
                  fill="#c0392b"
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
