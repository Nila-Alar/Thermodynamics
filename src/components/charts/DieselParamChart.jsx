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

export default function DieselParamChart({ comparisonData, currentR, currentEtaTh, currentMep }) {
  if (!comparisonData || comparisonData.length === 0) return null;

  // Recharts data sorted with ascending or descending r
  // For comparison graphs, showing r from 15 to 20 or 20 to 15
  const chartData = [...comparisonData].sort((a, b) => a.r - b.r);

  return (
    <div className="charts-grid-2">
      {/* Chart 1: Thermal Efficiency vs Compression Ratio */}
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">Thermal Efficiency (η_th) vs Compression Ratio (r)</h4>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="r" tick={{ fontSize: 12, fill: '#333' }}>
                <Label
                  value="Compression Ratio, r"
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
                  value="Thermal Efficiency, η_th (%)"
                  angle={-90}
                  offset={-10}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)}%`, 'Thermal Efficiency (η_th)']}
                labelFormatter={(label) => `Compression Ratio r = ${label}`}
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
              {currentR !== undefined && currentEtaTh !== undefined && (
                <ReferenceDot
                  x={currentR}
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

      {/* Chart 2: Mean Effective Pressure vs Compression Ratio */}
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">Mean Effective Pressure (MEP) vs Compression Ratio (r)</h4>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="r" tick={{ fontSize: 12, fill: '#333' }}>
                <Label
                  value="Compression Ratio, r"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit=" kPa"
                tick={{ fontSize: 12, fill: '#333' }}
              >
                <Label
                  value="MEP (kPa)"
                  angle={-90}
                  offset={-20}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#1a1a1a', fontSize: 12, fontWeight: 500 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(1)} kPa`, 'MEP']}
                labelFormatter={(label) => `Compression Ratio r = ${label}`}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="mep"
                name="MEP (kPa)"
                stroke="#2e7d32"
                strokeWidth={2.2}
                dot={{ r: 4, fill: '#2e7d32' }}
                activeDot={{ r: 6 }}
              />
              {currentR !== undefined && currentMep !== undefined && (
                <ReferenceDot
                  x={currentR}
                  y={currentMep}
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
