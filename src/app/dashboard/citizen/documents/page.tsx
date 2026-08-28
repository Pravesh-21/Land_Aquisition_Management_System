'use client';

import { useState } from 'react';
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
  const [downloadToast, setDownloadToast] = useState<{ title: string; ref: string } | null>(null);

  const handleDownload = (doc: CitizenDoc) => {
    // Generate an authentic official certificate text file blob and trigger browser download
    const documentContent = `========================================================================
GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT
BHU-NIRIKSHAN NATIONAL LAND ACQUISITION REPOSITORY
========================================================================

DOCUMENT TITLE: ${doc.title}
DOCUMENT REF:   ${doc.referenceNumber}
CATEGORY:       ${doc.category}
DATE OF ISSUE:  ${doc.issueDate}
ISSUING OFFICE: ${doc.issuingAuthority}
AUTHENTICATION: VERIFIED & DIGITALLY SIGNED (256-Bit SHA-256)

BENEFICIARY DETAILS:
Landowner Name: Sh. Rajendra Patel
Survey / Plot:  Survey Plot #442/1-A (ULPIN: IN-MH-440001-A12B)
Village/Tehsil: Hingna, Nagpur, Maharashtra
Acquired Area:  1.42 Hectares (3.51 Acres)
Statutory Act:  RFCTLARR Act (2013)

SUMMARY STATEMENT:
This official certified document confirms the statutory recording and digital
dispatch of ${doc.title} under the authority of ${doc.issuingAuthority}.
All compensatory solatium (100%) and 12% additional interest computations are
formally sealed in accordance with Section 26-30 of the RFCTLARR Act.

Digitally Authorized by:
Competent Authority / Land Acquisition Officer
Government of India e-Sign Seal: SHA256-${Date.now().toString(16).toUpperCase()}
========================================================================`;

    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.referenceNumber}_Official_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show sleek government notification banner
    setDownloadToast({ title: doc.title, ref: doc.referenceNumber });
    setTimeout(() => {
      setDownloadToast(null);
    }, 5000);
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

      {/* Download Success Toast Notification */}
      {downloadToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex items-center justify-between text-xs text-emerald-950 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-900">Document Downloaded Successfully</div>
              <div className="text-emerald-700">
                {downloadToast.title} • Ref: <span className="font-mono font-bold">{downloadToast.ref}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-emerald-800 hover:text-emerald-950 font-bold p-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-[#0072BC]">verified</span>
          <div>
            <div className="font-bold text-[#003178]">6 Digitally Signed Documents Available</div>
            <div className="text-slate-600">All records authenticated via National Land Record Modernization Program (DILRMP).</div>
          </div>
        </div>
        <span className="px-3 py-1 bg-white border border-[#0072BC] text-[#0072BC] font-bold rounded">
          e-Sign Verified
        </span>
      </div>

      {/* Documents List */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Certified Document Registry</h3>
          <span className="text-xs text-slate-500">Click Download to save verified copy</span>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {CITIZEN_DOCS.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-700 font-bold text-xs shrink-0">
                  PDF
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-[#0072BC] font-semibold rounded text-[10px] border border-blue-200">
                      {doc.category}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    <strong>Issuing Office:</strong> {doc.issuingAuthority} • <strong>Date:</strong> {doc.issueDate}
                  </div>
                  <div className="font-mono text-slate-600 text-[11px]">
                    Ref: {doc.referenceNumber} • Size: {doc.fileSize}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status="Digital Certified" variant="success" icon="verified" />
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white font-bold rounded text-xs transition-colors uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
