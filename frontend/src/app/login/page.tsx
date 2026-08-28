'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { UserRole, MockUser } from '@/types';

function LoginContent() {
  const router = useRouter();
  const { loginWithBackend, register } = useAuth();
  const { setCurrentRole } = useRole();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('AGENCY');
  const [regDesignation, setRegDesignation] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Login via Backend Database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId || !password) {
      setError('Please enter your User ID and Password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await loginWithBackend(emailOrId, password);
      if (res.success && res.role) {
        setCurrentRole(res.role);
        setLoading(false);
        router.push(`/dashboard/${res.role.toLowerCase()}`);
      } else {
        setError('Invalid User ID or Password. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('Backend authentication service unavailable.');
      setLoading(false);
    }
  };

  // Handle Registration -> Save to Backend Database
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register` : '/api/v1/auth/register';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          designation: regDesignation || `${regRole} Official`,
          department: regDepartment || `${regRole} Division`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser: MockUser = data.user;
        await register(newUser, data.role as UserRole);
        setCurrentRole(data.role as UserRole);
        setLoading(false);
        router.push(`/dashboard/${(data.role as string).toLowerCase()}`);
        return;
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Registration failed.');
      }
    } catch (err) {
      const newUser: MockUser = {
        name: regName,
        email: regEmail,
        designation: regDesignation || `${regRole} Official`,
        department: regDepartment || `${regRole} Division`,
      };
      await register(newUser, regRole);
      setCurrentRole(regRole);
      setLoading(false);
      router.push(`/dashboard/${regRole.toLowerCase()}`);
      return;
    }
    setLoading(false);
  };

  const roleOptions: { role: UserRole; label: string; org: string }[] = [
    { role: 'AGENCY', label: 'Requisite Agency Official', org: 'NHAI / Railways / PWD' },
    { role: 'LAO', label: 'Land Acquisition Officer', org: 'Revenue Department' },
    { role: 'FOREST', label: 'Forest & Environment Officer', org: 'MoEFCC' },
    { role: 'COLLECTOR', label: 'District Collector', org: 'District Administration' },
    { role: 'TEHSILDAR', label: 'Tehsildar / Revenue Court', org: 'Tehsil Revenue Court' },
    { role: 'CITIZEN', label: 'Landowner / Citizen G2C', org: 'Aadhaar e-KYC Single Window' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F6FE] flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-2 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">Government of India</span>
            <span className="border-l border-slate-300 h-3"></span>
            <span>Ministry of Rural Development</span>
          </div>
          <div className="text-[11px] font-bold text-[#003178]">
            BHU-NIRIKSHAN PORTAL
          </div>
        </div>
      </header>

      {/* Main Container - Centered MCA / MyGov Style Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[560px] relative mt-8">
          
          {/* Centered Circular Emblem Header */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-[#0072BC] shadow-md flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/logo.png?v=2" alt="Bhu Nirikshan Emblem" className="w-full h-full object-contain rounded-full" />
            </div>
          </div>

          {/* MCA Portal Card Container */}
          <div className="bg-white rounded-t-[36px] rounded-b-[16px] shadow-lg border border-blue-100 pt-16 pb-10 px-10 space-y-6">
            
            {/* Title Section */}
            <div className="text-center space-y-1">
              <h1 className="text-[24px] font-bold text-[#1B365D] tracking-tight">
                BHU-NIRIKSHAN User Login / Registration
              </h1>
              <div className="w-28 h-[3px] bg-[#FE932C] mx-auto rounded-full mt-2"></div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* LOGIN FORM MODE */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5 text-sm pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    User ID
                  </label>
                  <div className="text-[11px] text-slate-500 mb-1">
                    (Official Email ID for Officers, or Aadhaar Number for Citizens)
                  </div>
                  <input
                    type="text"
                    placeholder="Enter User ID or Official Email"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#0072BC] focus:outline-none transition-colors"
                    required
                  />
                  <div className="text-right">
                    <button type="button" className="text-xs text-[#0072BC] hover:underline font-medium">
                      Forgot User ID ?
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#0072BC] focus:outline-none transition-colors"
                    required
                  />
                  <div className="text-right">
                    <button type="button" className="text-xs text-[#0072BC] hover:underline font-medium">
                      Forgot Password ?
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons (MCA Style) */}
                <div className="space-y-3 pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0072BC] hover:bg-[#005c99] text-white font-bold text-sm rounded transition-colors shadow-sm uppercase tracking-wide"
                  >
                    {loading ? 'Authenticating...' : 'Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="w-full py-3 bg-white border-2 border-[#0072BC] text-[#0072BC] hover:bg-blue-50 font-bold text-sm rounded transition-colors uppercase tracking-wide"
                  >
                    Register
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM MODE */
              <form onSubmit={handleRegister} className="space-y-4 text-sm pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    User ID / Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. officer@revenue.gov.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    User Role / Designation *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm font-medium focus:bg-white focus:border-[#0072BC] focus:outline-none"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.role} value={opt.role}>
                        {opt.label} ({opt.org})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Designation Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Collector"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-xs focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Department / District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nagpur Division"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-xs focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary Registration Buttons */}
                <div className="space-y-3 pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0072BC] hover:bg-[#005c99] text-white font-bold text-sm rounded transition-colors shadow-sm uppercase tracking-wide"
                  >
                    {loading ? 'Creating User Account...' : 'Complete Registration'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors uppercase tracking-wide"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div>
          © 2026 <strong>BHU-NIRIKSHAN</strong>. Ministry of Rural Development, Government of India.
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[#003178]">Loading User Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
