'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { UserRole, MockUser } from '@/types';

// Official Credentials Directory for the Overview Modal
const OFFICIAL_CREDENTIALS = [
  {
    role: 'AGENCY' as UserRole,
    title: 'Requisite Agency (NHAI)',
    designation: 'Project Director (PIU Nagpur)',
    userId: 'agency@nhai.gov.in',
    shortId: 'agency',
    password: 'Agency@123',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    targetRoute: '/dashboard/agency',
  },
  {
    role: 'LAO' as UserRole,
    title: 'Land Acquisition Officer (LAO)',
    designation: 'Competent Authority (Pune Division)',
    userId: 'lao.pune@revenue.gov.in',
    shortId: 'lao',
    password: 'LAO@123',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    targetRoute: '/dashboard/lao',
  },
  {
    role: 'FOREST' as UserRole,
    title: 'Forest & Environment (MoEFCC)',
    designation: 'Divisional Forest Officer (DFO)',
    userId: 'dfo.forest@moefcc.gov.in',
    shortId: 'forest',
    password: 'Forest@123',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    targetRoute: '/dashboard/forest',
  },
  {
    role: 'COLLECTOR' as UserRole,
    title: 'District Collector (IAS)',
    designation: 'District Magistrate & Sanctioning Authority',
    userId: 'collector.nagpur@gov.in',
    shortId: 'collector',
    password: 'Collector@123',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    targetRoute: '/dashboard/collector',
  },
  {
    role: 'TEHSILDAR' as UserRole,
    title: 'Revenue Court / Tehsildar',
    designation: 'Executive Magistrate & Dispute Resolver',
    userId: 'tehsildar.court@revenue.gov.in',
    shortId: 'tehsildar',
    password: 'Tehsildar@123',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    targetRoute: '/dashboard/tehsildar',
  },
  {
    role: 'ADMIN' as UserRole,
    title: 'System Administrator',
    designation: 'Security & Access Administrator (NIC)',
    userId: 'admin@gov.in',
    shortId: 'admin',
    password: 'Admin@123',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    targetRoute: '/dashboard/admin',
  },
  {
    role: 'CITIZEN' as UserRole,
    title: 'Citizen / Landowner',
    designation: 'Verified Title Holder (Sh. Rajendra Patel)',
    userId: 'citizen@gov.in',
    shortId: 'citizen',
    password: 'Citizen@123',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    targetRoute: '/dashboard/citizen',
  },
];

