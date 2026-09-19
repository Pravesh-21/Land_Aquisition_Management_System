'use client';

import { useState } from 'react';
import { mockForestClearances, formatINR } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';
import ProjectLandMap from '@/components/map/ProjectLandMap';

export default function ForestIntersectionPage() {
  const clearance = mockForestClearances[0];
  const [selectedAlert, setSelectedAlert] = useState<'sanctuary' | 'reserved' | 'esz'>('sanctuary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Departmental OpenStreetMap GIS Spatial Overlay Engine
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
        {/* Leaflet OpenStreetMap GIS Canvas (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <ProjectLandMap
            height="520px"
            selectedUlpin="IN-MH-440001-C09M"
            showLayerControls={true}
          />
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
