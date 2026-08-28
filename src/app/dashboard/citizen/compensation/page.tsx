'use client';

import { useState } from 'react';
import { mockCompensations, formatINRFull } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export default function CompensationPage() {
  const comp = mockCompensations[0];
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Statutory Land Award Assessment
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Compensation & Valuation Breakdown</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Itemized statutory compensation determination under the RFCTLARR Act (2013) for your acquired land parcel.
          </p>
        </div>
        <Link
          href="/dashboard/citizen/documents"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]"
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span> View Award Documents
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Valuation Breakdown Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Total Disbursed Hero Card */}
          <div className="gov-card p-6 flex justify-between items-center border-l-4 border-l-[var(--color-land-green)]">
            <div>
              <div className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">TOTAL AWARD AMOUNT (SANCTIONED)</div>
              <div className="text-[36px] font-bold text-[var(--color-gov-navy)]">{formatINRFull(comp.totalAward)}</div>
              <div className="mt-1">
                <StatusBadge status="Disbursed via Aadhaar DBT" variant="success" icon="check_circle" />
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-[var(--color-land-green)] flex items-center justify-center font-bold text-xs text-[var(--color-land-green)]">
              100%
            </div>
          </div>

          {/* Itemized Valuation Table */}
          <div className="gov-card overflow-hidden">
            <div className="p-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] flex justify-between items-center">
              <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Itemized Statutory Components</h3>
              <button
                onClick={() => setShowCalculationModal(true)}
                className="text-xs text-[var(--color-gov-navy)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">calculate</span> View Calculation Method
              </button>
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
                    Base Land Market Value (Rate × Multiplier {comp.marketMultiplier})
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section26Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.baseLandValue * comp.marketMultiplier)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">home</span>
                    Value of Attached Assets (Structures / Trees / Wells)
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section29Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.assetStructureValue)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">percent</span>
                    Mandatory 100% Solatium Amount
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section30Reference}</td>
                  <td className="p-3 text-right font-bold text-[var(--color-land-green)]">{formatINRFull(comp.solatiumAmount)}</td>
                </tr>

                <tr className="gov-table-row">
                  <td className="p-3 font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">show_chart</span>
                    Interest Accrued (12% p.a. from Sec 11 Notification)
                  </td>
                  <td className="p-3 text-[var(--color-on-surface-variant)]">{comp.section80Reference}</td>
                  <td className="p-3 text-right font-bold">{formatINRFull(comp.interestAccrued)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[var(--color-surface-container-high)] text-sm font-bold text-[var(--color-gov-navy)]">
                  <td className="p-4" colSpan={2}>Final Award Amount:</td>
                  <td className="p-4 text-right text-[18px] text-[var(--color-gov-navy)]">{formatINRFull(comp.totalAward)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right Column: Payment Details & Linked Documents */}
        <div className="lg:col-span-4 space-y-6">
          <div className="gov-card p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] border-b border-[var(--color-outline-variant)] pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-land-green)]">verified_user</span>
              Disbursement Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary Name</span>
                <span className="font-bold text-slate-800">Sh. Rajendra Patel</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bank Account</span>
                <span className="font-bold text-slate-800">SBI A/C ****4920</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">IFSC Code</span>
                <span className="font-mono font-bold text-slate-800">SBIN0001042</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">PFMS / UTR Reference</span>
                <span className="font-mono font-bold text-slate-800">UTR-2023-1012-9842</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Disbursement Date</span>
                <span className="font-bold text-slate-800">12-Oct-2023</span>
              </div>
            </div>
          </div>

          <div className="gov-card p-6 space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-gov-navy)]">folder_open</span>
              Award Documents
            </h3>
            <p className="text-xs text-slate-500">
              Download official signed award declarations and bank credit receipts from the Documents tab.
            </p>
            <Link
              href="/dashboard/citizen/documents"
              className="block w-full py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold uppercase tracking-wider text-center hover:bg-slate-50"
            >
              Open Documents Repository →
            </Link>
          </div>
        </div>
      </div>

      {/* Statutory Calculation Method Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-300 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0072BC]">calculate</span>
                <h3 className="text-lg font-bold text-slate-900">RFCTLARR 2013 Statutory Valuation Formula</h3>
              </div>
              <button
                onClick={() => setShowCalculationModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-bold text-[#003178] mb-1">1. Base Market Value (Section 26)</div>
                <div>Determined by higher of: circle rate, average sale price of top 50% registered deeds in 3 years, or agreed consent rate. Multiplied by rural factor (1.0× to 2.0×).</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-bold text-[#003178] mb-1">2. Valuation of Assets Attached (Section 29)</div>
                <div>Independent certified valuation of structures, residential buildings, irrigation wells, tube wells, and standing timber/horticulture crops.</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <div className="font-bold text-emerald-900 mb-1">3. Mandatory 100% Solatium (Section 30)</div>
                <div>Statutory mandatory solatium equivalent to <strong>100%</strong> of the total land value is added over and above the assessed market value.</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-bold text-[#003178] mb-1">4. Additional Compensation / Interest (Section 80)</div>
                <div>Interest accrued at <strong>12% per annum</strong> from the preliminary notification date (Section 11) to the date of award publication.</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCalculationModal(false)}
                className="px-5 py-2 bg-[#0072BC] text-white text-xs font-bold uppercase rounded hover:bg-[#005c99]"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
