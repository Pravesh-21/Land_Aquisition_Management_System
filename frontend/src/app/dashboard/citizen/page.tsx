'use client';

import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockNotifications } from '@/data/mockData';

export default function CitizenDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-outline-variant)] pb-4">
        <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Citizen G2C Portal Dashboard</h1>
        <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
          Single-window portal for LARR compensation tracking, itemized payout schedules, & digital objection submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Acquired Area Map */}
        <div className="lg:col-span-8 gov-card p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Live Acquired Area Map</h3>
            <button className="p-1 border border-[var(--color-outline-variant)]"><span className="material-symbols-outlined text-[18px]">fullscreen</span></button>
          </div>

          <div className="w-full h-[400px] bg-slate-100 border border-[var(--color-outline-variant)] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')" }}></div>
            
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 border border-[var(--color-outline-variant)] flex items-center gap-2 text-xs font-bold z-10">
              <div className="w-3 h-3 bg-[var(--color-land-green)]"></div>
              <span>Acquired Zones (Plot #442, Block C)</span>
            </div>

            <div className="absolute bottom-4 right-4 bg-white border border-[var(--color-outline-variant)] p-1 flex flex-col gap-1 z-10">
              <button className="p-1"><span className="material-symbols-outlined text-[16px]">add</span></button>
              <button className="p-1"><span className="material-symbols-outlined text-[16px]">remove</span></button>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Acquisition Status Widget */}
          <div className="gov-card p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-gov-navy)]">pending_actions</span>
              Acquisition Status
            </h3>

            <div className="p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase">Application ID: AP-8842</div>
                  <div className="text-[14px] font-bold text-[var(--color-on-surface)] mt-0.5">Parcel #442, Block C</div>
                </div>
                <StatusBadge status="In Review" variant="warning" />
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-1.5">
                <div className="bg-[var(--color-gov-navy)] h-1.5" style={{ width: '45%' }}></div>
              </div>
            </div>

            <Link href="/dashboard/citizen/status" className="block text-center text-xs font-bold text-[var(--color-gov-navy)] hover:underline pt-2">
              View Detailed Timeline →
            </Link>
          </div>

          {/* Recent Notifications Widget */}
          <div className="gov-card p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-gov-navy)]">notifications_active</span>
              Recent Notifications
            </h3>

            <div className="space-y-3 text-xs">
              {mockNotifications.slice(0, 2).map((n) => (
                <div key={n.id} className="pb-3 border-b border-[var(--color-outline-variant)] space-y-1">
                  <div className="font-bold text-[var(--color-on-surface)] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[var(--color-land-green)]">check_circle</span>
                    {n.title}
                  </div>
                  <div className="text-[var(--color-on-surface-variant)]">{n.message}</div>
                  <div className="text-[10px] text-[var(--color-outline)]">{n.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
