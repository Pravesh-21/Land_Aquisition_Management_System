'use client';

import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';

export default function RoleSwitcher() {
  const router = useRouter();
  const { currentRole, setCurrentRole, allRoles } = useRole();
  const { role: authRole, login } = useAuth();

  const roleLabels: Record<UserRole, { label: string; icon: string }> = {
    AGENCY: { label: 'Requisite Agency', icon: 'domain' },
    LAO: { label: 'LAO', icon: 'person_search' },
    FOREST: { label: 'Forest & Env.', icon: 'forest' },
    COLLECTOR: { label: 'Collector', icon: 'account_balance' },
    TEHSILDAR: { label: 'Tehsildar', icon: 'balance' },
    CITIZEN: { label: 'Citizen Portal', icon: 'person' },
  };

  const handleRoleSwitch = async (role: UserRole) => {
    // Authenticate into the selected role session
    await login(role);
    setCurrentRole(role);
    router.push(`/dashboard/${role.toLowerCase()}`);
  };

  return (
    <div className="fixed top-[32px] left-0 right-0 z-40 bg-[var(--color-gov-navy)] border-b border-[var(--color-gov-navy-dark)]">
      <div className="flex items-stretch h-[44px] overflow-x-auto">
        {allRoles.map((role) => {
          const isActive = authRole === role;
          const config = roleLabels[role];
          return (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={`flex items-center gap-2 px-5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-r border-[rgba(255,255,255,0.1)] ${
                isActive
                  ? 'bg-[var(--color-gov-ochre-bright)] text-[#663500]'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
              <span className="hidden lg:inline">{config.label}</span>
              {isActive && (
                <span className="ml-1 w-2 h-2 rounded-full bg-[var(--color-land-green)] border border-white"></span>
              )}
            </button>
          );
        })}
        <div className="flex-1 bg-[var(--color-gov-navy)] flex items-center justify-end px-4">
          <span className="text-[11px] text-white/70 uppercase tracking-widest hidden xl:inline">
            🔒 RBAC Session Isolated
          </span>
        </div>
      </div>
    </div>
  );
}
