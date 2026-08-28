'use client';

import { mockVegetationData, mockParcels } from '@/data/mockData';

export default function VegetationPage() {
  const data = mockVegetationData[0];
  const parcel = mockParcels[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 4 • AI/ML Engine 1</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">OpenCV HSV Crop & Vegetation Density Indexing</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Automated HSV color space masking on satellite imagery tiles to classify crop coverage percentage & tree canopy density per parcel.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-[var(--color-land-green)] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-90">
          <span className="material-symbols-outlined text-[18px]">eco</span> Run OpenCV Masking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: HSV Color Space Masking View */}
        <div className="lg:col-span-7 gov-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
              OpenCV HSV Mask Overlay • Parcel {parcel.ulpin}
            </h3>
            <span className="text-xs text-[var(--color-land-green)] font-bold">Health Index: {data.vegetationHealthIndex}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[320px]">
            {/* Raw Satellite Tile */}
            <div className="bg-slate-900 relative border border-[var(--color-outline-variant)] flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80')" }}></div>
              <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 font-mono">RGB Tile</span>
            </div>

            {/* OpenCV HSV Masked Output */}
            <div className="bg-emerald-950 relative border border-[var(--color-outline-variant)] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-800 to-amber-950 opacity-90"></div>
              <span className="absolute top-2 left-2 bg-emerald-900 text-emerald-200 text-[10px] px-2 py-0.5 font-mono border border-emerald-500">
                HSV Green Mask (H:35-85, S:40-255)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Vegetation Breakdown */}
        <div className="lg:col-span-5 gov-card p-5 space-y-4">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)] border-b border-[var(--color-outline-variant)] pb-2">
            Land Cover Classification
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Crop Coverage ({data.primaryCropType})</span>
                <span className="text-[var(--color-land-green)] font-bold">{data.cropCoverage}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-2">
                <div className="bg-[var(--color-land-green)] h-full" style={{ width: `${data.cropCoverage}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Tree Canopy Density</span>
                <span className="text-emerald-700 font-bold">{data.treeCanopyDensity}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-2">
                <div className="bg-emerald-600 h-full" style={{ width: `${data.treeCanopyDensity}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Barren / Open Ground</span>
                <span className="text-[var(--color-earth-brown)] font-bold">{data.barrenPercentage}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-2">
                <div className="bg-[var(--color-earth-brown)] h-full" style={{ width: `${data.barrenPercentage}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Built-Up / Structures</span>
                <span className="text-[var(--color-gov-navy)] font-bold">{data.builtUpPercentage}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-variant)] h-2">
                <div className="bg-[var(--color-gov-navy)] h-full" style={{ width: `${data.builtUpPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
