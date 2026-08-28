'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import GovBanner from '@/components/layout/GovBanner';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useRole } from '@/contexts/RoleContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useRole();

  return (
    <div
      className={`pt-[32px] transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
      }`}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Page Content Guarded by Auth & Role Permissions */}
      <main className="p-6 max-w-[1280px] mx-auto">
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[var(--color-background)]">
        {/* Government Banner - Fixed Top */}
        <GovBanner />

        {/* Sidebar - Fixed Left below GovBanner */}
        <Sidebar />

        {/* Main Content Area with dynamic margin transition */}
        <DashboardContent>{children}</DashboardContent>
      </div>
    </NotificationProvider>
  );
}
