'use client';

import KPICard from '@/components/ui/KPICard';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';
import { mockProjects, mockParcels, formatINR } from '@/data/mockData';
import { KPIData } from '@/types';
import Link from 'next/link';

const kpiData: KPIData[] = [
  { label: 'Active Projects', value: '12', subtitle: '3 new this quarter', icon: 'folder_open', color: 'navy', trend: 'up', trendValue: '+3 from last quarter' },
  { label: 'Total Corridor Length', value: '458 km', subtitle: 'Across 5 states', icon: 'route', color: 'ochre' },
  { label: 'Parcels Identified', value: '3,842', subtitle: '1,204 Ha total area', icon: 'grid_view', color: 'green', trend: 'up', trendValue: '+342 this month' },
  { label: 'Pending Approvals', value: '23', subtitle: '8 overdue > 15 days', icon: 'pending_actions', color: 'red', trend: 'down', trendValue: '-5 from last week' },
];

const projectColumns = [
  { key: 'id', label: 'Project ID', width: '120px', render: (v: string) => <span className="font-semibold text-[var(--color-gov-navy)]">{v}</span> },
  { key: 'name', label: 'Project Name', render: (v: string) => <span className="font-medium">{v}</span> },
  { key: 'type', label: 'Type' },
  { key: 'agency', label: 'Agency' },
  { key: 'state', label: 'State' },
  { key: 'totalParcels', label: 'Parcels', align: 'right' as const },
  { key: 'corridorLength', label: 'Corridor (km)', align: 'right' as const },
  { key: 'estimatedCost', label: 'Est. Cost', align: 'right' as const, render: (v: number) => formatINR(v) },
  { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
];

export default function AgencyDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Requisite Agency Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Project corridor management, spatial mapping & land requirement assessment
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/agency/registration" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-status-info-bg)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </Link>
          <Link href="/dashboard/agency/corridor" className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">route</span>
            Draw Corridor
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* Active Projects Table */}
      <DataGrid
        title="Active Projects"
        columns={projectColumns}
        data={mockProjects}
        totalItems={12}
      />

      {/* Bottom Grid: Quick Stats + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Acquisition Pipeline */}
        <div className="lg:col-span-8 gov-card p-5">
          <h3 className="text-[16px] font-semibold text-[var(--color-gov-navy)] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">schema</span>
            Acquisition Pipeline Summary
          </h3>
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'Proposal', count: 5, color: 'bg-[var(--color-status-info-bg)]' },
              { label: 'SIA', count: 3, color: 'bg-[var(--color-status-warning-bg)]' },
              { label: 'Sec 11', count: 4, color: 'bg-[var(--color-gov-ochre-light)]' },
              { label: 'Sec 19', count: 2, color: 'bg-[var(--color-status-success-bg)]' },
              { label: 'Award', count: 6, color: 'bg-[#E8F5E9]' },
              { label: 'Possession', count: 8, color: 'bg-[#C8E6C9]' },
            ].map((stage) => (
              <div key={stage.label} className={`${stage.color} p-3 border border-[var(--color-outline-variant)] text-center`}>
                <div className="text-[24px] font-bold text-[var(--color-on-surface)]">{stage.count}</div>
                <div className="text-[11px] font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Alerts */}
        <div className="lg:col-span-4 gov-card p-5">
          <h3 className="text-[16px] font-semibold text-[var(--color-gov-navy)] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[var(--color-status-error)]">timer_off</span>
            Statutory Escalations
          </h3>
          <div className="space-y-3">
            {[
              { id: 'PRJ-001', label: 'Forest Clearance Pending', days: 22, severity: 'error' as const },
              { id: 'PRJ-003', label: 'SIA Report Overdue', days: 18, severity: 'error' as const },
              { id: 'PRJ-005', label: 'Proposal Review Pending', days: 12, severity: 'warning' as const },
            ].map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
                <div>
                  <div className="text-[13px] font-semibold text-[var(--color-on-surface)]">{alert.label}</div>
                  <div className="text-[11px] text-[var(--color-on-surface-variant)]">{alert.id}</div>
                </div>
                <StatusBadge status={`${alert.days} days`} variant={alert.severity} icon="schedule" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
