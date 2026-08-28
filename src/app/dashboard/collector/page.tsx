'use client';

import { useState, useEffect } from 'react';
import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockProjects, formatINR } from '@/data/mockData';
import { getCollectorSignedStatus, getLatestCrossRoleAction } from '@/utils/workflowState';
import Link from 'next/link';

export default function CollectorDashboard() {
  const [isSigned, setIsSigned] = useState(false);
  const [signTime, setSignTime] = useState<string | undefined>(undefined);
  const [latestAction, setLatestAction] = useState<{ text: string; timestamp: string } | null>(null);

  const loadData = () => {
    const status = getCollectorSignedStatus();
    setIsSigned(status.isSigned);
    setSignTime(status.signTime);
    setLatestAction(getLatestCrossRoleAction());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bhu_workflow_update', loadData);
    return () => window.removeEventListener('bhu_workflow_update', loadData);
  }, []);

  const projectsData = mockProjects.map((p, idx) => {
    if (idx === 0 && isSigned) {
      return {
        ...p,
        status: 'Section 11 Gazette Sanctioned',
      };
    }
    return p;
  });

  const proposalColumns = [
    { key: 'id', label: 'Ref ID', width: '120px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'name', label: 'Project Name', render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'agency', label: 'Requisite Agency' },
    { key: 'totalArea', label: 'Area (Ha)', align: 'right' as const },
    { key: 'estimatedCost', label: 'Est. Award (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
    {
      key: 'status',
      label: 'Acquisition Stage',
      render: (v: string, r: any) => {
        if (r.id === 'PRJ001' && isSigned) {
          return <StatusBadge status="Section 11 Gazette Sanctioned" variant="success" icon="verified" />;
        }
        return <StatusBadge status={v} variant={getStatusVariant(v)} />;
      },
    },
    {
      key: 'action',
      label: 'Action Queue',
      align: 'center' as const,
      render: (_: any, r: any) => {
        if (r.id === 'PRJ001' && isSigned) {
          return (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded border border-emerald-300 inline-block">
              ✓ e-Signed & Dispatched
            </span>
          );
        }
        return (
          <Link href="/dashboard/collector/approvals" className="px-3 py-1 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase hover:bg-[var(--color-gov-ochre-bright)]">
            e-Sign Approval
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">District Collector Executive Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Statutory Section 11 & Section 19 Gazette e-Sign authorization, spatial cadastral parcel oversight, and asset count verification under RFCTLARR Act (2013).
          </p>
        </div>
        <Link href="/dashboard/collector/approvals" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          Pending e-Sign Approval Queue ({isSigned ? '2' : '3'})
        </Link>
      </div>

      {latestAction && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-purple-700">sync_alt</span>
            <span><strong>Cross-Role Pipeline Stream ({latestAction.timestamp}):</strong> {latestAction.text}</span>
          </div>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded uppercase">
            Live Synchronized
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'District Projects', value: '14', subtitle: 'District Nagpur', color: 'navy', icon: 'account_balance' }} />
        <KPICard data={{ label: 'Section 11 Pending', value: isSigned ? '2' : '3', subtitle: isSigned ? '1 Gazette Sanctioned ✓' : 'Gazette Notifications', color: 'ochre', icon: 'gavel' }} />
        <KPICard data={{ label: 'Section 19 Sanction', value: '2', subtitle: 'Awaiting e-Signature', color: 'red', icon: 'draw' }} />
        <KPICard data={{ label: 'Total Disbursed', value: '₹ 184.2 Cr', subtitle: '100% Solatium included', color: 'green', icon: 'payments' }} />
      </div>

      {/* Spatial Cadastral Leaflet & OpenStreetMap WebGIS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0072BC]">map</span>
            District Land Acquisition Spatial Cadastral Map (Leaflet & OpenStreetMap)
          </h3>
          <div className="text-xs text-slate-500 font-medium">
            Standing Assets & Corridor Polygons Visualized
          </div>
        </div>
        <ProjectLandMap height="480px" showLayerControls={true} showAssets={true} />
      </div>

      <DataGrid
        title="Acquisition Proposal Approval Queue (Statutory Section 11 / 19)"
        columns={proposalColumns}
        data={projectsData}
        totalItems={projectsData.length}
      />
    </div>
  );
}
