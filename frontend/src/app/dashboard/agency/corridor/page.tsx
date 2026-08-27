'use client';

import { mockParcels, formatINR } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';

export default function CorridorPage() {
  const parcelColumns = [
    { key: 'idx', label: '#', width: '50px', render: (_: any, __: any, i: number) => i + 1 },
    { key: 'ulpin', label: 'ULPIN (Parcel ID)', render: (v: string) => <span className="font-mono text-[13px]">{v}</span> },
    { key: 'ownerName', label: 'Owner' },
    { key: 'landCategory', label: 'Category' },
    { key: 'area', label: 'Affected Area (Ha)', align: 'right' as const },
    { key: 'marketRate', label: 'Est. Compensation (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
  ];

  return (
    <div className="space-y-0 -m-6">
      {/* Full-width corridor tool */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Map Area */}
        <div className="flex-1 flex flex-col relative bg-white border-r border-[var(--color-outline-variant)]">
          {/* Map Placeholder */}
          <div className="flex-1 bg-[var(--color-surface-container)] relative overflow-hidden">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 bg-white/90 border border-[var(--color-outline-variant)] p-2 flex flex-col gap-2 z-10">
              <button className="p-1.5 bg-white border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]" title="Zoom In">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
              <button className="p-1.5 bg-white border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]" title="Zoom Out">
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <button className="p-1.5 bg-white border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]" title="Reset">
                <span className="material-symbols-outlined text-[16px]">explore</span>
              </button>
              <div className="h-px bg-[var(--color-outline-variant)]"></div>
              <button className="p-1.5 bg-white border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]" title="Layers">
                <span className="material-symbols-outlined text-[16px]">layers</span>
              </button>
            </div>

            {/* Map SVG Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] relative">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                {/* Grid lines */}
                {Array.from({length: 20}).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 30} x2="1000" y2={i * 30} stroke="#C8E6C9" strokeWidth="0.5" />
                ))}
                {Array.from({length: 30}).map((_, i) => (
                  <line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="600" stroke="#C8E6C9" strokeWidth="0.5" />
                ))}
                {/* Original route (dashed navy) */}
                <path d="M 80 500 L 250 400 L 400 430 L 600 250 L 800 120" fill="none" stroke="#003178" strokeWidth="3" strokeDasharray="8 4" />
                {/* Optimized route (solid ochre) */}
                <path d="M 80 500 L 220 350 L 450 380 L 650 180 L 800 120" fill="none" stroke="#FE932C" strokeWidth="3" />
                {/* Buffer zone */}
                <path d="M 80 500 L 220 350 L 450 380 L 650 180 L 800 120" fill="none" stroke="#FE932C" strokeWidth="30" opacity="0.1" />
                {/* Waypoints */}
                {[[80,500],[220,350],[450,380],[650,180],[800,120]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="#003178" stroke="white" strokeWidth="2" />
                ))}
                {/* Parcel blocks */}
                {[[300,360,40,30],[350,390,35,25],[500,320,45,35],[600,210,30,25]].map(([x,y,w,h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(186,26,26,0.15)" stroke="#BA1A1A" strokeWidth="1" strokeDasharray="3 2" />
                ))}
              </svg>
              <div className="absolute bottom-4 left-4 bg-white border border-[var(--color-outline-variant)] p-3 text-xs z-10">
                <div className="font-semibold text-[var(--color-gov-navy)] mb-2 uppercase tracking-wider">LEGEND</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><div className="w-6 h-[3px] bg-[var(--color-gov-navy)] border-dashed"></div><span>Original Alignment</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-[3px] bg-[var(--color-gov-ochre-bright)]"></div><span>Optimized Alignment</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-3 bg-[rgba(186,26,26,0.15)] border border-[var(--color-status-error)]"></div><span>Affected Parcels</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Impact Summary Table */}
          <div className="h-[240px] border-t border-[var(--color-outline-variant)] bg-white flex flex-col">
            <div className="px-4 py-2 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex justify-between items-center">
              <h3 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">Impact Summary</h3>
              <button className="text-xs text-[var(--color-gov-navy)] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">download</span> Export CSV
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="gov-table-header sticky top-0">
                  <tr>
                    <th className="p-2 font-medium w-10">#</th>
                    <th className="p-2 font-medium">ULPIN (Parcel ID)</th>
                    <th className="p-2 font-medium">Owner Category</th>
                    <th className="p-2 font-medium text-right">Affected Area (Ha)</th>
                    <th className="p-2 font-medium text-right">Est. Compensation (₹)</th>
                    <th className="p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {mockParcels.slice(0, 5).map((p, i) => (
                    <tr key={p.id} className="gov-table-row border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]">
                      <td className="p-2 text-[var(--color-on-surface-variant)]">{i + 1}</td>
                      <td className="p-2 font-mono">{p.ulpin}</td>
                      <td className="p-2">{p.landCategory}</td>
                      <td className="p-2 text-right">{p.area.toFixed(2)}</td>
                      <td className="p-2 text-right">{formatINR(p.marketRate)}</td>
                      <td className="p-2"><StatusBadge status={p.status} variant={getStatusVariant(p.status)} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[var(--color-surface-container-low)] text-xs font-semibold sticky bottom-0">
                  <tr>
                    <td className="p-2 text-right" colSpan={3}>Total (Current Alignment):</td>
                    <td className="p-2 text-right font-bold">{mockParcels.slice(0, 5).reduce((s, p) => s + p.area, 0).toFixed(2)} Ha</td>
                    <td className="p-2 text-right font-bold">{formatINR(mockParcels.slice(0, 5).reduce((s, p) => s + p.marketRate, 0))}</td>
                    <td className="p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Alignment Analysis */}
        <aside className="w-[320px] bg-white flex flex-col overflow-y-auto border-l border-[var(--color-outline-variant)] flex-shrink-0">
          <div className="p-4 border-b border-[var(--color-outline-variant)] sticky top-0 bg-white z-10">
            <h2 className="text-[20px] font-bold text-[var(--color-gov-navy)] mb-1">Alignment Analysis</h2>
            <p className="text-[12px] text-[var(--color-on-surface-variant)]">Configure parameters to generate optimal route alternatives minimizing acquisition cost and environmental impact.</p>
          </div>
          <div className="p-4 space-y-6 flex-1">
            {/* Project Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--color-on-surface)] uppercase tracking-wider">Project Type</label>
              <select className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-gov-navy)]">
                <option>NHAI Highway</option>
                <option>Railways Corridor</option>
                <option>Dedicated Freight</option>
                <option>PWD Road</option>
              </select>
            </div>

            {/* Physical Parameters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)] pb-2 uppercase tracking-wider">Physical Parameters</h3>
              <div className="space-y-2">
                <label className="text-xs text-[var(--color-on-surface)] flex justify-between">
                  <span>Right of Way (RoW) Width</span>
                  <span className="text-[var(--color-gov-navy)] font-bold">60m</span>
                </label>
                <input type="range" min="30" max="120" defaultValue="60" className="w-full accent-[var(--color-gov-navy)]" />
                <div className="flex justify-between text-[10px] text-[var(--color-on-surface-variant)]"><span>30m</span><span>120m</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[var(--color-on-surface)] flex justify-between">
                  <span>Design Speed</span>
                  <span className="text-[var(--color-gov-navy)] font-bold">120 km/h</span>
                </label>
                <select className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--color-gov-navy)]">
                  <option>80 km/h (State Hwy)</option>
                  <option>100 km/h (National Hwy)</option>
                  <option selected>120 km/h (Expressway)</option>
                </select>
              </div>
            </div>

            {/* Constraint Weights */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)] pb-2 uppercase tracking-wider">Constraint Weights</h3>
              <div className="space-y-3">
                {['Avoid Forest/Eco-sensitive Zones', 'Minimize Built-up Area Intersection', 'Prefer Government Land (Revenue)'].map((label, i) => (
                  <label key={i} className="flex items-center gap-3 text-[13px]">
                    <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 accent-[var(--color-gov-navy)]" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sticky Footer */}
          <div className="p-4 border-t border-[var(--color-outline-variant)] bg-white sticky bottom-0">
            <button className="w-full bg-[var(--color-gov-ochre)] text-white font-semibold text-xs py-3 flex items-center justify-center gap-2 hover:bg-[var(--color-gov-ochre-bright)] transition-colors uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">route</span>
              Run Route Realignment
            </button>
            <p className="text-[11px] text-center text-[var(--color-on-surface-variant)] mt-2">Algorithm: Least-Cost Path Analysis (A*)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
