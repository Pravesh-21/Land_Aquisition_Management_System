'use client';

import { mockGrievances } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import { Grievance, GrievanceCategory } from '@/types';
import { useState, useEffect } from 'react';

const GRIEVANCES_STORAGE_KEY = 'bhu_citizen_grievances_list';

export default function GrievancesPage() {
  const [category, setCategory] = useState<GrievanceCategory>('Valuation Dispute');
  const [parcelId, setParcelId] = useState('IN-MH-440001-A12B');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [grievancesList, setGrievancesList] = useState<Grievance[]>(mockGrievances);

  // Restore list from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(GRIEVANCES_STORAGE_KEY);
      if (saved) {
        setGrievancesList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse grievances from sessionStorage:', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !subject) return;

    const newId = `GRV-2024-${Math.floor(1000 + Math.random() * 9000)}-E`;
    const newGrievance: Grievance = {
      id: `G-${Date.now()}`,
      trackingId: newId,
      category: category,
      parcelId: parcelId || 'IN-MH-440001-A12B',
      subject: subject || 'Statutory Objection regarding Land Record Valuation',
      description: description || 'Objection filed under Section 64 of RFCTLARR Act.',
      dateFiled: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Hearing Scheduled',
      latestUpdate: 'Docket created in Revenue Court. Summons issued to Circle Office.',
      filedBy: 'Sh. Rajendra Patel (Landowner)',
    };

    const updated = [newGrievance, ...grievancesList];
    setGrievancesList(updated);
    try {
      sessionStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save grievance:', e);
    }

    setSubmittedMessage(`Grievance ${newId} submitted successfully to Revenue Court docket.`);
    setSubject('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-outline-variant)] pb-4">
        <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
          Citizen Redressal & Objections Portal
        </div>
        <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Raise Objection & Grievances</h1>
        <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
          Submit formal statutory objections regarding land acquisition processes, valuation disputes, or boundary anomalies directly to the Competent Revenue Authority.
        </p>
      </div>

      {submittedMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex items-center justify-between text-xs text-emerald-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[20px] text-emerald-700">task_alt</span>
            <span>{submittedMessage}</span>
          </div>
          <button
            onClick={() => setSubmittedMessage(null)}
            className="text-emerald-800 font-bold hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: New Grievance Form */}
        <div className="lg:col-span-5 gov-card p-6 space-y-4">
          <div className="border-b border-[var(--color-outline-variant)] pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-navy)]">edit_note</span>
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">New Grievance Form</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--color-on-surface)]">Grievance Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GrievanceCategory)}
                className="w-full border border-[var(--color-outline-variant)] p-3 bg-white focus:border-[var(--color-gov-navy)] focus:outline-none"
              >
                <option value="Valuation Dispute">Valuation Dispute (Section 26)</option>
                <option value="Boundary / Demarcation">Boundary / Demarcation Conflict</option>
                <option value="Compensation Delay">Compensation Delay / DBT issue</option>
                <option value="Ownership / Title">Ownership / Joint Title Dispute</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--color-on-surface)]">Related Parcel ID / Case Number *</label>
              <input
                type="text"
                placeholder="e.g., IN-MH-440001-A12B"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                className="w-full border border-[var(--color-outline-variant)] p-3 bg-white focus:border-[var(--color-gov-navy)] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--color-on-surface)]">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of objection"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-[var(--color-outline-variant)] p-3 bg-white focus:border-[var(--color-gov-navy)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--color-on-surface)]">Detailed Description *</label>
              <textarea
                rows={4}
                placeholder="Provide factual details regarding your objection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-[var(--color-outline-variant)] p-3 bg-white focus:border-[var(--color-gov-navy)] focus:outline-none"
                required
              ></textarea>
            </div>

            {/* Drag & Drop Upload */}
            <div className="p-4 border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-center cursor-pointer">
              <span className="material-symbols-outlined text-[28px] text-[var(--color-gov-navy)]">cloud_upload</span>
              <div className="font-bold text-[var(--color-gov-navy)] mt-1">Upload Supporting Evidence (Optional)</div>
              <div className="text-[10px] text-[var(--color-on-surface-variant)]">PDF, JPG, PNG up to 10MB</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubject('Tree Valuation Discrepancy in Survey #442/1-A');
                  setDescription('24 mature teak trees were enumerated as juvenile trees in the initial award notice. Requesting joint physical re-inspection.');
                }}
                className="py-3 bg-white border border-[var(--color-outline-variant)] text-[var(--color-gov-navy)] font-bold uppercase hover:bg-slate-50 transition-colors"
              >
                Fill Sample
              </button>
              <button
                type="submit"
                className="py-3 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                SUBMIT FORMAL OBJECTION
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Grievance Tracking Table */}
        <div className="lg:col-span-7 gov-card p-6 space-y-4">
          <div className="border-b border-[var(--color-outline-variant)] pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Grievance Tracking</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Status of your submitted objections routed to Revenue Court ({grievancesList.length} Total)</p>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 border border-[var(--color-outline-variant)] bg-white text-xs"><span className="material-symbols-outlined text-[16px]">filter_list</span></button>
              <button className="p-1.5 border border-[var(--color-outline-variant)] bg-white text-xs"><span className="material-symbols-outlined text-[16px]">download</span></button>
            </div>
          </div>

          <div className="border border-[var(--color-outline-variant)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="p-3">Tracking ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date Filed</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latest Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                {grievancesList.map((g) => (
                  <tr key={g.id} className="gov-table-row hover:bg-[var(--color-surface-container-low)]">
                    <td className="p-3 font-mono font-bold text-[var(--color-gov-navy)]">{g.trackingId}</td>
                    <td className="p-3 font-semibold">{g.category}</td>
                    <td className="p-3 text-[var(--color-on-surface-variant)]">{g.dateFiled}</td>
                    <td className="p-3"><StatusBadge status={g.status} variant={getStatusVariant(g.status)} /></td>
                    <td className="p-3 text-[var(--color-on-surface-variant)] max-w-[200px] truncate">{g.latestUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
