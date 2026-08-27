'use client';

import { mockCompensations, formatINRFull } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

export default function CompensationPage() {
  const comp = mockCompensations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 10 • Statutory Valuation Engine</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Compensation & Valuation Breakdown</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Itemized statutory formula calculation under RFCTLARR Act (2013): Total Award = (Land Base Rate × Market Multiplier) + Asset Structure + Crop Value + Mandatory 100% Solatium Amount.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]">
          <span className="material-symbols-outlined text-[18px]">download</span> Export Full Award Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Valuation Breakdown Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Total Disbursed Hero Card */}
          <div className="gov-card p-6 flex justify-between items-center border-l-4 border-l-[var(--color-land-green)]">
            <div>
              <div className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">TOTAL AWARD AMOUNT</div>
              <div className="text-[36px] font-bold text-[var(--color-gov-navy)]">{formatINRFull(comp.totalAward)}</div>
              <div className="mt-1">
                <StatusBadge status="Fully Processed on Oct 12, 2023" variant="success" icon="check_circle" />
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-[var(--color-land-green)] flex items-center justify-center font-bold text-xs text-[var(--color-land-green)]">
              100%
            </div>
          </div>

          {/* Itemized Valuation Table */}
          <div className="gov-card overflow-hidden">
            <div className="p-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] flex justify-between items-center">
              <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Valuation Breakdown</h3>
              <a href="#formula" className="text-xs text-[var(--color-gov-navy)] font-bold hover:underline">View Calculation Method ↗</a>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="p-3">Component</th>
                  <th className="p-3">Statutory Provision</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">landscape</span>
                    Base Land Value (Market Rate × {comp.marketMultiplier})
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section26Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.baseLandValue * comp.marketMultiplier)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">home</span>
                    Value of Assets Attached (Structures / Wells)
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section29Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.assetStructureValue)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">percent</span>
                    Mandatory Solatium ({comp.solatiumPercentage}% of Land Value)
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section30Reference}</td>
                  <td className="p-3 text-right font-bold text-[var(--color-land-green)]">{formatINRFull(comp.solatiumAmount)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">show_chart</span>
                    Interest Accrued ({comp.interestRate}% p.a.)
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section80Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.interestAccrued)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[var(--color-surface-container-high)] text-sm font-bold text-[var(--color-gov-navy)]">
                  <td className="p-4" colSpan={2}>Final Award Sanctioned Amount:</td>
                  <td className="p-4 text-right text-[18px] text-[var(--color-gov-navy)]">{formatINRFull(comp.totalAward)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right Column: Official Documents */}
        <div className="lg:col-span-4 gov-card p-6 space-y-4">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] border-b border-[var(--color-outline-variant)] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-navy)]">folder_open</span>
            Official Documents
          </h3>

          <div className="space-y-3">
            {[
              { title: 'Final_Award_Notice.pdf', size: '2.4 MB', date: 'Oct 10, 2023', badge: 'Official' },
              { title: 'Valuation_Report_Sec26.pdf', size: '5.1 MB', date: 'Sep 28, 2023', badge: 'Official' },
              { title: 'Disbursement_Receipt_DBT.pdf', size: '1.2 MB', date: 'Oct 12, 2023', badge: 'Receipt' },
            ].map((doc, i) => (
              <div key={i} className="p-3 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[var(--color-on-surface)]">{doc.title}</div>
                  <div className="text-[11px] text-[var(--color-on-surface-variant)]">{doc.size} • {doc.date}</div>
                  <StatusBadge status={doc.badge} variant="info" />
                </div>
                <button className="p-2 text-[var(--color-gov-navy)] hover:bg-white"><span className="material-symbols-outlined text-[20px]">download</span></button>
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-surface-container-low)]">
            Upload Additional Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
