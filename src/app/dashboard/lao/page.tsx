'use client';

import { useState, useEffect } from 'react';
import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockParcels, formatINR } from '@/data/mockData';
import { getCollectorSignedStatus, getLatestCrossRoleAction } from '@/utils/workflowState';
import Link from 'next/link';

export default function LAODashboard() {
  const [activeTab, setActiveTab] = useState<'cases' | 'map' | 'verification' | 'hearings'>('cases');
  const [isCollectorSigned, setIsCollectorSigned] = useState(false);
  const [latestAction, setLatestAction] = useState<{ text: string; timestamp: string } | null>(null);

  const loadData = () => {
    const status = getCollectorSignedStatus();
    setIsCollectorSigned(status.isSigned);
    setLatestAction(getLatestCrossRoleAction());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bhu_workflow_update', loadData);
    return () => window.removeEventListener('bhu_workflow_update', loadData);
  }, []);

  const assignedCasesData = mockParcels.map((parcel, idx) => {
    if (idx === 0 && isCollectorSigned) {
      return {
        ...parcel,
        status: 'Award Sanctioned (Ready for DBT)',
      };
    }
    return parcel;
  });

  const assignedCasesColumns = [
    { key: 'ulpin', label: 'ULPIN / Reference', width: '180px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'khasraNumber', label: 'Plot / Khasra No.', render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'village', label: 'Village & Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'ownerName', label: 'Primary Landowner' },
    { key: 'area', label: 'Area (Ha)', align: 'right' as const, render: (v: number) => v ? `${v} Ha` : '1.42 Ha' },
    {
      key: 'assetCount',
      label: 'Standing Assets',
      render: (v: any) => (
        <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-bold rounded text-[11px]">
          📦 {v ? `${v.total} (${v.structures}S/${v.trees}T/${v.wells}W)` : '26 Assets'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statutory Stage',
      render: (v: string, r: any) => {
        if (r.id === 'P001' && isCollectorSigned) {
          return <StatusBadge status="Award Sanctioned (Ready for DBT)" variant="success" icon="verified" />;
        }
        return <StatusBadge status={v} variant={getStatusVariant(v)} />;
      },
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      render: (_: any, r: any) => {
        if (r.id === 'P001' && isCollectorSigned) {
          return (
            <Link
              href="/dashboard/lao/dbt-disbursement"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded transition-colors inline-block"
            >
              💰 Authorize DBT
            </Link>
          );
        }
        return (
          <Link
            href={`/dashboard/lao/parcel-verification?ulpin=${r.ulpin}`}
            className="px-3 py-1.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-[var(--color-gov-navy-dark)] transition-colors inline-block"
          >
            Verify & Process
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Revenue Department • Land Acquisition Division
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Land Acquisition Officer (LAO) Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Case docket management, field survey asset verification, Section 15 hearings, and RFCTLARR compensation award processing.
          </p>
        </div>
      </div>

      {latestAction && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">sync_alt</span>
            <span><strong>Cross-Role Handshake ({latestAction.timestamp}):</strong> {latestAction.text}</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded uppercase">
            Handoff Verified
          </span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Assigned Parcels', value: '142', subtitle: 'NH-44 Corridor Phase II', color: 'navy', icon: 'folder_open' }} />
        <KPICard data={{ label: 'Pending Field Verification', value: '18', subtitle: 'Requires Surveyor Audit', color: 'ochre', icon: 'explore' }} />
        <KPICard data={{ label: 'Active Section 15 Hearings', value: '7', subtitle: 'Scheduled this week', color: 'tertiary', icon: 'gavel' }} />
        <KPICard data={{ label: 'Awards Sanctioned', value: isCollectorSigned ? '₹ 49.9 Cr' : '₹ 45.2 Cr', subtitle: isCollectorSigned ? 'Collector Approved Today ✓' : 'Collector Approved', color: 'green', icon: 'verified' }} />
      </div>

      {/* Spatial Cadastral Leaflet & OpenStreetMap WebGIS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0072BC]">map</span>
            Acquisition Corridor Cadastral Map & Standing Assets (Leaflet & OpenStreetMap)
          </h3>
          <div className="text-xs text-slate-500 font-medium">
            Section 29 Standing Assets (Structures, Trees, Wells) Visualized
          </div>
        </div>
        <ProjectLandMap height="460px" showLayerControls={true} showAssets={true} />
      </div>

      {/* Tab Navigation for Docket */}
      <div className="gov-card overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 flex-wrap">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'cases'
                ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Assigned Acquisition Cases ({assignedCasesData.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'map'
                ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            🗺 OpenStreetMap GIS Cadastral View
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'verification'
                ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            🔍 Pending Verification Queue (18)
          </button>
          <button
            onClick={() => setActiveTab('hearings')}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'hearings'
                ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖ Section 15 Hearings Docket (7)
          </button>
        </div>

        {activeTab === 'cases' && (
          <DataGrid
            columns={assignedCasesColumns}
            data={assignedCasesData}
            totalItems={assignedCasesData.length}
            showExport={false}
          />
        )}

        {activeTab === 'map' && (
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cadastral Survey Layer • NH-44 Alignment & Acquired Plots
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Click any plot polygon to view statutory details
              </span>
            </div>
            <ProjectLandMap
              height="480px"
              showLayerControls={true}
              showAssets={true}
            />
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-[var(--color-gov-navy)] text-base">Field Inspection & Spatial Discrepancy Queue</h4>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded">18 Parcels Pending Ground Survey</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Survey Plot #445/1 (Wanadongri)</div>
                  <div className="text-slate-600">Discrepancy: GIS boundary (2.15 Ha) vs RoR recorded (2.05 Ha). +0.10 Ha variation.</div>
                </div>
                <Link href="/dashboard/lao/parcel-verification?ulpin=IN-MH-440001-B04K" className="px-3 py-1.5 bg-[var(--color-gov-navy)] text-white font-bold rounded hover:bg-[var(--color-gov-navy-dark)]">
                  Resolve Boundary
                </Link>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Survey Plot #448/3 (Karanja Buffer Zone)</div>
                  <div className="text-slate-600">Discrepancy: Tree enumeration count requires joint inspection with DFO forest guards.</div>
                </div>
                <Link href="/dashboard/lao/vegetation" className="px-3 py-1.5 bg-[var(--color-gov-navy)] text-white font-bold rounded hover:bg-[var(--color-gov-navy-dark)]">
                  Inspect Canopy
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hearings' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-[var(--color-gov-navy)] text-base">Section 15 Statutory Objection Hearings Schedule</h4>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded">7 Hearings Listed</span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Sh. Rajendra Patel vs NHAI PIU Nagpur (Survey #442/1-A)</div>
                  <div className="text-slate-500">Subject: Section 29 Standing Asset Tree Valuation Recheck • Time: 14-Nov-2024 (11:30 AM)</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">Notice Served</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">M/s Sharma Enterprises vs Suresh Patel (Survey #445/1)</div>
                  <div className="text-slate-500">Subject: Commercial Access Road Demarcation • Time: 18-Nov-2024 (02:00 PM)</div>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded text-[11px]">Summons Pending</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
