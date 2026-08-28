'use client';

import { useState } from 'react';
import { mockForestClearances, formatINR } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export default function ForestIntersectionPage() {
  const clearance = mockForestClearances[0];
  const [selectedAlert, setSelectedAlert] = useState<'sanctuary' | 'reserved' | 'esz'>('sanctuary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Departmental GIS Spatial Overlay Engine
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Forest & Wildlife Boundary Intersection Review</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Alignment vector overlay against Survey of India Reserved Forests, Eco-Sensitive Zones (ESZ), & Wildlife Sanctuaries for Proposal {clearance.proposalId}.
          </p>
        </div>
        <Link
          href="/dashboard/forest"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold uppercase tracking-wider hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Clearances
        </Link>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GIS Compartment View (Left 7 Cols) */}
        <div className="lg:col-span-7 gov-card p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
              GIS Compartment Spatial Overlay
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                FSI Canopy Layer Active
              </span>
            </div>
          </div>

          <div className="w-full h-[460px] bg-emerald-950 relative overflow-hidden border border-[var(--color-outline-variant)] flex items-center justify-center">
            {/* Map Canvas Background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80')" }}
            ></div>
            
            {/* Overlay Sanctuary & Forest Polygons */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
              {/* Reserved Forest Polygon */}
              <path d="M 100 80 Q 250 50 400 150 T 700 220 L 750 400 L 200 420 Z" fill="rgba(45,90,39,0.35)" stroke="#2D5A27" strokeWidth="2" />
              {/* Wildlife Sanctuary Core Polygon */}
              <path d="M 250 120 Q 380 90 480 200 T 600 350 L 300 380 Z" fill="rgba(186,26,26,0.25)" stroke="#BA1A1A" strokeWidth="2" strokeDasharray="6 3" />
              {/* Proposed Highway Alignment Line */}
              <path d="M 50 400 L 220 300 L 420 220 L 620 120 L 780 50" fill="none" stroke="#BA1A1A" strokeWidth="4" />
              
              {/* Critical Intersect Marker */}
              <circle cx="420" cy="220" r="10" fill="#BA1A1A" stroke="#FFFFFF" strokeWidth="3" className="animate-pulse" />
            </svg>

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 bg-white/90 border border-[var(--color-outline-variant)] p-1.5 flex flex-col gap-1 z-10 rounded shadow-sm">
              <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 font-bold">+</button>
              <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 font-bold">-</button>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 border border-[var(--color-outline-variant)] p-3 text-xs z-10 rounded shadow-md">
              <div className="font-bold text-[var(--color-gov-navy)] mb-2 uppercase tracking-wider">MAP LEGEND</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><div className="w-5 h-[3px] bg-[#BA1A1A]"></div><span>Proposed Highway Alignment</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[rgba(186,26,26,0.25)] border border-[var(--color-status-error)]"></div><span>Karanja Wildlife Sanctuary Core</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[rgba(45,90,39,0.35)] border border-[var(--color-land-green)]"></div><span>Reserved Forest Compartment 42-B</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Intersection Alert System Container (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[var(--color-status-error)]">notifications_active</span>
              Intersection Alert System (3 Alerts)
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              High Ecological Sensitivity
            </span>
          </div>

          {/* Alert Card 1 - Wildlife Sanctuary Core */}
          <div
            onClick={() => setSelectedAlert('sanctuary')}
            className={`gov-card p-4 border-l-4 cursor-pointer transition-all ${
              selectedAlert === 'sanctuary'
                ? 'border-l-red-600 bg-red-50/50 shadow-md ring-1 ring-red-200'
                : 'border-l-red-500 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                CRITICAL SANCTUARY INTERSECT
              </div>
              <StatusBadge status="High Severity" variant="error" />
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 leading-snug">
              2.4 km Cut through Karanja Sanctuary Core
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Corridor bisects wildlife corridor. Mandatory 2 Underpasses (75m span) & animal overpass required under NBWL guidelines.
            </p>
            <div className="grid grid-cols-2 pt-2 mt-2 border-t border-slate-200 text-xs">
              <div><span className="text-slate-500">Impact Area:</span> <strong>14.2 Hectares</strong></div>
              <div><span className="text-slate-500">Tree Felling:</span> <strong>~1,250 Trees</strong></div>
            </div>
          </div>

          {/* Alert Card 2 - Reserved Forest Compartment 42-B */}
          <div
            onClick={() => setSelectedAlert('reserved')}
            className={`gov-card p-4 border-l-4 cursor-pointer transition-all ${
              selectedAlert === 'reserved'
                ? 'border-l-amber-600 bg-amber-50/50 shadow-md ring-1 ring-amber-200'
                : 'border-l-amber-500 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">nature</span>
                RESERVED FOREST DIVERSION
              </div>
              <StatusBadge status="Medium Risk" variant="warning" />
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 leading-snug">
              Compartment 42-B Forest Diversion (31.6 Ha)
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Compensatory Afforestation (CA) required on double the non-forest land area (63.2 Ha) with 2,600 saplings/Ha.
            </p>
            <div className="grid grid-cols-2 pt-2 mt-2 border-t border-slate-200 text-xs">
              <div><span className="text-slate-500">Calculated NPV:</span> <strong>₹ 98.4 Cr</strong></div>
              <div><span className="text-slate-500">CA Requirement:</span> <strong>63.2 Ha</strong></div>
            </div>
          </div>

          {/* Alert Card 3 - Eco-Sensitive Zone Buffer */}
          <div
            onClick={() => setSelectedAlert('esz')}
            className={`gov-card p-4 border-l-4 cursor-pointer transition-all ${
              selectedAlert === 'esz'
                ? 'border-l-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-200'
                : 'border-l-blue-500 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">info</span>
                ESZ BUFFER COMPLIANCE
              </div>
              <StatusBadge status="Compliant" variant="info" />
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 leading-snug">
              500m Eco-Sensitive Zone Noise Barrier Condition
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Requires continuous acoustic noise barriers (4m height) and zero nighttime high-beam lighting per MoEFCC conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
