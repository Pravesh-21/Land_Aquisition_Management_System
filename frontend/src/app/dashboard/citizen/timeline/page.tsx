'use client';

import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

interface TimelineEvent {
  id: string;
  date: string;
  category: 'NOTIFICATION' | 'HEARING' | 'AWARD' | 'PAYMENT' | 'SURVEY';
  title: string;
  authority: string;
  reference: string;
  summary: string;
  icon: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'EV-07',
    date: '12-Oct-2023',
    category: 'PAYMENT',
    title: 'Compensation DBT Credited to Bank Account',
    authority: 'State Bank of India / PFMS Single Window',
    reference: 'UTR-2023-1012-9842',
    summary: 'Direct Benefit Transfer of ₹47,38,500 successfully settled in Aadhaar-seeded savings account.',
    icon: 'payments',
  },
  {
    id: 'EV-06',
    date: '10-Oct-2023',
    category: 'AWARD',
    title: 'Section 23 Statutory Compensation Award Passed',
    authority: 'Office of District Collector, Nagpur',
    reference: 'AWD-SEC23-2023-1056',
    summary: 'Final statutory award determining land rate, solatium, and asset structures approved and signed.',
    icon: 'military_tech',
  },
  {
    id: 'EV-05',
    date: '20-Sep-2023',
    category: 'NOTIFICATION',
    title: 'Section 19 Declaration Published in Gazette of India',
    authority: 'Ministry of Rural Development / Govt of India',
    reference: 'E-GAZETTE-2023-SEC19-0891',
    summary: 'Conclusive declaration of public acquisition published for NH-44 Corridor alignment.',
    icon: 'description',
  },
  {
    id: 'EV-04',
    date: '18-Aug-2023',
    category: 'HEARING',
    title: 'Section 15 Landowner Hearing & Objection Inquiry',
    authority: 'Land Acquisition Officer (LAO), Pune Division',
    reference: 'HRG-CASE-2023-0442',
    summary: 'Citizen attended hearing regarding standing fruit trees on Survey #442. Tree enumeration adjusted.',
    icon: 'gavel',
  },
  {
    id: 'EV-03',
    date: '28-Jun-2023',
    category: 'NOTIFICATION',
    title: 'Section 11 Preliminary Notification Issued',
    authority: 'Revenue Department, District Administration',
    reference: 'NOTIF-SEC11-2023-4401',
    summary: 'Official notification published in local dailies. 60-day objection submission window initiated.',
    icon: 'campaign',
  },
  {
    id: 'EV-02',
    date: '14-May-2023',
    category: 'SURVEY',
    title: 'Ground Cadastral Survey & Geo-Tagged Verification',
    authority: 'Tehsil Land Records Survey Team',
    reference: 'SURV-INSP-2023-9912',
    summary: 'Physical boundary demarcation and asset inventory recording with anti-fraud GPS tagging completed.',
    icon: 'explore',
  },
  {
    id: 'EV-01',
    date: '10-Apr-2023',
    category: 'NOTIFICATION',
    title: 'Social Impact Assessment (SIA) Public Hearing',
    authority: 'SIA Expert Group / State University',
    reference: 'SIA-PUB-2023-0012',
    summary: 'Public consultation held at Gram Panchayat Hingna to assess community livelihood impacts.',
    icon: 'groups',
  },
];

export default function CitizenTimelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Historical Audit Log
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Acquisition Event Timeline</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Chronological record of government notifications, hearings, statutory awards, and disbursements.
          </p>
        </div>
        <Link
          href="/dashboard/citizen/documents"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]"
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span> View Documents
        </Link>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-[var(--color-gov-navy)] space-y-6 ml-3 my-4">
        {TIMELINE_EVENTS.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-[var(--color-gov-navy)] border-4 border-white flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[12px]">{event.icon}</span>
            </div>

            {/* Event Card */}
            <div className="gov-card p-5 bg-white border border-slate-200 hover:border-[#0072BC] transition-all space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-[#003178] font-bold text-[10px] uppercase rounded">
                    {event.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">{event.reference}</span>
                </div>
                <div className="text-xs font-bold text-slate-800">{event.date}</div>
              </div>

              <h3 className="text-[16px] font-bold text-slate-900">{event.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{event.summary}</p>

              <div className="text-[11px] text-slate-500 font-medium pt-1">
                <strong>Issuing Authority:</strong> {event.authority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
