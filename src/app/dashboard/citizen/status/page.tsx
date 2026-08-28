'use client';

import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

interface Stage {
  step: number;
  section: string;
  title: string;
  description: string;
  date: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  actionNote?: string;
}

const ACQUISITION_STAGES: Stage[] = [
  {
    step: 1,
    section: 'Section 4(1)',
    title: 'Preliminary Survey & Corridor Identification',
    description: 'Requisite Agency (NHAI) conducted spatial alignment feasibility and identified affected survey numbers.',
    date: '15-Jan-2023',
    status: 'COMPLETED',
  },
  {
    step: 2,
    section: 'Section 6',
    title: 'Social Impact Assessment (SIA) Study',
    description: 'Expert Group conducted public hearing and submitted report assessing livelihood and environmental impact.',
    date: '10-Apr-2023',
    status: 'COMPLETED',
  },
  {
    step: 3,
    section: 'Section 11(1)',
    title: 'Preliminary Acquisition Notification',
    description: 'District Collector published notification in District Gazette and local newspapers inviting claims.',
    date: '28-Jun-2023',
    status: 'COMPLETED',
  },
  {
    step: 4,
    section: 'Section 15',
    title: 'Hearing of Objections by LAO',
    description: 'Objection inquiry proceedings held at LAO Pune Division. Land measurement and tree counts recorded.',
    date: '18-Aug-2023',
    status: 'COMPLETED',
  },
  {
    step: 5,
    section: 'Section 19(1)',
    title: 'Declaration of Acquisition Publication',
    description: 'Final declaration of public purpose and conclusive acquisition published in the Gazette of India.',
    date: '20-Sep-2023',
    status: 'COMPLETED',
  },
  {
    step: 6,
    section: 'Section 23',
    title: 'Statutory Compensation Award Passed',
    description: 'Collector approved final award order of ₹47.38 Lakhs including 100% Solatium and 12% Interest.',
    date: '10-Oct-2023',
    status: 'COMPLETED',
  },
  {
    step: 7,
    section: 'Direct Benefit Transfer',
    title: 'Compensation Disbursement into Bank Account',
    description: 'Funds transferred directly to Aadhaar-linked SBI Account via PFMS / e-Kuber single window.',
    date: '12-Oct-2023',
    status: 'COMPLETED',
  },
  {
    step: 8,
    section: 'Section 38',
    title: 'Land Handover & Possession Taking',
    description: 'Revenue authorities issuing panchnama and recording transfer of possession to Highway Authority.',
    date: 'Expected Sep-2024',
    status: 'IN_PROGRESS',
    actionNote: 'Physical boundary demarcation in progress by Tehsil Survey Team.',
  },
];

export default function CitizenAcquisitionStatusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Statutory Acquisition Tracking
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Acquisition Lifecycle Status</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Real-time stage-wise statutory progress for Parcel IN-MH-440001-A12B under RFCTLARR Act (2013).
          </p>
        </div>
        <Link
          href="/dashboard/citizen/timeline"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold uppercase tracking-wider hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">timeline</span> View Event Timeline
        </Link>
      </div>

      {/* Progress Summary Card */}
      <div className="gov-card p-6 border-l-4 border-l-[var(--color-gov-navy)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stage: 7 of 8 Completed</div>
            <div className="text-[22px] font-bold text-slate-900 mt-1">Compensation Disbursed • Awaiting Final Handover</div>
            <p className="text-xs text-slate-600 mt-0.5">Award amount has been credited. Final mutation and possession is underway.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">87.5% Complete</span>
            <Link
              href="/dashboard/citizen/compensation"
              className="px-4 py-2 bg-[var(--color-gov-navy)] text-white text-xs font-bold uppercase rounded hover:bg-[var(--color-gov-navy-dark)]"
            >
              View Payment Award
            </Link>
          </div>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-[var(--color-land-green)] h-full rounded-full transition-all" style={{ width: '87.5%' }}></div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        {ACQUISITION_STAGES.map((stage) => {
          const isDone = stage.status === 'COMPLETED';
          const isCurrent = stage.status === 'IN_PROGRESS';

          return (
            <div
              key={stage.step}
              className={`gov-card p-5 border-l-4 transition-all ${
                isDone
                  ? 'border-l-[var(--color-land-green)] bg-white'
                  : isCurrent
                  ? 'border-l-[var(--color-gov-ochre)] bg-amber-50/40 shadow-md'
                  : 'border-l-slate-300 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-[var(--color-land-green)] text-white'
                        : isCurrent
                        ? 'bg-[var(--color-gov-ochre)] text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : stage.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0072BC]">{stage.section}</span>
                      <h3 className="text-[16px] font-bold text-slate-900">{stage.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{stage.description}</p>
                    {stage.actionNote && (
                      <div className="mt-2 text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded inline-block">
                        ℹ Note: {stage.actionNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 self-end md:self-center">
                  <div className="text-xs font-bold text-slate-800">{stage.date}</div>
                  <div className="mt-1">
                    <StatusBadge
                      status={isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                      variant={isDone ? 'success' : isCurrent ? 'warning' : 'info'}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
