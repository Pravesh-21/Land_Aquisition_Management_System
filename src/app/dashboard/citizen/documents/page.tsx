'use client';

import StatusBadge from '@/components/ui/StatusBadge';

interface CitizenDoc {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  issueDate: string;
  issuingAuthority: string;
  referenceNumber: string;
  verified: boolean;
}

const CITIZEN_DOCS: CitizenDoc[] = [
  {
    id: 'DOC-01',
    title: 'Section 23 Statutory Compensation Award Order',
    category: 'Award Order',
    fileSize: '3.4 MB',
    issueDate: '10-Oct-2023',
    issuingAuthority: 'Office of District Collector, Nagpur',
    referenceNumber: 'AWD-SEC23-2023-1056',
    verified: true,
  },
  {
    id: 'DOC-02',
    title: 'Aadhaar DBT Disbursement & Bank Credit Receipt',
    category: 'Payment Receipt',
    fileSize: '1.2 MB',
    issueDate: '12-Oct-2023',
    issuingAuthority: 'State Bank of India / PFMS Portal',
    referenceNumber: 'UTR-2023-1012-9842',
    verified: true,
  },
  {
    id: 'DOC-03',
    title: 'Section 19 Declaration of Acquisition (Gazette of India)',
    category: 'Gazette Notification',
    fileSize: '4.8 MB',
    issueDate: '20-Sep-2023',
    issuingAuthority: 'Ministry of Rural Development, New Delhi',
    referenceNumber: 'E-GAZETTE-2023-SEC19-0891',
    verified: true,
  },
  {
    id: 'DOC-04',
    title: 'Section 11(1) Preliminary Acquisition Notification',
    category: 'Notification',
    fileSize: '2.9 MB',
    issueDate: '28-Jun-2023',
    issuingAuthority: 'Collectorate Revenue Division, Nagpur',
    referenceNumber: 'NOTIF-SEC11-2023-4401',
    verified: true,
  },
  {
    id: 'DOC-05',
    title: 'Cadastral Map & Geo-Tagged Parcel Survey Sheet',
    category: 'Survey Map',
    fileSize: '6.1 MB',
    issueDate: '14-May-2023',
    issuingAuthority: 'Tehsil Inspector of Land Records (DILRMP)',
    referenceNumber: 'SURV-INSP-2023-9912',
    verified: true,
  },
  {
    id: 'DOC-06',
    title: 'Rehabilitation & Resettlement (R&R) Schedule II Entitlement Certificate',
    category: 'R&R Certificate',
    fileSize: '1.8 MB',
    issueDate: '15-Nov-2023',
    issuingAuthority: 'Administrator R&R / Sub-Divisional Officer',
    referenceNumber: 'RR-SCH2-2023-0142',
    verified: true,
  },
];

export default function CitizenDocumentsPage() {
  const handleDownload = (doc: CitizenDoc) => {
    alert(`Downloading ${doc.title} (${doc.fileSize})...\nReference: ${doc.referenceNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Official Government Record Repository
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Official Documents & Receipts</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Digitally certified copies of acquisition notifications, statutory valuation awards, bank receipts, and R&R certificates.
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0072BC]">verified</span>
          <span>All documents are cryptographically signed by the Competent Authority and valid for all legal & revenue purposes.</span>
        </div>
        <span className="font-bold text-[#003178]">6 Documents Available</span>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CITIZEN_DOCS.map((doc) => (
          <div key={doc.id} className="gov-card p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded">
                  {doc.category}
                </span>
                <span className="text-[11px] text-slate-500">{doc.fileSize} • {doc.issueDate}</span>
              </div>

              <h3 className="text-[16px] font-bold text-slate-900 leading-snug">{doc.title}</h3>

              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <div><strong>Authority:</strong> {doc.issuingAuthority}</div>
                <div className="font-mono text-[11px] text-slate-500"><strong>Ref:</strong> {doc.referenceNumber}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified Copy
              </span>
              <button
                onClick={() => handleDownload(doc)}
                className="px-4 py-2 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
