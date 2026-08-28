'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CitizenMapPage() {
  const [activeLayer, setActiveLayer] = useState<'all' | 'acquired' | 'alignment'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Spatial GIS Cadastral Viewer
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Land Parcel Map View</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Visual inspection of your land parcel boundaries (ULPIN: IN-MH-440001-A12B) in relation to the NH-44 Highway alignment.
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
        {/* Map Canvas (Left 8 Cols) */}
        <div className="lg:col-span-8 gov-card p-4 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
                Cadastral Survey Layer • Survey Plot #442/1-A
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                DILRMP Verified
              </span>
            </div>

            {/* Layer Toggles */}
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeLayer === 'all' ? 'bg-[var(--color-gov-navy)] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Layers
              </button>
              <button
                onClick={() => setActiveLayer('acquired')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeLayer === 'acquired' ? 'bg-[var(--color-gov-navy)] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Acquired Boundary
              </button>
              <button
                onClick={() => setActiveLayer('alignment')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeLayer === 'alignment' ? 'bg-[var(--color-gov-navy)] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Road Centerline
              </button>
            </div>
          </div>

          {/* Interactive GIS Viewer */}
          <div className="w-full h-[480px] bg-slate-900 relative overflow-hidden border border-[var(--color-outline-variant)] flex items-center justify-center">
            {/* Satellite Background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-75"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')" }}
            ></div>

            {/* Vector Cadastral Polygons */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 480">
              {/* Neighboring plots */}
              <polygon points="120,80 320,60 300,240 100,220" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
              <polygon points="560,100 750,110 730,320 540,290" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
              
              {/* Citizen Plot #442 - Highlighted */}
              <polygon
                points="280,180 540,160 520,380 260,360"
                fill="rgba(46,125,50,0.35)"
                stroke="#2E7D32"
                strokeWidth="3.5"
              />

              {/* Highway Corridor Overlay */}
              <path
                d="M 50 440 L 300 280 L 500 220 L 760 140"
                fill="none"
                stroke="#FE932C"
                strokeWidth="28"
                strokeOpacity="0.4"
              />
              <path
                d="M 50 440 L 300 280 L 500 220 L 760 140"
                fill="none"
                stroke="#D97706"
                strokeWidth="3"
                strokeDasharray="8 4"
              />

              {/* Centroid Pin */}
              <circle cx="400" cy="270" r="8" fill="#1B365D" stroke="#FFFFFF" strokeWidth="3" />
              <text x="415" y="275" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="monospace">
                Plot #442/1-A (1.42 Ha)
              </text>
            </svg>

            {/* Floating Info Tag */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 border border-slate-300 rounded shadow-md text-xs space-y-1 z-10">
              <div className="font-bold text-[var(--color-gov-navy)]">Your Parcel: Plot #442/1-A</div>
              <div className="text-slate-600"><strong>Coordinates:</strong> 21.1458° N, 79.0882° E</div>
              <div className="text-slate-600"><strong>Acquired Area:</strong> 1.42 Ha (100% of corridor cut)</div>
              <div className="text-emerald-800 font-bold">✓ Direct Access to 4-lane Service Road</div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 bg-white border border-slate-300 rounded p-1 flex flex-col gap-1 z-10 shadow-md">
              <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700">+</button>
              <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700">-</button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-300 rounded p-2.5 text-[11px] z-10 space-y-1 shadow-md">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1">Map Legend</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-[rgba(46,125,50,0.5)] border border-[#2E7D32]"></div>
                <span>Your Acquired Parcel (Plot #442)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#FE932C]"></div>
                <span>NH-44 Highway Alignment Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 border border-dashed border-slate-400"></div>
                <span>Adjacent Survey Plots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parcel Coordinate Info */}
        <div className="lg:col-span-4 space-y-5">
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-slate-200 pb-2">
              Boundary Coordinates (DGPS)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                <span className="font-bold text-slate-700">Point A (North-West)</span>
                <span className="font-mono text-slate-600">21.1462°N, 79.0879°E</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                <span className="font-bold text-slate-700">Point B (North-East)</span>
                <span className="font-mono text-slate-600">21.1461°N, 79.0888°E</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                <span className="font-bold text-slate-700">Point C (South-East)</span>
                <span className="font-mono text-slate-600">21.1454°N, 79.0886°E</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                <span className="font-bold text-slate-700">Point D (South-West)</span>
                <span className="font-mono text-slate-600">21.1455°N, 79.0878°E</span>
              </div>
            </div>
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
