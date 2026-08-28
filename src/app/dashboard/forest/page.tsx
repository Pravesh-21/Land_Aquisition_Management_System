'use client';

import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import { mockForestClearances, formatINR } from '@/data/mockData';
import Link from 'next/link';

export default function ForestDashboard() {
  const clearanceColumns = [
    { key: 'proposalId', label: 'Proposal ID', width: '200px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'projectName', label: 'Project Name', render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'stage', label: 'Clearance Stage', render: (v: string) => <StatusBadge status={v} variant="info" /> },
    { key: 'forestArea', label: 'Forest Area (Ha)', align: 'right' as const },
    { key: 'treeFellingEstimate', label: 'Tree Count Est.', align: 'right' as const, render: (v: number) => v.toLocaleString() },
    { key: 'npvAmount', label: 'Calculated NPV (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Review Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      render: () => (
        <Link
          href="/dashboard/forest/intersection"
          className="px-3 py-1 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold rounded hover:bg-slate-50 transition-colors"
        >
          Review Overlay
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Ministry of Environment, Forest and Climate Change (MoEFCC)
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Forest & Environment Clearance Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Ecological boundary overlap verification, Stage I/II Forest Clearance NOC pipeline, & Net Present Value (NPV) calculation under Forest (Conservation) Act.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Pending Clearances', value: '4', subtitle: '2 Critical Sanctuary Intersects', color: 'red', icon: 'forest' }} />
        <KPICard data={{ label: 'Forest Area Impacted', value: '45.8 Ha', subtitle: 'Across 3 Division Zones', color: 'ochre', icon: 'nature' }} />
        <KPICard data={{ label: 'Tree Felling Estimate', value: '3,850', subtitle: 'Compensatory CA: 91.6 Ha', color: 'navy', icon: 'forest' }} />
        <KPICard data={{ label: 'Total Calculated NPV', value: '₹ 142.5 Cr', subtitle: 'Per MoEFCC Rates', color: 'green', icon: 'currency_rupee' }} />
      </div>

      {/* Clearances Table */}
      <DataGrid
        title="Forest Clearance Proposals (MoEFCC PARIVESH Sync)"
        columns={clearanceColumns}
        data={mockForestClearances}
        totalItems={mockForestClearances.length}
        showExport={false}
      />
    </div>
  );
}
