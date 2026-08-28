'use client';

import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/layout/NotificationPanel';
import Link from 'next/link';

export default function TopBar() {
  const { roleConfig } = useRole();
  const { user, role, logout } = useAuth();
  const { unreadCount, togglePanel } = useNotifications();

  return (
    <>
      <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-outline-variant)] h-[56px] sticky top-[32px] z-20 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          {role !== 'CITIZEN' && (
            <div className="hidden md:flex items-center bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] px-3 py-1.5 focus-within:border-[var(--color-gov-navy)] transition-all">
              <span className="material-symbols-outlined text-[var(--color-outline)] text-[20px]">search</span>
              <input
                className="bg-transparent border-none outline-none text-sm px-2 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] w-64 focus:ring-0"
                placeholder="Search records, ULPIN, cases..."
                type="text"
              />
            </div>
          )}
          {role === 'CITIZEN' && (
            <div className="text-xs font-semibold text-[var(--color-gov-navy)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">account_balance</span>
              <span>National Land Acquisition Single Window Portal</span>
            </div>
          )}
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

          {/* Notification Bell */}
          <button
            id="notif-bell-btn"
            onClick={togglePanel}
            className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors relative"
            title="Notifications"
            aria-label={`${unreadCount} unread notifications`}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                  animation: 'badge-pulse 2s ease-in-out infinite',
                  border: '1.5px solid var(--color-surface-card)',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
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

      {/* Notification panel rendered here so it overlays everything */}
      <NotificationPanel />

      <style>{`
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 6px rgba(239,68,68,0.6); }
          50% { transform: scale(1.15); box-shadow: 0 0 10px rgba(239,68,68,0.9); }
        }
      `}</style>
    </>
  );
}
