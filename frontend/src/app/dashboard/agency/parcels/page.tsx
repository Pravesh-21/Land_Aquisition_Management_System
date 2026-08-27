'use client';

import { mockParcels } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';
import { formatINR } from '@/data/mockData';

export default function ParcelsPage() {
  const parcelColumns = [
    { key: 'ulpin', label: 'ULPIN (14-Digit Bhu-Aadhar)', width: '200px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'surveyNumber', label: 'Survey / Khasra', render: (_: any, r: any) => `${r.surveyNumber} (${r.khasraNumber})` },
    { key: 'village', label: 'Village / Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'area', label: 'Area (Ha)', align: 'right' as const },
    { key: 'landCategory', label: 'Category', render: (v: string, r: any) => <div><div className="font-semibold">{v}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">{r.landSubType || 'Standard'}</div></div> },
    { key: 'ownerName', label: 'Registered Owner', render: (v: string, r: any) => <div><div className="font-semibold">{v}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">{r.ownerAadhaar}</div></div> },
    { key: 'marketRate', label: 'Est. Valuation', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 2 • Geospatial Ingestion</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Automated 14-Digit ULPIN / Bhu-Aadhar Ingestion</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Real-time PostGIS ST_Intersects vector query results. Synchronized with State Land Records (Bhu-Naksha / Revenue DB).
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--color-gov-navy-dark)]">
            <span className="material-symbols-outlined text-[16px]">sync</span> Fetch Bhu-Naksha Vector
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="gov-card p-4 border-l-4 border-l-[var(--color-gov-navy)]">
          <div className="text-[11px] text-[var(--color-on-surface-variant)] uppercase font-semibold">Total Intersected ULPINs</div>
          <div className="text-[28px] font-bold text-[var(--color-gov-navy)]">{mockParcels.length}</div>
          <div className="text-[11px] text-[var(--color-land-green)] font-medium">100% Vector Match</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-l-[var(--color-gov-ochre)]">
          <div className="text-[11px] text-[var(--color-on-surface-variant)] uppercase font-semibold">Acquisition Area</div>
          <div className="text-[28px] font-bold text-[var(--color-gov-ochre)]">
            {mockParcels.reduce((acc, p) => acc + p.area, 0).toFixed(2)} Ha
          </div>
          <div className="text-[11px] text-[var(--color-on-surface-variant)]">Across 4 Villages</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-l-[var(--color-land-green)]">
          <div className="text-[11px] text-[var(--color-on-surface-variant)] uppercase font-semibold">Total Estimated Value</div>
          <div className="text-[28px] font-bold text-[var(--color-land-green)]">
            {formatINR(mockParcels.reduce((acc, p) => acc + p.marketRate, 0))}
          </div>
          <div className="text-[11px] text-[var(--color-on-surface-variant)]">Based on DLC 2023-24</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-l-[var(--color-status-error)]">
          <div className="text-[11px] text-[var(--color-on-surface-variant)] uppercase font-semibold">Flagged / Encumbered</div>
          <div className="text-[28px] font-bold text-[var(--color-status-error)]">
            {mockParcels.filter(p => p.disputeFlag || p.riskScore > 70).length}
          </div>
          <div className="text-[11px] text-[var(--color-status-error)]">Requires Special Clearance</div>
        </div>
      </div>

      {/* Main ULPIN Table */}
      <DataGrid
        title="Intersected Cadastral Land Parcels (Bhu-Aadhar Master Record)"
        columns={parcelColumns}
        data={mockParcels}
        totalItems={mockParcels.length}
      />
    </div>
  );
}
