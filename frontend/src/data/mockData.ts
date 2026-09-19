import { LandParcel, Project, Beneficiary, Grievance, Hearing, ForestClearance, CompensationBreakdown, WorkflowStep, AssetDetection, VegetationAnalysis, RiskAssessment, AppNotification, KPIData } from '@/types';

// ============================================
// Mock Land Parcels (50 records)
// ============================================
export const mockParcels: LandParcel[] = [
  { id: 'P001', ulpin: 'IN-MH-440001-A12B', surveyNumber: '45/1', khasraNumber: '142/3', village: 'Ramgarh', tehsil: 'Sikar', district: 'Sikar', state: 'Rajasthan', area: 2.45, areaUnit: 'hectares', landCategory: 'Agricultural', landSubType: 'Irrigated', ownerName: 'Sh. Rameshwar Lal', ownerAadhaar: 'XXXX XXXX 4920', ownerAccount: '*4920', marketRate: 1800000, coordinates: { lat: 27.6, lng: 75.1 }, riskScore: 72, disputeFlag: true, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Under Acquisition', assetCount: { structures: 2, trees: 45, wells: 1, total: 48 } },
  { id: 'P002', ulpin: 'IN-MH-440001-C34D', surveyNumber: '45/2', khasraNumber: '143/1', village: 'Ramgarh', tehsil: 'Sikar', district: 'Sikar', state: 'Rajasthan', area: 1.10, areaUnit: 'hectares', landCategory: 'Government', ownerName: 'Govt. of Rajasthan', ownerAadhaar: 'N/A', marketRate: 0, coordinates: { lat: 27.61, lng: 75.11 }, riskScore: 5, disputeFlag: false, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Identified', assetCount: { structures: 0, trees: 12, wells: 0, total: 12 } },
  { id: 'P003', ulpin: 'IN-MH-440002-E56F', surveyNumber: '46', khasraNumber: '144/2', village: 'Kondagaon', tehsil: 'Sikar', district: 'Sikar', state: 'Rajasthan', area: 0.85, areaUnit: 'hectares', landCategory: 'Commercial', ownerName: 'M/s Sharma Enterprises', ownerAadhaar: 'XXXX XXXX 8112', ownerAccount: '*8112', marketRate: 14350000, coordinates: { lat: 27.62, lng: 75.12 }, riskScore: 45, disputeFlag: false, forestProximity: false, multiOwner: true, religiousStructure: false, status: 'Surveyed', assetCount: { structures: 3, trees: 6, wells: 1, total: 10 } },
  { id: 'P004', ulpin: 'IN-MH-440003-G78H', surveyNumber: '47/A', khasraNumber: '145/1', village: 'Shirpur', tehsil: 'Dhule', district: 'Dhule', state: 'Maharashtra', area: 3.20, areaUnit: 'hectares', landCategory: 'Agricultural', landSubType: 'Barani', ownerName: 'Ramesh Kumar', ownerAadhaar: 'XXXX XXXX 4920', ownerAccount: '*4920', marketRate: 2400000, coordinates: { lat: 21.35, lng: 74.88 }, riskScore: 25, disputeFlag: false, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Notified', assetCount: { structures: 1, trees: 28, wells: 2, total: 31 } },
  { id: 'P005', ulpin: 'IN-MH-440003-I90J', surveyNumber: '47/B', khasraNumber: '145/2', village: 'Shirpur', tehsil: 'Dhule', district: 'Dhule', state: 'Maharashtra', area: 1.80, areaUnit: 'hectares', landCategory: 'Agricultural', ownerName: 'Sunita Devi', ownerAadhaar: 'XXXX XXXX 8112', ownerAccount: '*8112', marketRate: 1350000, coordinates: { lat: 21.36, lng: 74.89 }, riskScore: 15, disputeFlag: false, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Award Declared', assetCount: { structures: 1, trees: 18, wells: 1, total: 20 } },
  { id: 'P006', ulpin: 'IN-KA-560001-K12L', surveyNumber: '48/1', khasraNumber: '150/1', village: 'Hubballi', tehsil: 'Dharwad', district: 'Dharwad', state: 'Karnataka', area: 4.50, areaUnit: 'hectares', landCategory: 'Forest', ownerName: 'Forest Department', ownerAadhaar: 'N/A', marketRate: 0, coordinates: { lat: 15.36, lng: 75.12 }, riskScore: 88, disputeFlag: false, forestProximity: true, multiOwner: false, religiousStructure: false, status: 'Identified', assetCount: { structures: 0, trees: 420, wells: 0, total: 420 } },
  { id: 'P007', ulpin: 'IN-KA-560001-M34N', surveyNumber: '49/2', khasraNumber: '151/A', village: 'Belgaum', tehsil: 'Belgaum', district: 'Belgaum', state: 'Karnataka', area: 0.65, areaUnit: 'hectares', landCategory: 'Residential', ownerName: 'Vikram Singh', ownerAadhaar: 'XXXX XXXX 3301', ownerAccount: '*3301', marketRate: 8500000, coordinates: { lat: 15.85, lng: 74.50 }, riskScore: 82, disputeFlag: true, forestProximity: false, multiOwner: true, religiousStructure: true, status: 'Disputed', assetCount: { structures: 2, trees: 8, wells: 1, total: 11 } },
  { id: 'P008', ulpin: 'IN-RJ-302001-O56P', surveyNumber: '50/3', khasraNumber: '160/B', village: 'Jaipur Rural', tehsil: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', area: 2.10, areaUnit: 'hectares', landCategory: 'Agricultural', ownerName: 'Priya Sharma', ownerAadhaar: 'XXXX XXXX 9901', ownerAccount: '*9901', marketRate: 3150000, coordinates: { lat: 26.92, lng: 75.78 }, riskScore: 30, disputeFlag: false, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Compensation Paid', assetCount: { structures: 1, trees: 34, wells: 1, total: 36 } },
  { id: 'P009', ulpin: 'IN-MP-462001-Q78R', surveyNumber: '51/1', khasraNumber: '170/1', village: 'Bhopal East', tehsil: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', area: 5.60, areaUnit: 'hectares', landCategory: 'Agricultural', landSubType: 'Irrigated', ownerName: 'Mohan Lal Verma', ownerAadhaar: 'XXXX XXXX 5567', ownerAccount: '*5567', marketRate: 4200000, coordinates: { lat: 23.26, lng: 77.41 }, riskScore: 40, disputeFlag: false, forestProximity: true, multiOwner: false, religiousStructure: false, status: 'Under Acquisition', assetCount: { structures: 2, trees: 62, wells: 3, total: 67 } },
  { id: 'P010', ulpin: 'IN-GJ-380001-S90T', surveyNumber: '52/A', khasraNumber: '180/2', village: 'Ahmedabad Rural', tehsil: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', area: 1.25, areaUnit: 'hectares', landCategory: 'Commercial', ownerName: 'Gujarat Industrial Corp.', ownerAadhaar: 'N/A', marketRate: 25000000, coordinates: { lat: 23.02, lng: 72.57 }, riskScore: 55, disputeFlag: false, forestProximity: false, multiOwner: true, religiousStructure: false, status: 'Surveyed', assetCount: { structures: 4, trees: 10, wells: 1, total: 15 } },
  { id: 'P011', ulpin: 'IN-MH-440004-U12V', surveyNumber: '53/1', khasraNumber: '190/1', village: 'Nagpur South', tehsil: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', area: 3.80, areaUnit: 'hectares', landCategory: 'Agricultural', ownerName: 'Suresh Patil', ownerAadhaar: 'XXXX XXXX 7789', ownerAccount: '*7789', marketRate: 5700000, coordinates: { lat: 21.10, lng: 79.05 }, riskScore: 20, disputeFlag: false, forestProximity: false, multiOwner: false, religiousStructure: false, status: 'Possession Taken', assetCount: { structures: 1, trees: 52, wells: 2, total: 55 } },
  { id: 'P012', ulpin: 'IN-TN-600001-W34X', surveyNumber: '54/2', khasraNumber: '200/A', village: 'Kanchipuram', tehsil: 'Kanchipuram', district: 'Kanchipuram', state: 'Tamil Nadu', area: 0.90, areaUnit: 'hectares', landCategory: 'Residential', ownerName: 'S. Ramanathan', ownerAadhaar: 'XXXX XXXX 1122', ownerAccount: '*1122', marketRate: 12000000, coordinates: { lat: 12.83, lng: 79.70 }, riskScore: 65, disputeFlag: true, forestProximity: false, multiOwner: false, religiousStructure: true, status: 'Court Stay', assetCount: { structures: 2, trees: 5, wells: 0, total: 7 } },
];

// ============================================
// Mock Projects
// ============================================
export const mockProjects: Project[] = [
  {
    id: 'PRJ-001', name: 'NH-44 Nagpur-Hyderabad Expressway Phase II', type: 'NHAI Highway', agency: 'NHAI',
    district: 'Nagpur', state: 'Maharashtra', corridorLength: 158, bufferWidth: 60, totalParcels: 342,
    totalArea: 485.6, estimatedCost: 245000000, status: 'Section 11 Issued', startDate: '2023-06-15',
    estimatedCompletion: '2025-12-31',
    milestones: [
      { id: 'M1', name: 'Preliminary Notification (Sec 4)', status: 'completed', date: '2023-06-15', description: 'Published in official gazette' },
      { id: 'M2', name: 'Social Impact Assessment', status: 'completed', date: '2023-09-20', description: 'SIA report approved by expert group' },
      { id: 'M3', name: 'Section 11 Declaration', status: 'completed', date: '2024-01-10', description: 'Declaration of intended acquisition' },
      { id: 'M4', name: 'Section 19 Declaration', status: 'in-progress', date: undefined, description: 'Awaiting District Collector approval' },
      { id: 'M5', name: 'Award under Section 23', status: 'pending', description: 'Compensation award determination' },
      { id: 'M6', name: 'Possession under Section 38', status: 'pending', description: 'Taking of physical possession' },
    ],
  },
  {
    id: 'PRJ-002', name: 'Delhi-Varanasi HSR Corridor', type: 'Railways Corridor', agency: 'Indian Railways',
    district: 'Multiple', state: 'Uttar Pradesh', corridorLength: 865, bufferWidth: 100, totalParcels: 1280,
    totalArea: 2340.2, estimatedCost: 1800000000, status: 'SIA In Progress', startDate: '2024-01-20',
    estimatedCompletion: '2028-06-30',
    milestones: [
      { id: 'M1', name: 'Preliminary Notification', status: 'completed', date: '2024-01-20' },
      { id: 'M2', name: 'Social Impact Assessment', status: 'in-progress' },
      { id: 'M3', name: 'Section 11 Declaration', status: 'pending' },
      { id: 'M4', name: 'Section 19 Declaration', status: 'pending' },
      { id: 'M5', name: 'Award', status: 'pending' },
      { id: 'M6', name: 'Possession', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-003', name: 'Dedicated Freight Corridor - Western Segment', type: 'Dedicated Freight', agency: 'DFCCIL',
    district: 'Surat', state: 'Gujarat', corridorLength: 340, bufferWidth: 80, totalParcels: 890,
    totalArea: 1120.8, estimatedCost: 680000000, status: 'Under Review', startDate: '2024-04-01',
    estimatedCompletion: '2027-03-31',
    milestones: [
      { id: 'M1', name: 'Preliminary Notification', status: 'completed', date: '2024-04-01' },
      { id: 'M2', name: 'Social Impact Assessment', status: 'pending' },
      { id: 'M3', name: 'Section 11 Declaration', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-004', name: 'NTPC Singrauli Expansion Zone', type: 'NTPC Plant', agency: 'NTPC Ltd.',
    district: 'Singrauli', state: 'Madhya Pradesh', corridorLength: 0, bufferWidth: 200, totalParcels: 156,
    totalArea: 320.5, estimatedCost: 450000000, status: 'Award Declared', startDate: '2022-11-01',
    estimatedCompletion: '2024-12-31',
    milestones: [
      { id: 'M1', name: 'Preliminary Notification', status: 'completed', date: '2022-11-01' },
      { id: 'M2', name: 'Social Impact Assessment', status: 'completed', date: '2023-02-15' },
      { id: 'M3', name: 'Section 11 Declaration', status: 'completed', date: '2023-06-20' },
      { id: 'M4', name: 'Section 19 Declaration', status: 'completed', date: '2023-10-05' },
      { id: 'M5', name: 'Award', status: 'completed', date: '2024-03-12' },
      { id: 'M6', name: 'Possession', status: 'in-progress' },
    ],
  },
  {
    id: 'PRJ-005', name: 'PWD State Highway SH-17 Widening', type: 'PWD Road', agency: 'PWD Maharashtra',
    district: 'Pune', state: 'Maharashtra', corridorLength: 45, bufferWidth: 45, totalParcels: 210,
    totalArea: 98.3, estimatedCost: 120000000, status: 'Proposal Submitted', startDate: '2024-07-10',
    estimatedCompletion: '2026-09-30',
    milestones: [
      { id: 'M1', name: 'Preliminary Notification', status: 'in-progress' },
      { id: 'M2', name: 'Social Impact Assessment', status: 'pending' },
    ],
  },
];

// ============================================
// Mock Beneficiaries & Project Affected Persons (PAP/PAF)
// ============================================
export const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'PAF-MH-84920',
    name: 'Sh. Rajendra Patel',
    category: 'Title-Holder Landowner (100% Share)',
    aadhaar: 'XXXX XXXX 4920',
    accountNumber: '*4920',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0001842',
    village: 'Hingna, Nagpur',
    surveyNumber: '442/1-A',
    kycStatus: 'Verified',
    baseLandValue: 2000000,
    solatiumAmount: 2000000,
    assetAmount: 738500,
    rrGrant: 0,
    familyMembers: 4,
    disbursementAmount: 4738500,
    disbursementStatus: 'Sanctioned',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84921',
    name: 'Sh. Rameshwar Lal',
    category: 'Title-Holder (Joint Co-owner)',
    aadhaar: 'XXXX XXXX 8112',
    accountNumber: '*8112',
    bankName: 'Punjab National Bank',
    ifsc: 'PUNB0123400',
    village: 'Ramgarh',
    surveyNumber: '142/3',
    kycStatus: 'Verified',
    baseLandValue: 850000,
    solatiumAmount: 850000,
    assetAmount: 300000,
    rrGrant: 0,
    familyMembers: 5,
    disbursementAmount: 2000000,
    disbursementStatus: 'Processing',
    panchnamaStatus: 'Under Joint Survey',
  },
  {
    id: 'PAF-MH-84922',
    name: 'Smt. Sunita Devi',
    category: 'Agricultural Tenant Farmer',
    aadhaar: 'XXXX XXXX 3301',
    accountNumber: '*3301',
    bankName: 'Bank of India',
    ifsc: 'BKID0008810',
    village: 'Kondagaon',
    surveyNumber: '46',
    kycStatus: 'Verified',
    baseLandValue: 350000,
    solatiumAmount: 350000,
    assetAmount: 125000,
    rrGrant: 50000,
    familyMembers: 3,
    disbursementAmount: 875000,
    disbursementStatus: 'Disbursed',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84923',
    name: 'Sh. Vikram Singh Rathore',
    category: 'Landless Agricultural Laborer (Vulnerable)',
    aadhaar: 'XXXX XXXX 9901',
    accountNumber: '*9901',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0004912',
    village: 'Wanadongri',
    surveyNumber: '445/1',
    kycStatus: 'Pending',
    baseLandValue: 0,
    solatiumAmount: 0,
    assetAmount: 60000,
    rrGrant: 450000,
    familyMembers: 6,
    disbursementAmount: 510000,
    disbursementStatus: 'Pending',
    panchnamaStatus: 'Pending',
  },
  {
    id: 'PAF-MH-84924',
    name: 'M/s Sharma Agro Enterprises',
    category: 'Commercial Establishment Owner',
    aadhaar: 'XXXX XXXX 5567',
    accountNumber: '*5567',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0004520',
    village: 'Butibori',
    surveyNumber: '450/2-A',
    kycStatus: 'Verified',
    baseLandValue: 4200000,
    solatiumAmount: 4200000,
    assetAmount: 1400000,
    rrGrant: 0,
    familyMembers: 2,
    disbursementAmount: 9800000,
    disbursementStatus: 'Sanctioned',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84925',
    name: 'Sh. Suresh Tukaram Patil',
    category: 'Title-Holder Landowner (Irrigated)',
    aadhaar: 'XXXX XXXX 7789',
    accountNumber: '*7789',
    bankName: 'Bank of Maharashtra',
    ifsc: 'MAHB0000412',
    village: 'Karanja',
    surveyNumber: '448/3',
    kycStatus: 'Verified',
    baseLandValue: 3200000,
    solatiumAmount: 3200000,
    assetAmount: 1000000,
    rrGrant: 0,
    familyMembers: 4,
    disbursementAmount: 7400000,
    disbursementStatus: 'Processing',
    panchnamaStatus: 'Scheduled',
  },
  {
    id: 'PAF-MH-84926',
    name: 'Smt. Geeta Devi & Legal Heirs',
    category: 'Legal Successor Beneficiary',
    aadhaar: 'XXXX XXXX 2244',
    accountNumber: '*2244',
    bankName: 'UCO Bank',
    ifsc: 'UCBA0000982',
    village: 'Ramgarh',
    surveyNumber: '142/3-B',
    kycStatus: 'Verified',
    baseLandValue: 750000,
    solatiumAmount: 750000,
    assetAmount: 300000,
    rrGrant: 0,
    familyMembers: 4,
    disbursementAmount: 1800000,
    disbursementStatus: 'Processing',
    panchnamaStatus: 'Under Joint Survey',
  },
  {
    id: 'PAF-MH-84927',
    name: 'Sh. Baldev Singh Dhillon',
    category: 'Title-Holder Landowner (Horticulture)',
    aadhaar: 'XXXX XXXX 6677',
    accountNumber: '*6677',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0003310',
    village: 'Jaipur Rural',
    surveyNumber: '50/3',
    kycStatus: 'Verified',
    baseLandValue: 2400000,
    solatiumAmount: 2400000,
    assetAmount: 850000,
    rrGrant: 0,
    familyMembers: 5,
    disbursementAmount: 5650000,
    disbursementStatus: 'Disbursed',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84928',
    name: 'Sh. Prabhakar Rao Deshmukh',
    category: 'Title-Holder Landowner',
    aadhaar: 'XXXX XXXX 1092',
    accountNumber: '*1092',
    bankName: 'Canara Bank',
    ifsc: 'CNRB0002100',
    village: 'Wanadongri',
    surveyNumber: '445/2',
    kycStatus: 'Verified',
    baseLandValue: 1800000,
    solatiumAmount: 1800000,
    assetAmount: 450000,
    rrGrant: 0,
    familyMembers: 3,
    disbursementAmount: 4050000,
    disbursementStatus: 'Sanctioned',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84929',
    name: 'Smt. Shakuntala Bai Gond',
    category: 'Forest Dweller / Tribal Rights Holder (FRA 2006)',
    aadhaar: 'XXXX XXXX 4158',
    accountNumber: '*4158',
    bankName: 'Bank of India',
    ifsc: 'BKID0007720',
    village: 'Karanja Buffer Zone',
    surveyNumber: '448/4-F',
    kycStatus: 'Verified',
    baseLandValue: 600000,
    solatiumAmount: 600000,
    assetAmount: 220000,
    rrGrant: 280000,
    familyMembers: 5,
    disbursementAmount: 1700000,
    disbursementStatus: 'Processing',
    panchnamaStatus: 'Scheduled',
  },
  {
    id: 'PAF-MH-84930',
    name: 'Sh. Mohan Lal Verma',
    category: 'Project Displaced Family (PDF)',
    aadhaar: 'XXXX XXXX 5568',
    accountNumber: '*5568',
    bankName: 'Union Bank of India',
    ifsc: 'UBIN0532100',
    village: 'Hingna East',
    surveyNumber: '442/2',
    kycStatus: 'Verified',
    baseLandValue: 1400000,
    solatiumAmount: 1400000,
    assetAmount: 350000,
    rrGrant: 500000,
    familyMembers: 4,
    disbursementAmount: 3650000,
    disbursementStatus: 'Disbursed',
    panchnamaStatus: 'Completed',
  },
  {
    id: 'PAF-MH-84931',
    name: 'Sh. Tukaram Shinde',
    category: 'Small & Marginal Farmer',
    aadhaar: 'XXXX XXXX 9012',
    accountNumber: '*9012',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0001842',
    village: 'Shirpur',
    surveyNumber: '45-B',
    kycStatus: 'Verified',
    baseLandValue: 950000,
    solatiumAmount: 950000,
    assetAmount: 280000,
    rrGrant: 0,
    familyMembers: 3,
    disbursementAmount: 2180000,
    disbursementStatus: 'Processing',
    panchnamaStatus: 'Under Joint Survey',
  },
];

// ============================================
// Mock Grievances
// ============================================
export const mockGrievances: Grievance[] = [
  { id: 'G001', trackingId: 'GRV-8832-A', category: 'Valuation Dispute', parcelId: 'P001', subject: 'Market rate undervaluation', description: 'The market rate applied is below the circle rate as per DLC 2023 records.', dateFiled: '2023-10-12', status: 'Pending Review', latestUpdate: 'Assigned to Magistrate. Awaiting hearing date.', filedBy: 'Sh. Rameshwar Lal' },
  { id: 'G002', trackingId: 'GRV-7104-B', category: 'Boundary / Demarcation', parcelId: 'P003', subject: 'Boundary overlap with adjacent plot', description: 'The eastern boundary as demarcated does not match the registered patwari map.', dateFiled: '2023-09-28', status: 'Hearing Scheduled', latestUpdate: 'Hearing scheduled Nov 5, 10:00 AM at Circle Office', filedBy: 'M/s Sharma Enterprises' },
  { id: 'G003', trackingId: 'GRV-6591-C', category: 'Compensation Delay', parcelId: 'P005', subject: 'Delayed disbursement of compensation', description: 'Award was declared 6 months ago but funds have not been disbursed to registered bank account.', dateFiled: '2023-08-05', status: 'Resolved', latestUpdate: 'Funds disbursed to registered account on Oct 20.', filedBy: 'Sunita Devi' },
  { id: 'G004', trackingId: 'GRV-5210-D', category: 'Ownership / Title', parcelId: 'P007', subject: 'Disputed ownership claim', description: 'Multiple claimants on the property. Inheritance dispute pending in civil court.', dateFiled: '2023-07-12', status: 'Dismissed', latestUpdate: 'Insufficient evidence. See form for appeal details.', filedBy: 'Vikram Singh' },
];

// ============================================
// Mock Hearings
// ============================================
export const mockHearings: Hearing[] = [
  {
    id: 'H001', caseId: 'RJ-2023-8842', khasraNumber: '142/3', village: 'Ramgarh', tehsil: 'Sikar',
    disputeType: 'Title Dispute',
    applicant: { name: 'Sh. Rameshwar Lal', address: 'Ward 4, Ramgarh' },
    respondent: { name: 'Smt. Geeta Devi', address: 'Ward 7, Ramgarh' },
    presidingOfficer: 'Shri. Vikram Singh (Tehsildar)',
    scheduledDate: '2023-11-14', scheduledTime: '01:00 PM',
    status: 'Scheduling',
    evidence: [
      { id: 'E1', title: 'Original Sale Deed (1998)', type: 'Legal Document', dateFiled: '2023-10-12' },
      { id: 'E2', title: 'Registered Patwari Map', type: 'Map', dateFiled: '2023-10-15' },
      { id: 'E3', title: 'Affidavit (Applicant)', type: 'Affidavit', dateFiled: '2023-10-15' },
    ],
  },
  {
    id: 'H002', caseId: 'MH-2023-1104', khasraNumber: '46', village: 'Kondagaon', tehsil: 'Sikar',
    disputeType: 'Boundary Dispute',
    applicant: { name: 'M/s Sharma Enterprises', address: 'Main Market, Kondagaon' },
    respondent: { name: 'Sh. Ramesh Yadav', address: 'Ward 2, Kondagaon' },
    status: 'Hearing',
    evidence: [
      { id: 'E4', title: 'Survey Map 2022', type: 'Map', dateFiled: '2023-09-28' },
      { id: 'E5', title: 'Mutation Register Extract', type: 'Government Record', dateFiled: '2023-10-01' },
    ],
  },
];

// ============================================
// Mock Forest Clearances
// ============================================
export const mockForestClearances: ForestClearance[] = [
  {
    id: 'FC001', proposalId: 'PR/MH/FOR/12849/2023', projectName: 'NH-44 Phase II Alignment',
    stage: 'Stage II', forestArea: 14.2, treeFellingEstimate: 1250, npvAmount: 452000000,
    compensatoryAfforestation: 28.4,
    intersections: [
      { id: 'FI1', type: 'Critical', severity: 'High', title: '2.4km through Wildlife Sanctuary', description: 'Alignment crosses Core Zone (Compartment 42-B). Significant fragmentation risk identified.', areaImpacted: 14.2, clearanceRequired: 'NBWL Approval' },
      { id: 'FI2', type: 'Proximity', severity: 'Medium', title: 'Eco-Sensitive Zone Border', description: 'Alignment runs within 500m of the buffer zone for 4.1km.', areaImpacted: 8.5, distance: 320, clearanceRequired: 'NBWL Approval' },
    ],
    status: 'Under Review',
  },
];

// ============================================
// Mock Compensation Breakdowns
// ============================================
export const mockCompensations: CompensationBreakdown[] = [
  {
    parcelId: 'P001', baseLandValue: 2000000, marketMultiplier: 1.5, assetStructureValue: 500000,
    cropValue: 150000, treeValue: 75000, solatiumAmount: 1500000, solatiumPercentage: 100,
    interestAccrued: 250000, interestRate: 12, totalAward: 4250000,
    section26Reference: 'Section 26(1)', section29Reference: 'Section 29(1)',
    section30Reference: 'Section 30(1)', section80Reference: 'Section 80',
    status: 'Disbursed',
  },
  {
    parcelId: 'P004', baseLandValue: 3600000, marketMultiplier: 1.5, assetStructureValue: 800000,
    cropValue: 200000, treeValue: 100000, solatiumAmount: 2700000, solatiumPercentage: 100,
    interestAccrued: 0, interestRate: 12, totalAward: 7400000,
    section26Reference: 'Section 26(1)', section29Reference: 'Section 29(1)',
    section30Reference: 'Section 30(1)', section80Reference: 'Section 80',
    status: 'Approved',
  },
];

// ============================================
// Mock Workflow Steps
// ============================================
export const mockWorkflowSteps: WorkflowStep[] = [
  { id: 'WF1', name: 'Requisite Agency Submission', department: 'NHAI', status: 'completed', assignee: 'Sh. Jagdish Deshmukh', startDate: '2023-06-15', completedDate: '2023-06-20' },
  { id: 'WF2', name: 'LAO Verification & Survey', department: 'Revenue Dept.', status: 'completed', assignee: 'Smt. Meera Kulkarni', startDate: '2023-06-22', completedDate: '2023-08-15' },
  { id: 'WF3', name: 'Forest Department Clearance', department: 'MoEFCC', status: 'current', assignee: 'Dr. Anil Sharma', startDate: '2023-08-18', dueDate: '2023-11-18', daysOverdue: 0 },
  { id: 'WF4', name: 'Revenue Court Hearing', department: 'Revenue Court', status: 'pending', dueDate: '2024-01-15' },
  { id: 'WF5', name: 'District Collector Approval', department: 'District Admin', status: 'pending', dueDate: '2024-03-15' },
];

// ============================================
// Mock Asset Detections (YOLO)
// ============================================
export const mockAssetDetections: AssetDetection[] = [
  { id: 'AD1', parcelId: 'P001', type: 'Building', confidence: 0.94, boundingBox: { x: 120, y: 80, width: 45, height: 35, rotation: 15 }, surfaceArea: 1575, estimatedValue: 350000 },
  { id: 'AD2', parcelId: 'P001', type: 'Shed', confidence: 0.87, boundingBox: { x: 200, y: 150, width: 25, height: 20, rotation: -5 }, surfaceArea: 500, estimatedValue: 75000 },
  { id: 'AD3', parcelId: 'P001', type: 'Well', confidence: 0.91, boundingBox: { x: 300, y: 100, width: 8, height: 8, rotation: 0 }, surfaceArea: 50, estimatedValue: 120000 },
  { id: 'AD4', parcelId: 'P004', type: 'Building', confidence: 0.96, boundingBox: { x: 150, y: 90, width: 60, height: 40, rotation: 22 }, surfaceArea: 2400, estimatedValue: 680000 },
  { id: 'AD5', parcelId: 'P004', type: 'Wall', confidence: 0.82, boundingBox: { x: 50, y: 200, width: 180, height: 3, rotation: 0 }, surfaceArea: 540, estimatedValue: 45000 },
];

// ============================================
// Mock Vegetation Analysis (OpenCV)
// ============================================
export const mockVegetationData: VegetationAnalysis[] = [
  { parcelId: 'P001', cropCoverage: 62.5, treeCanopyDensity: 15.3, barrenPercentage: 12.2, builtUpPercentage: 8.5, waterPercentage: 1.5, primaryCropType: 'Wheat (Rabi)', vegetationHealthIndex: 0.72 },
  { parcelId: 'P004', cropCoverage: 78.2, treeCanopyDensity: 5.1, barrenPercentage: 8.7, builtUpPercentage: 6.5, waterPercentage: 1.5, primaryCropType: 'Cotton (Kharif)', vegetationHealthIndex: 0.81 },
  { parcelId: 'P009', cropCoverage: 85.0, treeCanopyDensity: 8.0, barrenPercentage: 3.5, builtUpPercentage: 2.0, waterPercentage: 1.5, primaryCropType: 'Soybean', vegetationHealthIndex: 0.88 },
];

// ============================================
// Mock Risk Assessments (XGBoost)
// ============================================
export const mockRiskAssessments: RiskAssessment[] = [
  { parcelId: 'P001', overallRiskScore: 72, factors: { disputeHistory: 85, forestProximity: 10, multiOwnerComplexity: 20, religiousStructures: 0, encroachmentRisk: 45, litigationHistory: 90 }, recommendation: 'Review Required' },
  { parcelId: 'P006', overallRiskScore: 88, factors: { disputeHistory: 15, forestProximity: 95, multiOwnerComplexity: 5, religiousStructures: 0, encroachmentRisk: 10, litigationHistory: 20 }, recommendation: 'Bypass Recommended' },
  { parcelId: 'P007', overallRiskScore: 82, factors: { disputeHistory: 70, forestProximity: 5, multiOwnerComplexity: 80, religiousStructures: 95, encroachmentRisk: 60, litigationHistory: 75 }, recommendation: 'Bypass Recommended' },
  { parcelId: 'P003', overallRiskScore: 45, factors: { disputeHistory: 30, forestProximity: 5, multiOwnerComplexity: 65, religiousStructures: 0, encroachmentRisk: 40, litigationHistory: 25 }, recommendation: 'Review Required' },
  { parcelId: 'P004', overallRiskScore: 25, factors: { disputeHistory: 10, forestProximity: 15, multiOwnerComplexity: 5, religiousStructures: 0, encroachmentRisk: 20, litigationHistory: 10 }, recommendation: 'Proceed' },
];

// ============================================
// Mock Notifications
// ============================================
export const mockNotifications: AppNotification[] = [
  { id: 'N1', title: 'Document Verification Complete', message: 'Your documents for AP-8842 have been successfully verified by the regional office.', type: 'success', timestamp: '2 hours ago', read: false, actionUrl: '/dashboard/citizen/status' },
  { id: 'N2', title: 'Public Hearing Scheduled', message: 'A public hearing for Zone B expansion is scheduled for next Tuesday at 10:00 AM.', type: 'info', timestamp: '1 day ago', read: false },
  { id: 'N3', title: 'Compensation Award Approved', message: 'Your compensation for Parcel #442 has been approved. Awaiting disbursement.', type: 'success', timestamp: '3 days ago', read: true },
  { id: 'N4', title: 'Forest Clearance Pending', message: 'Stage II clearance for NH-44 alignment requires additional documentation.', type: 'warning', timestamp: '5 days ago', read: true },
  { id: 'N5', title: 'Escalation Alert', message: 'Case RJ-2023-8842 has exceeded 15-day statutory limit. Auto-escalated to SDM.', type: 'error', timestamp: '1 week ago', read: true },
];

// ============================================
// Utility: Format Currency
// ============================================
export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)} L`;
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
