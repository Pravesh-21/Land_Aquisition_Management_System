'use client';

import { useState } from 'react';
import KPICard from '@/components/ui/KPICard';
import { mockRiskAssessments } from '@/data/mockData';

export default function AgencyRiskScoringPage() {
  const [bypassedUlpin, setBypassedUlpin] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Machine Learning & Risk Intelligence
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Land Acquisition Risk Scoring & Delay Forecasting</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Multi-factor parcel vulnerability analysis combining litigation history, ownership fragmentation, and forest proximity.
          </p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {bypassedUlpin && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[20px] text-emerald-700">alt_route</span>
            <span>Corridor bypass route simulated successfully for parcel {bypassedUlpin}. Buffer recalculated avoiding high-risk zone.</span>
          </div>
          <button
            onClick={() => setBypassedUlpin(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Assessed Parcels', value: '5', subtitle: 'Corridor Alignment', color: 'navy', icon: 'analytics' }} />
        <KPICard data={{ label: 'High Risk Flagged', value: '2', subtitle: 'Score > 80', color: 'red', icon: 'warning' }} />
        <KPICard data={{ label: 'Bypass Recommended', value: '2', subtitle: 'Alternative Routes Feasible', color: 'ochre', icon: 'alt_route' }} />
        <KPICard data={{ label: 'Low Risk Parcels', value: '2', subtitle: 'Proceed Directly', color: 'green', icon: 'check_circle' }} />
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockRiskAssessments.map((item, idx) => {
          const isHighRisk = item.overallRiskScore > 75;
          return (
            <div key={idx} className="gov-card p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="font-mono text-sm font-bold text-[var(--color-gov-navy)]">Parcel #{item.parcelId}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">Recommendation: {item.recommendation}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isHighRisk ? 'text-red-700' : item.overallRiskScore > 50 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {item.overallRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isHighRisk ? 'bg-red-100 text-red-800' : item.overallRiskScore > 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.recommendation}
                  </span>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Vulnerability Factors</div>
                {Object.entries(item.factors).map(([factor, score]) => (
                  <div key={factor} className="space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${score > 70 ? 'bg-red-500' : score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {isHighRisk && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-red-600">warning</span>
                    <span className="font-medium">High Risk Flagged • Corridor Realignment Recommended</span>
                  </div>
                  <button
                    onClick={() => setBypassedUlpin(`P-00${idx + 1}`)}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold uppercase text-[10px] rounded transition-colors cursor-pointer"
                  >
                    Simulate Bypass
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
