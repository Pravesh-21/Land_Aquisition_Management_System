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
    { key: 'stage', label: 'Stage', render: (v: string) => <StatusBadge status={v} variant="info" /> },
    { key: 'forestArea', label: 'Forest Area (Ha)', align: 'right' as const },
    { key: 'treeFellingEstimate', label: 'Tree Felling Est.', align: 'right' as const, render: (v: number) => v.toLocaleString() },
    { key: 'npvAmount', label: 'Est. NPV (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Forest & Environment Clearance Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Ecological boundary overlap checker, Stage I/II Forest Clearance NOC pipeline, & Net Present Value (NPV) calculation.
          </p>
        </div>
        <Link href="/dashboard/forest/intersection" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-land-green)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">layers</span>
          Run Spatial Overlay Analysis
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Pending Clearances', value: '4', subtitle: '2 Critical Sanctuary Intersects', color: 'red', icon: 'forest' }} />
        <KPICard data={{ label: 'Forest Area Impacted', value: '45.8 Ha', subtitle: 'Across 3 Division Zones', color: 'ochre', icon: 'nature' }} />
        <KPICard data={{ label: 'Tree Felling Estimate', value: '3,850', subtitle: 'Compensatory CA: 91.6 Ha', color: 'navy', icon: 'forest' }} />
        <KPICard data={{ label: 'Total Calculated NPV', value: '₹ 142.5 Cr', subtitle: 'Per MoEFCC 2023 Rates', color: 'green', icon: 'currency_rupee' }} />
      </div>

      <DataGrid
        title="Forest Clearance Proposals (MoEFCC PARIVESH Sync)"
        columns={clearanceColumns}
        data={mockForestClearances}
        totalItems={mockForestClearances.length}
      />
    </div>
  );
}
