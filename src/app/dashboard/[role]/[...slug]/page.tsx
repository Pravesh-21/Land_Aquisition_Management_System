'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRole } from '../../../../contexts/RoleContext';
import DataGrid from '../../../../components/ui/DataGrid';
import KPICard from '../../../../components/ui/KPICard';
import StatusBadge, { getStatusVariant } from '../../../../components/ui/StatusBadge';
import { mockParcels, mockBeneficiaries, mockGrievances, mockForestClearances, formatINR } from '../../../../data/mockData';
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
