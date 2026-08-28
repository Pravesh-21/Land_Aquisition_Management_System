'use client';

import { useState } from 'react';
import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockParcels, formatINR } from '@/data/mockData';
import Link from 'next/link';

export default function LAODashboard() {
  const [activeTab, setActiveTab] = useState<'cases' | 'map' | 'verification' | 'hearings'>('cases');

  const assignedCasesColumns = [
    { key: 'ulpin', label: 'ULPIN / Reference', width: '180px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'khasraNumber', label: 'Plot / Khasra No.', render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'village', label: 'Village & Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'ownerName', label: 'Primary Landowner' },
    { key: 'area', label: 'Area (Ha)', align: 'right' as const, render: (v: number) => v ? `${v} Ha` : '1.42 Ha' },
    { key: 'status', label: 'Statutory Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Link
          href={`/dashboard/lao/parcel-verification?ulpin=${r.ulpin}`}
          className="px-3 py-1.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-[var(--color-gov-navy-dark)] transition-colors inline-block"
        >
          Verify & Process
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
            Revenue Department • Land Acquisition Division
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Land Acquisition Officer (LAO) Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Case docket management, field survey asset verification, Section 15 hearings, and RFCTLARR compensation award processing.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Assigned Parcels', value: '142', subtitle: 'NH-44 Corridor Phase II', color: 'navy', icon: 'folder_open' }} />
        <KPICard data={{ label: 'Pending Field Verification', value: '18', subtitle: 'Requires Surveyor Audit', color: 'ochre', icon: 'explore' }} />
        <KPICard data={{ label: 'Active Section 15 Hearings', value: '7', subtitle: 'Scheduled this week', color: 'tertiary', icon: 'gavel' }} />
        <KPICard data={{ label: 'Awards Sanctioned', value: '₹ 45.2 Cr', subtitle: 'Collector Approved', color: 'green', icon: 'verified' }} />
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
            📋 Assigned Acquisition Cases ({mockParcels.length})
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
            data={mockParcels}
            totalItems={mockParcels.length}
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
            />
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">Parcels Awaiting Physical / Document Sign-off</h3>
              <Link
                href="/dashboard/lao/parcel-verification"
                className="text-xs font-bold text-[#0072BC] hover:underline"
              >
                Open Full Verification Pipeline →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockParcels.slice(0, 3).map((p) => (
                <div key={p.id} className="p-4 border border-slate-200 rounded bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-[var(--color-gov-navy)]">{p.ulpin}</span>
                    <StatusBadge status="Needs Review" variant="warning" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">{p.ownerName}</div>
                  <div className="text-[11px] text-slate-500">{p.village}, {p.tehsil} • {p.area} Ha</div>
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/lao/parcel-verification?ulpin=${p.ulpin}`}
                      className="block w-full py-1.5 text-center bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold rounded hover:bg-blue-50"
                    >
                      Inspect & Verify
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hearings' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">Upcoming Section 15 Objection Hearings</h3>
              <Link
                href="/dashboard/lao/hearing-management"
                className="text-xs font-bold text-[#0072BC] hover:underline"
              >
                Open Hearing Management →
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { time: 'Tomorrow, 11:00 AM', parcel: 'IN-MH-440001-A12B', owner: 'Sh. Rajendra Patel', issue: 'Tree count enumeration discrepancy on Survey 442' },
                { time: '30-Aug, 02:30 PM', parcel: 'IN-MH-440001-B04K', owner: 'Smt. Kamla Devi', issue: 'Joint ownership division & compensation split inquiry' },
              ].map((h, i) => (
                <div key={i} className="p-3 border border-slate-200 rounded bg-slate-50 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{h.owner} • <span className="font-mono text-[#0072BC]">{h.parcel}</span></div>
                    <div className="text-slate-600 mt-0.5">{h.issue}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{h.time}</div>
                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded">Hearing Room 2</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
