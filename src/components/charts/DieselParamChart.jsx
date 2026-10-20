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

  const chartData = [...comparisonData].sort((a, b) => a.r - b.r);

  return (
    <div className="charts-grid-2">
      {/* Chart 1: Thermal Efficiency vs Compression Ratio */}
      <div className="chart-card chart-theme-diesel">
        <div className="chart-header">
          <div className="chart-badge-title">
            <span className="chart-pill chart-pill-amber">EFFICIENCY</span>
            <h4 className="chart-title">η_th vs Compression Ratio (r)</h4>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" opacity={0.6} />
              <XAxis dataKey="r" tick={{ fontSize: 12, fill: '#4b5563' }}>
                <Label
                  value="Compression Ratio, r"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#9a3412', fontSize: 12, fontWeight: 600 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit="%"
                tick={{ fontSize: 12, fill: '#4b5563' }}
              >
                <Label
                  value="Thermal Efficiency, η_th (%)"
                  angle={-90}
                  offset={-10}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#9a3412', fontSize: 12, fontWeight: 600 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(2)}%`, 'Thermal Efficiency (η_th)']}
                labelFormatter={(label) => `Compression Ratio r = ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #f97316', boxShadow: '0 4px 12px rgba(249,115,22,0.15)' }}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="etaThPercent"
                name="η_th (%)"
                stroke="#ea580c"
                strokeWidth={3}
                dot={{ r: 5, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              {currentR !== undefined && currentEtaTh !== undefined && (
                <ReferenceDot
                  x={currentR}
                  y={currentEtaTh * 100}
                  r={8}
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Mean Effective Pressure vs Compression Ratio */}
      <div className="chart-card chart-theme-diesel">
        <div className="chart-header">
          <div className="chart-badge-title">
            <span className="chart-pill chart-pill-emerald">PRESSURE</span>
            <h4 className="chart-title">MEP vs Compression Ratio (r)</h4>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 35, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" opacity={0.6} />
              <XAxis dataKey="r" tick={{ fontSize: 12, fill: '#4b5563' }}>
                <Label
                  value="Compression Ratio, r"
                  offset={-20}
                  position="insideBottom"
                  style={{ textAnchor: 'middle', fill: '#166534', fontSize: 12, fontWeight: 600 }}
                />
              </XAxis>
              <YAxis
                domain={['auto', 'auto']}
                unit=" kPa"
                tick={{ fontSize: 12, fill: '#4b5563' }}
              >
                <Label
                  value="MEP (kPa)"
                  angle={-90}
                  offset={-20}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#166534', fontSize: 12, fontWeight: 600 }}
                />
              </YAxis>
              <Tooltip
                formatter={(val) => [`${Number(val).toFixed(1)} kPa`, 'MEP']}
                labelFormatter={(label) => `Compression Ratio r = ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.15)' }}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="mep"
                name="MEP (kPa)"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              {currentR !== undefined && currentMep !== undefined && (
                <ReferenceDot
                  x={currentR}
                  y={currentMep}
                  r={8}
                  fill="#dc2626"
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
