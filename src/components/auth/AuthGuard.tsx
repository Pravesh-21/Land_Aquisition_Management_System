'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ROLE_PATH_MAP: Record<string, UserRole> = {
  admin: 'ADMIN',
  agency: 'AGENCY',
  lao: 'LAO',
  forest: 'FOREST',
  collector: 'COLLECTOR',
  tehsildar: 'TEHSILDAR',
  citizen: 'CITIZEN',
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role: currentRole, isAuthenticated } = useAuth();

  // Extract target role from current dashboard URL
  const segments = pathname.split('/').filter(Boolean);
  const targetRoleSegment = segments.length >= 2 && segments[0] === 'dashboard' ? segments[1] : null;
  const requiredRole = targetRoleSegment ? ROLE_PATH_MAP[targetRoleSegment.toLowerCase()] : null;

  // 1. Unauthenticated check
  if (!isAuthenticated || !currentRole) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="gov-card p-8 max-w-md w-full text-center space-y-4 border-t-4 border-t-[var(--color-status-error)]">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-status-error)]">lock</span>
          <h2 className="text-[22px] font-bold text-[var(--color-gov-navy)]">Authentication Required</h2>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            You must be logged into the National Land Acquisition Portal to access official department dashboards.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 bg-[var(--color-gov-navy)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]"
          >
            Go to Parichay SSO Login
          </Link>
        </div>
      </div>
    );
  }

  // 2. Role Conflict / Authorization check
  if (requiredRole && currentRole !== requiredRole) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="gov-card p-8 max-w-lg w-full space-y-6 border-t-4 border-t-[var(--color-status-error)]">
          <div className="flex items-center gap-3 border-b border-[var(--color-outline-variant)] pb-4">
            <span className="material-symbols-outlined text-[36px] text-[var(--color-status-error)]">gpp_bad</span>
            <div>
              <h2 className="text-[20px] font-bold text-[var(--color-gov-navy)]">Access Denied • 403 Forbidden</h2>
              <div className="text-xs font-bold text-[var(--color-status-error)] uppercase tracking-wider">Statutory Role Boundary Restriction</div>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[var(--color-on-surface)]">
            <p>
              Your active session is authenticated as <strong>{currentRole}</strong> ({currentRole === 'CITIZEN' ? 'Landowner' : 'Official Officer'}).
            </p>
            <div className="p-3 bg-[var(--color-status-error-bg)] border border-red-200 text-[var(--color-status-error)]">
              <strong>Security Rule Violation:</strong> You are attempting to access the restricted <strong>{requiredRole} Dashboard</strong> (`{pathname}`). You do not possess the required RBAC clearance for this role.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href={`/dashboard/${currentRole.toLowerCase()}`}
              className="py-3 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-center text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
            >
              Return to My {currentRole} Dashboard
            </Link>
            <Link
              href={`/login?role=${requiredRole}`}
              className="py-3 bg-[var(--color-gov-ochre)] text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)]"
            >
              Re-Authenticate as {requiredRole}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized -> Render requested dashboard view
  return <>{children}</>;
}
