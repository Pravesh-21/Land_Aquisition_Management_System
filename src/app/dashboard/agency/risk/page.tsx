'use client';

import { mockRiskAssessments, mockParcels } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';

export default function RiskScoringPage() {
  return (
    <div className="space-y-6">
      {/* Header - Cleaned without raw ML tags or retrain button */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Predictive Decision Support Engine
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Acquisition Delay & Litigation Risk Assessment</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Predictive risk modeling (0–100%) computed using multi-variable indicators: historical revenue disputes, multi-owner title complexity, forest proximity, & litigation records.
          </p>
        </div>
      </div>

      {/* Risk Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRiskAssessments.map((risk) => {
          const parcel = mockParcels.find((p) => p.id === risk.parcelId) || mockParcels[0];
          const isHighRisk = risk.overallRiskScore >= 70;

          return (
            <div
              key={risk.parcelId}
              className={`gov-card p-5 border-t-4 ${
                isHighRisk ? 'border-t-[var(--color-status-error)]' : 'border-t-[var(--color-gov-ochre)]'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-[var(--color-gov-navy)]">{parcel.ulpin}</div>
                  <div className="text-[16px] font-bold text-[var(--color-on-surface)] mt-0.5">
                    {parcel.ownerName} • {parcel.village}
                  </div>
                  <div className="text-xs text-[var(--color-on-surface-variant)]">
                    Survey No. {parcel.surveyNumber} ({parcel.area} Ha)
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[28px] font-bold ${
                      isHighRisk ? 'text-[var(--color-status-error)]' : 'text-[var(--color-gov-ochre)]'
                    }`}
                  >
                    {risk.overallRiskScore}%
                  </div>
                  <StatusBadge status={risk.recommendation} variant={getStatusVariant(risk.recommendation)} />
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-3 pt-3 border-t border-[var(--color-outline-variant)] text-xs">
                <div className="font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                  Risk Multipliers
                </div>
                {[
                  { label: 'Dispute History', val: risk.factors.disputeHistory },
                  { label: 'Forest Proximity', val: risk.factors.forestProximity },
                  { label: 'Multi-Owner Title Complexity', val: risk.factors.multiOwnerComplexity },
                  { label: 'Religious / Community Structure', val: risk.factors.religiousStructures },
                  { label: 'Litigation History', val: risk.factors.litigationHistory },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{f.label}</span>
                      <span className="font-bold">{f.val}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-surface-variant)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 transition-all ${
                          f.val > 70
                            ? 'bg-[var(--color-status-error)]'
                            : f.val > 40
                            ? 'bg-[var(--color-gov-ochre)]'
                            : 'bg-[var(--color-land-green)]'
                        }`}
                        style={{ width: `${f.val}%` }}
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
                    onClick={() => alert(`Alignment bypass simulation recorded for ${parcel.ulpin}`)}
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
