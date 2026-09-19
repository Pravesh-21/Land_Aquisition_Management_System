'use client';

import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/layout/NotificationPanel';
import Link from 'next/link';

export default function TopBar() {
  const { roleConfig, isSidebarCollapsed, toggleSidebar } = useRole();
  const { user, role, logout } = useAuth();
  const { unreadCount, togglePanel } = useNotifications();

  return (
    <>
      <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-outline-variant)] h-[56px] sticky top-[32px] z-20 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          {/* Sidebar Expand / Collapse Quick Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-gov-navy)] rounded transition-colors flex items-center justify-center cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

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
            className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors relative cursor-pointer"
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
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '700',
                  lineHeight: '1',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  border: '1.5px solid #ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  zIndex: 10,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-gov-navy)] text-white text-xs font-bold flex items-center justify-center">
              {roleConfig.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-[var(--color-on-surface)] leading-tight">{roleConfig.user.name}</div>
              <div className="text-[10px] text-[var(--color-outline)]">{roleConfig.user.designation}</div>
            </div>
            <button
              onClick={logout}
              className="ml-2 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded transition-colors cursor-pointer"
              title="Logout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Notification Dropdown Panel */}
      <NotificationPanel />
    </>
  );
}
