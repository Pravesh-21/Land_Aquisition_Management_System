'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRole } from '../../../../contexts/RoleContext';
import DataGrid from '../../../../components/ui/DataGrid';
import KPICard from '../../../../components/ui/KPICard';
import StatusBadge, { getStatusVariant } from '../../../../components/ui/StatusBadge';
import { mockParcels, mockBeneficiaries, mockGrievances, mockForestClearances, mockProjects, formatINR } from '../../../../data/mockData';
import Link from 'next/link';

interface SubpageConfig {
  title: string;
  category: string;
  description: string;
  kpis: { label: string; value: string; subtitle: string; color?: 'navy' | 'green' | 'ochre' | 'red' | 'tertiary'; icon: string }[];
  columns: any[];
  data: any[];
  modalType?: string;
}

export default function GenericModulePage() {
  const pathname = usePathname();
  const { roleConfig } = useRole();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Extract role and slug from path
  const segments = pathname.split('/').filter(Boolean);
  const currentRole = segments[1]?.toUpperCase() || 'AGENCY';
  const rawSlug = segments[segments.length - 1] || 'module';

  // Specific Subpage Handler Dictionary
  const getSubpageConfig = (): SubpageConfig => {
    switch (rawSlug) {
      // ==========================================
      // LAO (Land Acquisition Officer) Subfeatures
      // ==========================================
      case 'parcel-verification':
        return {
          title: 'Cadastral Parcel Ground Verification',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Compare GIS spatial boundary coordinates against surveyor field inspection reports. Flag discrepancies in land area and tree counts.',
          kpis: [
            { label: 'Assigned Parcels', value: '142', subtitle: 'Corridor Alignment', color: 'navy', icon: 'verified' },
            { label: 'Verified & Cleared', value: '124', subtitle: 'Ground Audit Match', color: 'green', icon: 'check_circle' },
            { label: 'Discrepancies Flagged', value: '18', subtitle: 'Requires Joint Survey', color: 'red', icon: 'warning' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Survey / Khasra No.' },
            { key: 'village', label: 'Revenue Village', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
            { key: 'areaHectares', label: 'GIS Area (Ha)', align: 'right' as const },
            { key: 'ownerName', label: 'Recorded Owner' },
            { key: 'status', label: 'Verification Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'parcel-verify' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-[var(--color-gov-navy-dark)] cursor-pointer"
                >
                  Verify Parcel
                </button>
              ),
            },
          ],
          data: mockParcels,
        };

      case 'document-verification':
        return {
          title: 'Title Deed & Revenue Record Verification',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Verify 7/12 land extract, non-encumbrance certificate, revenue mutation history, and Aadhaar e-KYC documents before award preparation.',
          kpis: [
            { label: 'Submitted Documents', value: '384', subtitle: 'All Claims', color: 'navy', icon: 'fact_check' },
            { label: 'Title Verified', value: '346', subtitle: 'Clear Ownership', color: 'green', icon: 'verified' },
            { label: 'Clarifications Raised', value: '38', subtitle: 'Pending Revenue RoR', color: 'ochre', icon: 'pending' },
          ],
          columns: [
            { key: 'ulpin', label: 'Parcel ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'ownerName', label: 'Claimant / Landowner' },
            { key: 'khasraNumber', label: 'Khasra No.' },
            { key: 'landCategory', label: 'Document Type', render: () => <span className="font-semibold text-slate-800">7/12 Extract + Title Deed</span> },
            { key: 'status', label: 'Verification State', render: () => <StatusBadge status="Under Review" variant="warning" /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'doc-verify' })}
                  className="px-3 py-1 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Inspect Title
                </button>
              ),
            },
          ],
          data: mockParcels,
        };

      case 'land-validation':
        return {
          title: 'DILRMP RoR Land Record Synchronization',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Validate landowner registry against State Digital Land Records (DILRMP) database to prevent fraudulent compensation claims.',
          kpis: [
            { label: 'Sync Status', value: '100% Live', subtitle: 'API Connected', color: 'green', icon: 'sync' },
            { label: 'Cadastral Plots Matched', value: '142', subtitle: 'District RoR Database', color: 'navy', icon: 'checklist' },
            { label: 'Joint Titles Detected', value: '24', subtitle: 'Requires Consent Split', color: 'tertiary', icon: 'people' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'RoR Survey No.' },
            { key: 'ownerName', label: 'DILRMP Record Holder' },
            { key: 'areaHectares', label: 'RoR Area (Ha)', align: 'right' as const },
            { key: 'village', label: 'Tehsil Office', render: (_: any, r: any) => `${r.tehsil}` },
            { key: 'status', label: 'API Validation', render: () => <StatusBadge status="API Match" variant="success" icon="check_circle" /> },
          ],
          data: mockParcels,
        };

      case 'objection-processing':
        return {
          title: 'Section 15 Landowner Objection Management',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Review objections filed under Section 15 of RFCTLARR Act 2013 regarding compensation valuation, land measurement, and public purpose.',
          kpis: [
            { label: 'Total Objections Filed', value: '12', subtitle: '60-Day Window', color: 'navy', icon: 'report_problem' },
            { label: 'Inquiry Completed', value: '8', subtitle: 'Reports Forwarded', color: 'green', icon: 'check_circle' },
            { label: 'Hearings Scheduled', value: '4', subtitle: 'Before Collector', color: 'ochre', icon: 'event' },
          ],
          columns: [
            { key: 'id', label: 'Case Number', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'claimantName', label: 'Objector Name' },
            { key: 'category', label: 'Objection Category' },
            { key: 'parcelId', label: 'Concerned ULPIN', render: (v: string) => <span className="font-mono text-xs text-slate-600">{v}</span> },
            { key: 'status', label: 'Processing Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'objection-review' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-[var(--color-gov-navy-dark)] cursor-pointer"
                >
                  Review Objection
                </button>
              ),
            },
          ],
          data: mockGrievances,
        };

      case 'hearing-management':
        return {
          title: 'Section 15 Hearing Docket & Proceedings',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Manage formal hearing calendar, summon notices, claimant attendance sheets, and digital hearing proceedings uploads.',
          kpis: [
            { label: 'Hearings Scheduled', value: '7', subtitle: 'This Month', color: 'navy', icon: 'gavel' },
            { label: 'Notices Dispatched', value: '100%', subtitle: 'Via Registered Post & SMS', color: 'green', icon: 'mark_email_read' },
            { label: 'Disposal Rate', value: '91.2%', subtitle: 'Timelines Met', color: 'tertiary', icon: 'trending_up' },
          ],
          columns: [
            { key: 'id', label: 'Hearing Docket No.', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'claimantName', label: 'Claimant / Advocate' },
            { key: 'category', label: 'Hearing Subject' },
            { key: 'submissionDate', label: 'Scheduled Date' },
            { key: 'status', label: 'Hearing State', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'hearing-proceedings' })}
                  className="px-3 py-1 bg-white border border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] text-xs font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Record Order
                </button>
              ),
            },
          ],
          data: mockGrievances,
        };

      case 'compensation':
        return {
          title: 'Statutory RFCTLARR Valuation Engine',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Calculate market value (Section 26), assets (Section 29), 100% Solatium (Section 30), and 12% interest (Section 80) for draft awards.',
          kpis: [
            { label: 'Total Valuation', value: '₹ 47.38 Cr', subtitle: '142 Parcels', color: 'navy', icon: 'payments' },
            { label: 'Avg Rate / Ha', value: '₹ 2.45 Cr', subtitle: 'Market Circle Rate', color: 'green', icon: 'analytics' },
            { label: 'Solatium Share', value: '₹ 23.69 Cr', subtitle: 'Mandatory 100%', color: 'ochre', icon: 'percent' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'ownerName', label: 'Landowner' },
            { key: 'areaHectares', label: 'Area (Ha)', align: 'right' as const },
            { key: 'baseRate', label: 'Base Rate (₹/Ha)', align: 'right' as const, render: () => '₹ 1,20,00,000' },
            { key: 'solatium', label: 'Solatium (100%)', align: 'right' as const, render: () => <span className="text-emerald-700 font-bold">100%</span> },
            { key: 'status', label: 'Valuation Status', render: () => <StatusBadge status="Assessed" variant="success" /> },
          ],
          data: mockParcels,
        };

      case 'award-preparation':
        return {
          title: 'Section 23 Statutory Award Docket Preparation',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Compile land descriptions, true area measurements, total compensation apportionments, and submit draft awards to District Collector.',
          kpis: [
            { label: 'Draft Awards Ready', value: '14', subtitle: 'Pending Collector Sign', color: 'navy', icon: 'military_tech' },
            { label: 'Sanctioned Awards', value: '128', subtitle: 'Gazette Published', color: 'green', icon: 'verified' },
            { label: 'Total Sanction', value: '₹ 45.2 Cr', subtitle: 'Disbursement Ready', color: 'tertiary', icon: 'currency_rupee' },
          ],
          columns: [
            { key: 'ulpin', label: 'Award ID / ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'ownerName', label: 'Beneficiary Landowner' },
            { key: 'khasraNumber', label: 'Khasra Plot' },
            { key: 'status', label: 'Approval Status', render: () => <StatusBadge status="Draft Compiled" variant="info" /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'award-submit' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-[var(--color-gov-navy-dark)] cursor-pointer"
                >
                  Submit to Collector
                </button>
              ),
            },
          ],
          data: mockParcels,
        };

      case 'payment-monitoring':
        return {
          title: 'Beneficiary Payment & Bank Settlement Monitor',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Monitor Aadhaar payment bridge transactions, PFMS responses, IFSC account validations, and handle failed transaction re-attempts.',
          kpis: [
            { label: 'Disbursed Amount', value: '₹ 42.8 Cr', subtitle: '94.6% Completed', color: 'green', icon: 'account_balance_wallet' },
            { label: 'Successful DBT', value: '1,398', subtitle: 'Settled in Bank', color: 'navy', icon: 'check_circle' },
            { label: 'Failed / Pending Fix', value: '54', subtitle: 'KYC / IFSC Re-verify', color: 'red', icon: 'warning' },
          ],
          columns: [
            { key: 'id', label: 'Beneficiary ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'name', label: 'Beneficiary Name' },
            { key: 'village', label: 'Village / Survey' },
            { key: 'disbursementAmount', label: 'Award Amount', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'kycStatus', label: 'Settlement Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
          ],
          data: mockBeneficiaries,
        };

      case 'beneficiaries':
        return {
          title: 'Direct Benefit Transfer (DBT) Disbursement Batch',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Authorize direct electronic transfer of compensation into verified beneficiary bank accounts via PFMS / e-Kuber single-window gateway.',
          kpis: [
            { label: 'Batch #9482-A', value: '1,452', subtitle: 'Beneficiaries In Queue', color: 'navy', icon: 'currency_rupee' },
            { label: 'Batch Total', value: '₹ 45.2 Cr', subtitle: 'Sanctioned Funds', color: 'green', icon: 'account_balance' },
            { label: 'Gateway State', value: 'Online', subtitle: 'PFMS e-Kuber Live', color: 'tertiary', icon: 'sensors' },
          ],
          columns: [
            { key: 'id', label: 'Beneficiary ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'name', label: 'Name' },
            { key: 'accountNumber', label: 'Bank Account' },
            { key: 'disbursementAmount', label: 'Amount (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'kycStatus', label: 'KYC Verification', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setActionSuccess(`DBT Authorization PIN #84920 generated for ${r.name}. Electronic credit dispatched to PFMS / e-Kuber single window.`)}
                  className="px-3 py-1 bg-[var(--color-land-green)] text-white text-xs font-semibold rounded hover:opacity-90 cursor-pointer"
                >
                  Authorize DBT
                </button>
              ),
            },
          ],
          data: mockBeneficiaries,
        };

      case 'mutation':
        return {
          title: 'Section 38 Possession & RoR Mutation Registry',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Record physical possession certificate (Panchnama) after 100% compensation payment and trigger RoR mutation in favor of the Requisite Agency.',
          kpis: [
            { label: 'Possession Taken', value: '112 Ha', subtitle: 'Free of Encumbrance', color: 'green', icon: 'swap_horiz' },
            { label: 'Pending Demarcation', value: '30 Ha', subtitle: 'Boundary Pillars', color: 'ochre', icon: 'straighten' },
            { label: 'Mutation Recorded', value: '88%', subtitle: 'State Revenue Code', color: 'navy', icon: 'assignment_turned_in' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Plot No.' },
            { key: 'ownerName', label: 'Ex-Landowner' },
            { key: 'areaHectares', label: 'Possession Area (Ha)', align: 'right' as const },
            { key: 'status', label: 'Mutation Status', render: () => <StatusBadge status="Mutated to NHAI" variant="success" icon="check_circle" /> },
          ],
          data: mockParcels,
        };

      case 'notes':
        return {
          title: 'Statutory Case Docket Notes & Audit Trail',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Internal case remarks, field notes, inquiry observations, and statutory compliance timestamps associated with acquisition parcels.',
          kpis: [
            { label: 'Total Case Notes', value: '246', subtitle: 'Signed by Officer', color: 'navy', icon: 'note' },
            { label: 'Pending Directives', value: '12', subtitle: 'Requires Field Response', color: 'ochre', icon: 'pending_actions' },
            { label: 'Audit Compliance', value: '100%', subtitle: 'C&AG Ready', color: 'green', icon: 'verified' },
          ],
          columns: [
            { key: 'ulpin', label: 'Case ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'ownerName', label: 'Concerned Party' },
            { key: 'notes', label: 'Official Observation', render: () => <span className="text-slate-700">Joint measurement completed. Boundary pillar #14 verified without dispute.</span> },
            { key: 'date', label: 'Timestamp', render: () => <span className="text-slate-500 font-mono text-[11px]">28-Aug-2024 14:30</span> },
          ],
          data: mockParcels,
        };

      case 'evidence':
        return {
          title: 'Field Survey Photo & Geo-Tagged Evidence Vault',
          category: 'Land Acquisition Officer (LAO)',
          description: 'Cryptographically sealed repository of ground survey photographs, boundary demarcation videos, panchnama copies, and drone orthomosaics.',
          kpis: [
            { label: 'Geo-Tagged Photos', value: '1,420', subtitle: 'EXIF Verified', color: 'navy', icon: 'photo_camera' },
            { label: 'Drone Orthomosaics', value: '8 Scans', subtitle: 'Sub-centimeter GSD', color: 'tertiary', icon: 'satellite_alt' },
            { label: 'Tamper-Proof Checks', value: '100% Valid', subtitle: 'SHA-256 Hashes Match', color: 'green', icon: 'lock' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Khasra Plot' },
            { key: 'village', label: 'Inspection Site', render: (_: any, r: any) => `${r.village}` },
            { key: 'evidenceCount', label: 'Evidence Files', render: () => <span className="font-bold text-[#0072BC]">8 Photos + 1 Panchnama</span> },
            { key: 'status', label: 'Integrity Seal', render: () => <StatusBadge status="SHA-256 Valid" variant="success" icon="lock" /> },
          ],
          data: mockParcels,
        };

      // ==========================================
      // Forest & Environment Subfeatures
      // ==========================================
      case 'gis-review':
        return {
          title: 'Project Corridor & FSI Forest Canopy Review',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Review proposed project alignment vector against Forest Survey of India (FSI) canopy density layers (Very Dense, Moderately Dense, Open Forest).',
          kpis: [
            { label: 'Corridor Length', value: '458 km', subtitle: 'Total Alignment', color: 'navy', icon: 'map' },
            { label: 'Forest Overlap', value: '45.8 Ha', subtitle: 'Across 3 Divisions', color: 'red', icon: 'forest' },
            { label: 'Dense Canopy Impact', value: '12.4 Ha', subtitle: 'Requires Special Mitigation', color: 'ochre', icon: 'nature' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Project Name' },
            { key: 'forestArea', label: 'Forest Diversion (Ha)', align: 'right' as const },
            { key: 'stage', label: 'Stage', render: (v: string) => <StatusBadge status={v} variant="info" /> },
          ],
          data: mockForestClearances,
        };

      case 'document-review':
        return {
          title: 'MoEFCC Form-A & Forest Diversion Proposal Review',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Verify statutory Form-A, Tree Enumeration Lists, Compensatory Afforestation Schemes, and Wildlife Conservation Plans submitted by Agency.',
          kpis: [
            { label: 'Proposals Under Review', value: '4', subtitle: 'MoEFCC Parivesh Portal', color: 'navy', icon: 'description' },
            { label: 'CA Schemes Verified', value: '3', subtitle: 'Double Non-Forest Land', color: 'green', icon: 'verified' },
            { label: 'Queries Outstanding', value: '2', subtitle: 'Clarification to NHAI', color: 'ochre', icon: 'pending' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal Ref', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Project Title' },
            { key: 'docType', label: 'Document Package', render: () => <span className="font-semibold text-slate-800">Form-A + CA Proposal + Wildlife Plan</span> },
            { key: 'status', label: 'Document Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
          ],
          data: mockForestClearances,
        };

      case 'impact-review':
        return {
          title: 'Ecological & Wildlife Corridor Impact Assessment',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Evaluate habitat fragmentation, animal migration corridor intersections, water catchment disturbances, and specify wildlife mitigation structures.',
          kpis: [
            { label: 'Tiger Corridor Intersects', value: '1', subtitle: 'Karanja-Melghat Corridor', color: 'red', icon: 'pets' },
            { label: 'Eco-Ducts Recommended', value: '2 Overpasses', subtitle: 'NBWL Approved Specs', color: 'green', icon: 'eco' },
            { label: 'Water Catchments Assessed', value: '8 Streams', subtitle: 'Zero Siltation Rule', color: 'navy', icon: 'water_drop' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Alignment Zone' },
            { key: 'ecoImpact', label: 'Ecological Concern', render: () => <span className="text-red-700 font-bold">Karanja Sanctuary Buffer (2.4 km)</span> },
            { key: 'mitigation', label: 'Mandatory Mitigation', render: () => <span>2 Animal Underpasses (75m span)</span> },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="Mitigation Prescribed" variant="warning" /> },
          ],
          data: mockForestClearances,
        };

      case 'additional-info':
        return {
          title: 'Parivesh Clarification & Essential Detail Query (EDS/ADS)',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Issue official Essential Details Sought (EDS) queries to Project Requisite Agency regarding alternative alignment feasibility and tree counts.',
          kpis: [
            { label: 'Queries Raised', value: '6', subtitle: 'Parivesh Sync', color: 'navy', icon: 'help' },
            { label: 'Responses Received', value: '4', subtitle: 'Satisfactory', color: 'green', icon: 'mark_email_read' },
            { label: 'Pending NHAI Reply', value: '2', subtitle: 'Time limit: 30 days', color: 'ochre', icon: 'timer' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'query', label: 'Official Query Summary', render: () => <span className="text-slate-800">Submit revised alignment avoiding Compartment 42-B dense canopy.</span> },
            { key: 'issuedDate', label: 'Issued Date', render: () => '14-Aug-2024' },
            { key: 'status', label: 'Query State', render: () => <StatusBadge status="Awaiting NHAI Reply" variant="warning" /> },
          ],
          data: mockForestClearances,
        };

      case 'noc-processing':
        return {
          title: 'Stage-I / Stage-II Forest Clearance & Tree NOC',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Process in-principle Stage-I approval, verify Compensatory Afforestation land mutation, receive NPV demand notes, and issue Tree Felling NOC.',
          kpis: [
            { label: 'Stage-I In-Principle', value: '2 Approved', subtitle: 'MoEFCC Regional Office', color: 'navy', icon: 'task_alt' },
            { label: 'Stage-II Formal Orders', value: '1 Cleared', subtitle: 'Final Gazette Order', color: 'green', icon: 'verified' },
            { label: 'NPV Realized', value: '₹ 142.5 Cr', subtitle: 'CAMPA Account', color: 'tertiary', icon: 'currency_rupee' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Project Name' },
            { key: 'stage', label: 'Current Stage', render: (v: string) => <StatusBadge status={v} variant="info" /> },
            { key: 'npvAmount', label: 'NPV Deposited', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'status', label: 'NOC Decision', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
          ],
          data: mockForestClearances,
        };

      case 'issues':
        return {
          title: 'Ecological Objections & Violation Flags',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Flag unpermitted construction activity inside protected forest buffers, unauthorized tree felling, or deviations from sanctioned alignments.',
          kpis: [
            { label: 'Active Flags', value: '1', subtitle: 'Unauthorized Clearing', color: 'red', icon: 'flag' },
            { label: 'Resolved Inquiries', value: '5', subtitle: 'Penalty Imposed', color: 'green', icon: 'check_circle' },
            { label: 'Inspection Patrols', value: 'Weekly', subtitle: 'Forest Guard Beats', color: 'navy', icon: 'shield' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal / Beat', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'issue', label: 'Violation Details', render: () => <span className="text-red-700 font-bold">Tree felling commenced 200m ahead of Stage-II Gazette publication.</span> },
            { key: 'actionTaken', label: 'DFO Directives', render: () => <span>Stop-work notice issued to NHAI Contractor + ₹5 Lakh penalty.</span> },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="Notice Issued" variant="error" /> },
          ],
          data: mockForestClearances,
        };

      case 'conditions':
        return {
          title: 'Compensatory Afforestation (CA) & NPV Conditions',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Track mandatory compliance conditions: Double non-forest land planting (10 years maintenance), Soil Moisture Conservation (SMC), and CAMPA deposits.',
          kpis: [
            { label: 'CA Land Identified', value: '91.6 Ha', subtitle: 'Transferred to Forest Dept', color: 'green', icon: 'rule' },
            { label: 'Saplings Planted', value: '91,600', subtitle: 'Indigenous Native Species', color: 'navy', icon: 'eco' },
            { label: 'CAMPA Fund Credited', value: '₹ 142.5 Cr', subtitle: 'National Fund', color: 'tertiary', icon: 'savings' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'caArea', label: 'CA Land Required', render: () => '91.6 Ha (Non-Forest)' },
            { key: 'species', label: 'Native Species Mix', render: () => 'Teak, Neem, Mahua, Bamboo' },
            { key: 'status', label: 'Compliance Audit', render: () => <StatusBadge status="100% Compliant" variant="success" icon="check_circle" /> },
          ],
          data: mockForestClearances,
        };

      case 'tracking':
        return {
          title: 'MoEFCC Clearance Statutory 150-Day Pipeline',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Track statutory milestone deadlines: State Advisory Committee -> Regional Empowered Committee (REC) -> Forest Advisory Committee (FAC) -> MoEFCC.',
          kpis: [
            { label: 'Avg Approval Time', value: '88 Days', subtitle: 'Target: <150 Days', color: 'green', icon: 'timer' },
            { label: 'Active Pipeline', value: '4 Projects', subtitle: 'State Division Level', color: 'navy', icon: 'track_changes' },
            { label: 'Zero Overdue', value: '100%', subtitle: 'No Statutory Lapses', color: 'tertiary', icon: 'verified' },
          ],
          columns: [
            { key: 'proposalId', label: 'Proposal ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Project Name' },
            { key: 'stage', label: 'Current Stage' },
            { key: 'daysElapsed', label: 'Days Elapsed', render: () => <span className="font-bold text-slate-800">42 / 150 Days</span> },
            { key: 'status', label: 'Timeline State', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
          ],
          data: mockForestClearances,
        };

      case 'audit':
        return {
          title: 'Forest Clearance Historical Audit & Gazette Archive',
          category: 'Forest & Environment Officer (DFO)',
          description: 'Permanent chronological archive of Forest Advisory Committee (FAC) recommendations, State Government orders, and Gazette notifications.',
          kpis: [
            { label: 'Archived Clearances', value: '48 Orders', subtitle: 'Digitally Signed', color: 'navy', icon: 'history' },
            { label: 'Total Forest Diversion', value: '342.8 Ha', subtitle: 'Historical Decade Total', color: 'tertiary', icon: 'inventory' },
            { label: 'Audited by CAG', value: 'Verified', subtitle: 'Zero Non-Compliance', color: 'green', icon: 'verified' },
          ],
          columns: [
            { key: 'proposalId', label: 'Gazette Ref', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'projectName', label: 'Project Name' },
            { key: 'forestArea', label: 'Diverted Area (Ha)' },
            { key: 'status', label: 'Clearance Status', render: () => <StatusBadge status="Gazette Published" variant="success" icon="check_circle" /> },
          ],
          data: mockForestClearances,
        };

      // ==========================================
      // Tehsildar & Revenue Court Dispute Cases
      // ==========================================
      case 'disputes':
        return {
          title: 'Revenue Court Boundary & Title Dispute Register',
          category: 'Revenue Court & Tehsildar',
          description: 'Statutory dispute management under Section 64 & Section 76 of RFCTLARR Act (2013). Manage boundary overlap petitions, title rivalries, and High Court stay injunctions.',
          kpis: [
            { label: 'Active Dispute Dockets', value: '18 Cases', subtitle: '4 New This Month', color: 'red', icon: 'gavel' },
            { label: 'Scheduled Hearings', value: '5 This Week', subtitle: 'Summons Dispatched', color: 'navy', icon: 'event' },
            { label: 'Injunction / Stays Logged', value: '2 High Court', subtitle: 'Stay Order Active', color: 'ochre', icon: 'lock' },
            { label: 'Cases Resolved', value: '42 Orders', subtitle: 'Title Mutated in RoR', color: 'green', icon: 'task_alt' },
          ],
          columns: [
            { key: 'caseId', label: 'Case Number', width: '150px', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Survey Plot' },
            { key: 'village', label: 'Village & Tehsil', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
            { key: 'disputeType', label: 'Dispute Category', render: (v: string) => <StatusBadge status={v} variant="error" /> },
            {
              key: 'parties',
              label: 'Applicant vs Respondent',
              render: (_: any, r: any) => (
                <div>
                  <div className="font-semibold text-slate-900">{r.applicant?.name || 'Petitioner'}</div>
                  <div className="text-[11px] text-slate-500">vs. {r.respondent?.name || 'Respondent'}</div>
                </div>
              ),
            },
            {
              key: 'scheduledDate',
              label: 'Scheduled Hearing',
              render: (_: any, r: any) => r.scheduledDate ? `${r.scheduledDate} (${r.scheduledTime || '11:00 AM'})` : 'Under Scrutiny',
            },
            { key: 'status', label: 'Docket Status', render: (v: string) => <StatusBadge status={v || 'Hearing Active'} variant={getStatusVariant(v || 'Hearing')} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'dispute-manage' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Manage Case
                </button>
              ),
            },
          ],
          data: [
            {
              caseId: 'DISP-MH-2023-8842',
              khasraNumber: '142/3 (Plot A)',
              village: 'Hingna',
              tehsil: 'Nagpur Rural',
              disputeType: 'Title & Apportionment Dispute',
              applicant: { name: 'Sh. Rameshwar Lal', relation: 'Elder Brother (50% Share)' },
              respondent: { name: 'Smt. Geeta Devi & Co-heirs', relation: 'Legal Successors' },
              presidingOfficer: 'Shri Vikram Singh (Tehsildar)',
              scheduledDate: '14-Nov-2024',
              scheduledTime: '11:30 AM',
              courtStay: 'No Stay Active',
              claimedAmount: '₹ 47,38,500',
              status: 'Hearing Scheduled',
            },
            {
              caseId: 'DISP-MH-2023-1104',
              khasraNumber: '445/1',
              village: 'Wanadongri',
              tehsil: 'Nagpur Rural',
              disputeType: 'Boundary Demarcation Conflict',
              applicant: { name: 'M/s Sharma Enterprises', relation: 'Adjacent Commercial Plot Owner' },
              respondent: { name: 'Sh. Suresh Patel', relation: 'Acquired Landowner' },
              presidingOfficer: 'Shri Vikram Singh (Tehsildar)',
              scheduledDate: '18-Nov-2024',
              scheduledTime: '02:00 PM',
              courtStay: 'Interim Injunction Logged',
              claimedAmount: '₹ 72,15,000',
              status: 'High Court Stay',
            },
            {
              caseId: 'DISP-MH-2023-2291',
              khasraNumber: '448/3',
              village: 'Karanja',
              tehsil: 'Nagpur Rural',
              disputeType: 'Forest Boundary Buffer Contest',
              applicant: { name: 'Gram Panchayat Karanja', relation: 'Common Village Land Trustee' },
              respondent: { name: 'Maharashtra Forest Dept', relation: 'Territorial Division' },
              presidingOfficer: 'Shri Vikram Singh (Tehsildar)',
              scheduledDate: '22-Nov-2024',
              scheduledTime: '10:00 AM',
              courtStay: 'Joint Survey Ordered',
              claimedAmount: '₹ 98,40,000',
              status: 'Joint Survey Pending',
            },
            {
              caseId: 'DISP-MH-2023-3840',
              khasraNumber: '450/2-A',
              village: 'Butibori',
              tehsil: 'Nagpur Rural',
              disputeType: 'Solatium Distribution Rivalry',
              applicant: { name: 'Sh. Anil G. Deshmukh', relation: 'Mortgage Holder' },
              respondent: { name: 'Gram Sabha Representatives', relation: 'Beneficiaries' },
              presidingOfficer: 'Shri Vikram Singh (Tehsildar)',
              scheduledDate: '28-Nov-2024',
              scheduledTime: '03:30 PM',
              courtStay: 'No Stay',
              claimedAmount: '₹ 1,07,00,000',
              status: 'Hearing Scheduled',
            },
          ],
        };

      // ==========================================
      // Tehsildar / Revenue Court Subfeatures (10 Modules)
      // ==========================================
      case 'revenue-verification':
        return {
          title: 'Land Record & Revenue RoR Verification Gateway',
          category: 'Revenue Court & Tehsil Office',
          description: 'Verify 7/12 & Jamabandi Record of Rights (RoR) extracts against DILRMP digitized database. Reconcile recorded ownership tenure, survey plot boundaries, encumbrance history, and flag revenue record anomalies.',
          kpis: [
            { label: 'RoRs Verified', value: '124 / 142', subtitle: 'DILRMP Digitized Match', color: 'green', icon: 'fact_check' },
            { label: 'Title Matches', value: '98.4%', subtitle: 'Single/Joint Ownership', color: 'navy', icon: 'verified' },
            { label: 'Active Encumbrances', value: '3 Plots', subtitle: 'Bank Mortgage Logged', color: 'ochre', icon: 'account_balance' },
            { label: 'Discrepancies Flagged', value: '2 Cases', subtitle: 'Requires Patwari Re-survey', color: 'red', icon: 'warning' },
          ],
          columns: [
            { key: 'ulpin', label: 'ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Survey / Khasra No.' },
            { key: 'village', label: 'Revenue Village', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
            { key: 'ownerName', label: 'Recorded Owner in RoR' },
            { key: 'areaHectares', label: 'RoR Area (Ha)', align: 'right' as const },
            { key: 'encumbrance', label: 'Encumbrance Status', render: (v: string) => <StatusBadge status={v || 'Nil Encumbrance'} variant={v === 'Bank Mortgage' ? 'warning' : 'success'} /> },
            { key: 'status', label: 'Revenue Verification', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'tehsildar-ror-verify' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Verify RoR
                </button>
              ),
            },
          ],
          data: [
            { ulpin: 'IN-MH-440001-A12B', khasraNumber: '442/1-A', village: 'Hingna', tehsil: 'Nagpur Rural', ownerName: 'Sh. Rajendra Patel', areaHectares: 1.42, encumbrance: 'Nil Encumbrance (12-Yr Clear)', status: 'Verified' },
            { ulpin: 'IN-MH-440001-B04K', khasraNumber: '445/1', village: 'Wanadongri', tehsil: 'Nagpur Rural', ownerName: 'Sh. Suresh Patel & Co-heirs', areaHectares: 2.15, encumbrance: 'Joint Shareholding', status: 'Pending Verification' },
            { ulpin: 'IN-MH-440001-C09L', khasraNumber: '142/3', village: 'Ramgarh', tehsil: 'Nagpur Rural', ownerName: 'Sh. Rameshwar Lal', areaHectares: 1.80, encumbrance: 'Civil Title Contest', status: 'Discrepancy Flagged' },
            { ulpin: 'IN-MH-440001-D15M', khasraNumber: '450/2-A', village: 'Butibori', tehsil: 'Nagpur Rural', ownerName: 'M/s Sharma Agro Enterprises', areaHectares: 3.20, encumbrance: 'SBI Crop Loan Mortgaged', status: 'Under Review' },
          ],
        };

      case 'mutation-tracking':
        return {
          title: 'Section 38 Land Acquisition Mutation & Alienation Register',
          category: 'Revenue Court & Land Records',
          description: 'Track state revenue code mutation proceedings following 100% compensation disbursement and physical possession handover. Transfer title ownership to the Requisite Agency.',
          kpis: [
            { label: 'Mutations Sanctioned', value: '88%', subtitle: 'Transferred to NHAI/Agency', color: 'green', icon: 'swap_horiz' },
            { label: 'Processing in Tehsil', value: '12%', subtitle: 'Patwari Entry Underway', color: 'ochre', icon: 'pending' },
            { label: 'Panchnama Certified', value: '112.4 Ha', subtitle: 'Section 38 Possession', color: 'navy', icon: 'verified' },
            { label: 'Avg Sanction SLA', value: '5.2 Days', subtitle: 'Target: 7 Days', color: 'tertiary', icon: 'schedule' },
          ],
          columns: [
            { key: 'mutationNo', label: 'Mutation Entry No.', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Survey Plot' },
            { key: 'village', label: 'Revenue Village' },
            { key: 'formerOwner', label: 'Former Landowner' },
            { key: 'transferee', label: 'Transferee Agency' },
            { key: 'panchnamaDate', label: 'Possession Date' },
            { key: 'status', label: 'Mutation Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'tehsildar-mutation-sanction' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Sanction Entry
                </button>
              ),
            },
          ],
          data: [
            { mutationNo: 'MUT-2024-8842', khasraNumber: '442/1-A', village: 'Hingna', formerOwner: 'Sh. Rajendra Patel', transferee: 'NHAI PIU Nagpur', panchnamaDate: '15-Oct-2024', status: 'Sanctioned' },
            { mutationNo: 'MUT-2024-8843', khasraNumber: '445/1', village: 'Wanadongri', formerOwner: 'Sh. Suresh Patel', transferee: 'NHAI PIU Nagpur', panchnamaDate: '20-Oct-2024', status: 'Processing' },
            { mutationNo: 'MUT-2024-8844', khasraNumber: '450/2-A', village: 'Butibori', formerOwner: 'M/s Sharma Enterprises', transferee: 'NHAI PIU Nagpur', panchnamaDate: '24-Oct-2024', status: 'Sanctioned' },
            { mutationNo: 'MUT-2024-8845', khasraNumber: '448/3', village: 'Karanja', formerOwner: 'Sh. Suresh Patil', transferee: 'NHAI PIU Nagpur', panchnamaDate: '26-Oct-2024', status: 'Under Review' },
          ],
        };

      case 'alerts':
        return {
          title: 'Tehsil Court Pending Actions & Statutory Alerts Gateway',
          category: 'Revenue Court Alert Hub',
          description: 'High-priority notifications for upcoming digital hearing appearances, expiring statutory reply windows, high court injunction stays, and pending compensation e-KYC verifications.',
          kpis: [
            { label: 'Urgent Dockets', value: '4 Priority', subtitle: 'Immediate Action Required', color: 'red', icon: 'notifications_active' },
            { label: 'Hearings This Week', value: '5 Listed', subtitle: 'Summons Served', color: 'navy', icon: 'event' },
            { label: 'Stay Notices Logged', value: '2 High Court', subtitle: 'Injunctions Active', color: 'ochre', icon: 'gavel' },
            { label: 'e-KYC Pending', value: '3 Beneficiaries', subtitle: 'Awaiting Verification', color: 'tertiary', icon: 'fingerprint' },
          ],
          columns: [
            { key: 'alertId', label: 'Alert ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'severity', label: 'Severity', render: (v: string) => <StatusBadge status={v} variant={v === 'Critical' ? 'error' : 'warning'} /> },
            { key: 'title', label: 'Subject Matter' },
            { key: 'target', label: 'Concerned Plot / Party' },
            { key: 'deadline', label: 'Statutory Deadline' },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => {
                    setActionSuccess(`Alert ${r.alertId} processed and recorded in Tehsildar Court register.`);
                  }}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Process Alert
                </button>
              ),
            },
          ],
          data: [
            { alertId: 'ALT-TEH-001', severity: 'Critical', title: 'High Court Interim Stay on Solatium Apportionment', target: 'Case DISP-MH-2023-1104 (Wanadongri)', deadline: '18-Nov-2024' },
            { alertId: 'ALT-TEH-002', severity: 'High', title: 'Digital Hearing Scheduled for Boundary Dispute', target: 'Sh. Rameshwar Lal vs Geeta Devi (Plot #142/3)', deadline: '14-Nov-2024' },
            { alertId: 'ALT-TEH-003', severity: 'Medium', title: 'Beneficiary Bank e-KYC Verification Pending', target: 'Sh. Vikram Singh (Plot #445/1)', deadline: '10-Nov-2024' },
            { alertId: 'ALT-TEH-004', severity: 'High', title: 'Section 38 RoR Mutation Order Approval Due', target: 'Plot #450/2-A (Butibori)', deadline: '08-Nov-2024' },
          ],
        };

      case 'reports':
        return {
          title: 'Tehsil-Level Revenue Court & Acquisition MIS Reports',
          category: 'Revenue Administration & Reporting',
          description: 'Generate and export statutory Tehsil returns for District Collector, State Revenue Board, and Land Acquisition Officer.',
          kpis: [
            { label: 'Tehsil Reports Ready', value: '12 Reports', subtitle: 'Automated Returns', color: 'navy', icon: 'analytics' },
            { label: 'Affected Persons (PAP)', value: '1,452', subtitle: 'All Villages Synced', color: 'green', icon: 'groups' },
            { label: 'Disbursed Compensation', value: '₹ 128.4 Cr', subtitle: 'PFMS e-Kuber', color: 'tertiary', icon: 'payments' },
            { label: 'Mutation Compliance', value: '88%', subtitle: 'State Revenue Code', color: 'ochre', icon: 'verified' },
          ],
          columns: [
            { key: 'title', label: 'Report Title', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'statute', label: 'Statutory Reference' },
            { key: 'frequency', label: 'Frequency' },
            { key: 'lastUpdated', label: 'Last Updated' },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => {
                    const docContent = `GOVERNMENT OF INDIA • TEHSILDAR REVENUE COURT SIKAR / NAGPUR\nREPORT TITLE: ${r.title}\nSTATUTORY ACT: ${r.statute}\nGENERATED: ${new Date().toLocaleString('en-IN')}\nSTATUS: DIGITALLY CERTIFIED BY TEHSILDAR`;
                    const blob = new Blob([docContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${r.title.replace(/\s+/g, '_')}_Tehsil.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setActionSuccess(`Tehsil report "${r.title}" downloaded successfully.`);
                  }}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Export Report
                </button>
              ),
            },
          ],
          data: [
            { id: 'TR1', title: 'Tehsil Monthly Land Acquisition & Dispute Summary', statute: 'Section 64 & Section 76 RFCTLARR', frequency: 'Monthly', lastUpdated: '28-Oct-2024' },
            { id: 'TR2', title: 'Section 15 Hearing Proceedings & Magistrate Findings Docket', statute: 'Section 15(2) Inquiry Record', frequency: 'Fortnightly', lastUpdated: '26-Oct-2024' },
            { id: 'TR3', title: 'Beneficiary Compensation DBT & e-KYC Verification Register', statute: 'Section 26-30 PFMS Return', frequency: 'Weekly', lastUpdated: '28-Oct-2024' },
            { id: 'TR4', title: 'Section 38 RoR Mutation & State Alienation Progress Return', statute: 'State Land Revenue Code', frequency: 'Monthly', lastUpdated: '24-Oct-2024' },
          ],
        };

      // ==========================================
      // District Collector Subfeatures (14 Modules)
      // ==========================================
      case 'proposal-review':
        return {
          title: 'Acquisition Proposal Review & Executive Decision',
          category: 'District Collector & Competent Authority',
          description: 'Review statutory land acquisition proposals submitted by Requisite Agencies (NHAI, Railways, State PWD). Scrutinize Social Impact Assessment (SIA) approvals, Section 4 notifications, and land schedules.',
          kpis: [
            { label: 'Active Proposals', value: '6', subtitle: 'District Nagpur', color: 'navy', icon: 'rate_review' },
            { label: 'Recommended for Sec 11', value: '2', subtitle: 'SIA Cleared', color: 'green', icon: 'check_circle' },
            { label: 'Returned with Queries', value: '1', subtitle: 'Boundary Alignment Issue', color: 'ochre', icon: 'replay' },
            { label: 'Total Estimated Outlay', value: '₹ 184.2 Cr', subtitle: 'District Budget', color: 'tertiary', icon: 'payments' },
          ],
          columns: [
            { key: 'id', label: 'Proposal Ref', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'name', label: 'Project Name', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'agency', label: 'Requisite Agency' },
            { key: 'totalArea', label: 'Required Area (Ha)', align: 'right' as const },
            { key: 'estimatedCost', label: 'Est. Outlay (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'siaStatus', label: 'SIA Expert Clearance', render: () => <StatusBadge status="SIA Approved" variant="success" icon="verified" /> },
            { key: 'status', label: 'Approval Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-proposal-review' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Review & Decide
                </button>
              ),
            },
          ],
          data: mockProjects,
        };

      case 'objection-oversight':
        return {
          title: 'Statutory Section 15 Objection & Hearing Oversight',
          category: 'District Collector & Revenue Administration',
          description: 'Supervise inquiry proceedings conducted by Land Acquisition Officers and Revenue Magistrates under Section 15(2) of the Act. Monitor statutory 60-day objection timelines and hear aggrieved landholders.',
          kpis: [
            { label: 'Total Objections Filed', value: '34 Cases', subtitle: 'Section 15(1) Petitions', color: 'navy', icon: 'gavel' },
            { label: 'Inquiries Completed', value: '28 Cases', subtitle: 'LAO Reports Received', color: 'green', icon: 'task_alt' },
            { label: 'Collector Directions Issued', value: '6 Orders', subtitle: 'Revision Directed', color: 'ochre', icon: 'description' },
            { label: 'Statutory Compliance', value: '94.2%', subtitle: 'Within 60 Days', color: 'tertiary', icon: 'verified' },
          ],
          columns: [
            { key: 'trackingId', label: 'Docket No.', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'parcelId', label: 'Survey Plot' },
            { key: 'filedBy', label: 'Objector Name' },
            { key: 'category', label: 'Objection Category', render: (v: string) => <StatusBadge status={v} variant="warning" /> },
            { key: 'dateFiled', label: 'Date Filed' },
            { key: 'status', label: 'Inquiry Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-objection-direction' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Issue Directive
                </button>
              ),
            },
          ],
          data: mockGrievances,
        };

      case 'inter-dept':
        return {
          title: 'Inter-Departmental Statutory Clearance Coordination Matrix',
          category: 'District Collector & Executive Oversight',
          description: 'Single-window inter-agency tracking between Revenue, Forest & Environment (MoEFCC), State PWD, Irrigation Department, and District Land Records (DILRMP).',
          kpis: [
            { label: 'Clearances Tracked', value: '14 Projects', subtitle: 'Single Window Gateway', color: 'navy', icon: 'hub' },
            { label: 'Stage II Forest Clearance', value: '1 Pending', subtitle: 'MoEFCC Western Region', color: 'ochre', icon: 'forest' },
            { label: 'RoR Mutation Sync', value: '98.2%', subtitle: 'State Revenue Code', color: 'green', icon: 'sync' },
            { label: 'Avg Clearance SLA', value: '28 Days', subtitle: 'Target: 45 Days', color: 'tertiary', icon: 'schedule' },
          ],
          columns: [
            { key: 'dept', label: 'Concerned Department', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'clearanceType', label: 'Required Clearance / NOC' },
            { key: 'project', label: 'Linked Corridor Project' },
            { key: 'slaDue', label: 'Statutory SLA Due Date' },
            { key: 'status', label: 'Department Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-inter-dept' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Summon / Expedite
                </button>
              ),
            },
          ],
          data: [
            { id: 'ID1', dept: 'MoEFCC - Western Region (Forest)', clearanceType: 'Stage II Forest Diversion (14.2 Ha)', project: 'NH-44 Corridor Phase II', slaDue: '15-Nov-2024', status: 'Under Review' },
            { id: 'ID2', dept: 'State PWD - Roads Division', clearanceType: 'Right-of-Way Road Cut Permission', project: 'NH-44 Corridor Phase II', slaDue: '20-Oct-2024', status: 'Approved' },
            { id: 'ID3', dept: 'Water Resources / Irrigation Dept', clearanceType: 'Canal Crossing Canal Syphon NOC', project: 'Nagpur Ring Road West', slaDue: '30-Nov-2024', status: 'Pending Review' },
            { id: 'ID4', dept: 'DILRMP / Inspector of Land Records', clearanceType: 'Digital Cadastral RoR Integration', project: 'Industrial Park Corridor', slaDue: '10-Oct-2024', status: 'Approved' },
          ],
        };

      case 'compensation-monitoring':
        return {
          title: 'District Compensation & Statutory Award Monitoring Schedule',
          category: 'District Collector & Award Sanction Authority',
          description: 'Monitor district-wide compensation determination under Section 26 to 30 of RFCTLARR Act (2013). Track 100% statutory solatium, 12% additional market value interest, and standing asset values.',
          kpis: [
            { label: 'Total Assessed Award', value: '₹ 184.2 Cr', subtitle: 'Section 26 Valuation', color: 'navy', icon: 'payments' },
            { label: 'Collector Sanctioned', value: '₹ 142.8 Cr', subtitle: 'Gazette Sealed', color: 'green', icon: 'verified' },
            { label: 'PFMS DBT Disbursed', value: '₹ 128.4 Cr', subtitle: 'Direct Beneficiary Credit', color: 'tertiary', icon: 'account_balance' },
            { label: 'Pending Disbursal', value: '₹ 14.4 Cr', subtitle: 'Awaiting Bank e-KYC', color: 'ochre', icon: 'pending' },
          ],
          columns: [
            { key: 'parcelId', label: 'Parcel ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'village', label: 'Village & Tehsil' },
            { key: 'owner', label: 'Landowner (PAF)' },
            { key: 'baseValue', label: 'Base Value (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'solatium', label: '100% Solatium (₹)', align: 'right' as const, render: (v: number) => formatINR(v) },
            { key: 'totalAward', label: 'Total Award (₹)', align: 'right' as const, render: (v: number) => <span className="font-bold text-emerald-800">{formatINR(v)}</span> },
            { key: 'status', label: 'Sanction Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-compensation-sanction' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Sanction Award
                </button>
              ),
            },
          ],
          data: [
            { parcelId: 'IN-MH-440001-A12B', village: 'Hingna, Nagpur', owner: 'Sh. Rajendra Patel', baseValue: 2000000, solatium: 2000000, totalAward: 4738500, status: 'Sanctioned' },
            { parcelId: 'IN-MH-440001-B04K', village: 'Wanadongri, Nagpur', owner: 'Sh. Suresh Patel', baseValue: 3600000, solatium: 3600000, totalAward: 7400000, status: 'Approved' },
            { parcelId: 'IN-MH-440001-C09L', village: 'Kondagaon, Nagpur', owner: 'Sh. Rameshwar Lal', baseValue: 1800000, solatium: 1800000, totalAward: 4250000, status: 'Under Review' },
            { parcelId: 'IN-MH-440001-D15M', village: 'Butibori, Nagpur', owner: 'M/s Sharma Enterprises', baseValue: 4500000, solatium: 4500000, totalAward: 9800000, status: 'Sanctioned' },
          ],
        };

      case 'possession-rr':
        return {
          title: 'Section 38 Physical Possession & R&R Entitlement Oversight',
          category: 'District Collector & R&R Administrator',
          description: 'Supervise physical possession certificates (Panchnama) after 100% compensation transfer. Track Rehabilitation & Resettlement (R&R) Schedule II infrastructure benefits for Project Displaced Families (PDF).',
          kpis: [
            { label: 'Possession Handed', value: '112.4 Ha', subtitle: 'Free of Encumbrances', color: 'green', icon: 'home_work' },
            { label: 'Affected Families', value: '1,452 PAF', subtitle: 'Survey Verified', color: 'navy', icon: 'groups' },
            { label: 'Displaced Families', value: '184 PDF', subtitle: 'Resettlement Colony Assigned', color: 'tertiary', icon: 'cottage' },
            { label: 'R&R Infrastructure', value: '92% Done', subtitle: 'Roads, Water & Power', color: 'ochre', icon: 'construction' },
          ],
          columns: [
            { key: 'sector', label: 'Corridor Sector', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'area', label: 'Acquired Extent (Ha)', align: 'right' as const },
            { key: 'panchnama', label: 'Possession Panchnama', render: (v: string) => <StatusBadge status={v} variant={v === 'Completed' ? 'success' : 'warning'} /> },
            { key: 'paf', label: 'Affected Families (PAF)' },
            { key: 'rrStatus', label: 'R&R Grant Disbursement', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-possession' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Verify Panchnama
                </button>
              ),
            },
          ],
          data: [
            { id: 'RR1', sector: 'Sector A: Hingna - Wanadongri Bypass', area: '45.2 Ha', panchnama: 'Completed', paf: '412 PAF (48 PDF)', rrStatus: 'Disbursed' },
            { id: 'RR2', sector: 'Sector B: Karanja Forest Alignment', area: '38.6 Ha', panchnama: 'Under Joint Survey', paf: '298 PAF (12 PDF)', rrStatus: 'Approved' },
            { id: 'RR3', sector: 'Sector C: Butibori Industrial Interchange', area: '28.6 Ha', panchnama: 'Completed', paf: '742 PAF (124 PDF)', rrStatus: 'Processing' },
          ],
        };

      case 'delay-exceptions':
        return {
          title: 'Statutory Timeline Delay & Exception Intervention Engine',
          category: 'District Collector & Appellate Authority',
          description: 'Automated exception monitoring flagging Section 11 expiration risks (12-month limit under Section 25), PFMS DBT bank rejection failures, and delayed joint survey discrepancies.',
          kpis: [
            { label: 'Critical Exceptions', value: '4 Cases', subtitle: 'Immediate Collector Review', color: 'red', icon: 'warning' },
            { label: 'Section 25 Lapse Warning', value: '1 Case', subtitle: 'Approaching 12-Month Limit', color: 'ochre', icon: 'timer' },
            { label: 'PFMS Bank Rejections', value: '2 Transactions', subtitle: 'Aadhaar Name Mismatch', color: 'navy', icon: 'error' },
            { label: 'Court Injunction Stays', value: '1 Docket', subtitle: 'High Court Interim Stay', color: 'tertiary', icon: 'gavel' },
          ],
          columns: [
            { key: 'id', label: 'Exception ID', render: (v: string) => <span className="font-mono font-bold text-red-700">{v}</span> },
            { key: 'project', label: 'Project / Survey Plot' },
            { key: 'category', label: 'Exception Category', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'rootCause', label: 'Root Cause / Delay Factor' },
            { key: 'overdueDays', label: 'Overdue (Days)', align: 'center' as const, render: (v: number) => <span className="font-bold text-red-600">{v} Days</span> },
            { key: 'severity', label: 'Severity', render: (v: string) => <StatusBadge status={v} variant="error" /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-exception-intervene' })}
                  className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Intervene
                </button>
              ),
            },
          ],
          data: [
            { id: 'EX-2024-001', project: 'NH-44 Phase II (Plot #445/1)', category: 'Section 25 Timeline Expiry Risk', rootCause: 'Section 11 issued 10 months ago; Section 19 declaration pending final joint survey.', overdueDays: 45, severity: 'Critical' },
            { id: 'EX-2024-002', project: 'Nagpur Ring Road (Plot #142/3)', category: 'PFMS DBT Rejection', rootCause: 'Beneficiary bank account IFSC code mismatch during electronic treasury credit.', overdueDays: 14, severity: 'High' },
            { id: 'EX-2024-003', project: 'Karanja Forest Corridor', category: 'Inter-Agency Boundary Contest', rootCause: 'Discrepancy of 0.8 Ha between Forest Boundary Pillar 42 and Revenue RoR map.', overdueDays: 28, severity: 'High' },
            { id: 'EX-2024-004', project: 'Butibori Industrial Hub', category: 'High Court Injunction Stay', rootCause: 'Writ petition filed regarding solatium distribution among co-parceners.', overdueDays: 60, severity: 'Critical' },
          ],
        };

      case 'escalations':
        return {
          title: 'District Escalation Matrix & High-Level Resolution Register',
          category: 'District Collector & Appellate Authority',
          description: 'Formal escalation queue for cases referred directly from Land Acquisition Officers, Divisional Forest Officers, or Requiring Agencies requiring IAS Collector intervention.',
          kpis: [
            { label: 'Escalated Matters', value: '5 Cases', subtitle: 'Referred to Collector', color: 'red', icon: 'priority_high' },
            { label: 'Collector Hearings', value: '3 Listed', subtitle: 'This Week', color: 'navy', icon: 'gavel' },
            { label: 'Decrees Enforced', value: '12 Orders', subtitle: 'Past 6 Months', color: 'green', icon: 'verified' },
            { label: 'Avg Resolution Time', value: '4.8 Days', subtitle: 'Fast-Track Track', color: 'tertiary', icon: 'speed' },
          ],
          columns: [
            { key: 'id', label: 'Escalation ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'referredBy', label: 'Referring Officer' },
            { key: 'subject', label: 'Subject Matter / Contest' },
            { key: 'date', label: 'Date Escalated' },
            { key: 'urgency', label: 'Urgency', render: (v: string) => <StatusBadge status={v} variant={v === 'High Priority' ? 'error' : 'warning'} /> },
            { key: 'status', label: 'Escalation Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'collector-escalation-decree' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Pass Decree
                </button>
              ),
            },
          ],
          data: [
            { id: 'ESC-2024-101', referredBy: 'SDO / LAO Nagpur', subject: 'Gram Sabha Resolution Dispute on Common Village Land (Plot #450/2-A)', date: '22-Oct-2024', urgency: 'High Priority', status: 'Pending Hearing' },
            { id: 'ESC-2024-102', referredBy: 'DFO MoEFCC Western Region', subject: 'Wildlife Corridor Buffer Realignment for Sector 3', date: '25-Oct-2024', urgency: 'High Priority', status: 'Under Review' },
            { id: 'ESC-2024-103', referredBy: 'Project Director NHAI', subject: 'Request for Police Demarcation Protection during Boundary Pillar Fixing', date: '27-Oct-2024', urgency: 'Urgent', status: 'Action Directed' },
          ],
        };

      case 'mis-reports':
        return {
          title: 'District Land Acquisition MIS & Statutory Reporting Centre',
          category: 'District Collector & Executive MIS',
          description: 'Generate and export authorized MIS analytical summaries, Section 11/19 Gazette audit registers, and Ministry of Rural Development quarterly compliance returns.',
          kpis: [
            { label: 'MIS Reports Ready', value: '24 Reports', subtitle: 'Automated Generation', color: 'navy', icon: 'analytics' },
            { label: 'Total Acquired Extent', value: '342.8 Ha', subtitle: 'District Nagpur', color: 'green', icon: 'landscape' },
            { label: 'Total Fund Audited', value: '₹ 184.2 Cr', subtitle: 'CAG & State Treasury', color: 'tertiary', icon: 'account_balance' },
            { label: 'Audit Status', value: 'Fully Compliant', subtitle: 'Zero Audit Paras', color: 'navy', icon: 'verified' },
          ],
          columns: [
            { key: 'title', label: 'Report Title', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'actRef', label: 'Statutory Act Reference' },
            { key: 'cycle', label: 'Reporting Cycle' },
            { key: 'lastGenerated', label: 'Last Generated' },
            { key: 'format', label: 'Format' },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => {
                    const docContent = `GOVERNMENT OF INDIA • DISTRICT COLLECTORATE NAGPUR\nMIS REPORT: ${r.title}\nACT REF: ${r.actRef}\nGENERATED: ${new Date().toLocaleString('en-IN')}\nSTATUS: DIGITALLY CERTIFIED BY DISTRICT COLLECTOR`;
                    const blob = new Blob([docContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${r.title.replace(/\s+/g, '_')}_MIS.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setActionSuccess(`Report "${r.title}" exported successfully.`);
                  }}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              ),
            },
          ],
          data: [
            { id: 'REP1', title: 'District Land Acquisition Monthly Progress Return (MPR)', actRef: 'Section 11 & Section 19 MIS', cycle: 'Monthly (Oct 2024)', lastGenerated: '28-Oct-2024', format: 'PDF / XLSX' },
            { id: 'REP2', title: 'Section 23 Statutory Compensation & Solatium Disbursement Register', actRef: 'Section 26-30 Audit Schedule', cycle: 'Quarterly', lastGenerated: '24-Oct-2024', format: 'PDF / CSV' },
            { id: 'REP3', title: 'Section 38 Physical Possession & Panchnama Handover Docket', actRef: 'Section 38 RoR Transfer', cycle: 'Fortnightly', lastGenerated: '26-Oct-2024', format: 'PDF / XLSX' },
            { id: 'REP4', title: 'Rehabilitation & Resettlement (R&R) Schedule II Entitlement Compliance', actRef: 'RFCTLARR Schedule II', cycle: 'Monthly', lastGenerated: '20-Oct-2024', format: 'PDF / XLSX' },
          ],
        };

      case 'audit-trail':
        return {
          title: 'Executive Audit Trail & Digital Transaction Log',
          category: 'District Administration Security & Compliance',
          description: 'Immutable digital ledger recording every e-Signature, award approval, boundary alteration, and fund sanction across all district revenue officers with cryptographic DSC verification.',
          kpis: [
            { label: 'Total Audit Events', value: '1,842', subtitle: 'Immutable Ledger', color: 'navy', icon: 'history' },
            { label: 'e-Sign Transactions', value: '124 DSC', subtitle: '256-Bit SHA Verified', color: 'green', icon: 'verified' },
            { label: 'Boundary Modifications', value: '18 Logged', subtitle: 'GIS Versioned', color: 'ochre', icon: 'layers' },
            { label: 'Cryptographic Match', value: '100%', subtitle: 'Zero Tampering', color: 'tertiary', icon: 'lock' },
          ],
          columns: [
            { key: 'logId', label: 'Log ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'officer', label: 'Officer & Designation' },
            { key: 'actionType', label: 'Action Type', render: (v: string) => <span className="font-semibold text-slate-900">{v}</span> },
            { key: 'entity', label: 'Entity Modified / Sanctioned' },
            { key: 'dscHash', label: 'DSC Hash (Masked)', render: (v: string) => <span className="font-mono text-[11px] text-slate-500">{v}</span> },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="Verified" variant="success" icon="check_circle" /> },
          ],
          data: [
            { logId: 'AUD-98421', timestamp: '28-Oct-2024 14:32:18', officer: 'Sh. Ramesh Kumar, IAS (Collector)', actionType: 'Section 11 Gazette e-Sign', entity: 'NH-44 Phase II Alignment', dscHash: 'SHA256:9f83...a12c' },
            { logId: 'AUD-98420', timestamp: '28-Oct-2024 11:15:04', officer: 'Smt. Meera Kulkarni (LAO)', actionType: 'Section 15 Ground Audit Verification', entity: 'Plot #442/1-A (Hingna)', dscHash: 'SHA256:4d72...89ee' },
            { logId: 'AUD-98419', timestamp: '27-Oct-2024 16:45:22', officer: 'Shri Vikram Singh (Tehsildar)', actionType: 'Summons Issued in Dispute Docket', entity: 'Case DISP-MH-2023-8842', dscHash: 'SHA256:1a84...33cc' },
            { logId: 'AUD-98418', timestamp: '26-Oct-2024 09:20:10', officer: 'Dr. Anil Sharma (DFO Forest)', actionType: 'Stage I Forest NOC Clearance', entity: 'Compartment 42-B (14.2 Ha)', dscHash: 'SHA256:88ee...55ff' },
          ],
        };

      case 'notifications':
        return {
          title: 'District Collector Statutory Alerts & Executive Notification Hub',
          category: 'District Administration Alert Gateway',
          description: 'High-priority statutory alerts, automated milestone escalation reminders, and pending Section 11/19 Gazette signatures requiring District Collector attention.',
          kpis: [
            { label: 'Unread Alerts', value: '3 Priority', subtitle: 'Action Required', color: 'red', icon: 'notifications_active' },
            { label: 'Deadlines Approaching', value: '2 Statutory', subtitle: 'Next 7 Days', color: 'ochre', icon: 'timer' },
            { label: 'DBT Batches Ready', value: '1 Queue', subtitle: '₹ 45.2 Cr Sanction', color: 'green', icon: 'payments' },
            { label: 'Gateway State', value: 'Active', subtitle: 'PFMS & DILRMP Sync', color: 'tertiary', icon: 'sensors' },
          ],
          columns: [
            { key: 'alertId', label: 'Alert ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'severity', label: 'Severity', render: (v: string) => <StatusBadge status={v} variant={v === 'High' ? 'error' : 'warning'} /> },
            { key: 'title', label: 'Alert Subject', render: (v: string) => <span className="font-bold text-slate-900">{v}</span> },
            { key: 'origin', label: 'Originating Office' },
            { key: 'timestamp', label: 'Timestamp' },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => {
                    setActionSuccess(`Alert ${r.alertId} acknowledged and routed to concerned desk.`);
                  }}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Acknowledge
                </button>
              ),
            },
          ],
          data: [
            { alertId: 'ALT-8841', severity: 'High', title: 'Section 11 Gazette Declaration Pending e-Sign', origin: 'Collectorate Revenue Cell', timestamp: '1 hour ago' },
            { alertId: 'ALT-8840', severity: 'Medium', title: 'Stage II Forest Diversion Joint Committee Inspection Scheduled', origin: 'MoEFCC Forest Division', timestamp: '4 hours ago' },
            { alertId: 'ALT-8839', severity: 'High', title: 'PFMS DBT Batch #9482-A (₹45.2 Cr) Sanctioned & Dispatched', origin: 'State Treasury Gateway', timestamp: '1 day ago' },
          ],
        };

      // ==========================================
      // Project Affected Persons (PAP) & Compensation Register
      // ==========================================
      case 'affected-persons':
      case 'beneficiaries':
        if (currentRole === 'CITIZEN') {
          return {
            title: 'Statutory Data Protection & Personal Privacy Guard',
            category: 'Citizen / Landowner Portal',
            description: 'Under Section 8(1)(j) of the Right to Information Act and the Digital Personal Data Protection Act (2023), district-wide beneficiary personal financial identifiers, Aadhaar numbers, and bank disbursement schedules are restricted to Authorized Revenue Officers.',
            kpis: [
              { label: 'Access Policy', value: 'Restricted', subtitle: 'Statutory Privacy Rule', color: 'red', icon: 'lock' },
              { label: 'Your Parcel Award', value: '₹ 47,38,500', subtitle: 'Plot #442/1-A', color: 'green', icon: 'verified' },
              { label: 'DBT Status', value: 'Disbursed', subtitle: 'SBI *4920', color: 'navy', icon: 'account_balance' },
            ],
            columns: [
              { key: 'item', label: 'Authorized Single-Window View' },
              { key: 'description', label: 'Access Path' },
            ],
            data: [
              { item: 'View Your Verified Compensation Breakdown', description: 'Available under Citizen Compensation Dashboard (/dashboard/citizen/compensation)' },
              { item: 'Track Section 11/19/23 Award Lifecycle', description: 'Available under Citizen Acquisition Status (/dashboard/citizen/status)' },
              { item: 'Download Certified Award Order & Bank Receipts', description: 'Available under Citizen Documents Repository (/dashboard/citizen/documents)' },
            ],
          };
        }

        return {
          title: 'Project Affected Persons (PAP) & Compensation Entitlement Register',
          category: roleConfig.label,
          description: 'Statutory register of project affected persons, title-holders, agricultural tenants, and displaced families (PAF) under RFCTLARR Act (2013). Tehsildar & Compensation Office gateway for direct electronic compensation disbursement.',
          kpis: [
            { label: 'Total Affected Persons', value: '1,452 PAP', subtitle: '412 PAF Families', color: 'navy', icon: 'groups' },
            { label: 'Assessed Compensation', value: '₹ 184.2 Cr', subtitle: '100% Solatium + Assets', color: 'green', icon: 'payments' },
            { label: 'Aadhaar e-KYC Verified', value: '96.4%', subtitle: 'PFMS Single-Window Ready', color: 'tertiary', icon: 'verified_user' },
            { label: 'Disbursement Active', value: '₹ 128.4 Cr', subtitle: 'Transferred via PFMS DBT', color: 'ochre', icon: 'account_balance' },
          ],
          columns: [
            { key: 'id', label: 'Beneficiary ID', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            {
              key: 'name',
              label: 'Affected Person & Category',
              render: (v: string, r: any) => (
                <div>
                  <div className="font-semibold text-slate-900">{v}</div>
                  <div className="text-[11px] text-slate-500">{r.category || 'Title-Holder Landowner'}</div>
                </div>
              ),
            },
            { key: 'village', label: 'Village & Plot', render: (_: any, r: any) => `${r.village} (Plot #${r.surveyNumber})` },
            {
              key: 'bankDetails',
              label: 'Aadhaar & Bank Account',
              render: (_: any, r: any) => (
                <div className="font-mono text-xs">
                  <div className="text-slate-800">{r.bankName} ({r.accountNumber})</div>
                  <div className="text-[10px] text-slate-500">{r.aadhaar}</div>
                </div>
              ),
            },
            { key: 'kycStatus', label: 'e-KYC Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'disbursementAmount',
              label: 'Total Award (₹)',
              align: 'right' as const,
              render: (v: number) => <span className="font-bold text-emerald-800">{formatINR(v)}</span>,
            },
            { key: 'disbursementStatus', label: 'Disbursement Stage', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
            {
              key: 'action',
              label: 'Action',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <button
                  onClick={() => setSelectedRecord({ ...r, modal: 'pap-disburse' })}
                  className="px-3 py-1 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Process DBT
                </button>
              ),
            },
          ],
          data: mockBeneficiaries,
        };

      // ==========================================
      // Default Fallback for other modules
      // ==========================================
      default:
        const cleanTitle = rawSlug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        return {
          title: `${cleanTitle} Overview`,
          category: roleConfig.label,
          description: `Departmental operational module for ${cleanTitle.toLowerCase()} under statutory guidelines of the RFCTLARR Act (2013).`,
          kpis: [
            { label: `Active ${cleanTitle}`, value: '142', subtitle: 'District Records', color: 'navy', icon: 'folder_open' },
            { label: 'Under Review', value: '18', subtitle: 'Pending Sign-off', color: 'ochre', icon: 'pending' },
            { label: 'Compliance', value: '98.4%', subtitle: 'Statutory Timelines', color: 'green', icon: 'verified' },
          ],
          columns: [
            { key: 'ulpin', label: 'Reference / ULPIN', render: (v: string) => <span className="font-mono font-bold text-[var(--color-gov-navy)]">{v}</span> },
            { key: 'khasraNumber', label: 'Plot / Khasra No.' },
            { key: 'village', label: 'Village & Division', render: (_: any, r: any) => `${r.village}, ${r.tehsil}` },
            { key: 'ownerName', label: 'Record Holder' },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} variant={getStatusVariant(v)} /> },
          ],
          data: mockParcels,
        };
    }
  };

  const config = getSubpageConfig();

  return (
    <div className="space-y-6">
      {/* Page Title Header - Cleaned with no useless "Execute Department Action" */}
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            {config.category}
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">{config.title}</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1 max-w-4xl leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Domain-specific KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {config.kpis.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* Tailored Data Grid */}
      <DataGrid
        title={`${config.title} Records`}
        columns={config.columns}
        data={config.data}
        totalItems={config.data.length}
        showExport={false}
      />

      {/* Interactive Action Modals */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-300 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0072BC]">verified</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRecord.modal === 'parcel-verify'
                    ? `Verify Parcel • ${selectedRecord.ulpin}`
                    : selectedRecord.modal === 'doc-verify'
                    ? `Title Verification • ${selectedRecord.ownerName}`
                    : selectedRecord.modal === 'objection-review'
                    ? `Section 15 Objection • Case ${selectedRecord.id}`
                    : selectedRecord.modal === 'hearing-proceedings'
                    ? `Record Hearing Order • Docket ${selectedRecord.id}`
                    : `Submit Award • ${selectedRecord.ulpin}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="text-slate-500">Record Holder / Claimant:</div>
                <div className="font-bold text-slate-900 text-sm">{selectedRecord.ownerName || selectedRecord.claimantName}</div>
                <div className="text-slate-600">Location: {selectedRecord.village || 'Nagpur Division'}</div>
              </div>

              {selectedRecord.modal === 'parcel-verify' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-slate-800">
                    <div><strong>GIS Calculated Area:</strong> {selectedRecord.areaHectares || '1.42'} Ha</div>
                    <div><strong>Ground Surveyor Measured Area:</strong> {selectedRecord.areaHectares || '1.42'} Ha (Zero Variance)</div>
                    <div className="text-emerald-800 font-bold mt-1">✓ Anti-Fraud GPS Boundary Check: PASSED</div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">LAO Verification Remarks:</label>
                    <textarea
                      defaultValue="Field survey measurements match cadastral revenue records. Recommended for Section 19 declaration."
                      rows={2}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'doc-verify' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-slate-800">
                    <div><strong>7/12 RoR Extract:</strong> Verified against DILRMP database</div>
                    <div><strong>Encumbrance Search:</strong> Nil encumbrance for past 12 years</div>
                    <div><strong>Aadhaar e-KYC:</strong> Successfully authenticated</div>
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'objection-review' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-slate-800">
                    <div><strong>Objection Type:</strong> {selectedRecord.category || 'Valuation Dispute'}</div>
                    <div><strong>Claimant Statement:</strong> {selectedRecord.description || 'Tree valuation not included in initial inventory.'}</div>
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'dispute-manage' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-amber-900 flex justify-between">
                      <span>Case #{selectedRecord.caseId}</span>
                      <span>{selectedRecord.status}</span>
                    </div>
                    <div><strong>Dispute Category:</strong> {selectedRecord.disputeType}</div>
                    <div><strong>Survey Plot:</strong> Khasra #{selectedRecord.khasraNumber} ({selectedRecord.village})</div>
                    <div><strong>Parties:</strong> {selectedRecord.applicant?.name} <em>vs</em> {selectedRecord.respondent?.name}</div>
                    <div><strong>Compensation at Stake:</strong> {selectedRecord.claimedAmount || '₹ 47.38 Lakh'}</div>
                    <div><strong>Court Injunction:</strong> {selectedRecord.courtStay || 'None'}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Revenue Court Magistrate Directive / Order:</label>
                    <textarea
                      defaultValue={`Summons issued to both parties for digital appearance on ${selectedRecord.scheduledDate || 'next hearing'}. Field revenue patwari instructed to submit demarcation overlay.`}
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-proposal-review' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-[#003178] flex justify-between">
                      <span>Proposal #{selectedRecord.id}</span>
                      <span>{selectedRecord.agency}</span>
                    </div>
                    <div><strong>Project:</strong> {selectedRecord.name}</div>
                    <div><strong>Required Land Extent:</strong> {selectedRecord.totalArea} Hectares</div>
                    <div><strong>Estimated Financial Outlay:</strong> {formatINR(selectedRecord.estimatedCost)}</div>
                    <div><strong>SIA Approval Status:</strong> Approved by Multi-Disciplinary Expert Group</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">District Collector Official Remarks / Directions:</label>
                    <textarea
                      defaultValue="Proposal examined under Section 7 & Section 11(1) of RFCTLARR Act (2013). Recommended for preliminary Gazette issuance."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-objection-direction' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-amber-900 flex justify-between">
                      <span>Docket #{selectedRecord.trackingId}</span>
                      <span>{selectedRecord.category}</span>
                    </div>
                    <div><strong>Objector:</strong> {selectedRecord.filedBy} (Plot #{selectedRecord.parcelId})</div>
                    <div><strong>Objection Details:</strong> {selectedRecord.description}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Collector Statutory Direction to LAO:</label>
                    <textarea
                      defaultValue="LAO directed to conduct joint inspection with Horticulture Officer within 7 days and submit revised tree valuation schedule."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-inter-dept' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-slate-900">{selectedRecord.dept}</div>
                    <div><strong>Required NOC:</strong> {selectedRecord.clearanceType}</div>
                    <div><strong>Linked Project:</strong> {selectedRecord.project}</div>
                    <div><strong>SLA Due Date:</strong> {selectedRecord.slaDue}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">District Collector Notice / Directive:</label>
                    <textarea
                      defaultValue="Joint District Coordination Meeting scheduled under chairmanship of District Collector on Monday 11:00 AM. Clearances to be expedited."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-compensation-sanction' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-emerald-900 flex justify-between">
                      <span>ULPIN #{selectedRecord.parcelId}</span>
                      <span className="font-bold">{formatINR(selectedRecord.totalAward)}</span>
                    </div>
                    <div><strong>Landowner:</strong> {selectedRecord.owner} ({selectedRecord.village})</div>
                    <div><strong>Base Land Value:</strong> {formatINR(selectedRecord.baseValue)}</div>
                    <div><strong>100% Solatium (Sec 30):</strong> {formatINR(selectedRecord.solatium)}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Statutory Award Sanction Order:</label>
                    <textarea
                      defaultValue="Award determination sanctioned under Section 23 of RFCTLARR Act (2013). Authorized for electronic disbursement via PFMS."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-possession' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-slate-900">{selectedRecord.sector}</div>
                    <div><strong>Acquired Extent:</strong> {selectedRecord.area}</div>
                    <div><strong>Project Displaced Families:</strong> {selectedRecord.paf}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Section 38 Panchnama & Possession Certificate:</label>
                    <textarea
                      defaultValue="Physical possession certificate confirmed after 100% compensation disbursement. Revenue records updated with state alienation stamp."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-exception-intervene' && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-red-900 flex justify-between">
                      <span>Exception #{selectedRecord.id}</span>
                      <span className="font-bold text-red-700">{selectedRecord.severity}</span>
                    </div>
                    <div><strong>Category:</strong> {selectedRecord.category}</div>
                    <div><strong>Root Cause:</strong> {selectedRecord.rootCause}</div>
                    <div><strong>Days Overdue:</strong> {selectedRecord.overdueDays} Days</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Collector Executive Intervention Directive:</label>
                    <textarea
                      defaultValue="Priority fast-track resolution ordered. SDM / LAO instructed to resolve within 48 hours and submit compliance report."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'collector-escalation-decree' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-purple-900 flex justify-between">
                      <span>Escalation #{selectedRecord.id}</span>
                      <span>{selectedRecord.urgency}</span>
                    </div>
                    <div><strong>Referred By:</strong> {selectedRecord.referredBy}</div>
                    <div><strong>Contest:</strong> {selectedRecord.subject}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">District Collector Appellate Decree / Order:</label>
                    <textarea
                      defaultValue="Collectorate order passed under statutory supervisory powers. Directions issued to both authorities for immediate enforcement."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'pap-disburse' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-emerald-900 flex justify-between">
                      <span>{selectedRecord.id} • {selectedRecord.name}</span>
                      <span className="font-bold">{formatINR(selectedRecord.disbursementAmount)}</span>
                    </div>
                    <div><strong>Category:</strong> {selectedRecord.category}</div>
                    <div><strong>Survey Plot:</strong> Plot #{selectedRecord.surveyNumber} ({selectedRecord.village})</div>
                    <div><strong>Bank Account:</strong> {selectedRecord.bankName} (A/c: {selectedRecord.accountNumber})</div>
                    <div><strong>Aadhaar e-KYC:</strong> {selectedRecord.kycStatus} ({selectedRecord.aadhaar})</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Tehsildar / LAO Compensation Disbursement Directive:</label>
                    <textarea
                      defaultValue={`Direct Benefit Transfer of ${formatINR(selectedRecord.disbursementAmount)} approved under Section 23/30 of RFCTLARR Act (2013). Authorized for electronic credit dispatch via PFMS single window.`}
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'tehsildar-ror-verify' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-[#003178] flex justify-between">
                      <span>ULPIN: {selectedRecord.ulpin}</span>
                      <span>Plot #{selectedRecord.khasraNumber}</span>
                    </div>
                    <div><strong>Owner in RoR:</strong> {selectedRecord.ownerName} ({selectedRecord.village})</div>
                    <div><strong>Area Recorded:</strong> {selectedRecord.areaHectares} Hectares</div>
                    <div><strong>Encumbrance Search:</strong> {selectedRecord.encumbrance}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Tehsildar RoR Certification Remarks:</label>
                    <textarea
                      defaultValue="7/12 RoR extract verified against DILRMP digitized state land records. Title and boundaries certified for Section 19 declaration."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRecord.modal === 'tehsildar-mutation-sanction' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-slate-800 space-y-1">
                    <div className="font-bold text-emerald-900 flex justify-between">
                      <span>Mutation #{selectedRecord.mutationNo}</span>
                      <span>Plot #{selectedRecord.khasraNumber}</span>
                    </div>
                    <div><strong>Former Landowner:</strong> {selectedRecord.formerOwner} ({selectedRecord.village})</div>
                    <div><strong>Transferee Agency:</strong> {selectedRecord.transferee}</div>
                    <div><strong>Possession Panchnama:</strong> {selectedRecord.panchnamaDate}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">Revenue Court Tehsildar Mutation Sanction Order:</label>
                    <textarea
                      defaultValue="Mutation sanctioned under State Land Revenue Code. Record of Rights (7/12) updated to record title transfer in favor of Requisite Agency."
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded text-xs focus:border-[#0072BC] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActionSuccess(`Successfully verified and updated ${selectedRecord.ulpin || selectedRecord.id}!`);
                  setSelectedRecord(null);
                }}
                className="px-5 py-2 bg-[var(--color-gov-navy)] hover:bg-[var(--color-gov-navy-dark)] text-white text-xs font-bold rounded uppercase"
              >
                Confirm & Sign Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
