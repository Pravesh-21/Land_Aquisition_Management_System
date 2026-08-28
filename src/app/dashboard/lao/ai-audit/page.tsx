'use client';

import { mockAssetDetections, mockParcels, formatINR } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { useState } from 'react';

export default function AIAuditPage() {
  const [selectedParcel, setSelectedParcel] = useState(mockParcels[0]);

  const detections = mockAssetDetections.filter(d => d.parcelId === selectedParcel.id) || mockAssetDetections;
  const totalAssetValue = detections.reduce((acc, d) => acc + d.estimatedValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 3 • AI/ML Engine 1</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">YOLOv8-OBB AI Satellite Asset Audit Pipeline</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Automated structure footprint detection using Oriented Bounding Boxes (OBB) for rotated building footprints, agricultural sheds, wells, & boundary walls with instant surface area computation.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--color-gov-ochre-bright)]">
          <span className="material-symbols-outlined text-[18px]">satellite_alt</span> Trigger Satellite Aerial Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Satellite Canvas */}
        <div className="lg:col-span-7 gov-card p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
              Satellite Tile Scan • {selectedParcel.ulpin}
            </h3>
            <span className="text-xs text-[var(--color-land-green)] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> YOLOv8-OBB Inference Complete
            </span>
          </div>

          <div className="w-full h-[400px] bg-slate-800 relative flex items-center justify-center overflow-hidden border border-[var(--color-outline-variant)]">
            {/* Simulated Satellite Image Base */}
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')" }}></div>
            
            {/* Render OBB Overlays */}
            {detections.map((d) => (
              <div
                key={d.id}
                className="absolute border-2 border-[var(--color-gov-ochre-bright)] bg-[rgba(254,147,44,0.2)] flex items-center justify-center"
                style={{
                  left: `${d.boundingBox.x}px`,
                  top: `${d.boundingBox.y}px`,
                  width: `${d.boundingBox.width * 2}px`,
                  height: `${d.boundingBox.height * 2}px`,
                  transform: `rotate(${d.boundingBox.rotation}deg)`,
                }}
              >
                <span className="bg-[var(--color-gov-navy)] text-white text-[10px] font-mono px-1 py-0.5 whitespace-nowrap">
                  {d.type} ({(d.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            ))}

            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[11px] font-mono p-2 z-10">
              Resolution: 0.3m/px • Scan Date: 2024-08-15
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-xs font-semibold text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[var(--color-gov-ochre-bright)] border border-white"></div> Building Footprint</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 border border-white"></div> Farm Shed</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 border border-white"></div> Tube Well</div>
          </div>
        </div>

        {/* Right: AI Asset Inventory Breakdown */}
        <div className="lg:col-span-5 gov-card p-5 space-y-4">
          <div className="border-b border-[var(--color-outline-variant)] pb-3">
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Detected Asset Inventory</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Computed surface area & valuation per RFCTLARR Sec 29(1)</p>
          </div>

          <div className="space-y-3">
            {detections.map((d) => (
              <div key={d.id} className="p-3 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex justify-between items-center">
                <div>
                  <div className="text-[14px] font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-gov-navy)]">domain</span>
                    {d.type}
                  </div>
                  <div className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                    Footprint: {d.surfaceArea} sq.m • Confidence: {(d.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-[var(--color-gov-navy)]">{formatINR(d.estimatedValue)}</div>
                  <StatusBadge status="Audited" variant="success" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--color-outline-variant)] flex justify-between items-center font-bold">
            <span className="text-xs uppercase text-[var(--color-on-surface-variant)]">Total Asset Valuation:</span>
            <span className="text-[20px] text-[var(--color-gov-navy)]">{formatINR(totalAssetValue)}</span>
          </div>

          <button className="w-full bg-[var(--color-gov-navy)] text-white font-semibold text-xs py-3 uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]">
            Validate & Lock AI Asset Audit
          </button>
        </div>
      </div>
    </div>
  );
}
