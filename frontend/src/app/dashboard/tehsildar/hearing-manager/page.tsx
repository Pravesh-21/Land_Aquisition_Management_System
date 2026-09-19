'use client';

import { mockHearings } from '@/data/mockData';
import StepTracker from '@/components/ui/StepTracker';
import { useState } from 'react';

export default function HearingManagerPage() {
  const hearing = mockHearings[0];
  const [selectedOfficer, setSelectedOfficer] = useState('1');
  const [selectedSlot, setSelectedSlot] = useState('01:00 PM');
  const [issued, setIssued] = useState(false);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="border-b border-[var(--color-outline-variant)] pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">
          <span>Land Records</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Dispute Resolution</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[var(--color-gov-navy)]">Schedule Hearing</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Tehsildar Hearing Scheduler</h1>
          <StepTracker
            steps={[
              { id: '1', label: 'Intake', status: 'completed' },
              { id: '2', label: 'Verification', status: 'completed' },
              { id: '3', label: 'Scheduling', status: issued ? 'completed' : 'current' },
              { id: '4', label: 'Resolution', status: 'pending' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dispute Case File Card (Left 7 Cols) */}
        <div className="lg:col-span-7 gov-card flex flex-col">
          <div className="bg-[var(--color-gov-navy)] text-white p-4 flex justify-between items-center">
            <h2 className="text-[18px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">folder_open</span>
              Dispute Case File
            </h2>
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 border border-white/30 font-mono">
              Case ID: {hearing.caseId}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Khasra Info */}
            <div className="flex gap-5 pb-6 border-b border-[var(--color-outline-variant)]">
              <div className="w-32 h-32 bg-slate-200 border border-[var(--color-outline-variant)] flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80')" }}></div>
                <span className="absolute bottom-1 right-1 bg-white text-[var(--color-gov-navy)] text-[10px] font-bold px-1 border border-[var(--color-outline-variant)]">Map View</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase">Subject Property</div>
                    <div className="text-[24px] font-bold text-[var(--color-gov-navy)] leading-tight">Khasra No. {hearing.khasraNumber}</div>
                  </div>
                  <span className="bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-bold px-2.5 py-1 uppercase border border-red-300">
                    TITLE DISPUTE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-[var(--color-on-surface-variant)]">Village:</span>
                    <span className="font-bold">{hearing.village}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-[var(--color-on-surface-variant)]">Tehsil:</span>
                    <span className="font-bold">{hearing.tehsil}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-[var(--color-on-surface-variant)]">Total Area:</span>
                    <span className="font-bold">1.24 Hectares</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-[var(--color-on-surface-variant)]">Land Type:</span>
                    <span className="font-bold">Agricultural (Barani)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Involved */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider mb-3 border-b border-[var(--color-outline-variant)] pb-2">
                Parties Involved
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
                  <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase">Applicant</div>
                  <div className="text-[15px] font-bold text-[var(--color-on-surface)] mt-1">{hearing.applicant.name}</div>
                  <div className="text-xs text-[var(--color-on-surface-variant)] mt-1">{hearing.applicant.address}</div>
                </div>
                <div className="p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
                  <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase">Respondent</div>
                  <div className="text-[15px] font-bold text-[var(--color-on-surface)] mt-1">{hearing.respondent.name}</div>
                  <div className="text-xs text-[var(--color-on-surface-variant)] mt-1">{hearing.respondent.address}</div>
                </div>
              </div>
            </div>

            {/* Submitted Evidence Data Grid */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider mb-3 border-b border-[var(--color-outline-variant)] pb-2 flex justify-between">
                <span>Submitted Evidence</span>
                <span className="text-[var(--color-on-surface-variant)] font-normal">3 Documents</span>
              </h4>
              <div className="border border-[var(--color-outline-variant)]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] uppercase font-semibold">
                      <th className="p-2 w-10 text-center">#</th>
                      <th className="p-2">Document Title</th>
                      <th className="p-2 w-28">Date Filed</th>
                      <th className="p-2 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)]">
                    {hearing.evidence.map((doc, i) => (
                      <tr key={doc.id} className="hover:bg-[var(--color-surface-container-low)]">
                        <td className="p-2 text-center text-[var(--color-on-surface-variant)]">{i + 1}</td>
                        <td className="p-2 font-medium text-[var(--color-on-surface)]">{doc.title}</td>
                        <td className="p-2 text-[var(--color-on-surface-variant)]">{doc.dateFiled}</td>
                        <td className="p-2 text-center">
                          <button className="text-[var(--color-gov-navy)] font-bold hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Hearing Card (Right 5 Cols) */}
        <div className="lg:col-span-5 gov-card p-6 space-y-6">
          <div className="border-b border-[var(--color-outline-variant)] pb-3">
            <h2 className="text-[20px] font-bold text-[var(--color-gov-navy)]">Schedule Hearing</h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Configure date, time, & assign presiding officer.</p>
          </div>

          {/* Officer Assignment */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--color-on-surface)]">Presiding Officer</label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full bg-white border border-[var(--color-outline-variant)] p-3 text-xs focus:border-[var(--color-gov-navy)] focus:outline-none"
            >
              <option value="1">Shri. Vikram Singh (Tehsildar)</option>
              <option value="2">Smt. Meena Kumari (Naib Tehsildar)</option>
              <option value="3">Shri. Rajesh Sharma (SDM - Escalated)</option>
            </select>
          </div>

          {/* Calendar Picker (November 2023 Grid) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[var(--color-on-surface)]">Select Date</label>
              <button className="text-[var(--color-gov-navy)] font-semibold hover:underline">Jump to next available</button>
            </div>
            <div className="border border-[var(--color-outline-variant)] p-3 bg-white space-y-3">
              <div className="flex justify-between items-center font-bold text-xs">
                <button className="p-1"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span>November 2023</span>
                <button className="p-1"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[var(--color-on-surface-variant)]">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {[29,30,31].map(d => <div key={d} className="p-2 text-slate-300">{d}</div>)}
                {Array.from({length: 13}).map((_, i) => <div key={i} className="p-2 hover:bg-slate-100 cursor-pointer">{i + 1}</div>)}
                <div className="p-2 bg-[var(--color-gov-navy)] text-white font-bold cursor-pointer">14</div>
                {Array.from({length: 4}).map((_, i) => <div key={i} className="p-2 hover:bg-slate-100 cursor-pointer">{i + 15}</div>)}
              </div>
            </div>
          </div>

          {/* Time Slot Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--color-on-surface)]">Time Slot (Nov 14)</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['09:00 AM (Booked)', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:30 PM'].map((slot, i) => (
                <button
                  key={i}
                  onClick={() => i !== 0 && setSelectedSlot(slot)}
                  disabled={i === 0}
                  className={`py-2 border ${
                    i === 0 ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed' : slot === selectedSlot ? 'border-2 border-[var(--color-gov-navy)] bg-[var(--color-status-info-bg)] text-[var(--color-gov-navy)] font-bold' : 'border-[var(--color-outline-variant)] hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Summons Notice Banner */}
          <div className="p-3 bg-[var(--color-surface-container-high)] border-l-4 border-l-[var(--color-gov-ochre)] text-xs text-[var(--color-on-surface-variant)] flex gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-ochre)] text-[18px]">info</span>
            <span>Summons will be automatically generated & dispatched via SMS to registered mobile numbers of both parties upon confirmation.</span>
          </div>

          <button
            onClick={() => setIssued(true)}
            className={`w-full py-4 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
              issued ? 'bg-[var(--color-land-green)]' : 'bg-[var(--color-gov-ochre)] hover:bg-[var(--color-gov-ochre-bright)]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{issued ? 'check_circle' : 'send'}</span>
            {issued ? 'SUMMONS DISPATCHED ✓' : 'ISSUE SUMMONS & SCHEDULE'}
          </button>
        </div>
      </div>
    </div>
  );
}
