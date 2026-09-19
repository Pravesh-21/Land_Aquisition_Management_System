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

  const collectorModules = [
    { id: '1', title: 'Land & Parcel Overview', desc: 'GIS spatial overview of affected parcels & owners', href: '/dashboard/collector/parcels', icon: 'landscape', badge: '142 Plots' },
    { id: '2', title: 'Workflow Pipeline', desc: 'Statutory Section 4 to 38 movement tracking', href: '/dashboard/collector/workflow', icon: 'schema', badge: '5 Stages' },
    { id: '3', title: 'e-Sign Approvals', desc: 'Aadhaar DSC digital signature for Gazette orders', href: '/dashboard/collector/approvals', icon: 'verified', badge: isSigned ? '1 Signed ✓' : '1 Pending' },
    { id: '4', title: 'Proposal Review & Decision', desc: 'Approve, return or escalate agency proposals', href: '/dashboard/collector/proposal-review', icon: 'rate_review', badge: '6 Active' },
    { id: '5', title: 'Statutory Objection Oversight', desc: 'Section 15 hearings & LAO inquiry supervision', href: '/dashboard/collector/objection-oversight', icon: 'gavel', badge: '34 Cases' },
    { id: '6', title: 'Inter-Dept Coordination', desc: 'MoEFCC, PWD, Railways clearance single-window', href: '/dashboard/collector/inter-dept', icon: 'hub', badge: '14 Projects' },
    { id: '7', title: 'Compensation Monitoring', desc: 'Section 26-30 award schedule & 100% solatium', href: '/dashboard/collector/compensation-monitoring', icon: 'payments', badge: '₹ 184.2 Cr' },
    { id: '8', title: 'Possession & R&R Monitoring', desc: 'Section 38 panchnama & displaced families', href: '/dashboard/collector/possession-rr', icon: 'home_work', badge: '112.4 Ha' },
    { id: '9', title: 'Delay & Exception Engine', desc: 'Section 25 timeline warnings & PFMS bank retry', href: '/dashboard/collector/delay-exceptions', icon: 'warning', badge: '4 Critical' },
    { id: '10', title: 'Escalation Management', desc: 'High-level IAS Collector decrees and dispute orders', href: '/dashboard/collector/escalations', icon: 'priority_high', badge: '5 Matters' },
    { id: '11', title: 'District MIS & Reports', desc: 'Automated statutory returns & CAG export files', href: '/dashboard/collector/mis-reports', icon: 'analytics', badge: '24 Reports' },
    { id: '12', title: 'Audit & Activity Oversight', desc: 'Cryptographic immutable digital transaction log', href: '/dashboard/collector/audit-trail', icon: 'history', badge: '1,842 Logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            District Administration • Office of District Collector
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">District Collector Executive Command Center</h1>
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

      {/* KPI Overview */}
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

      {/* Acquisition Proposal Approval Queue */}
      <DataGrid
        title="Acquisition Proposal Approval Queue (Statutory Section 11 / 19)"
        columns={proposalColumns}
        data={projectsData}
        totalItems={projectsData.length}
      />

      {/* 14 Key Collector Features Matrix */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[20px] font-bold text-[var(--color-gov-navy)]">District Collector Statutory Modules (14 Key Operations)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive executive oversight, statutory clearances, and inter-departmental enforcement.</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#0072BC] font-bold text-xs rounded border border-blue-200">
            14 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {collectorModules.map((mod) => (
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
