'use client';

import { useState } from 'react';
import { mockParcels, formatINR } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import ProjectLandMap from '@/components/map/ProjectLandMap';

export default function CorridorPage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [bufferWidth, setBufferWidth] = useState<number>(60);
  const [previousBuffer, setPreviousBuffer] = useState<number>(60);

  // Dynamic Affected Area Calculations based on RoW Buffer
  const calculateMetrics = (width: number) => {
    if (width <= 45) {
      return {
        parcelsCount: 4,
        landAreaHa: 9.8,
        costEstimate: 196000000,
        assetsCount: 52,
        highRiskCount: 1,
      };
    } else if (width <= 60) {
      return {
        parcelsCount: 5,
        landAreaHa: 12.2,
        costEstimate: 245000000,
        assetsCount: 68,
        highRiskCount: 2,
      };
    } else if (width <= 75) {
      return {
        parcelsCount: 7,
        landAreaHa: 15.8,
        costEstimate: 316000000,
        assetsCount: 94,
        highRiskCount: 3,
      };
    } else if (width <= 90) {
      return {
        parcelsCount: 9,
        landAreaHa: 19.4,
        costEstimate: 388000000,
        assetsCount: 122,
        highRiskCount: 4,
      };
    } else {
      return {
        parcelsCount: 12,
        landAreaHa: 24.6,
        costEstimate: 492000000,
        assetsCount: 168,
        highRiskCount: 6,
      };
    }
  };

  const currentMetrics = calculateMetrics(bufferWidth);
  const baselineMetrics = calculateMetrics(previousBuffer);

  const parcelDelta = currentMetrics.parcelsCount - baselineMetrics.parcelsCount;
  const landDelta = (currentMetrics.landAreaHa - baselineMetrics.landAreaHa).toFixed(1);
  const costDelta = currentMetrics.costEstimate - baselineMetrics.costEstimate;
  const assetDelta = currentMetrics.assetsCount - baselineMetrics.assetsCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            WebGIS Spatial Alignment Engine • Feature 1
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Corridor Definition & Affected Area Calculator</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Real-time interactive OpenStreetMap cadastral overlay with Right-of-Way (RoW) buffer simulation, dynamic impact delta, and intersecting survey plots.
          </p>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet OpenStreetMap (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <ProjectLandMap
            height="580px"
            selectedUlpin={selectedParcel?.ulpin}
            onParcelSelect={(p) => setSelectedParcel(p)}
            showLayerControls={true}
          />
        </div>

        {/* Corridor Controls & Live Affected Area Calculator (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 📍 Feature 2: Affected Area Calculator on RoW Change */}
          <div className="gov-card p-5 space-y-4 border-t-4 border-t-[#0072BC]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-[#0072BC]">calculate</span>
                <span>Affected Area Calculator</span>
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-[#0072BC] text-[10px] font-bold rounded uppercase">
                Live Simulation
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium">Corridor Project:</label>
                <div className="font-bold text-slate-900 text-sm">NH-44 Nagpur-Hyderabad (Phase II)</div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 font-bold">Right-of-Way (RoW) Width:</span>
                  <span className="font-mono font-bold text-sm text-[var(--color-gov-navy)] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {bufferWidth} Meters
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="10"
                  value={bufferWidth}
                  onChange={(e) => {
                    setPreviousBuffer(bufferWidth);
                    setBufferWidth(Number(e.target.value));
                  }}
                  className="w-full cursor-pointer accent-[var(--color-gov-navy)] h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>30m (Narrow)</span>
                  <span>60m (Standard)</span>
                  <span>70m</span>
                  <span>120m (Expressway)</span>
                </div>
              </div>

              {/* Dynamic Impact Delta Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>RoW Change Impact:</span>
                  <span className="font-mono text-[#0072BC]">
                    {previousBuffer}m → {bufferWidth}m
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Parcels Affected</div>
                    <div className="text-sm font-bold text-slate-900 flex items-baseline gap-1 mt-0.5">
                      <span>{baselineMetrics.parcelsCount} → {currentMetrics.parcelsCount}</span>
                      {parcelDelta !== 0 && (
                        <span className={`text-[10px] font-bold ${parcelDelta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          ({parcelDelta > 0 ? `+${parcelDelta}` : parcelDelta})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Land Affected</div>
                    <div className="text-sm font-bold text-slate-900 flex items-baseline gap-1 mt-0.5">
                      <span>{baselineMetrics.landAreaHa} → {currentMetrics.landAreaHa} Ha</span>
                      {Number(landDelta) !== 0 && (
                        <span className={`text-[10px] font-bold ${Number(landDelta) > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          ({Number(landDelta) > 0 ? `+${landDelta}` : landDelta} Ha)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Estimated Cost</div>
                    <div className="text-xs font-bold text-emerald-900 mt-0.5">
                      {formatINR(currentMetrics.costEstimate)}
                    </div>
                    {costDelta !== 0 && (
                      <div className={`text-[10px] font-bold ${costDelta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {costDelta > 0 ? `+${formatINR(costDelta)}` : formatINR(costDelta)}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Standing Assets</div>
                    <div className="text-sm font-bold text-slate-900 flex items-baseline gap-1 mt-0.5">
                      <span>{baselineMetrics.assetsCount} → {currentMetrics.assetsCount}</span>
                      {assetDelta !== 0 && (
                        <span className={`text-[10px] font-bold ${assetDelta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          ({assetDelta > 0 ? `+${assetDelta}` : assetDelta})
                        </span>
                      )}
                    </div>
                  </div>
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
                  {selectedParcel.assetCount && (
                    <div className="p-2 bg-white border border-blue-200 rounded my-1 text-[11px] space-y-0.5">
                      <div className="font-bold text-[var(--color-gov-navy)] flex justify-between">
                        <span>📦 Standing Asset Count:</span>
                        <span>{selectedParcel.assetCount.total} Total</span>
                      </div>
                      <div className="text-slate-600">
                        {selectedParcel.assetCount.structures} Structures • {selectedParcel.assetCount.trees} Trees • {selectedParcel.assetCount.wells} Wells
                      </div>
                    </div>
                  )}
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
                Click on any polygon on the OpenStreetMap view to inspect cadastral parcel ownership and acquisition coordinates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
