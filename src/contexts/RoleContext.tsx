'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { UserRole, RoleConfig, SidebarItem, MockUser } from '@/types';

// ============================================
// Role Configuration — All 6 Dashboards
// ============================================

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  AGENCY: {
    id: 'AGENCY',
    label: 'Requisite Agency',
    shortLabel: 'NHAI / Railways',
    icon: 'domain',
    description: 'Corridor drawing, WebGIS spatial mapping, ULPIN vector intersection',
    user: {
      name: 'Sh. Jagdish Deshmukh',
      designation: 'Project Director',
      department: 'NHAI - PIU Nagpur',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard/agency' },
      { id: 'registration', label: 'Project Registration', icon: 'app_registration', href: '/dashboard/agency/registration' },
      { id: 'corridor', label: 'Corridor Definition', icon: 'route', href: '/dashboard/agency/corridor' },
      { id: 'assessment', label: 'Land Assessment', icon: 'assessment', href: '/dashboard/agency/assessment' },
      { id: 'proposal', label: 'Proposal Submission', icon: 'send', href: '/dashboard/agency/proposal' },
      { id: 'documents', label: 'Document Management', icon: 'folder_open', href: '/dashboard/agency/documents' },
      { id: 'tracking', label: 'Status Tracking', icon: 'track_changes', href: '/dashboard/agency/tracking' },
      { id: 'queries', label: 'Respond to Queries', icon: 'question_answer', href: '/dashboard/agency/queries' },
      { id: 'parcels', label: 'Parcel Monitoring', icon: 'grid_view', href: '/dashboard/agency/parcels' },
      { id: 'progress', label: 'Progress Dashboard', icon: 'trending_up', href: '/dashboard/agency/progress' },
      { id: 'milestones', label: 'Milestones & Timeline', icon: 'flag', href: '/dashboard/agency/milestones' },
      { id: 'coordination', label: 'Inter-Dept Coordination', icon: 'hub', href: '/dashboard/agency/coordination' },
      { id: 'risk', label: 'Risk Scoring (ML)', icon: 'warning', href: '/dashboard/agency/risk' },
      { id: 'optimize', label: 'Route Optimization', icon: 'alt_route', href: '/dashboard/agency/optimize' },
      { id: 'reports', label: 'Project Reports', icon: 'analytics', href: '/dashboard/agency/reports' },
    ],
  },
  LAO: {
    id: 'LAO',
    label: 'Land Acquisition Officer',
    shortLabel: 'LAO',
    icon: 'person_search',
    description: 'Asset verification, surveyor data, inventory validation',
    user: {
      name: 'Smt. Meera Kulkarni',
      designation: 'Land Acquisition Officer',
      department: 'Revenue Dept. - Pune Division',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Assigned Cases', icon: 'dashboard', href: '/dashboard/lao' },
      { id: 'parcel-verify', label: 'Parcel Verification', icon: 'verified', href: '/dashboard/lao/parcel-verification' },
      { id: 'doc-verify', label: 'Document Verification', icon: 'fact_check', href: '/dashboard/lao/document-verification' },
      { id: 'field-survey', label: 'Field Survey Review', icon: 'explore', href: '/dashboard/lao/field-survey' },
      { id: 'ai-audit', label: 'AI Asset Verification', icon: 'smart_toy', href: '/dashboard/lao/ai-audit' },
      { id: 'vegetation', label: 'Vegetation Analysis', icon: 'eco', href: '/dashboard/lao/vegetation' },
      { id: 'land-validate', label: 'Land Record Validation', icon: 'checklist', href: '/dashboard/lao/land-validation' },
      { id: 'objection', label: 'Objection Processing', icon: 'report_problem', href: '/dashboard/lao/objection-processing' },
      { id: 'hearing', label: 'Hearing Management', icon: 'gavel', href: '/dashboard/lao/hearing-management' },
      { id: 'compensation', label: 'Compensation Processing', icon: 'payments', href: '/dashboard/lao/compensation' },
      { id: 'award', label: 'Award Preparation', icon: 'military_tech', href: '/dashboard/lao/award-preparation' },
      { id: 'payment', label: 'Payment Monitoring', icon: 'account_balance_wallet', href: '/dashboard/lao/payment-monitoring' },
      { id: 'beneficiaries', label: 'DBT Disbursement', icon: 'currency_rupee', href: '/dashboard/lao/beneficiaries' },
      { id: 'mutation', label: 'Mutation / Possession', icon: 'swap_horiz', href: '/dashboard/lao/mutation' },
      { id: 'notes', label: 'Case Notes', icon: 'note', href: '/dashboard/lao/notes' },
      { id: 'evidence', label: 'Evidence Management', icon: 'attachment', href: '/dashboard/lao/evidence' },
    ],
  },
  FOREST: {
    id: 'FOREST',
    label: 'Forest & Environment Officer',
    shortLabel: 'Forest / Env.',
    icon: 'forest',
    description: 'Ecological boundary, forest clearance NOC, environmental risk',
    user: {
      name: 'Dr. Anil Sharma',
      designation: 'Divisional Forest Officer',
      department: 'MoEFCC - Western Region',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Clearance Dashboard', icon: 'dashboard', href: '/dashboard/forest' },
      { id: 'gis-review', label: 'Project & GIS Review', icon: 'map', href: '/dashboard/forest/gis-review' },
      { id: 'doc-review', label: 'Document Review', icon: 'description', href: '/dashboard/forest/document-review' },
      { id: 'impact', label: 'Environmental Impact', icon: 'eco', href: '/dashboard/forest/impact-review' },
      { id: 'intersection', label: 'Spatial Overlay Review', icon: 'layers', href: '/dashboard/forest/intersection' },
      { id: 'additional-info', label: 'Additional Info Request', icon: 'info', href: '/dashboard/forest/additional-info' },
      { id: 'noc', label: 'Clearance / NOC Process', icon: 'task_alt', href: '/dashboard/forest/noc-processing' },
      { id: 'issues', label: 'Issue / Objection Flag', icon: 'flag', href: '/dashboard/forest/issues' },
      { id: 'conditions', label: 'Clearance Conditions', icon: 'rule', href: '/dashboard/forest/conditions' },
      { id: 'tracking', label: 'Status Tracking', icon: 'track_changes', href: '/dashboard/forest/tracking' },
      { id: 'audit', label: 'Audit & Doc History', icon: 'history', href: '/dashboard/forest/audit' },
    ],
  },
  COLLECTOR: {
    id: 'COLLECTOR',
    label: 'District Collector',
    shortLabel: 'Collector',
    icon: 'account_balance',
    description: 'Executive overview, statutory approvals, award sanctioning',
    user: {
      name: 'Sh. Ramesh Kumar, IAS',
      designation: 'District Collector',
      department: 'District Administration - Nagpur',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Acquisition Dashboard', icon: 'dashboard', href: '/dashboard/collector' },
      { id: 'proposal', label: 'Proposal Review', icon: 'rate_review', href: '/dashboard/collector/proposal-review' },
      { id: 'parcels', label: 'Land & Parcel Overview', icon: 'landscape', href: '/dashboard/collector/parcels' },
      { id: 'notifications', label: 'Notification Management', icon: 'notifications', href: '/dashboard/collector/notifications' },
      { id: 'objections', label: 'Objection Management', icon: 'report_problem', href: '/dashboard/collector/objections' },
      { id: 'hearings', label: 'Hearing & Inquiry', icon: 'gavel', href: '/dashboard/collector/hearings' },
      { id: 'decisions', label: 'Objection Decision', icon: 'check_circle', href: '/dashboard/collector/decisions' },
      { id: 'approvals', label: 'e-Sign Approvals', icon: 'verified', href: '/dashboard/collector/approvals' },
      { id: 'awards', label: 'Award Monitoring', icon: 'military_tech', href: '/dashboard/collector/awards' },
      { id: 'compensation', label: 'Compensation Monitoring', icon: 'payments', href: '/dashboard/collector/compensation' },
      { id: 'rnr', label: 'R&R Monitoring', icon: 'home_work', href: '/dashboard/collector/rnr' },
      { id: 'possession', label: 'Possession Monitoring', icon: 'real_estate_agent', href: '/dashboard/collector/possession' },
      { id: 'workflow', label: 'Workflow Pipeline', icon: 'schema', href: '/dashboard/collector/workflow' },
      { id: 'delays', label: 'Delay & Exception', icon: 'timer_off', href: '/dashboard/collector/delays' },
      { id: 'reports', label: 'District Reports', icon: 'analytics', href: '/dashboard/collector/reports' },
      { id: 'audit', label: 'Audit Trail', icon: 'history', href: '/dashboard/collector/audit' },
    ],
  },
  TEHSILDAR: {
    id: 'TEHSILDAR',
    label: 'Revenue Court / Tehsildar',
    shortLabel: 'Tehsildar',
    icon: 'balance',
    description: 'Digital hearing, dispute resolution, court stay logging',
    user: {
      name: 'Sh. Vikram Singh',
      designation: 'Tehsildar',
      department: 'Revenue Court - Sikar Tehsil',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard/tehsildar' },
      { id: 'hearings', label: 'Hearing Schedule', icon: 'event', href: '/dashboard/tehsildar/hearings' },
      { id: 'hearing-manager', label: 'Hearing Manager', icon: 'gavel', href: '/dashboard/tehsildar/hearing-manager' },
      { id: 'disputes', label: 'Dispute Cases', icon: 'folder_open', href: '/dashboard/tehsildar/disputes' },
      { id: 'citizen-disputes', label: 'Citizen Disputes', icon: 'people', href: '/dashboard/tehsildar/citizen-disputes' },
      { id: 'boundary', label: 'Boundary Conflicts', icon: 'crop_free', href: '/dashboard/tehsildar/boundary' },
      { id: 'court-stays', label: 'Court Stay Log', icon: 'book', href: '/dashboard/tehsildar/court-stays' },
      { id: 'case-mgmt', label: 'Case Management', icon: 'work', href: '/dashboard/tehsildar/case-management' },
      { id: 'resolution', label: 'Resolution Tracking', icon: 'task_alt', href: '/dashboard/tehsildar/resolution' },
    ],
  },
  CITIZEN: {
    id: 'CITIZEN',
    label: 'Landowner / Citizen G2C',
    shortLabel: 'Citizen Portal',
    icon: 'person',
    description: 'Aadhaar-authenticated, compensation tracking, objection filing',
    user: {
      name: 'Sh. Rajendra Patel',
      designation: 'Landowner',
      department: 'Citizen',
      aadhaar: 'XXXX XXXX 4920',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard/citizen' },
      { id: 'land-records', label: 'Land Records', icon: 'landscape', href: '/dashboard/citizen/land-records' },
      { id: 'status', label: 'Acquisition Status', icon: 'query_stats', href: '/dashboard/citizen/status' },
      { id: 'timeline', label: 'Timeline', icon: 'timeline', href: '/dashboard/citizen/timeline' },
      { id: 'compensation', label: 'Compensation', icon: 'payments', href: '/dashboard/citizen/compensation' },
      { id: 'documents', label: 'Documents', icon: 'folder_open', href: '/dashboard/citizen/documents' },
      { id: 'grievances', label: 'Grievances', icon: 'gavel', href: '/dashboard/citizen/grievances' },
      { id: 'map', label: 'Map View', icon: 'map', href: '/dashboard/citizen/map' },
    ],
  },
};

const ROLE_ORDER: UserRole[] = ['AGENCY', 'LAO', 'FOREST', 'COLLECTOR', 'TEHSILDAR', 'CITIZEN'];

// ============================================
// Context
// ============================================

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  roleConfig: RoleConfig;
  allRoles: UserRole[];
  allRoleConfigs: Record<UserRole, RoleConfig>;
  activeSidebarItem: string;
  setActiveSidebarItem: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>('AGENCY');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('dashboard');

  useEffect(() => {
    if (pathname) {
      const segs = pathname.split('/').filter(Boolean);
      if (segs.length >= 2 && segs[0] === 'dashboard') {
        const roleFromUrl = segs[1].toUpperCase() as UserRole;
        if (ROLE_CONFIGS[roleFromUrl]) {
          setCurrentRole(roleFromUrl);
        }
      }
    }
  }, [pathname]);

  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.AGENCY;

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveSidebarItem('dashboard');
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole: handleRoleChange,
        roleConfig,
        allRoles: ROLE_ORDER,
        allRoleConfigs: ROLE_CONFIGS,
        activeSidebarItem,
        setActiveSidebarItem,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export { ROLE_CONFIGS, ROLE_ORDER };
