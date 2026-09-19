'use client';

import { useState } from 'react';
import KPICard from '@/components/ui/KPICard';
import StatusBadge, { getStatusVariant } from '@/components/ui/StatusBadge';
import DataGrid from '@/components/ui/DataGrid';
import ProjectLandMap from '@/components/map/ProjectLandMap';
import { mockProjects as initialProjects, formatINR } from '@/data/mockData';
import { KPIData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const kpiData: KPIData[] = [
  { label: 'Active Projects', value: '12', subtitle: '3 new this quarter', icon: 'folder_open', color: 'navy', trend: 'up', trendValue: '+3 from last quarter' },
  { label: 'Total Corridor Length', value: '458 km', subtitle: 'Across 5 states', icon: 'route', color: 'ochre' },
  { label: 'Parcels Identified', value: '3,842', subtitle: '1,204 Ha total area', icon: 'grid_view', color: 'green', trend: 'up', trendValue: '+342 this month' },
  { label: 'Pending Approvals', value: '23', subtitle: '8 overdue > 15 days', icon: 'pending_actions', color: 'red', trend: 'down', trendValue: '-5 from last week' },
];

export default function AgencyDashboard() {
  const { role } = useAuth();
  const isAuthority = role !== 'CITIZEN';

  const [projects, setProjects] = useState(initialProjects);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setFormValues({ ...project });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects(projects.map((p) => (p.id === formValues.id ? { ...p, ...formValues } : p)));
    setToastMessage(`Proposal ${formValues.id} (${formValues.name}) updated successfully!`);
    setEditingProject(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const projectColumns = [
    { key: 'id', label: 'Project ID', width: '120px', render: (v: string) => <span className="font-semibold text-[var(--color-gov-navy)]">{v}</span> },
    { key: 'name', label: 'Project Name', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'type', label: 'Type' },
    { key: 'agency', label: 'Agency' },
    { key: 'state', label: 'State' },
    { key: 'totalParcels', label: 'Parcels', align: 'right' as const },
    { key: 'corridorLength', label: 'Corridor (km)', align: 'right' as const },
    { key: 'estimatedCost', label: 'Est. Cost', align: 'right' as const, render: (v: number) => formatINR(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
    ...(isAuthority
      ? [
          {
            key: 'action',
            label: 'Authority Action',
            align: 'center' as const,
            render: (_: any, r: any) => (
              <button
                type="button"
                onClick={() => handleOpenEdit(r)}
                className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">edit_document</span>
                Update Proposal
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Requisite Agency Single Window
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Project Corridor & Land Requirement Dashboard</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Project corridor management, spatial OpenStreetMap mapping, & land requirement assessment under RFCTLARR Act (2013).
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/agency/corridor"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gov-ochre)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-gov-ochre-bright)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            Open Full WebGIS Editor
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* Interactive Leaflet WebGIS Map Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-gov-navy)] text-[22px]">map</span>
            <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">
              Active Project Corridor & Land Acquisition Polygons (OpenStreetMap)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            NH-44 Nagpur-Hyderabad Corridor (Phase II)
          </span>
        </div>

        <ProjectLandMap
          height="460px"
          showLayerControls={true}
        />
      </div>

      {/* Active Projects Table */}
      <DataGrid
        title="Active Acquisition Projects"
        columns={projectColumns}
        data={projects}
        totalItems={projects.length}
        showExport={false}
      />

      {/* Proposal Update Modal (Authority Only) */}
      {isAuthority && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-300">
            <div className="px-6 py-4 bg-[var(--color-gov-navy)] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">edit_document</span>
                <h3 className="font-bold text-base">Update Acquisition Proposal ({editingProject.id})</h3>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/30 text-blue-100 text-[10px] font-bold rounded uppercase">
                Authority Only
              </span>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-slate-800 text-[11px]">
                <strong>Statutory Notice:</strong> Modifications made to this proposal will be logged into the immutable audit trail and synced across District Collector and LAO queues.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Name:</label>
                  <input
                    type="text"
                    value={formValues.name || ''}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.name !== editingProject.name ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                    required
                  />
                  {formValues.name !== editingProject.name && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Requisite Agency:</label>
                  <input
                    type="text"
                    value={formValues.agency || ''}
                    onChange={(e) => setFormValues({ ...formValues, agency: e.target.value })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.agency !== editingProject.agency ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                    required
                  />
                  {formValues.agency !== editingProject.agency && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corridor Length (km):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.corridorLength || ''}
                    onChange={(e) => setFormValues({ ...formValues, corridorLength: Number(e.target.value) })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.corridorLength !== editingProject.corridorLength ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                    required
                  />
                  {formValues.corridorLength !== editingProject.corridorLength && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Parcels Count:</label>
                  <input
                    type="number"
                    value={formValues.totalParcels || ''}
                    onChange={(e) => setFormValues({ ...formValues, totalParcels: Number(e.target.value) })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.totalParcels !== editingProject.totalParcels ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                    required
                  />
                  {formValues.totalParcels !== editingProject.totalParcels && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Outlay / Cost (₹):</label>
                  <input
                    type="number"
                    value={formValues.estimatedCost || ''}
                    onChange={(e) => setFormValues({ ...formValues, estimatedCost: Number(e.target.value) })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.estimatedCost !== editingProject.estimatedCost ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                    required
                  />
                  {formValues.estimatedCost !== editingProject.estimatedCost && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Acquisition Stage / Status:</label>
                  <select
                    value={formValues.status || ''}
                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                    className={`w-full border p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none ${
                      formValues.status !== editingProject.status ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'
                    }`}
                  >
                    <option value="Proposal Submitted">Proposal Submitted</option>
                    <option value="SIA Approved">SIA Approved</option>
                    <option value="Section 11 Notification">Section 11 Notification</option>
                    <option value="Section 19 Declaration">Section 19 Declaration</option>
                    <option value="Award Approved">Award Approved</option>
                  </select>
                  {formValues.status !== editingProject.status && (
                    <span className="text-[10px] text-amber-700 font-bold">Modified</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white font-bold rounded uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
