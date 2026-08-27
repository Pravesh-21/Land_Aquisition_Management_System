'use client';

import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function TopBar() {
  const { roleConfig } = useRole();
  const { user, role, logout } = useAuth();

  return (
    <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-outline-variant)] h-[56px] sticky top-[76px] z-20 flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] px-3 py-1.5 focus-within:border-[var(--color-gov-navy)] transition-all">
          <span className="material-symbols-outlined text-[var(--color-outline)] text-[20px]">search</span>
          <input
            className="bg-transparent border-none outline-none text-sm px-2 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] w-64 focus:ring-0"
            placeholder="Search records, ULPIN, cases..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-[var(--color-gov-navy)] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] px-2 py-1 uppercase tracking-wider">
          {roleConfig.user.department}
        </span>

        {/* Auth Session Indicator */}
        <span className="text-xs font-bold text-[var(--color-land-green)] bg-[var(--color-status-success-bg)] border border-green-300 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">verified_user</span>
          AUTH: {role}
        </span>

        <div className="h-6 w-px bg-[var(--color-outline-variant)]"></div>
        <button className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-status-error)] rounded-full"></span>
        </button>
        <button className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <div className="h-6 w-px bg-[var(--color-outline-variant)]"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-[13px] font-semibold text-[var(--color-on-surface)]">{user?.name || roleConfig.user.name}</div>
            <div className="text-[11px] text-[var(--color-on-surface-variant)]">{user?.designation || roleConfig.user.designation}</div>
          </div>
          <Link
            href="/login"
            onClick={logout}
            className="w-8 h-8 bg-[var(--color-gov-navy)] text-white flex items-center justify-center font-bold text-sm hover:bg-[var(--color-status-error)] transition-colors"
            title="Sign Out / Switch User Account"
          >
            {(user?.name || roleConfig.user.name).split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Link>
        </div>
      </div>
    </header>
  );
}
