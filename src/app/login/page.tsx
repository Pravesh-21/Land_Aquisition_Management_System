'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  const { loginWithBackend, register, sendVerificationOtp, verifyOtp, resendOtp } = useAuth();
  const { setCurrentRole } = useRole();

  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');

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
  const [regPhone, setRegPhone] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Verification state
  const [verificationChannel, setVerificationChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [maskedDestination, setMaskedDestination] = useState<string>('');
  const [otpValue, setOtpValue] = useState<string>('');
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [verificationInfo, setVerificationInfo] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend countdown timer
  useEffect(() => {
    let timer: any = null;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownRemaining]);

  // Handle Login via Backend Database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId || !password) {
      setError('Please enter your User ID and Password.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await loginWithBackend(emailOrId, password);
      if (res.success && res.role) {
        setCurrentRole(res.role);

        // If unverified citizen, trigger in-card verification view
        if (res.requiresVerification) {
          setMode('verify');
          setLoading(false);
          const channel = regPhone ? 'WHATSAPP' : 'EMAIL';
          setVerificationChannel(channel);
          requestOtpForChannel(channel);
          return;
        }

        setLoading(false);
        router.push(`/dashboard/${res.role.toLowerCase()}`);
      } else {
        setError(res.message || 'Invalid User ID or Password. Please check your credentials.');
        setLoading(false);
      }
    } catch {
      setError('Authentication service error. Please check your credentials.');
      setLoading(false);
    }
  };

  // Helper to request OTP for a specific channel
  const requestOtpForChannel = async (channel: 'WHATSAPP' | 'EMAIL') => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await sendVerificationOtp(channel);
      if (res.success) {
        setMaskedDestination(res.maskedDestination || '');
        setCooldownRemaining(res.cooldown || 60);
        setVerificationInfo(`Verification code dispatched to ${channel}.`);
      } else {
        setError(res.message || `Failed to dispatch ${channel} verification code.`);
      }
    } catch {
      setError(`Network error dispatching ${channel} verification code.`);
    }
  };

  // Handle Citizen Registration -> Transition to In-Card Verification
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const citizenRole: UserRole = 'CITIZEN';
    const citizenUser: MockUser = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      designation: 'Landowner',
      department: regDistrict.trim() ? `Landowner (${regDistrict.trim()})` : 'Citizen G2C',
      phone: regPhone.trim() || undefined,
      aadhaar: regAadhaar.trim() || undefined,
    };

    try {
      const res = await register(citizenUser, citizenRole, regPassword);
      if (res.success) {
        setCurrentRole(citizenRole);
        setLoading(false);

        // Transition seamlessly into in-card verification step
        setMode('verify');
        const defaultChannel = regPhone.trim() ? 'WHATSAPP' : 'EMAIL';
        setVerificationChannel(defaultChannel);
        requestOtpForChannel(defaultChannel);
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
        setLoading(false);
      }
    } catch {
      setError('Registration error. Please check your input.');
      setLoading(false);
    }
  };

  // Handle Channel Switch in Verification View
  const handleChannelSwitch = (newChannel: 'WHATSAPP' | 'EMAIL') => {
    setVerificationChannel(newChannel);
    setOtpValue('');
    requestOtpForChannel(newChannel);
  };

  // Handle OTP Resend
  const handleResendOtp = async () => {
    if (cooldownRemaining > 0) return;
    setError('');
    setSuccessMsg('');
    try {
      const res = await resendOtp(verificationChannel);
      if (res.success) {
        setMaskedDestination(res.maskedDestination || '');
        setCooldownRemaining(res.cooldown || 60);
        setSuccessMsg(`Fresh verification code sent via ${verificationChannel}.`);
      } else {
        setError(res.message || 'Resend cooldown in effect.');
      }
    } catch {
      setError('Network error requesting OTP resend.');
    }
  };

  // Handle OTP Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await verifyOtp(verificationChannel, otpValue.trim());
      if (res.success) {
        setSuccessMsg('Account verified successfully! Redirecting to Citizen Portal...');
        setTimeout(() => {
          router.push('/dashboard/citizen');
        }, 800);
      } else {
        setError(res.message || 'Invalid or expired verification code.');
        setLoading(false);
      }
    } catch {
      setError('Network error validating verification code.');
      setLoading(false);
    }
  };

  // Autofill credentials from Overview modal
  const handleAutofill = (userId: string, pass: string) => {
    setEmailOrId(userId);
    setPassword(pass);
    setShowCredsModal(false);
    setError('');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Government Strip */}
      <header className="bg-[var(--color-gov-navy)] text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider">भारत सरकार | Government of India</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300">Ministry of Rural Development & Ministry of Road Transport</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowCredsModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded text-[11px] font-semibold hover:bg-amber-400/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">vpn_key</span>
            Official Credentials Directory
          </button>
        </div>
      </header>

      {/* Main 2-Column Responsive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ============================================================
              LEFT COLUMN: Form (Login / Register / Verification)
             ============================================================ */}
          <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
            <div>
              {/* Official Brand & Emblem Header */}
              <div className="text-center space-y-1 mb-5">
                <div 
                  className="w-20 h-20 bg-white border-2 border-[#0072BC] shadow-md flex items-center justify-center p-1 overflow-hidden mx-auto mb-2.5"
                  style={{ borderRadius: '50%' }}
                >
                  <img
                    src="/logo.png?v=3"
                    alt="BHU-NIRIKSHAN Official Emblem"
                    className="w-full h-full object-contain"
                    style={{ borderRadius: '50%' }}
                  />
                </div>
                <h1 className="text-[20px] font-bold text-[#1B365D] tracking-tight">
                  {mode === 'login'
                    ? 'BHU-NIRIKSHAN User Login'
                    : mode === 'register'
                    ? 'Citizen / Landowner Registration'
                    : 'Account Verification'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Official Government Portal
                </p>
                <div className="w-20 h-[3px] bg-[#FE932C] mx-auto mt-1.5" style={{ borderRadius: '9999px' }}></div>
              </div>

              {/* Mode Navigation Tabs (Login vs Citizen Register) */}
              {mode !== 'verify' && (
                <div className="flex border-b border-slate-200 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                      mode === 'login'
                        ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Official & Citizen Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                      mode === 'register'
                        ? 'border-[var(--color-gov-navy)] text-[var(--color-gov-navy)]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Citizen / Landowner Registration
                  </button>
                </div>
              )}

              {/* Alert Feedback Messages */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5 text-rose-600">error</span>
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5 text-emerald-600">check_circle</span>
                  <div className="flex-1">{successMsg}</div>
                </div>
              )}

              {/* ------------------------------------------------------------
                  MODE 1: SIGN IN FORM
                 ------------------------------------------------------------ */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      User ID or Official Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. agency, collector, or user@gov.in"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        className="w-full px-3 py-2 pl-9 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[var(--color-gov-navy)] focus:outline-none"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">
                        person
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-[var(--color-gov-navy)] hover:underline font-medium"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter account password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pl-9 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[var(--color-gov-navy)] focus:outline-none"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">
                        lock
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span>Authenticating Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="w-full py-2.5 border-2 border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold uppercase tracking-wider rounded hover:bg-blue-50/60 transition-colors cursor-pointer"
                    >
                      Register as Citizen / Landowner
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCredsModal(true)}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-600">vpn_key</span>
                      <span>🔑 View Actor Credentials & Passwords Directory</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------
                  MODE 2: CITIZEN REGISTRATION FORM
                 ------------------------------------------------------------ */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sh. Rajendra Patel"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[var(--color-gov-navy)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rajendra@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Mobile No.
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98225 66778"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Aadhaar / Land Title Ref
                      </label>
                      <input
                        type="text"
                        placeholder="12-digit UID or Survey No."
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District / Tehsil</label>
                      <input
                        type="text"
                        placeholder="e.g. Nagpur / Sikar"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Password <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Min 8 chars, A-Z, 0-9, symbol</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Create strong account password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Note: Only Citizen accounts can self-register. Government authorities are provisioned by NIC Administration.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-60"
                  >
                    {loading ? 'Creating Citizen Account...' : 'Continue to Account Verification'}
                  </button>
                </form>
              )}

              {/* ------------------------------------------------------------
                  MODE 3: IN-CARD OTP VERIFICATION SCREEN
                 ------------------------------------------------------------ */}
              {mode === 'verify' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mb-1">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      Statutory Account Verification
                    </div>
                    <h2 className="text-lg font-bold text-[var(--color-gov-navy)]">
                      Verify your citizen account
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Verify your registered contact to activate portal access under RFCTLARR Act (2013).
                    </p>
                  </div>

                  {/* Channel Selector Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Choose verification channel
                    </label>
                    <div className="relative">
                      <select
                        value={verificationChannel}
                        onChange={(e) => handleChannelSwitch(e.target.value as 'WHATSAPP' | 'EMAIL')}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)] cursor-pointer"
                      >
                        <option value="WHATSAPP">WhatsApp (Secure OTP)</option>
                        <option value="EMAIL">Email (Government Mail)</option>
                      </select>
                    </div>
                  </div>

                  {/* Masked destination feedback */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="text-slate-500">
                      We sent a 6-digit statutory code to your registered contact:
                    </div>
                    <div className="font-mono font-bold text-slate-800 text-sm">
                      {verificationChannel === 'WHATSAPP' ? 'WhatsApp: ' : 'Email: '}
                      {maskedDestination || (verificationChannel === 'WHATSAPP' ? '+91 ******1123' : 'p******@gmail.com')}
                    </div>
                    {verificationInfo && (
                      <div className="text-[11px] text-emerald-700 font-medium">{verificationInfo}</div>
                    )}
                  </div>

                  {/* OTP Input Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter 6-digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        placeholder="1 2 3 4 5 6"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[8px] font-mono text-xl py-2.5 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-[var(--color-gov-navy)] focus:outline-none bg-white font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      {cooldownRemaining > 0 ? (
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">timer</span>
                          Resend code in 00:{cooldownRemaining < 10 ? `0${cooldownRemaining}` : cooldownRemaining}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-[var(--color-gov-navy)] font-semibold hover:underline"
                        >
                          Resend code
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleChannelSwitch(verificationChannel === 'WHATSAPP' ? 'EMAIL' : 'WHATSAPP')}
                        className="text-slate-600 hover:text-slate-900 underline text-[11px]"
                      >
                        Switch to {verificationChannel === 'WHATSAPP' ? 'Email' : 'WhatsApp'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpValue.length !== 6}
                      className="w-full py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {loading ? 'Validating Code...' : 'Verify & Continue into Application'}
                    </button>
                  </form>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      ← Return to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                <span>Argon2id + 256-bit Sealed</span>
              </div>
              <div>NIC Standards Compliant</div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: Application Visual / Illustration (GIS & Cadastral)
              (Pure visual showcase — zero text overlay)
             ============================================================ */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative bg-[#0a1928] overflow-hidden min-h-[640px]">
            <Image
              src="/assets/auth_hero.jpg"
              alt="BHU-NIRIKSHAN National Land Acquisition Management System"
              fill
              className="object-cover object-center"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>

        </div>
      </main>

      {/* Official Credentials Directory Modal */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-[var(--color-gov-navy)] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-lg">admin_panel_settings</span>
                  Official Authority Credentials Directory
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pre-configured accounts seeded in PostgreSQL with Argon2id encryption. Click to quick-fill.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-3 divide-y divide-slate-100">
              {OFFICIAL_CREDENTIALS.map((cred) => (
                <div key={cred.role} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cred.badgeColor}`}>
                        {cred.role}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{cred.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{cred.designation}</div>
                    <div className="text-xs font-mono text-slate-700">
                      ID: <span className="font-semibold text-slate-900">{cred.userId}</span>
                      <span className="text-slate-400 mx-1">|</span>
                      Short: <span className="font-semibold">{cred.shortId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Password</div>
                      <div className="font-mono text-xs font-bold text-slate-800">
                        {revealedPasswords[cred.role] ? cred.password : '••••••••'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setRevealedPasswords({
                          ...revealedPasswords,
                          [cred.role]: !revealedPasswords[cred.role],
                        })
                      }
                      className="p-1.5 text-slate-500 hover:text-slate-700 text-xs"
                      title={revealedPasswords[cred.role] ? 'Hide' : 'Reveal'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {revealedPasswords[cred.role] ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAutofill(cred.shortId, cred.password)}
                      className="px-3 py-1.5 bg-[var(--color-gov-navy)] text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Autofill
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 National Informatics Centre (NIC) · Ministry of Rural Development · Government of India
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
