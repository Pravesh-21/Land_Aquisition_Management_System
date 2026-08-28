'use client';

import { useState } from 'react';
import { mockParcels, formatINR } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';

export default function CorridorPage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [bufferWidth, setBufferWidth] = useState<number>(60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            WebGIS Spatial Alignment Engine
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Corridor Definition & Land Acquisition Polygons</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Real-time interactive OpenStreetMap cadastral overlay with Right-of-Way (RoW) buffer simulation and intersecting survey plots.
          </p>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet OpenStreetMap (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <ProjectLandMap
            height="560px"
            selectedUlpin={selectedParcel?.ulpin}
            onParcelSelect={(p) => setSelectedParcel(p)}
            showLayerControls={true}
          />
        </div>

        {/* Corridor Controls & Parcel Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Corridor Parameter Panel */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-slate-200 pb-2">
              Corridor Alignment Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium">Project Name:</label>
                <div className="font-bold text-slate-900 text-sm">NH-44 Nagpur-Hyderabad Corridor Phase II</div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 font-medium">Right-of-Way (RoW) Buffer:</span>
                  <span className="font-bold text-[var(--color-gov-navy)]">{bufferWidth} Meters</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="10"
                  value={bufferWidth}
                  onChange={(e) => setBufferWidth(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[var(--color-gov-navy)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Total Length</div>
                  <div className="text-base font-bold text-[var(--color-gov-navy)]">12.4 km</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Intersecting Plots</div>
                  <div className="text-base font-bold text-emerald-800">5 Parcels (12.2 Ha)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Parcel Inspector */}
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Parcel Inspector</span>
              <span className="text-[11px] text-slate-500 font-normal">Click any map polygon</span>
            </h3>

            {selectedParcel ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-1">
                  <div className="font-mono text-xs font-bold text-[#0072BC]">{selectedParcel.ulpin}</div>
                  <div className="font-bold text-slate-900 text-sm">Survey #{selectedParcel.surveyNumber}</div>
                  <div className="text-slate-700"><strong>Owner:</strong> {selectedParcel.ownerName}</div>
                  <div className="text-slate-600"><strong>Village:</strong> {selectedParcel.village}</div>
                  <div className="text-slate-600"><strong>Acquired Area:</strong> {selectedParcel.areaHa} Hectares</div>
                  {selectedParcel.compensationINR && (
                    <div className="text-emerald-800 font-bold"><strong>Est. Award:</strong> {selectedParcel.compensationINR}</div>
                  )}
                  <div className="pt-1">
                    <StatusBadge status={selectedParcel.status} variant={getStatusVariant(selectedParcel.status)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded">
                Click on any coloured polygon on the OpenStreetMap view to inspect cadastral parcel ownership and acquisition coordinates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
