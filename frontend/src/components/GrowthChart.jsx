import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Ruler, Scale, Activity } from 'lucide-react';

export default function GrowthChart({ measurements }) {
  const [metric, setMetric] = useState('height');

  if (!measurements || measurements.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] border border-dashed border-slate-800">
        <Activity className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
        <h4 className="text-slate-300 font-extrabold text-sm mb-1">No Growth Curves Plotted Yet</h4>
        <p className="text-2xs text-slate-400 max-w-xs leading-relaxed">
          Record height and weight entries to visualize longitudinal physical growth trajectories.
        </p>
      </div>
    );
  }

  const chartData = measurements.map((m) => ({
    date: m.measurement_date,
    ageMonths: `${m.age_months_at_measurement}m`,
    height: m.height_cm,
    weight: m.weight_kg,
    bmi: m.bmi,
  }));

  const metricConfigs = {
    height: {
      key: 'height',
      name: 'Height (cm)',
      color: '#14b8a6',
      gradientId: 'heightGrad',
      unit: 'cm',
      icon: Ruler,
    },
    weight: {
      key: 'weight',
      name: 'Weight (kg)',
      color: '#06b6d4',
      gradientId: 'weightGrad',
      unit: 'kg',
      icon: Scale,
    },
    bmi: {
      key: 'bmi',
      name: 'BMI (kg/m²)',
      color: '#818cf8',
      gradientId: 'bmiGrad',
      unit: 'kg/m²',
      icon: Activity,
    },
  };

  const activeConfig = metricConfigs[metric];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl shadow-xl text-2xs space-y-1 backdrop-blur-md">
          <p className="font-extrabold text-white font-mono">{data.date} ({data.ageMonths} old)</p>
          <div className="flex items-center justify-between gap-4 text-teal-400">
            <span>Height:</span>
            <span className="font-mono font-bold">{data.height} cm</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-cyan-400">
            <span>Weight:</span>
            <span className="font-mono font-bold">{data.weight} kg</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-indigo-400">
            <span>BMI:</span>
            <span className="font-mono font-bold">{data.bmi} kg/m²</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2 tracking-tight">
            <span>📈</span>
            <span>WHO Physical Growth Trajectory Curves</span>
          </h3>
          <p className="text-2xs text-slate-400">Longitudinal growth measurements logged over time</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setMetric('height')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-2xs transition cursor-pointer ${
              metric === 'height'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Height
          </button>
          <button
            onClick={() => setMetric('weight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-2xs transition cursor-pointer ${
              metric === 'weight'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Weight
          </button>
          <button
            onClick={() => setMetric('bmi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-2xs transition cursor-pointer ${
              metric === 'bmi'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            BMI
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="ageMonths" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeConfig.key}
              name={activeConfig.name}
              stroke={activeConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${activeConfig.gradientId})`}
              dot={{ r: 4, fill: activeConfig.color, strokeWidth: 2, stroke: '#090d16' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
