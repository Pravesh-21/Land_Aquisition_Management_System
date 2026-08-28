'use client';

import { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

interface CitizenParcel {
  id: string;
  ulpin: string;
  surveyNumber: string;
  subDivision: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  areaHectares: number;
  areaAcres: number;
  landCategory: string;
  soilClassification: string;
  primaryOwner: string;
  ownershipShare: string;
  coOwners: string[];
  mutationNumber: string;
  encumbranceStatus: string;
  acquisitionStage: string;
  statutoryNoticeRef: string;
  assetCount: {
    structures: number;
    trees: number;
    wells: number;
    total: number;
    details: string;
  };
}

const CITIZEN_PARCELS: CitizenParcel[] = [
  {
    id: 'P-442-C',
    ulpin: 'IN-MH-440001-A12B',
    surveyNumber: '442/1-A',
    subDivision: 'Block C, Plot 14',
    village: 'Hingna',
    tehsil: 'Nagpur Rural',
    district: 'Nagpur',
    state: 'Maharashtra',
    areaHectares: 1.42,
    areaAcres: 3.51,
    landCategory: 'Agricultural (Perennial Irrigated)',
    soilClassification: 'Black Cotton Soil - Class I',
    primaryOwner: 'Sh. Rajendra Patel',
    ownershipShare: '100% Sole Title',
    coOwners: ['None (Single Title Holder)'],
    mutationNumber: 'MUT-NGP-2018-8491',
    encumbranceStatus: 'Clean Title (No Bank Mortgage)',
    acquisitionStage: 'Award Declared (Section 23)',
    statutoryNoticeRef: 'GAZ-SEC19-2023-0891',
    assetCount: {
      structures: 1,
      trees: 24,
      wells: 1,
      total: 26,
      details: '1 Pucca Residential House (120 sqm), 24 Fruit-bearing Teak & Mango trees, 1 Open Borewell (180ft)',
    },
  },
  {
    id: 'P-443-C',
    ulpin: 'IN-MH-440001-A12C',
    surveyNumber: '443/2-B',
    subDivision: 'Block C, Plot 15',
    village: 'Hingna',
    tehsil: 'Nagpur Rural',
    district: 'Nagpur',
    state: 'Maharashtra',
    areaHectares: 0.65,
    areaAcres: 1.61,
    landCategory: 'Agricultural (Semi-Irrigated)',
    soilClassification: 'Clay Loam - Class II',
    primaryOwner: 'Sh. Rajendra Patel',
    ownershipShare: '50% Joint Ownership',
    coOwners: ['Sh. Suresh Patel (Brother - 50%)'],
    mutationNumber: 'MUT-NGP-2019-1102',
    encumbranceStatus: 'Clean Title',
    acquisitionStage: 'Section 19 Declaration Published',
    statutoryNoticeRef: 'GAZ-SEC19-2023-0892',
    assetCount: {
      structures: 1,
      trees: 12,
      wells: 0,
      total: 13,
      details: '1 Agricultural Storage Shed (45 sqm), 12 Neem & Guava trees',
    },
  },
];

export default function CitizenLandRecordsPage() {
  const [selectedParcel, setSelectedParcel] = useState<CitizenParcel | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Verified Land Title & Asset Inventory
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">My Registered Land Parcels</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Official revenue land records, standing asset counts, and acquisition status linked to your verified RoR identity.
          </p>
        </div>
        <Link
          href="/dashboard/citizen/map"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-navy-dark)]"
        >
          <span className="material-symbols-outlined text-[18px]">map</span> View on Interactive Map
        </Link>
      </div>

      {/* Summary Stats with Total Asset Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="gov-card p-5 border-l-4 border-l-[var(--color-gov-navy)]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Acquired Area</div>
          <div className="text-[28px] font-bold text-[var(--color-gov-navy)] mt-1">2.07 Ha</div>
          <div className="text-xs text-slate-600 mt-0.5">5.12 Acres across 2 Plots</div>
        </div>

        <div className="gov-card p-5 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standing Assets Enumerated</div>
          <div className="text-[28px] font-bold text-amber-900 mt-1">39 Assets</div>
          <div className="text-xs text-slate-600 mt-0.5">2 Structures, 36 Trees, 1 Well</div>
        </div>

        <div className="gov-card p-5 border-l-4 border-l-[var(--color-land-green)]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue Authority</div>
          <div className="text-[20px] font-bold text-slate-800 mt-1">Hingna, Nagpur</div>
          <div className="text-xs text-slate-600 mt-0.5">Maharashtra Land Revenue Code</div>
        </div>

        <div className="gov-card p-5 border-l-4 border-l-[var(--color-gov-ochre)]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acquisition Project</div>
          <div className="text-[20px] font-bold text-slate-800 mt-1">NH-44 Expansion</div>
          <div className="text-xs text-slate-600 mt-0.5">Nagpur-Hyderabad Corridor Phase II</div>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Associated Land Parcels</h3>
          <span className="text-xs font-semibold text-slate-600">2 Records Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="p-3">ULPIN / Survey No.</th>
                <th className="p-3">Village & Sub-Division</th>
                <th className="p-3">Acquired Area</th>
                <th className="p-3">Standing Asset Count</th>
                <th className="p-3">Ownership Share</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]">
              {CITIZEN_PARCELS.map((parcel) => (
                <tr key={parcel.id} className="gov-table-row hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-mono font-bold text-[var(--color-gov-navy)]">{parcel.ulpin}</div>
                    <div className="text-[11px] text-slate-500">Khasra / Survey #{parcel.surveyNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{parcel.village}, {parcel.tehsil}</div>
                    <div className="text-[11px] text-slate-500">{parcel.subDivision}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    <div>{parcel.areaHectares} Ha</div>
                    <div className="text-[11px] text-slate-500">({parcel.areaAcres} Acres)</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold rounded text-[11px] inline-block">
                      📦 {parcel.assetCount.total} Assets
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {parcel.assetCount.structures} Struct, {parcel.assetCount.trees} Trees, {parcel.assetCount.wells} Well
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-emerald-800">{parcel.ownershipShare}</td>
                  <td className="p-3">
                    <StatusBadge status={parcel.acquisitionStage} variant="info" />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedParcel(parcel)}
                      className="px-3 py-1.5 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-bold rounded hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Inspect Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Record Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-300 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#0072BC] uppercase tracking-wider">RoR Certified Land Record & Asset Schedule</div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Parcel {selectedParcel.ulpin} (Survey #{selectedParcel.surveyNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500 font-medium">ULPIN (Unique Land Parcel ID)</div>
                <div className="font-mono font-bold text-slate-900 text-sm">{selectedParcel.ulpin}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500 font-medium">Survey / Khasra Number</div>
                <div className="font-bold text-slate-900 text-sm">{selectedParcel.surveyNumber}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500 font-medium">Location & Sub-Division</div>
                <div className="font-bold text-slate-900">{selectedParcel.village}, {selectedParcel.tehsil}, {selectedParcel.district}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500 font-medium">Recorded Area</div>
                <div className="font-bold text-slate-900">{selectedParcel.areaHectares} Hectares ({selectedParcel.areaAcres} Acres)</div>
              </div>

              {/* Asset Count Schedule Card */}
              <div className="col-span-2 p-3.5 bg-amber-50/80 border border-amber-200 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    Section 29 Standing Asset Inventory ({selectedParcel.assetCount.total} Total Assets)
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    Field Survey Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-2 border border-amber-100 rounded">
                    <div className="font-bold text-slate-900 text-sm">{selectedParcel.assetCount.structures}</div>
                    <div className="text-[10px] text-slate-500">Houses / Sheds</div>
                  </div>
                  <div className="bg-white p-2 border border-amber-100 rounded">
                    <div className="font-bold text-emerald-800 text-sm">{selectedParcel.assetCount.trees}</div>
                    <div className="text-[10px] text-slate-500">Fruit & Timber Trees</div>
                  </div>
                  <div className="bg-white p-2 border border-amber-100 rounded">
                    <div className="font-bold text-blue-800 text-sm">{selectedParcel.assetCount.wells}</div>
                    <div className="text-[10px] text-slate-500">Wells / Borewells</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 pt-1">
                  <strong>Inventory Details:</strong> {selectedParcel.assetCount.details}
                </div>
              </div>

              <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded space-y-1">
                <div className="text-[#003178] font-bold">Ownership & Title Information</div>
                <div className="text-slate-800"><strong>Primary Title:</strong> {selectedParcel.primaryOwner} ({selectedParcel.ownershipShare})</div>
                <div className="text-slate-600"><strong>Co-Owners:</strong> {selectedParcel.coOwners.join(', ')}</div>
                <div className="text-slate-600"><strong>Encumbrance Check:</strong> {selectedParcel.encumbranceStatus}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                href="/dashboard/citizen/compensation"
                className="text-xs font-bold text-[#0072BC] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">payments</span> View Valuation & Compensation →
              </Link>
              <button
                onClick={() => setSelectedParcel(null)}
                className="px-5 py-2 bg-[var(--color-gov-navy)] text-white text-xs font-bold uppercase rounded hover:bg-[var(--color-gov-navy-dark)]"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
