'use client';

import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import { mockProjects, formatINR } from '@/data/mockData';
import Link from 'next/link';

export default function CollectorDashboard() {
  const proposalColumns = [
    { key: 'id', label: 'Ref ID', width: '120px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'name', label: 'Project Name', render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'agency', label: 'Requisite Agency' },
    { key: 'totalArea', label: 'Area (Ha)', align: 'right' as const },
    { key: 'estimatedCost', label: 'Est. Award (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Acquisition Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
    {
      key: 'action', label: 'Action Queue', align: 'center' as const, render: (_: any, r: any) => (
        <Link href="/dashboard/collector/approvals" className="px-3 py-1 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase hover:bg-[var(--color-gov-ochre-bright)]">
          e-Sign Approval
        </Link>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">District Collector Executive Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Statutory Section 11 & Section 19 Gazette e-Sign authorization, statutory escalation management, & final acquisition sanctioning under RFCTLARR Act (2013).
          </p>
        </div>
        <Link href="/dashboard/collector/approvals" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          Pending e-Sign Approval Queue (3)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'District Projects', value: '14', subtitle: 'District Nagpur', color: 'navy', icon: 'account_balance' }} />
        <KPICard data={{ label: 'Section 11 Pending', value: '3', subtitle: 'Gazette Notifications', color: 'ochre', icon: 'gavel' }} />
        <KPICard data={{ label: 'Section 19 Sanction', value: '2', subtitle: 'Awaiting e-Signature', color: 'red', icon: 'draw' }} />
        <KPICard data={{ label: 'Total Disbursed', value: '₹ 184.2 Cr', subtitle: '100% Solatium included', color: 'green', icon: 'payments' }} />
      </div>

      <DataGrid
        title="Acquisition Proposal Approval Queue (Statutory Section 11 / 19)"
        columns={proposalColumns}
        data={mockProjects}
        totalItems={mockProjects.length}
      />
    </div>
  );
}