function LoginContent() {
  const router = useRouter();
  const { loginWithBackend, register } = useAuth();
  const { setCurrentRole } = useRole();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hidden Credentials Overview Modal state
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Register form state (Citizen only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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
        setError(res.message || 'Invalid User ID or Password. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('Authentication service error. Please check your credentials.');
      setLoading(false);
    }
  };

  // Handle Citizen Registration -> Save to Database as CITIZEN
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    const citizenRole: UserRole = 'CITIZEN';
    const citizenUser: MockUser = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      designation: 'Landowner',
      department: regDistrict.trim() ? `Landowner (${regDistrict.trim()})` : 'Citizen G2C',
      aadhaar: regAadhaar.trim() || undefined,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register` : '/api/v1/auth/register';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: citizenUser.name,
          email: citizenUser.email,
          password: regPassword,
          role: citizenRole,
          designation: citizenUser.designation,
          department: citizenUser.department,
          aadhaar_or_id: regAadhaar.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser: MockUser = data.user;
        await register(newUser, citizenRole, regPassword);
        setCurrentRole(citizenRole);
        setLoading(false);
        router.push('/dashboard/citizen');
        return;
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Registration failed.');
      }
    } catch (err) {
      await register(citizenUser, citizenRole, regPassword);
      setCurrentRole(citizenRole);
      setLoading(false);
      router.push('/dashboard/citizen');
      return;
    }
    setLoading(false);
  };

  // Autofill credentials from Overview modal
  const handleAutofill = (userId: string, pass: string) => {
    setEmailOrId(userId);
    setPassword(pass);
    setShowCredsModal(false);
    setError('');
  };

  const toggleRevealPassword = (roleKey: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [roleKey]: !prev[roleKey],
    }));
  };

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
        <div className="w-full max-w-[540px] relative mt-8">

          {/* Centered Circular Emblem Header */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-[#0072BC] shadow-md flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/logo.png?v=3" alt="Bhu Nirikshan Emblem" className="w-full h-full object-contain rounded-full" />
            </div>
          </div>

          {/* MCA Portal Card Container */}
          <div className="bg-white rounded-t-[36px] rounded-b-[16px] shadow-lg border border-blue-100 pt-16 pb-8 px-10 space-y-6">

            {/* Title Section */}
            <div className="text-center space-y-1">
              <h1 className="text-[22px] font-bold text-[#1B365D] tracking-tight">
                {mode === 'login' ? 'BHU-NIRIKSHAN User Login' : 'Citizen / Landowner Registration'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Official Government Portal
              </p>
              <div className="w-24 h-[3px] bg-[#FE932C] mx-auto rounded-full mt-2"></div>
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
                    (Official Email ID for Officers, or Aadhaar / Email for Citizens)
                  </div>
                  <input
                    type="text"
                    placeholder="Enter User ID or Email"
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
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2.5 pr-10 text-sm text-slate-800 focus:bg-white focus:border-[#0072BC] focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 flex items-center justify-center cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <div className="text-right">
                    <button type="button" className="text-xs text-[#0072BC] hover:underline font-medium">
                      Forgot Password ?
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0072BC] hover:bg-[#005c99] text-white font-bold text-sm rounded transition-colors shadow-sm uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{loading ? 'Authenticating...' : 'Login'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="w-full py-3 bg-white border-2 border-[#0072BC] text-[#0072BC] hover:bg-blue-50 font-bold text-sm rounded transition-colors uppercase tracking-wide cursor-pointer"
                  >
                    Register as Citizen / Landowner
                  </button>

                  {/* Hidden Password Overview Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCredsModal(true)}
                      className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">key</span>
                      <span>🔑 View Actor Credentials & Passwords Directory</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* CITIZEN REGISTRATION FORM MODE */
              <form onSubmit={handleRegister} className="space-y-4 text-sm pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Name (as per Aadhaar / Land Record) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sh. Rajendra Patel"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rajendra.patel@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Aadhaar Number / ID
                    </label>
                    <input
                      type="text"
                      placeholder="XXXX XXXX 4920"
                      value={regAadhaar}
                      onChange={(e) => setRegAadhaar(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      District / Tehsil
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nagpur Rural"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Choose a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-slate-300 rounded px-3 py-2 pr-10 text-sm focus:bg-white focus:border-[#0072BC] focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white font-bold text-sm rounded transition-colors shadow-sm uppercase tracking-wide cursor-pointer"
                  >
                    {loading ? 'Creating Citizen Account...' : 'Complete Registration & Access Portal'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs text-center block"
                  >
                    ← Back to Official Login
                  </button>
                </div>
              </form>
            )}

            {/* MCA Security Badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>256-Bit SSL Encrypted • Government of India</span>
            </div>
          </div>
        </div>
      </main>

      {/* CREDENTIALS & PASSWORDS OVERVIEW MODAL */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-300 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#0072BC] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                  Authorized Credentials Directory
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Official Actor Logins & Passwords Overview
                </h3>
              </div>
              <button
                onClick={() => setShowCredsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded">
              💡 <strong>Demo Guidance:</strong> Each of the 6 roles has its own distinct official User ID and password. You can inspect passwords below or click <strong>Autofill</strong> to populate the login form instantly.
            </div>

            {/* Credentials Table / Cards */}
            <div className="space-y-3">
              {OFFICIAL_CREDENTIALS.map((cred) => {
                const isRevealed = !!revealedPasswords[cred.role];
                return (
                  <div
                    key={cred.role}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded border uppercase tracking-wider ${cred.badgeColor}`}>
                          {cred.role}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{cred.title}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">{cred.designation}</div>
                      <div className="font-mono text-slate-700 pt-0.5">
                        <span className="font-semibold text-slate-500">User ID:</span>{' '}
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-[var(--color-gov-navy)]">
                          {cred.userId}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      {/* Password with Reveal Toggle */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 font-mono">
                        <span className="text-slate-400 text-[10px]">Pass:</span>
                        <span className="font-bold text-slate-900 min-w-[80px]">
                          {isRevealed ? cred.password : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRevealPassword(cred.role)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 ml-1"
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isRevealed ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>

                      {/* 1-Click Autofill Button */}
                      <button
                        type="button"
                        onClick={() => handleAutofill(cred.userId, cred.password)}
                        className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white font-bold text-[11px] rounded transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase rounded transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} National Land Acquisition Management Portal • Government of India</span>
          <div className="flex gap-4 text-slate-600">
            <span className="hover:underline cursor-pointer">Security Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Helpdesk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F6FE] flex items-center justify-center">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
