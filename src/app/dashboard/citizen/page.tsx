'use client';

import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockNotifications } from '@/data/mockData';

export default function CitizenDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-outline-variant)] pb-4 flex justify-between items-end">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Citizen & Landowner Portal
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Landowner Acquisition Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Single-window portal for RFCTLARR compensation tracking, official orders, and interactive cadastral map verification.
          </p>
        </div>
        <Link
          href="/dashboard/citizen/compensation"
          className="px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]"
        >
          💰 View ₹47.38L Award
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live OpenStreetMap GIS Acquired Area Map */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0072BC]">map</span>
              Live Acquired Parcel Map (OpenStreetMap)
            </h3>
            <Link
              href="/dashboard/citizen/map"
              className="text-xs font-bold text-[#0072BC] hover:underline"
            >
              Full Screen GIS Viewer →
            </Link>
          </div>

          <ProjectLandMap
            height="420px"
            selectedUlpin="IN-MH-440001-A12B"
            showLayerControls={true}
          />
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
                  <div className="text-[11px] font-semibold text-[var(--color-on-surface-variant)] uppercase">ULPIN: IN-MH-440001-A12B</div>
                  <div className="text-[14px] font-bold text-[var(--color-on-surface)] mt-0.5">Plot #442/1-A, Hingna (1.42 Ha)</div>
                </div>
                <StatusBadge status="Award Passed" variant="success" />
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--color-land-green)] h-2 rounded-full" style={{ width: '87.5%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Stage 7 of 8 Completed</span>
                <span className="font-bold text-emerald-800">87.5% Complete</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/dashboard/citizen/status"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center text-xs font-bold text-slate-800 transition-colors"
              >
                Track Lifecycle →
              </Link>
              <Link
                href="/dashboard/citizen/documents"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center text-xs font-bold text-slate-800 transition-colors"
              >
                Download Award →
              </Link>
            </div>
          </div>

          {/* Quick Notice Widget */}
          <div className="gov-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Official Communication</h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
              <div className="font-bold text-[#003178]">Section 23 Award Declared</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Direct Benefit Transfer of ₹47,38,500 successfully settled in your Aadhaar-linked SBI Account on 12-Oct-2023.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
