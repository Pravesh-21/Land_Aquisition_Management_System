'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import StepTracker from '@/components/ui/StepTracker';
import { getCollectorSignedStatus, setCollectorSignedStatus } from '@/utils/workflowState';

export default function CollectorApprovalsPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [consent, setConsent] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signTimestamp, setSignTimestamp] = useState<string>('');

  // Restore signature state from shared workflowState
  const loadState = () => {
    const { isSigned, signTime } = getCollectorSignedStatus();
    if (isSigned) {
      setSigned(true);
      setConsent(true);
      setOtp(['1', '2', '3', '4', '5', '6']);
      setSignTimestamp(signTime || new Date().toLocaleString('en-IN'));
    } else {
      setSigned(false);
      setConsent(false);
      setOtp(['', '', '', '', '', '']);
      setSignTimestamp('');
    }
  };

  useEffect(() => {
    loadState();
    window.addEventListener('bhu_workflow_update', loadState);
    return () => window.removeEventListener('bhu_workflow_update', loadState);
  }, []);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
    }
  };

  const handleQuickFill = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setConsent(true);
  };

  const handleSign = () => {
    const timeStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setSigned(true);
    setSignTimestamp(timeStr);
    setCollectorSignedStatus(true, timeStr);
  };

  const handleReset = () => {
    setCollectorSignedStatus(false);
    setSigned(false);
    setOtp(['', '', '', '', '', '']);
    setConsent(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">
            Ref No: LARR/2024/042-B • Gazette Notification • Live Cross-Role Handoff
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Section 11 Declaration Approval</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Statutory declaration under Right to Fair Compensation and Transparency in Land Acquisition Act, 2013.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {signed && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
            >
              Reset for Demo
            </button>
          )}
          <button className="p-2 border border-[var(--color-outline-variant)] bg-white hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">search</span></button>
          <button className="p-2 border border-[var(--color-outline-variant)] bg-white hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
          <button className="p-2 border border-[var(--color-outline-variant)] bg-white hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">print</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gazette Document Viewer (Left 7 Cols) */}
        <div className="lg:col-span-7 gov-card p-8 bg-white border border-[var(--color-outline-variant)] space-y-6 min-h-[600px] text-xs">
          <div className="text-center space-y-2 border-b-2 border-[var(--color-gov-navy)] pb-6">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-300 p-1 flex items-center justify-center shadow-sm mx-auto">
              <img src="/logo.png?v=3" alt="Govt Emblem" className="w-full h-full object-contain rounded-full" />
            </div>
            <h2 className="text-[22px] font-bold text-[var(--color-on-surface)] tracking-tight uppercase">
              THE GAZETTE OF INDIA
            </h2>
            <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
              EXTRAORDINARY • PART II - SECTION 3 - SUB-SECTION (ii)
            </div>
            <div className="text-[11px] font-bold text-[var(--color-gov-navy)]">Published by Authority</div>
          </div>

          <div className="text-right text-[11px] font-semibold text-[var(--color-on-surface-variant)]">
            New Delhi, the 24th October, 2024
          </div>

          <div className="space-y-4 leading-relaxed text-[13px] text-justify text-[var(--color-on-surface)]">
            <p>
              <strong>S.O. 4592(E).—</strong> Whereas it appears to the Appropriate Government that a total of 45.2 Hectares of land is required in the Village of Ramgarh, Tehsil Sadar, District Nagpur for public purpose, namely, for the construction of a new National Highway corridor expansion.
            </p>
            <p>
              And whereas, the Social Impact Assessment (SIA) report has been evaluated and approved by the Expert Group under Section 7 of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013.
            </p>
            <p>
              Now, therefore, the Appropriate Government, under Section 11 of the said Act, hereby notifies that the land detailed in the schedule below is likely to be needed for the aforementioned public purpose.
            </p>
          </div>

          {/* Schedule Table */}
          <div className="border border-[var(--color-outline-variant)] mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-container-high)] text-[var(--color-gov-navy)] font-bold">
                  <th className="p-2 border-r border-[var(--color-outline-variant)]">Survey No.</th>
                  <th className="p-2 border-r border-[var(--color-outline-variant)]">Area (Ha)</th>
                  <th className="p-2">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                <tr><td className="p-2 border-r border-[var(--color-outline-variant)]">442/1-A</td><td className="p-2 border-r border-[var(--color-outline-variant)]">1.42</td><td className="p-2">Agricultural (Irrigated)</td></tr>
                <tr><td className="p-2 border-r border-[var(--color-outline-variant)]">445/1</td><td className="p-2 border-r border-[var(--color-outline-variant)]">2.15</td><td className="p-2">Mixed Agriculture</td></tr>
                <tr><td className="p-2 border-r border-[var(--color-outline-variant)]">450/2-A</td><td className="p-2 border-r border-[var(--color-outline-variant)]">3.20</td><td className="p-2">Gram Panchayat Land</td></tr>
              </tbody>
            </table>
          </div>

          {/* Digital Signature Seal on Document when Signed */}
          {signed && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[20px] text-emerald-700">verified</span>
                  DIGITALLY SIGNED & GAZETTE SANCTIONED
                </div>
                <div className="text-[11px] text-emerald-800">
                  Signed by: <strong>Sh. Ramesh Kumar, IAS</strong> (District Collector, Nagpur)
                </div>
                <div className="font-mono text-[10px] text-emerald-700">
                  UIDAI DSC-Aadhaar • Certified: {signTimestamp || 'Active Session'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center font-bold text-emerald-700 text-xs shadow-sm">
                SEALED
              </div>
            </div>
          )}
        </div>

        {/* e-Signature Panel (Right 5 Cols) */}
        <div className="lg:col-span-5 gov-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--color-outline-variant)] pb-4">
              <span className="material-symbols-outlined text-[var(--color-gov-navy)] text-[28px]">verified</span>
              <div>
                <h3 className="text-[20px] font-bold text-[var(--color-gov-navy)]">e-Signature Authorization</h3>
                <p className="text-xs text-[var(--color-on-surface-variant)]">Authorize document issuance using Aadhaar e-KYC.</p>
              </div>
            </div>

            {/* Verification Steps Tracker */}
            <div className="p-4 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
              <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider mb-3">VERIFICATION STEPS</div>
              <StepTracker
                direction="vertical"
                steps={[
                  { id: '1', label: 'Document Reviewed (Section 11 Declaration loaded)', status: 'completed' },
                  { id: '2', label: 'Aadhaar Authentication (Awaiting OTP verification)', status: signed ? 'completed' : 'current' },
                  { id: '3', label: 'Digital Certificate Attachment (Pending authorization)', status: signed ? 'completed' : 'pending' },
                ]}
              />
            </div>

            {/* Signatory Details */}
            <div className="p-4 border border-[var(--color-outline-variant)] bg-white text-xs space-y-2">
              <div className="font-bold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Signatory Details</div>
              <div className="flex justify-between border-b border-[var(--color-outline-variant)] pb-1">
                <span className="text-[var(--color-on-surface-variant)]">Name:</span>
                <span className="font-bold">Sh. Ramesh Kumar, IAS</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-outline-variant)] pb-1">
                <span className="text-[var(--color-on-surface-variant)]">Designation:</span>
                <span className="font-bold">District Collector</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-on-surface-variant)]">Aadhaar (Masked):</span>
                <span className="font-bold font-mono">XXXX XXXX 9821</span>
              </div>
            </div>

            {/* OTP Input Block */}
            <div className="p-4 border border-[var(--color-outline-variant)] bg-white space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-on-surface)]">
                <span>Enter OTP sent to registered mobile</span>
                {!signed && (
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] text-[#0072BC] hover:underline font-bold"
                  >
                    ⚡ Auto-Fill Demo OTP
                  </button>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    disabled={signed}
                    className="w-10 h-10 text-center border border-[var(--color-outline-variant)] text-lg font-bold font-mono focus:border-[var(--color-gov-navy)] focus:outline-none"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-on-surface-variant)]">
                <span>Session Time remaining: 04:30</span>
                <button className="text-[var(--color-gov-navy)] font-semibold hover:underline">Resend OTP</button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={signed}
                className="w-4 h-4 accent-[var(--color-gov-navy)]"
              />
              <span>I hereby consent to provide my Aadhaar Number for authentication with UIDAI to generate an e-signature.</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--color-outline-variant)]">
            <button
              onClick={handleReset}
              className="py-3 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
            >
              {signed ? 'Reset' : 'Cancel'}
            </button>
            <button
              onClick={handleSign}
              disabled={signed || !consent || otp.join('').length < 6}
              className={`py-3 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                signed
                  ? 'bg-emerald-700 cursor-default shadow-md'
                  : consent && otp.join('').length === 6
                  ? 'bg-[var(--color-gov-ochre)] hover:bg-[var(--color-gov-ochre-bright)] cursor-pointer shadow-md'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{signed ? 'check_circle' : 'draw'}</span>
              {signed ? 'SIGNED & SANCTIONED ✓' : 'SIGN & ISSUE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
