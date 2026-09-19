'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { roleConfig, activeSidebarItem, setActiveSidebarItem, isSidebarCollapsed, toggleSidebar } = useRole();
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav
      className={`bg-[var(--color-gov-navy)] text-white fixed left-0 top-[32px] bottom-0 border-r border-[var(--color-outline-variant)] flex flex-col z-30 overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Branding Header with Collapse/Expand Toggle */}
      <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between flex-shrink-0 h-[64px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 p-0.5 overflow-hidden border border-amber-400">
            <img src="/logo.png?v=3" alt="Emblem" className="w-full h-full object-contain rounded-full" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col truncate animate-in fade-in duration-200">
              <span className="font-bold text-[16px] tracking-tight leading-tight">BHU-NIRIKSHAN</span>
              <span className="text-[10px] text-white/70 uppercase tracking-widest">Govt. of India</span>
            </div>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors flex-shrink-0 cursor-pointer"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* User Info (Visible when expanded) */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0 animate-in fade-in duration-200">
          <div className="text-[11px] text-white/60 uppercase tracking-wider mb-0.5">Logged in as</div>
          <div className="text-sm font-semibold truncate text-white">{roleConfig.user.name}</div>
          <div className="text-xs text-white/70 truncate">{roleConfig.user.designation}</div>
        </div>
      )}

      {/* CTA Button for Department Officers */}
      {roleConfig.id !== 'CITIZEN' && (
        <div className="px-3 py-2.5 flex-shrink-0">
          <button
            className={`w-full bg-[var(--color-gov-ochre-bright)] text-[#663500] font-semibold text-xs py-2 px-2 flex items-center justify-center gap-2 hover:bg-[var(--color-gov-ochre)] hover:text-white transition-colors uppercase tracking-wider rounded ${
              isSidebarCollapsed ? 'p-2' : ''
            }`}
            title="New Action"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {!isSidebarCollapsed && <span>New Action</span>}
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {roleConfig.sidebarItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/dashboard/${roleConfig.id.toLowerCase()}`);
          const isExactActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveSidebarItem(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded transition-colors ${
                isSidebarCollapsed ? 'justify-center px-2' : ''
              } ${
                isExactActive
                  ? 'bg-[var(--color-gov-ochre-bright)] text-[#663500] font-bold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              {!isSidebarCollapsed && item.badge && (
                <span className="ml-auto bg-[var(--color-status-error)] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto px-2 py-2.5 border-t border-white/20 space-y-0.5 flex-shrink-0">
        <Link
          href={`/dashboard/${roleConfig.id.toLowerCase()}`}
          title={isSidebarCollapsed ? `Role: ${roleConfig.id}` : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-[12px] text-white/70 hover:bg-white/10 rounded transition-colors ${
            isSidebarCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">verified_user</span>
          {!isSidebarCollapsed && <span className="truncate">Role: {roleConfig.id}</span>}
        </Link>
        <Link
          href="/login"
          onClick={logout}
          title={isSidebarCollapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-[12px] text-red-300 hover:bg-white/10 rounded transition-colors ${
            isSidebarCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">logout</span>
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </nav>
  );
}
