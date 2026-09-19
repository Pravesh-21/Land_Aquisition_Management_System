'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-outline-variant)] pb-5">
        <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
          System Administration & RBAC Management
        </div>
        <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">
          BHU-NIRIKSHAN Security & Administration Hub
        </h1>
        <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
          Production-grade PostgreSQL authentication, statutory role-based permissions, and user auditing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Current Authenticated Session</div>
          <div className="text-xl font-bold text-[var(--color-gov-navy)] mt-1">{user?.name || 'Administrator'}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Role: {role}</div>
          <div className="text-xs text-slate-500 mt-2">Department: National Informatics Center</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Authentication Foundation</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">PostgreSQL Active</div>
          <div className="text-xs text-slate-600 mt-1">Argon2id Hashing + JWT Rotation</div>
          <div className="text-xs text-slate-500 mt-2">Database: bhudrishti_db</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Statutory RBAC Scope</div>
          <div className="text-xl font-bold text-[var(--color-gov-navy)] mt-1">7 Roles / 27 Perms</div>
          <div className="text-xs text-slate-600 mt-1">Database-driven authorization</div>
          <div className="text-xs text-slate-500 mt-2">RFCTLARR Statutory Compliance</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs">
        <h2 className="text-base font-bold text-[var(--color-gov-navy)] mb-4">
          Government Officer & Citizen Access Portals
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <Link href="/dashboard/agency" className="p-3 border border-blue-200 bg-blue-50 rounded hover:bg-blue-100 font-semibold text-blue-900">
            Agency / NHAI Corridor Portal
          </Link>
          <Link href="/dashboard/lao" className="p-3 border border-amber-200 bg-amber-50 rounded hover:bg-amber-100 font-semibold text-amber-900">
            Land Acquisition Officer (LAO)
          </Link>
          <Link href="/dashboard/forest" className="p-3 border border-emerald-200 bg-emerald-50 rounded hover:bg-emerald-100 font-semibold text-emerald-900">
            Forest & MoEFCC Clearance
          </Link>
          <Link href="/dashboard/collector" className="p-3 border border-purple-200 bg-purple-50 rounded hover:bg-purple-100 font-semibold text-purple-900">
            District Collector Sanctions
          </Link>
          <Link href="/dashboard/tehsildar" className="p-3 border border-rose-200 bg-rose-50 rounded hover:bg-rose-100 font-semibold text-rose-900">
            Revenue Court & Tehsildar
          </Link>
          <Link href="/dashboard/citizen" className="p-3 border border-teal-200 bg-teal-50 rounded hover:bg-teal-100 font-semibold text-teal-900">
            Citizen & Landowner Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
