'use client';

import { usePathname } from 'next/navigation';
import { useRole } from '../../../../contexts/RoleContext';
import DataGrid from '../../../../components/ui/DataGrid';
import KPICard from '../../../../components/ui/KPICard';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { mockParcels } from '../../../../data/mockData';

export default function GenericModulePage() {
  const pathname = usePathname();
  const { roleConfig } = useRole();

  // Extract module name from path
  const segments = pathname.split('/').filter(Boolean);
  const rawSlug = segments[segments.length - 1] || 'Module';
  const moduleTitle = rawSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const columns = [
    { key: 'ulpin', label: 'Reference / ULPIN ID', width: '180px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'khasraNumber', label: 'Plot / Khasra No.' },
    { key: 'village', label: 'Village / Division', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'landCategory', label: 'Category' },
    { key: 'ownerName', label: 'Primary Record Holder' },
    { key: 'status', label: 'Statutory Status', render: (v: string) => <StatusBadge status={v} variant="info" /> },
    {
      key: 'action', label: 'Action', align: 'center' as const, render: () => (
        <button className="px-3 py-1 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold hover:bg-[var(--color-surface-container-low)]">
          Inspect Record
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            {roleConfig.label} Module
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">{moduleTitle}</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Official government registry record manager compliant with RFCTLARR Act (2013) guidelines.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]">
          Execute Department Action
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KPICard data={{ label: `${moduleTitle} Records`, value: '142', subtitle: 'Active in District', color: 'navy', icon: 'folder_open' }} />
        <KPICard data={{ label: 'Pending Verification', value: '18', subtitle: 'Requires Officer Signoff', color: 'ochre', icon: 'pending_actions' }} />
        <KPICard data={{ label: 'Compliance Score', value: '98.4%', subtitle: 'Statutory Timelines Met', color: 'green', icon: 'verified' }} />
      </div>

      {/* Data Grid */}
      <DataGrid
        title={`${moduleTitle} Master Registry`}
        columns={columns}
        data={mockParcels}
        totalItems={mockParcels.length}
      />
    </div>
  );
}
