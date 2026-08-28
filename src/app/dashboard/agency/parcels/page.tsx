'use client';

import { useState } from 'react';
import { mockParcels, formatINR } from '@/data/mockData';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';

export default function ParcelsPage() {
  // Selection state for multi-parcel comparison
  const [selectedIds, setSelectedIds] = useState<string[]>(['P001', 'P002', 'P003']);
  const [activeTab, setActiveTab] = useState<'comparison' | 'priority' | 'all'>('comparison');

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedParcels = mockParcels.filter((p) => selectedIds.includes(p.id));

  // Sorted by Risk Score for Acquisition Priority Ranking Matrix
  const priorityRankedParcels = [...mockParcels].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  const parcelColumns = [
    {
      key: 'select',
      label: 'Compare',
      width: '70px',
      align: 'center' as const,
      render: (_: any, r: any) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={() => toggleSelect(r.id)}
          className="rounded border-slate-300 text-[var(--color-gov-navy)] focus:ring-0 cursor-pointer w-4 h-4"
        />
      ),
    },
    { key: 'ulpin', label: 'ULPIN (14-Digit Bhu-Aadhar)', width: '200px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'surveyNumber', label: 'Survey / Khasra', render: (_: any, r: any) => `${r.surveyNumber} (${r.khasraNumber})` },
    { key: 'village', label: 'Village / Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
    { key: 'area', label: 'Area (Ha)', align: 'right' as const },
    {
      key: 'riskScore',
      label: 'Risk Score',
      align: 'center' as const,
      render: (v: number) => {
        const color = v > 70 ? 'text-red-700 bg-red-50 border-red-200' : v > 40 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
        return (
          <span className={`px-2 py-0.5 font-bold font-mono text-xs rounded border ${color}`}>
            {v}/100
          </span>
        );
      },
    },
    { key: 'landCategory', label: 'Category', render: (v: string, r: any) => <div><div className="font-semibold">{v}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">{r.landSubType || 'Standard'}</div></div> },
    { key: 'ownerName', label: 'Registered Owner', render: (v: string, r: any) => <div><div className="font-semibold">{v}</div><div className="text-[11px] text-[var(--color-on-surface-variant)]">{r.ownerAadhaar}</div></div> },
    { key: 'marketRate', label: 'Est. Valuation', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Geospatial Ingestion & Multi-Parcel Analysis
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Multi-Parcel Comparison & Acquisition Priority</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Side-by-side affected parcel comparison engine, machine learning risk prioritization, and PostGIS vector reconciliation.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'comparison' ? 'bg-[var(--color-gov-navy)] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            📊 Multi-Parcel Comparison ({selectedIds.length})
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'priority' ? 'bg-[var(--color-gov-navy)] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎯 Priority Ranking
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-[var(--color-gov-navy)] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            📑 All Parcels Grid
          </button>
        </div>
      </div>

      {/* 1. Multi-Parcel Comparison View */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-950">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#0072BC]">compare</span>
              <span>
                Comparing <strong>{selectedParcels.map((p) => `Parcel ${p.surveyNumber}`).join(' vs ')}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Quick Presets:</span>
              <button
                onClick={() => setSelectedIds(['P001', 'P002', 'P003'])}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-blue-200 text-[#0072BC] rounded font-bold text-[11px]"
              >
                P001 vs P002 vs P003
              </button>
              <button
                onClick={() => setSelectedIds(['P004', 'P008'])}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-blue-200 text-red-700 rounded font-bold text-[11px]"
              >
                High-Risk (P004 vs P008)
              </button>
            </div>
          </div>

          <div className="gov-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-gov-navy)] text-white border-b border-slate-300">
                    <th className="p-3.5 font-bold uppercase tracking-wider w-48 bg-[#132742]">Comparison Metric</th>
                    {selectedParcels.map((p) => (
                      <th key={p.id} className="p-3.5 font-bold text-center border-l border-slate-600 min-w-[200px]">
                        <div className="text-sm">{p.id} (Plot #{p.surveyNumber})</div>
                        <div className="text-[10px] font-mono text-slate-300 font-normal">{p.ulpin}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {/* Area */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">📍 Acquired Area</td>
                    {selectedParcels.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200">
                        <span className="text-sm font-bold text-[var(--color-gov-navy)]">{p.area} Hectares</span>
                        <div className="text-[10px] text-slate-500">{((p.area / 12.2) * 100).toFixed(1)}% of corridor section</div>
                      </td>
                    ))}
                  </tr>

                  {/* Risk Score */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">⚠️ Risk Score (ML)</td>
                    {selectedParcels.map((p) => {
                      const score = p.riskScore || 20;
                      const badgeColor = score > 70 ? 'bg-red-100 text-red-900 border-red-300' : score > 40 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300';
                      const label = score > 70 ? 'HIGH RISK' : score > 40 ? 'MEDIUM' : 'LOW RISK';
                      return (
                        <td key={p.id} className="p-3 text-center border-l border-slate-200">
                          <div className={`inline-block px-2.5 py-1 rounded font-bold font-mono border ${badgeColor}`}>
                            {score}/100 • {label}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Land Type */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">🌾 Land Category</td>
                    {selectedParcels.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 font-semibold">
                        <div>{p.landCategory}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{p.landSubType || 'Standard Tenure'}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Acquisition Percentage */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">📐 Acquisition %</td>
                    {selectedParcels.map((p, idx) => {
                      const pct = idx === 0 ? '100% (Total Extent)' : idx === 1 ? '75% (Partial Severance)' : '40% (Corridor Strip)';
                      return (
                        <td key={p.id} className="p-3 text-center border-l border-slate-200">
                          <span className="font-bold text-slate-900">{pct}</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Estimated Value */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">💰 Estimated Value (₹)</td>
                    {selectedParcels.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200">
                        <span className="text-sm font-bold text-emerald-800">{formatINR(p.marketRate)}</span>
                        <div className="text-[10px] text-slate-500">Includes 100% Solatium</div>
                      </td>
                    ))}
                  </tr>

                  {/* Registered Owner */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">👤 Registered Landowner</td>
                    {selectedParcels.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200">
                        <div className="font-semibold text-slate-900">{p.ownerName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{p.ownerAadhaar}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Status */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50">📜 Statutory Status</td>
                    {selectedParcels.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200">
                        <StatusBadge status={p.status} variant={getStatusVariant(p.status)} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. 🎯 Acquisition Priority Ranking Matrix */}
      {activeTab === 'priority' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-purple-700">insights</span>
              <span>
                <strong>Automated Machine Learning Acquisition Priority Engine:</strong> Parcels ranked by statutory vulnerability, litigation hazard, and critical corridor path.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded uppercase">
              AI Risk Weighting
            </span>
          </div>

          <div className="space-y-3">
            {priorityRankedParcels.map((parcel, index) => {
              const score = parcel.riskScore || 20;
              const isHigh = score > 70;
              const isMedium = score > 40 && score <= 70;
              const priorityLabel = isHigh ? 'HIGH PRIORITY 🔴' : isMedium ? 'MEDIUM PRIORITY 🟡' : 'LOW PRIORITY 🟢';
              const borderAccent = isHigh ? 'border-l-red-600 bg-red-50/30' : isMedium ? 'border-l-amber-500 bg-amber-50/20' : 'border-l-emerald-600 bg-emerald-50/20';

              return (
                <div key={parcel.id} className={`gov-card p-4 border-l-4 ${borderAccent} flex flex-wrap items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{parcel.id} — Plot #{parcel.surveyNumber}</h4>
                        <span className="font-mono text-xs text-[var(--color-gov-navy)] font-bold">({parcel.ulpin})</span>
                        <span className="text-xs font-bold tracking-wide">{priorityLabel}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        <strong>Owner:</strong> {parcel.ownerName} • <strong>Village:</strong> {parcel.village} • <strong>Area:</strong> {parcel.area} Ha • <strong>Value:</strong> {formatINR(parcel.marketRate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">Risk Score: {score}/100</div>
                      <div className="text-[10px] text-slate-500">{isHigh ? 'Litigation / Forest Hazard' : isMedium ? 'Valuation Dispute' : 'Clear Title'}</div>
                    </div>
                    <button
                      onClick={() => toggleSelect(parcel.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 cursor-pointer"
                    >
                      {selectedIds.includes(parcel.id) ? '✓ In Compare' : '+ Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main ULPIN Table */}
      <DataGrid
        title="Intersected Cadastral Land Parcels (Bhu-Aadhar Master Record)"
        columns={parcelColumns}
        data={mockParcels}
        totalItems={mockParcels.length}
      />
    </div>
  );
}
