'use client';

import { useState, useEffect } from 'react';
import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { getSharedHearings, getLatestCrossRoleAction } from '@/utils/workflowState';
import { Hearing } from '@/types';
import Link from 'next/link';

export default function TehsildarDashboard() {
  const [hearingsData, setHearingsData] = useState<Hearing[]>([]);
  const [latestAction, setLatestAction] = useState<{ text: string; timestamp: string } | null>(null);

  const loadData = () => {
    setHearingsData(getSharedHearings());
    setLatestAction(getLatestCrossRoleAction());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bhu_workflow_update', loadData);
    return () => window.removeEventListener('bhu_workflow_update', loadData);
  }, []);

  const hearingColumns = [
    { key: 'caseId', label: 'Case ID', width: '150px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'khasraNumber', label: 'Khasra No.' },
    { key: 'village', label: 'Village / Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'disputeType', label: 'Dispute Type', render: (v: string) => <StatusBadge status={v} variant="error" /> },
    {
      key: 'applicant',
      label: 'Applicant vs Respondent',
      render: (_: any, r: any) => (
        <div>
          <div className="font-semibold text-slate-900">{r.applicant?.name || 'Petitioner'}</div>
          <div className="text-[11px] text-[var(--color-on-surface-variant)]">vs. {r.respondent?.name || 'Respondent'}</div>
        </div>
      ),
    },
    { key: 'scheduledDate', label: 'Scheduled Hearing', render: (_: any, r: any) => r.scheduledDate ? `${r.scheduledDate} ${r.scheduledTime || ''}` : 'Not Scheduled' },
    {
      key: 'action', label: 'Action', align: 'center' as const, render: () => (
        <Link href="/dashboard/tehsildar/hearing-manager" className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold uppercase rounded transition-colors">
          Manage Hearing
        </Link>
      )
    },
  ];

  const tehsildarModules = [
    { id: '1', title: 'Hearing Manager', desc: 'Schedule hearings, record attendance, statements & findings', href: '/dashboard/tehsildar/hearing-manager', icon: 'gavel', badge: '5 Scheduled' },
    { id: '2', title: 'Dispute Cases Register', desc: 'Section 64/76 boundary overlaps, title rivalries & injunctions', href: '/dashboard/tehsildar/disputes', icon: 'folder_open', badge: '18 Cases' },
    { id: '3', title: 'Affected Persons & Disbursement', desc: '1,452 PAP/PAF records, Aadhaar e-KYC & DBT authorizations', href: '/dashboard/tehsildar/affected-persons', icon: 'groups', badge: '₹ 184.2 Cr' },
    { id: '4', title: 'Land Record & RoR Verification', desc: '7/12 & Jamabandi DILRMP digitized database reconciliation', href: '/dashboard/tehsildar/revenue-verification', icon: 'fact_check', badge: '124 Verified' },
    { id: '5', title: 'Mutation Tracking', desc: 'Section 38 possession mutations & alienation transfer orders', href: '/dashboard/tehsildar/mutation-tracking', icon: 'swap_horiz', badge: '88% Done' },
    { id: '6', title: 'Acquisition Parcel Overview', desc: 'Spatial cadastral overview of all 142 Tehsil plots', href: '/dashboard/tehsildar/parcels', icon: 'landscape', badge: '142 Plots' },
    { id: '7', title: 'Case & Document Records', desc: 'Summons notices, patwari maps, affidavits & stay orders', href: '/dashboard/tehsildar/documents', icon: 'description', badge: '48 Records' },
    { id: '8', title: 'Pending Actions & Alerts', desc: 'High-court stays, approaching reply deadlines & e-KYC queue', href: '/dashboard/tehsildar/alerts', icon: 'notifications_active', badge: '4 Priority' },
    { id: '9', title: 'Tehsil-Level Reports', desc: 'Monthly returns for District Collector & Revenue Board', href: '/dashboard/tehsildar/reports', icon: 'analytics', badge: '12 Reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Revenue Department • Office of the Tehsildar & Revenue Magistrate
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Revenue Court & Tehsildar Command Center</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Digital hearing scheduler, spatial cadastral boundary verification, standing asset inspection, and court dispute resolution under RFCTLARR Act (2013).
          </p>
        </div>
        <Link href="/dashboard/tehsildar/hearing-manager" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">event</span>
          Schedule New Hearing
        </Link>
      </div>

      {latestAction && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#0072BC]">sync_alt</span>
            <span><strong>Live Pipeline Activity ({latestAction.timestamp}):</strong> {latestAction.text}</span>
          </div>
          <span className="px-2 py-0.5 bg-blue-100 text-[#0072BC] font-bold text-[10px] rounded uppercase">
            Synchronized
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Pending Disputes', value: String(hearingsData.length), subtitle: 'Direct Citizen & Agency Sync', color: 'red', icon: 'gavel' }} />
        <KPICard data={{ label: 'Hearings Scheduled', value: '5', subtitle: 'This Week', color: 'navy', icon: 'event' }} />
        <KPICard data={{ label: 'Cases Resolved', value: '42', subtitle: 'This Month', color: 'green', icon: 'task_alt' }} />
        <KPICard data={{ label: 'Court Stays Logged', value: '2', subtitle: 'High Court Injunctions', color: 'ochre', icon: 'book' }} />
      </div>

      {/* Spatial Revenue Dispute Cadastral OpenStreetMap GIS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0072BC]">gavel</span>
            Revenue Cadastral & Survey Plot Dispute Map (Leaflet & OpenStreetMap)
          </h3>
          <div className="text-xs text-slate-500 font-medium">
            Standing Asset Schedule & Disputed Polygons Visualized
          </div>
        </div>
        <ProjectLandMap height="480px" showLayerControls={true} showAssets={true} />
      </div>

      <DataGrid
        title={`Revenue Court Active Dispute Register (${hearingsData.length} Live Dockets)`}
        columns={hearingColumns}
        data={hearingsData}
        totalItems={hearingsData.length}
      />

      {/* 10 Key Tehsildar Features Matrix */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[20px] font-bold text-[var(--color-gov-navy)]">Tehsil Revenue Court Modules (10 Key Operations)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive judicial hearing administration, RoR verification, mutation tracking, and DBT authorizations.</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#0072BC] font-bold text-xs rounded border border-blue-200">
            10 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tehsildarModules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="gov-card p-5 hover:border-[var(--color-gov-navy)] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded bg-blue-50 text-[var(--color-gov-navy)] flex items-center justify-center group-hover:bg-[var(--color-gov-navy)] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[22px]">{mod.icon}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded group-hover:bg-blue-100 group-hover:text-[#0072BC]">
                    {mod.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-[var(--color-gov-navy)] transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {mod.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[var(--color-gov-navy)]">
                <span>Access Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
