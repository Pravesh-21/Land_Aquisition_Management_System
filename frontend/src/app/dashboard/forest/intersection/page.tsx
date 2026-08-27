'use client';

import { mockForestClearances, formatINR } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ForestIntersectionPage() {
  const clearance = mockForestClearances[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">STAGE II CLEARANCE</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Forest Officer Intersection Analysis</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Proposal ID: {clearance.proposalId} • Alignment vs. Reserved Forest & Wildlife Sanctuary Boundaries
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-surface-container-low)]">
            <span className="material-symbols-outlined text-[18px]">download</span> Download NOC Template
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)]">
            <span className="material-symbols-outlined text-[18px]">event</span> Schedule Committee Meeting
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GIS Compartment View (Left 8 Cols) */}
        <div className="lg:col-span-8 gov-card p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">GIS COMPARTMENT VIEW</h3>
            <div className="flex gap-2">
              <button className="p-1 border border-[var(--color-outline-variant)] bg-white text-xs"><span className="material-symbols-outlined text-[16px]">swap_vert</span></button>
              <button className="p-1 border border-[var(--color-outline-variant)] bg-white text-xs"><span className="material-symbols-outlined text-[16px]">my_location</span></button>
            </div>
          </div>

          <div className="w-full h-[450px] bg-emerald-950 relative overflow-hidden border border-[var(--color-outline-variant)] flex items-center justify-center">
            {/* Map Canvas Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80')" }}></div>
            
            {/* Overlay Sanctuary & Forest Polygons */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
              <path d="M 100 80 Q 250 50 400 150 T 700 220 L 750 400 L 200 420 Z" fill="rgba(45,90,39,0.35)" stroke="#2D5A27" strokeWidth="2" />
              <path d="M 250 120 Q 380 90 480 200 T 600 350 L 300 380 Z" fill="rgba(186,26,26,0.25)" stroke="#BA1A1A" strokeWidth="2" strokeDasharray="6 3" />
              {/* Proposed Highway Alignment Line */}
              <path d="M 50 400 L 220 300 L 420 220 L 620 120 L 780 50" fill="none" stroke="#BA1A1A" strokeWidth="4" />
            </svg>

            {/* Floating Map Controls */}
            <div className="absolute top-4 right-4 bg-white/90 border border-[var(--color-outline-variant)] p-1.5 flex flex-col gap-1 z-10">
              <button className="p-1 hover:bg-[var(--color-surface-container-low)]"><span className="material-symbols-outlined text-[16px]">add</span></button>
              <button className="p-1 hover:bg-[var(--color-surface-container-low)]"><span className="material-symbols-outlined text-[16px]">remove</span></button>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 border border-[var(--color-outline-variant)] p-3 text-xs z-10">
              <div className="font-bold text-[var(--color-gov-navy)] mb-2 uppercase tracking-wider">LEGEND</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><div className="w-5 h-[3px] bg-[#BA1A1A]"></div><span>Proposed Alignment</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[rgba(186,26,26,0.25)] border border-[var(--color-status-error)]"></div><span>Wildlife Sanctuary</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[rgba(45,90,39,0.35)] border border-[var(--color-land-green)]"></div><span>Reserved Forest</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Intersection Alerts (Right 4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">INTERSECTION ALERTS</div>

          {/* Alert Card 1 - High Severity */}
          <div className="gov-card p-4 border-l-4 border-l-[var(--color-status-error)] bg-[var(--color-surface-card)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-[var(--color-status-error)] font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                CRITICAL INTERSECTION
              </div>
              <StatusBadge status="Severity: High" variant="error" />
            </div>
            <h3 className="text-[18px] font-bold text-[var(--color-on-surface)] leading-tight mb-2">
              2.4km through Wildlife Sanctuary
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">
              Alignment crosses Core Zone (Compartment 42-B). Significant fragmentation risk identified.
            </p>
            <div className="grid grid-cols-2 pt-3 border-t border-[var(--color-outline-variant)] text-xs">
              <div>
                <div className="text-[var(--color-on-surface-variant)]">Area Impacted</div>
                <div className="font-bold text-[14px]">14.2 Hectares</div>
              </div>
              <div>
                <div className="text-[var(--color-on-surface-variant)]">Tree Felling Est.</div>
                <div className="font-bold text-[14px]">~1,250</div>
              </div>
            </div>
          </div>

          {/* Alert Card 2 - Medium Severity */}
          <div className="gov-card p-4 border-l-4 border-l-[var(--color-gov-ochre)] bg-[var(--color-surface-card)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-[var(--color-gov-ochre)] font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">info</span>
                PROXIMITY ALERT
              </div>
              <StatusBadge status="Severity: Medium" variant="warning" />
            </div>
            <h3 className="text-[16px] font-bold text-[var(--color-on-surface)] leading-tight mb-2">
              Eco-Sensitive Zone Border
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">
              Alignment runs within 500m of the buffer zone for 4.1km.
            </p>
            <div className="grid grid-cols-2 pt-3 border-t border-[var(--color-outline-variant)] text-xs">
              <div>
                <div className="text-[var(--color-on-surface-variant)]">Distance to Border</div>
                <div className="font-bold text-[14px]">320m (Avg)</div>
              </div>
              <div>
                <div className="text-[var(--color-on-surface-variant)]">Clearance Required</div>
                <div className="font-bold text-[14px]">NBWL Approval</div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="gov-card p-4 bg-[var(--color-surface-container-low)] space-y-2 text-xs">
            <div className="font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">ANALYSIS SUMMARY</div>
            <div className="flex justify-between py-1 border-b border-[var(--color-outline-variant)]">
              <span className="text-[var(--color-on-surface-variant)]">Total Alignment Length:</span>
              <span className="font-bold">45.8 km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-outline-variant)]">
              <span className="text-[var(--color-on-surface-variant)]">Total Forest Intersect:</span>
              <span className="font-bold">12.1 km</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-[14px]">
              <span className="text-[var(--color-gov-navy)]">NPV Calculated (Est.):</span>
              <span className="text-[var(--color-gov-navy)]">₹ 45.2 Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
