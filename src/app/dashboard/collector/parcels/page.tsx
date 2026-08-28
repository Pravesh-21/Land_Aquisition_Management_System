'use client';

import { useState } from 'react';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockParcels, formatINR } from '@/data/mockData';

export default function CollectorParcelsPage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const columns = [
    { key: 'ulpin', label: 'ULPIN (Parcel ID)', width: '180px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'surveyNumber', label: 'Survey / Khasra No.' },
    { key: 'village', label: 'Village & Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'ownerName', label: 'Recorded Landowner' },
    { key: 'area', label: 'Area (Ha)', align: 'right' as const, render: (v: number) => `${v} Ha` },
    { key: 'marketRate', label: 'Assessed Value', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Statutory Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            District Administration • Cadastral Parcel Registry
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">District Land & Parcel Overview</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            District Collectorate spatial cadastral map & master registry of all parcels surveyed for acquisition.
          </p>
        </div>
      </div>

      {/* Spatial Leaflet OpenStreetMap View */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-navy)]">map</span>
            District OpenStreetMap GIS Cadastral Layer
          </h3>
          <span className="text-xs font-semibold text-slate-500">142 Parcels under NH-44 Alignment</span>
        </div>

        <ProjectLandMap
          height="450px"
          selectedUlpin={selectedParcel?.ulpin}
          onParcelSelect={(p) => setSelectedParcel(p)}
          showLayerControls={true}
        />
      </div>

      {/* Parcels Table */}
      <DataGrid
        title="District Master Parcel Registry"
        columns={columns}
        data={mockParcels}
        totalItems={mockParcels.length}
        showExport={false}
      />
    </div>
  );
}
