'use client';

import { mockRiskAssessments, mockParcels } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';

export default function RiskScoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 6 • AI/ML Engine 2</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">XGBoost Acquisition Delay & Litigation Risk Scoring</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Predictive delay risk scoring (0–100%) computed using multi-variable gradient boosted trees (historical land disputes, multi-title complexity, forest proximity, & sacred site flags).
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--color-gov-ochre-bright)]">
          <span className="material-symbols-outlined text-[16px]">psychology</span> Re-train XGBoost Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRiskAssessments.map((risk) => {
          const parcel = mockParcels.find(p => p.id === risk.parcelId) || mockParcels[0];
          const isHighRisk = risk.overallRiskScore >= 70;
          return (
            <div key={risk.parcelId} className={`gov-card p-5 border-t-4 ${isHighRisk ? 'border-t-[var(--color-status-error)]' : 'border-t-[var(--color-gov-ochre)]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-[var(--color-gov-navy)]">{parcel.ulpin}</div>
                  <div className="text-[16px] font-bold text-[var(--color-on-surface)] mt-0.5">{parcel.ownerName} • {parcel.village}</div>
                  <div className="text-xs text-[var(--color-on-surface-variant)]">Survey No. {parcel.surveyNumber} ({parcel.area} Ha)</div>
                </div>
                <div className="text-right">
                  <div className={`text-[28px] font-bold ${isHighRisk ? 'text-[var(--color-status-error)]' : 'text-[var(--color-gov-ochre)]'}`}>
                    {risk.overallRiskScore}%
                  </div>
                  <StatusBadge status={risk.recommendation} variant={getStatusVariant(risk.recommendation)} />
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-3 pt-3 border-t border-[var(--color-outline-variant)] text-xs">
                <div className="font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Risk Multipliers</div>
                {[
                  { label: 'Dispute History', val: risk.factors.disputeHistory },
                  { label: 'Forest Proximity', val: risk.factors.forestProximity },
                  { label: 'Multi-Owner Title Complexity', val: risk.factors.multiOwnerComplexity },
                  { label: 'Religious/Community Structure', val: risk.factors.religiousStructures },
                  { label: 'Litigation History', val: risk.factors.litigationHistory },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{f.label}</span>
                      <span className="font-bold">{f.val}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-surface-variant)] h-1.5">
                      <div
                        className={`h-1.5 ${f.val > 70 ? 'bg-[var(--color-status-error)]' : f.val > 40 ? 'bg-[var(--color-gov-ochre)]' : 'bg-[var(--color-land-green)]'}`}
                        style={{ width: `${f.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {isHighRisk && (
                <div className="mt-4 p-3 bg-[var(--color-status-error-bg)] border border-[rgba(186,26,26,0.2)] text-xs text-[var(--color-status-error)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Triggers Feature 7 Automated Route Shift Recommendation</span>
                  </div>
                  <button className="px-2 py-1 bg-[var(--color-status-error)] text-white font-semibold uppercase text-[10px]">Auto-Shift Route</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
