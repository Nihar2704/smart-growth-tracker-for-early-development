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
    <div className="health-card p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-lg health-card-subtle">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[var(--primary)] shrink-0 mt-0.5">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider health-card text-muted">
                Machine Learning Prediction Service
              </span>
              {modelInfo && (
                <span className="text-xs font-mono text-muted">
                  {modelInfo.algorithm_name} (v{modelInfo.model_version})
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-main mt-1">
              Calibrated Monitoring Probability Assessment
            </h3>
            <p className="text-sm text-muted mt-0.5">
              Pattern evaluation based on WHO growth references and CDC milestone response metrics.
            </p>
          </div>
        </div>

        <button
          onClick={handleGeneratePrediction}
          disabled={loading}
          className="px-4 py-2.5 btn-primary text-xs font-semibold transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{prediction ? 'Recalculate Estimate' : 'Generate ML Estimate'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {prediction ? (
        <div className="space-y-6">
          {/* Main Status & Calibrated Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Status Narrative */}
            <div className="md:col-span-2 p-5 rounded-lg health-card-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Estimated Status
                </span>
                <span className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                  isRecommend ? 'badge-caution' : 'badge-routine'
                }`}>
                  {prediction.status}
                </span>
              </div>

              <p className="text-sm text-main leading-relaxed font-normal">
                {prediction.guidance}
              </p>

              <div className="text-xs text-muted pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between font-mono">
                <span>Generated: {new Date(prediction.created_at).toLocaleDateString()}</span>
                <span>Calibrated Sigmoid Output</span>
              </div>
            </div>

            {/* Probability Score Box */}
            <div className="p-5 rounded-lg health-card-subtle flex flex-col justify-center items-center text-center space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Calibrated Monitoring Score
              </span>
              
              <div className="text-4xl font-bold font-mono tracking-tight text-main">
                {proba}%
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded overflow-hidden border border-[var(--border-color)]">
                <div
                  className={`h-full transition-all duration-500 ${
                    proba >= 50 ? 'bg-amber-600' : 'bg-teal-600'
                  }`}
                  style={{ width: `${proba}%` }}
                />
              </div>

              <span className="text-xs text-muted font-medium">
                {proba >= 50 ? 'Above threshold (≥50%)' : 'Within baseline (<50%)'}
              </span>
            </div>
          </div>

          {/* Feature Contribution Observations */}
          {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Contributing Factor Indicators
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {prediction.contributing_factors.map((f, idx) => {
                  const isRisk = f.impact === 'Risk Indicator';
                  // Sanitize any remaining 10000% string if present
                  const displayValue = f.value.includes('10000%') ? f.value.replace('10000%', '100%') : f.value;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg health-card-subtle text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-main text-sm">{f.label}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider shrink-0 ${
                          isRisk ? 'badge-caution' : 'badge-routine'
                        }`}>
                          {f.impact}
                        </span>
                      </div>
                      <div className="font-mono text-main font-semibold text-sm">{displayValue}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Persistent Non-Diagnostic Disclaimer */}
          <div className="p-4 health-card-subtle rounded-lg flex items-start gap-3 text-xs text-muted">
            <Info className="w-4.5 h-4.5 text-muted shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-main">Non-Diagnostic Framing:</strong> This machine learning prediction provides calibrated educational decision support. It evaluates patterns against reference datasets and does not constitute a medical diagnosis.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center health-card-subtle rounded-lg space-y-2">
          <p className="text-xs text-muted font-normal">
            Click the button above to generate a machine learning monitoring score for this child profile.
          </p>
        </div>
      )}
    </div>
  );
}
