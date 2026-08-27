'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { UserRole, MockUser } from '@/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, role: activeRole, isLoaded } = useAuth();
  const { setCurrentRole } = useRole();

  const preselectedRole = (searchParams.get('role')?.toUpperCase() as UserRole) || 'AGENCY';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(preselectedRole);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regGovtId, setRegGovtId] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setSelectedRole(roleParam.toUpperCase() as UserRole);
    }
  }, [searchParams]);

  // If already authenticated and no explicit action requested, offer direct jump or clear
  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      await login(selectedRole, email, password);
      setCurrentRole(selectedRole);
      setLoading(false);
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    }, 500);
  };

  const handleCitizenAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'credentials') {
      setStep('otp');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await login('CITIZEN');
      setCurrentRole('CITIZEN');
      setLoading(false);
      router.push('/dashboard/citizen');
    }, 500);
  };

  const handleRegisterNewIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      const newUser: MockUser = {
        name: regName || `Sh. ${selectedRole} Officer`,
        designation: regDesignation || `${selectedRole} Authority`,
        department: regDepartment || `${selectedRole} Division`,
        aadhaar: regGovtId ? `XXXX XXXX ${regGovtId.slice(-4)}` : undefined,
      };

      await register(newUser, selectedRole);
      setCurrentRole(selectedRole);
      setLoading(false);
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    }, 600);
  };

  const roleDetails: Record<UserRole, { label: string; org: string; icon: string }> = {
    AGENCY: { label: 'Requisite Agency Official', org: 'NHAI / Railways / PWD', icon: 'domain' },
    LAO: { label: 'Land Acquisition Officer', org: 'Revenue Department', icon: 'person_search' },
    FOREST: { label: 'Forest Clearance Officer', org: 'MoEFCC', icon: 'forest' },
    COLLECTOR: { label: 'District Collector', org: 'District Administration', icon: 'account_balance' },
    TEHSILDAR: { label: 'Tehsildar / Revenue Court', org: 'Tehsil Revenue Court', icon: 'balance' },
    CITIZEN: { label: 'Landowner / Citizen', org: 'Aadhaar e-KYC Single Window', icon: 'person' },
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Gov Top Banner */}
      <div className="gov-banner flex items-center justify-between px-8 w-full">
        <div className="flex items-center gap-4 text-xs font-medium">
          <span>Government of India</span>
          <span className="border-l border-[var(--color-outline-variant)] h-4"></span>
          <span>Ministry of Rural Development</span>
          <span className="border-l border-[var(--color-outline-variant)] h-4"></span>
          <span>Department of Land Resources</span>
        </div>
        <div className="text-xs font-bold text-[var(--color-gov-navy)]">BHU-DRISHTI PARICHAY SSO & IDENTITY PORTAL</div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Left Hero Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[var(--color-gov-navy)] text-white rounded-full flex items-center justify-center font-bold text-2xl">
                <span className="material-symbols-outlined text-[32px]">account_balance</span>
              </div>
              <div>
                <h1 className="text-[32px] font-bold text-[var(--color-gov-navy)] leading-tight">BHU-DRISHTI</h1>
                <div className="text-xs font-bold text-[var(--color-gov-ochre)] uppercase tracking-widest">
                  Parichay / MeriPehchan Identity & Access Portal
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed text-justify">
              Identification and Role-Based Access Control (RBAC) portal compliant with the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013.
            </p>

            {/* Select Role Identity */}
            <div className="gov-card p-5 space-y-3">
              <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
                Select Identity Role
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleDetails) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRole(r);
                      setStep('credentials');
                    }}
                    className={`p-3 text-left border text-xs flex items-center gap-2.5 transition-all ${
                      selectedRole === r
                        ? 'border-2 border-[var(--color-gov-navy)] bg-[var(--color-status-info-bg)] text-[var(--color-gov-navy)] font-bold'
                        : 'border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface)] hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{roleDetails[r].icon}</span>
                    <div className="truncate">
                      <div className="font-bold truncate">{roleDetails[r].label}</div>
                      <div className="text-[10px] text-[var(--color-on-surface-variant)] truncate">{roleDetails[r].org}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Login / Register Box */}
          <div className="lg:col-span-6">
            <div className="gov-card p-8 bg-white border border-[var(--color-outline-variant)] space-y-6">
              {/* Mode Tabs: Login vs Register */}
              <div className="flex border-b border-[var(--color-outline-variant)]">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    mode === 'login'
                      ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] bg-[var(--color-surface-container-low)]'
                      : 'border-transparent text-[var(--color-on-surface-variant)] hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] inline-block mr-1 align-sub">login</span>
                  Login to Existing Identity
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    mode === 'register'
                      ? 'border-[var(--color-gov-ochre-bright)] text-[var(--color-gov-ochre)] bg-[var(--color-status-warning-bg)]'
                      : 'border-transparent text-[var(--color-on-surface-variant)] hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] inline-block mr-1 align-sub">person_add</span>
                  Register New Identity
                </button>
              </div>

              <div className="flex justify-between items-center bg-[var(--color-surface-container-low)] p-3 border border-[var(--color-outline-variant)]">
                <div>
                  <div className="text-[11px] font-bold text-[var(--color-gov-navy)] uppercase">Target Role Identity</div>
                  <div className="text-xs font-bold text-[var(--color-on-surface)]">{roleDetails[selectedRole].label} ({roleDetails[selectedRole].org})</div>
                </div>
                <span className="material-symbols-outlined text-[var(--color-gov-navy)] text-[24px]">{roleDetails[selectedRole].icon}</span>
              </div>

              {mode === 'login' ? (
                /* LOGIN FORM */
                selectedRole === 'CITIZEN' ? (
                  <form onSubmit={handleCitizenAadhaar} className="space-y-4 text-xs">
                    {step === 'credentials' ? (
                      <div className="space-y-2">
                        <label className="font-bold text-[var(--color-on-surface)]">Aadhaar Number (12 Digits) *</label>
                        <input
                          type="text"
                          placeholder="XXXX XXXX 4920"
                          defaultValue="XXXX XXXX 4920"
                          className="w-full border border-[var(--color-outline-variant)] p-3 text-sm font-mono focus:border-[var(--color-gov-navy)] focus:outline-none"
                          required
                        />
                        <p className="text-[11px] text-[var(--color-on-surface-variant)]">An OTP will be sent to your UIDAI registered mobile number.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="font-bold text-[var(--color-on-surface)]">Enter 6-Digit OTP *</label>
                        <input
                          type="text"
                          placeholder="1 2 3 4 5 6"
                          defaultValue="123456"
                          className="w-full border border-[var(--color-outline-variant)] p-3 text-lg text-center font-mono font-bold tracking-widest focus:border-[var(--color-gov-navy)] focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[var(--color-gov-ochre)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? 'Authenticating UIDAI...' : step === 'credentials' ? 'Send Aadhaar OTP' : 'Verify & Enter Citizen Dashboard'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOfficialLogin} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[var(--color-on-surface)]">Official Email / Parichay ID *</label>
                      <input
                        type="email"
                        placeholder={`official.${selectedRole.toLowerCase()}@gov.in`}
                        defaultValue={`${selectedRole.toLowerCase()}@gov.in`}
                        className="w-full border border-[var(--color-outline-variant)] p-3 focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[var(--color-on-surface)]">Password / Security Key *</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        defaultValue="password123"
                        className="w-full border border-[var(--color-outline-variant)] p-3 focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[var(--color-gov-navy)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)] transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      {loading ? 'Verifying Credentials...' : `Identify as ${selectedRole} & Open Dashboard`}
                    </button>
                  </form>
                )
              ) : (
                /* REGISTER NEW IDENTITY FORM */
                <form onSubmit={handleRegisterNewIdentity} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--color-on-surface)]">Full Name (as per Govt ID) *</label>
                    <input
                      type="text"
                      placeholder={selectedRole === 'CITIZEN' ? 'e.g., Sh. Rameshwar Lal' : 'e.g., Sh. Vikram Singh, IAS'}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full border border-[var(--color-outline-variant)] p-3 focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-[var(--color-on-surface)]">Designation / Title *</label>
                      <input
                        type="text"
                        placeholder={selectedRole === 'CITIZEN' ? 'Landowner / Applicant' : 'e.g., Project Director / Collector'}
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        className="w-full border border-[var(--color-outline-variant)] p-3 focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[var(--color-on-surface)]">Department / Division *</label>
                      <input
                        type="text"
                        placeholder="e.g., NHAI Nagpur / Revenue Court"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full border border-[var(--color-outline-variant)] p-3 focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--color-on-surface)]">Government ID / Aadhaar Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., GOV-8842-MH / 12-digit Aadhaar"
                      value={regGovtId}
                      onChange={(e) => setRegGovtId(e.target.value)}
                      className="w-full border border-[var(--color-outline-variant)] p-3 font-mono focus:border-[var(--color-gov-navy)] focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="p-3 bg-[var(--color-status-success-bg)] border border-green-200 text-xs text-[var(--color-land-green)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Registration will automatically assign Level 4 RBAC Clearance for <strong>{selectedRole}</strong>.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[var(--color-gov-ochre)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    {loading ? 'Registering Identity...' : `Register as ${selectedRole} & Open Dashboard`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[var(--color-gov-navy)]">Loading Identity & Access Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
