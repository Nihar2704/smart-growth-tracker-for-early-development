import React, { useState, useEffect } from 'react';
import { predictChildMonitoring, getChildPredictions, getMLModelInfo } from '../services/api';
import { Brain, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function MLPredictionCard({ childId, assessmentId, onPredictionComplete }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestData();
  }, [childId, assessmentId]);

  const fetchLatestData = async () => {
    try {
      const info = await getMLModelInfo();
      setModelInfo(info);

      if (childId) {
        const history = await getChildPredictions(childId);
        if (history && history.length > 0) {
          const match = assessmentId 
            ? history.find((p) => p.milestone_assessment_id === assessmentId) || history[0]
            : history[0];
          setPrediction(match);
        }
      }
    } catch (err) {
      console.error('Error fetching ML info/predictions:', err);
    }
  };

  const handleGeneratePrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictChildMonitoring(childId, assessmentId);
      setPrediction(res);
      if (onPredictionComplete) {
        onPredictionComplete(res);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate ML monitoring prediction.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isRecommend = prediction?.predicted_class === 1;
  const proba = prediction?.monitoring_probability || 0;

  return (
    <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0 mt-0.5">
            <Brain className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                Machine Learning Prediction Service
              </span>
              {modelInfo && (
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {modelInfo.algorithm_name} (v{modelInfo.model_version})
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[var(--text-main)] mt-1">
              Calibrated Developmental Monitoring Estimate
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Pattern evaluation synthesizing WHO growth percentiles and CDC milestone responses.
            </p>
          </div>
        </div>

        <button
          onClick={handleGeneratePrediction}
          disabled={loading}
          className="px-4 py-2.2 btn-primary text-xs font-semibold transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{prediction ? 'Recalculate Estimate' : 'Generate ML Estimate'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {prediction ? (
        <div className="space-y-5">
          {/* Main Status & Calibrated Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Narrative */}
            <div className="md:col-span-2 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estimated Monitoring Status
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isRecommend ? 'badge-caution' : 'badge-routine'
                }`}>
                  {prediction.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {prediction.guidance}
              </p>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
                <span>Calculated: {new Date(prediction.created_at).toLocaleDateString()}</span>
                <span>Platt-Calibrated Sigmoid Output</span>
              </div>
            </div>

            {/* Probability Score Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center items-center text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calibrated Monitoring Score
              </span>
              
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[var(--text-main)]">
                {proba}%
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    proba >= 50 ? 'bg-amber-600' : 'bg-teal-600'
                  }`}
                  style={{ width: `${proba}%` }}
                />
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                {proba >= 50 ? 'Above threshold (≥50%)' : 'Within baseline (<50%)'}
              </span>
            </div>
          </div>

          {/* Feature Contribution Observations */}
          {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pattern Assessment Indicators
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {prediction.contributing_factors.map((f, idx) => {
                  const isRisk = f.impact === 'Risk Indicator';
                  const displayValue = f.value.includes('10000%') ? f.value.replace('10000%', '100%') : f.value;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 text-xs truncate">{f.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                          isRisk ? 'badge-caution' : 'badge-routine'
                        }`}>
                          {f.impact}
                        </span>
                      </div>
                      <div className="font-mono text-slate-700 font-bold text-xs">{displayValue}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Persistent Non-Diagnostic Disclaimer */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px] sm:text-xs">
              <strong className="text-slate-800">Non-Diagnostic Statistical Support:</strong> This calibrated machine learning model evaluates multi-domain observational patterns against WHO reference samples. It does not provide medical diagnoses or replace doctor clinical examinations.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-500 font-normal">
            Click "Generate ML Estimate" above to calculate a calibrated developmental monitoring score for this child profile.
          </p>
        </div>
      )}
    </div>
  );
}
