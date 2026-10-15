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
      <div className="panel-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[260px] border border-dashed border-[var(--border-color)]">
        <Activity className="w-10 h-10 text-[var(--text-secondary)] mb-3 animate-pulse" />
        <h4 className="text-[var(--text-main)] font-bold text-sm mb-1">No Growth Curves Plotted Yet</h4>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Record height and weight entries to visualize longitudinal physical growth trajectories.
        </p>
      </div>
    );
  }

  const chartData = [...measurements]
    .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date))
    .map((m) => ({
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
      color: '#2F6F5E',
      gradientId: 'heightGrad',
      unit: 'cm',
      icon: Ruler,
    },
    weight: {
      key: 'weight',
      name: 'Weight (kg)',
      color: '#0D9488',
      gradientId: 'weightGrad',
      unit: 'kg',
      icon: Scale,
    },
    bmi: {
      key: 'bmi',
      name: 'BMI (kg/m²)',
      color: '#6366F1',
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
        <div className="bg-white/95 border border-[var(--border-color)] p-3 rounded-xl shadow-lg text-xs space-y-1 backdrop-blur-xs font-sans">
          <p className="font-bold text-[var(--text-main)] font-mono">{data.date} ({data.ageMonths} old)</p>
          <div className="flex items-center justify-between gap-4 text-teal-800">
            <span>Height:</span>
            <span className="font-mono font-bold">{data.height} cm</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-teal-700">
            <span>Weight:</span>
            <span className="font-mono font-bold">{data.weight} kg</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-indigo-700">
            <span>BMI:</span>
            <span className="font-mono font-bold">{data.bmi} kg/m²</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-5.5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] flex items-center gap-2 tracking-tight">
            <span>📈</span>
            <span>WHO Physical Growth Trajectory Curves</span>
          </h3>
          <p className="text-xs text-slate-500">Longitudinal growth measurements logged over time</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto justify-around">
          <button
            onClick={() => setMetric('height')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex-1 sm:flex-initial ${
              metric === 'height'
                ? 'bg-white text-[var(--primary)] shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Height
          </button>
          <button
            onClick={() => setMetric('weight')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex-1 sm:flex-initial ${
              metric === 'weight'
                ? 'bg-white text-[var(--primary)] shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Weight
          </button>
          <button
            onClick={() => setMetric('bmi')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex-1 sm:flex-initial ${
              metric === 'bmi'
                ? 'bg-white text-[var(--primary)] shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            BMI
          </button>
        </div>
      </div>

      {measurements.length === 1 && (
        <div className="p-3 bg-[var(--status-routine-bg)] border border-[var(--status-routine-border)] text-[var(--status-routine-text)] rounded-xl text-xs flex items-center gap-2">
          <span>💡</span>
          <span>
            <strong>First Growth Baseline Logged:</strong> Record additional measurements every 1–2 months to visualize your child's continuous longitudinal growth curve.
          </span>
        </div>
      )}

      <div className="h-64 w-full pt-2">

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2F6F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2F6F5E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E9" opacity={0.8} />
            <XAxis dataKey="ageMonths" stroke="#788290" fontSize={11} tickLine={false} />
            <YAxis stroke="#788290" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeConfig.key}
              name={activeConfig.name}
              stroke={activeConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${activeConfig.gradientId})`}
              dot={{ r: 4, fill: activeConfig.color, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
