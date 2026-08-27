'use client';

import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import { mockBeneficiaries, formatINR } from '@/data/mockData';
import Link from 'next/link';

export default function LAODashboard() {
  const beneficiaryColumns = [
    { key: 'id', label: 'Beneficiary ID', width: '130px', render: (v: string) => <span className="font-semibold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'name', label: 'Name & Details', render: (v: string, r: any) => <div><div className="font-semibold text-[var(--color-on-surface)]">{v}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">Acct ending in {r.accountNumber}</div></div> },
    { key: 'village', label: 'Village / Survey', render: (_: any, r: any) => `${r.village} / ${r.surveyNumber}` },
    { key: 'kycStatus', label: 'KYC Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} icon={v === 'Verified' ? 'check_circle' : 'warning'} /> },
    { key: 'disbursementAmount', label: 'Disbursement Amount', align: 'right' as const, render: (v: number) => <span className="font-semibold">{formatINR(v)}</span> },
    {
      key: 'action', label: 'Action', align: 'center' as const, render: (_: any, r: any) => (
        r.kycStatus === 'Verified' ? (
          <button className="px-3 py-1 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold hover:bg-[var(--color-status-info-bg)]">
            Verify & Approve
          </button>
        ) : (
          <button className="px-3 py-1 bg-[var(--color-surface-variant)] text-[var(--color-outline)] text-xs font-semibold cursor-not-allowed" disabled>
            Resolve Issue
          </button>
        )
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">LAO Disbursement Approval Portal</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Authorize Direct Benefit Transfer (DBT) payments for verified land acquisition beneficiaries under RFCTLARR Act (2013).
          </p>
        </div>
        <Link href="/dashboard/lao/beneficiaries" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">payments</span>
          Trigger DBT Batch
        </Link>
      </div>

      {/* Batch Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Large Status Card */}
        <div className="md:col-span-8 gov-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-[24px] font-bold text-[var(--color-gov-navy)] mb-1">Batch #9482-A Summary</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Total allocation for NH-44 Phase II Highway Expansion.</p>
            </div>
            <StatusBadge status="Ready for Review" variant="info" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="border-l-4 border-[var(--color-gov-navy)] pl-4">
              <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">Total Beneficiaries</div>
              <div className="text-[36px] font-bold text-[var(--color-on-surface)]">1,452</div>
            </div>
            <div className="border-l-4 border-[var(--color-gov-tertiary-container)] pl-4">
              <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">Total Amount Pending</div>
              <div className="text-[28px] font-bold text-[var(--color-on-surface)] mt-2">₹ 45.2 Cr</div>
            </div>
            <div className="border-l-4 border-[var(--color-gov-ochre)] pl-4">
              <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">Est. Processing Time</div>
              <div className="text-[28px] font-bold text-[var(--color-on-surface)] mt-2">2-4 Hrs</div>
            </div>
          </div>
        </div>

        {/* KYC Status Small Card */}
        <div className="md:col-span-4 gov-card p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">KYC Verification</h4>
            <span className="material-symbols-outlined text-[var(--color-gov-ochre)]">verified_user</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-[36px] font-bold text-[var(--color-on-surface)] leading-none">1,398</span>
            <span className="text-xs text-[var(--color-on-surface-variant)] pb-1">/ 1,452</span>
          </div>
          <div className="w-full bg-[var(--color-surface-variant)] h-2 mt-2">
            <div className="bg-[var(--color-land-green)] h-full" style={{ width: '96%' }}></div>
          </div>
          <p className="text-[12px] text-[var(--color-on-surface-variant)] mt-3">54 records require manual review before batch processing.</p>
        </div>
      </div>

      {/* Pending Beneficiaries Table */}
      <DataGrid
        title="Pending Beneficiary Authorizations"
        columns={beneficiaryColumns}
        data={mockBeneficiaries}
        totalItems={1452}
      />
    </div>
  );
}
