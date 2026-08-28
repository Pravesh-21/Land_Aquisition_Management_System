// ============================================
// BHU-DRISHTI Type Definitions
// ============================================

// --- Role-Based Access Control ---
export type UserRole = 
  | 'AGENCY'
  | 'LAO'
  | 'FOREST'
  | 'COLLECTOR'
  | 'TEHSILDAR'
  | 'CITIZEN';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  sidebarItems: SidebarItem[];
  user: MockUser;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface MockUser {
  name: string;
  designation: string;
  department: string;
  email?: string;
  avatar?: string;
  aadhaar?: string;
}

// --- Land Parcel ---
export interface LandParcel {
  id: string;
  ulpin: string;
  surveyNumber: string;
  khasraNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  area: number;
  areaUnit: 'hectares' | 'sqm';
  landCategory: 'Agricultural' | 'Commercial' | 'Residential' | 'Forest' | 'Barren' | 'Government';
  landSubType?: string;
  ownerName: string;
  ownerAadhaar: string;
  ownerAccount?: string;
  marketRate: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  geometry?: GeoJSON.Feature;
  riskScore: number;
  disputeFlag: boolean;
  forestProximity: boolean;
  multiOwner: boolean;
  religiousStructure: boolean;
  status: ParcelStatus;
  assetCount?: {
    structures: number;
    trees: number;
    wells: number;
    total: number;
  };
}

export type ParcelStatus = 
  | 'Identified'
  | 'Surveyed'
  | 'Notified'
  | 'Under Acquisition'
  | 'Award Declared'
  | 'Compensation Paid'
  | 'Possession Taken'
  | 'Disputed'
  | 'Court Stay';

// --- Project ---
export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  agency: string;
  district: string;
  state: string;
  corridorLength: number;
  bufferWidth: number;
  totalParcels: number;
  totalArea: number;
  estimatedCost: number;
  status: ProjectStatus;
  startDate: string;
  estimatedCompletion: string;
  milestones: Milestone[];
}

export type ProjectType = 
  | 'NHAI Highway'
  | 'Railways Corridor'
  | 'Dedicated Freight'
  | 'PWD Road'
  | 'NTPC Plant'
  | 'Industrial Development';

export type ProjectStatus = 
  | 'Draft'
  | 'Proposal Submitted'
  | 'Under Review'
  | 'SIA In Progress'
  | 'Section 11 Issued'
  | 'Section 19 Issued'
  | 'Award Declared'
  | 'Possession Phase'
  | 'Completed';

export interface Milestone {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  date?: string;
  description?: string;
}

// --- Workflow ---
export interface WorkflowStep {
  id: string;
  name: string;
  department: string;
  status: 'completed' | 'current' | 'pending' | 'escalated';
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  daysOverdue?: number;
  actions?: WorkflowAction[];
}

export interface WorkflowAction {
  id: string;
  label: string;
  type: 'approve' | 'reject' | 'escalate' | 'query' | 'sign';
  requiresOTP?: boolean;
}

// --- Compensation ---
export interface CompensationBreakdown {
  parcelId: string;
  baseLandValue: number;
  marketMultiplier: number;
  assetStructureValue: number;
  cropValue: number;
  treeValue: number;
  solatiumAmount: number;
  solatiumPercentage: number;
  interestAccrued: number;
  interestRate: number;
  totalAward: number;
  section26Reference: string;
  section29Reference: string;
  section30Reference: string;
  section80Reference: string;
  status: 'Calculated' | 'Under Review' | 'Approved' | 'Disbursed';
}

// --- Beneficiary ---
export interface Beneficiary {
  id: string;
  name: string;
  aadhaar: string;
  accountNumber: string;
  bankName: string;
  village: string;
  surveyNumber: string;
  kycStatus: 'Verified' | 'Pending' | 'Failed';
  disbursementAmount: number;
  disbursementStatus: 'Pending' | 'Processing' | 'Completed' | 'Failed';
}

// --- Grievance ---
export type GrievanceCategory = 'Valuation Dispute' | 'Boundary / Demarcation' | 'Compensation Delay' | 'Ownership / Title' | 'Procedural';

export interface Grievance {
  id: string;
  trackingId: string;
  category: GrievanceCategory;
  parcelId: string;
  subject: string;
  description: string;
  dateFiled: string;
  status: 'Pending Review' | 'Hearing Scheduled' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  latestUpdate: string;
  filedBy: string;
}

// --- Hearing ---
export interface Hearing {
  id: string;
  caseId: string;
  khasraNumber: string;
  village: string;
  tehsil: string;
  disputeType: string;
  applicant: PartyInfo;
  respondent: PartyInfo;
  presidingOfficer?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'Intake' | 'Verification' | 'Scheduling' | 'Hearing' | 'Resolution';
  evidence: EvidenceDocument[];
}

export interface PartyInfo {
  name: string;
  address: string;
  contact?: string;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  type: string;
  dateFiled: string;
  fileUrl?: string;
}

// --- Forest Clearance ---
export interface ForestClearance {
  id: string;
  proposalId: string;
  projectName: string;
  stage: 'Stage I' | 'Stage II' | 'Approved' | 'Rejected';
  forestArea: number;
  treeFellingEstimate: number;
  npvAmount: number;
  compensatoryAfforestation: number;
  intersections: ForestIntersection[];
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Conditions Applied';
}

export interface ForestIntersection {
  id: string;
  type: 'Critical' | 'Proximity' | 'Buffer';
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  areaImpacted: number;
  distance?: number;
  clearanceRequired?: string;
}

// --- AI/ML Types ---
export interface AssetDetection {
  id: string;
  parcelId: string;
  type: 'Building' | 'Shed' | 'Well' | 'Wall' | 'Road' | 'Tank';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  surfaceArea: number;
  estimatedValue: number;
}

export interface VegetationAnalysis {
  parcelId: string;
  cropCoverage: number;
  treeCanopyDensity: number;
  barrenPercentage: number;
  builtUpPercentage: number;
  waterPercentage: number;
  primaryCropType?: string;
  vegetationHealthIndex: number;
}

export interface RiskAssessment {
  parcelId: string;
  overallRiskScore: number;
  factors: {
    disputeHistory: number;
    forestProximity: number;
    multiOwnerComplexity: number;
    religiousStructures: number;
    encroachmentRisk: number;
    litigationHistory: number;
  };
  recommendation: 'Proceed' | 'Review Required' | 'Bypass Recommended';
}

// --- Notification ---
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// --- KPI ---
export interface KPIData {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: 'navy' | 'ochre' | 'green' | 'red' | 'tertiary';
}
