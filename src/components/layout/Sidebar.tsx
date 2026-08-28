'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';

export default function Sidebar() {
  const { roleConfig, activeSidebarItem, setActiveSidebarItem } = useRole();
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--color-gov-navy)] text-white w-[260px] fixed left-0 top-[76px] bottom-0 border-r border-[var(--color-outline-variant)] flex flex-col z-30 overflow-hidden">
      {/* Branding Header */}
      <div className="px-6 py-5 border-b border-white/20 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 p-0.5 overflow-hidden border border-amber-400">
          <img src="/logo.png?v=2" alt="Emblem" className="w-full h-full object-contain rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[18px] tracking-tight leading-tight">BHU-NIRIKSHAN</span>
          <span className="text-[11px] text-white/70 uppercase tracking-widest">Govt. of India</span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Logged in as</div>
        <div className="text-sm font-semibold truncate">{roleConfig.user.name}</div>
        <div className="text-xs text-white/70 truncate">{roleConfig.user.designation}</div>
      </div>

      {/* CTA Button */}
      <div className="px-4 py-3 flex-shrink-0">
        <button className="w-full bg-[var(--color-gov-ochre-bright)] text-[#663500] font-semibold text-xs py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-[var(--color-gov-ochre)] hover:text-white transition-colors uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Department Action
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {roleConfig.sidebarItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/dashboard/${roleConfig.id.toLowerCase()}`);
          const isExactActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveSidebarItem(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                isExactActive
                  ? 'bg-[var(--color-gov-ochre-bright)] text-[#663500] font-bold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[var(--color-status-error)] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto px-3 py-3 border-t border-white/20 space-y-0.5 flex-shrink-0">
        <a className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/70 hover:bg-white/10 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">help</span>
          Help Center
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/70 hover:bg-white/10 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </a>
      </div>
    </nav>
  );
}
