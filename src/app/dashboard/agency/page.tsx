'use client';

import KPICard from '@/components/ui/KPICard';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockProjects, formatINR } from '@/data/mockData';
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
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Requisite Agency Single Window
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Project Corridor & Land Requirement Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Project corridor management, spatial OpenStreetMap mapping, & land requirement assessment under RFCTLARR Act (2013).
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/agency/corridor"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            Open Full WebGIS Editor
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* Interactive Leaflet WebGIS Map Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-navy)] text-[22px]">map</span>
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">
              Active Project Corridor & Land Acquisition Polygons (OpenStreetMap)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            NH-44 Nagpur-Hyderabad Corridor (Phase II)
          </span>
        </div>

        <ProjectLandMap
          height="460px"
          showLayerControls={true}
        />
      </div>

      {/* Active Projects Table */}
      <DataGrid
        title="Active Acquisition Projects"
        columns={projectColumns}
        data={mockProjects}
        totalItems={mockProjects.length}
        showExport={false}
      />
    </div>
  );
}
