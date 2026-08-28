'use client';

import KPICard from '@/components/ui/KPICard';
import DataGrid from '@/components/ui/DataGrid';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import { mockHearings } from '@/data/mockData';
import Link from 'next/link';

export default function TehsildarDashboard() {
  const hearingColumns = [
    { key: 'caseId', label: 'Case ID', width: '130px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'khasraNumber', label: 'Khasra No.' },
    { key: 'village', label: 'Village / Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'disputeType', label: 'Dispute Type', render: (v: string) => <StatusBadge status={v} variant="error" /> },
    { key: 'applicant', label: 'Applicant vs Respondent', render: (_: any, r: any) => <div><div className="font-semibold">{r.applicant.name}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">vs. {r.respondent.name}</div></div> },
    { key: 'scheduledDate', label: 'Scheduled Hearing', render: (_: any, r: any) => r.scheduledDate ? `${r.scheduledDate} ${r.scheduledTime}` : 'Not Scheduled' },
    {
      key: 'action', label: 'Action', align: 'center' as const, render: () => (
        <Link href="/dashboard/tehsildar/hearing-manager" className="px-3 py-1 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase hover:bg-[var(--color-gov-navy-dark)]">
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
            Digital hearing scheduler, land boundary dispute resolution, summons dispatch, & court stay log under RFCTLARR Act (2013).
          </p>
        </div>
        <Link href="/dashboard/tehsildar/hearing-manager" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">event</span>
          Schedule New Hearing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard data={{ label: 'Pending Disputes', value: '18', subtitle: '6 Boundary Conflicts', color: 'red', icon: 'gavel' }} />
        <KPICard data={{ label: 'Hearings Scheduled', value: '5', subtitle: 'This Week', color: 'navy', icon: 'event' }} />
        <KPICard data={{ label: 'Cases Resolved', value: '42', subtitle: 'This Month', color: 'green', icon: 'task_alt' }} />
        <KPICard data={{ label: 'Court Stays Logged', value: '2', subtitle: 'High Court Injunctions', color: 'ochre', icon: 'book' }} />
      </div>

      <DataGrid
        title="Revenue Court Active Dispute Register"
        columns={hearingColumns}
        data={mockHearings}
        totalItems={mockHearings.length}
      />
    </div>
  );
}
