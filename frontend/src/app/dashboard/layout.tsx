'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import GovBanner from '@/components/layout/GovBanner';
import RoleSwitcher from '@/components/layout/RoleSwitcher';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[var(--color-background)]">
        {/* Government Banner - Fixed Top */}
        <GovBanner />
        
        {/* Role Switcher - Below Banner */}
        <RoleSwitcher />
        
        {/* Sidebar - Fixed Left */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="ml-[260px] pt-[76px]">
          {/* Top Bar */}
          <TopBar />
          
          {/* Page Content Guarded by Auth & Role Permissions */}
          <main className="p-6 max-w-[1280px] mx-auto">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
