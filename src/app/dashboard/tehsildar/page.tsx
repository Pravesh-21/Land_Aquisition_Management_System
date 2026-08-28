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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Revenue Court & Tehsildar Dispute Portal</h1>
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
    </div>
  );
}
