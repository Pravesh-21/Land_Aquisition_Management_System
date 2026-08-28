'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProjectLandMap, { SAMPLE_PROJECT_PARCELS } from '@/components/map/ProjectLandMap';

export default function CitizenMapPage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(SAMPLE_PROJECT_PARCELS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Spatial OpenStreetMap Cadastral Viewer
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Interactive Land Parcel Map View</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Visual inspection of your land parcel boundaries (ULPIN: IN-MH-440001-A12B) in relation to the NH-44 Highway acquisition corridor.
          </p>
        </div>
        <Link
          href="/dashboard/citizen/land-records"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold uppercase tracking-wider hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">list</span> View Land Records Table
        </Link>
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet OpenStreetMap (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <ProjectLandMap
            height="520px"
            selectedUlpin="IN-MH-440001-A12B"
            onParcelSelect={(p) => setSelectedParcel(p)}
            showLayerControls={true}
          />
        </div>

        {/* Right Column: Parcel Coordinate Info */}
        <div className="lg:col-span-4 space-y-5">
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-slate-200 pb-2">
              Selected Parcel Details
            </h3>

            {selectedParcel && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded space-y-1">
                  <div className="font-mono font-bold text-emerald-900">{selectedParcel.ulpin}</div>
                  <div className="font-bold text-slate-900 text-sm">Survey Plot #{selectedParcel.surveyNumber}</div>
                  <div className="text-slate-700"><strong>Owner:</strong> {selectedParcel.ownerName}</div>
                  <div className="text-slate-700"><strong>Village:</strong> {selectedParcel.village}</div>
                  <div className="text-slate-700"><strong>Acquired Area:</strong> {selectedParcel.areaHa} Ha</div>
                  {selectedParcel.compensationINR && (
                    <div className="text-emerald-800 font-bold text-sm pt-1">
                      Award: {selectedParcel.compensationINR}
                    </div>
                  )}
                </div>

                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-700">DGPS Boundary Pinpoints:</div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-600">
                    21.0850° N, 79.0200° E (P1)<br />
                    21.0875° N, 79.0260° E (P2)<br />
                    21.0830° N, 79.0290° E (P3)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="gov-card p-5 space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-slate-200 pb-2">
              Related Citizen Actions
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/citizen/compensation"
                className="block p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded font-bold text-[#003178] transition-colors"
              >
                💰 View ₹47.38L Compensation Breakdown →
              </Link>
              <Link
                href="/dashboard/citizen/grievances"
                className="block p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800 transition-colors"
              >
                ⚖ Raise Demarcation / Boundary Query →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
