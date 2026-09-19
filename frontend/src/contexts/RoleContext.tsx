'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { UserRole, RoleConfig, SidebarItem, MockUser } from '@/types';

// ============================================
// Streamlined Role Configuration — Cleaned & Focused
// ============================================

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    id: 'ADMIN',
    label: 'System Administrator',
    shortLabel: 'Admin',
    icon: 'admin_panel_settings',
    description: 'System administration, RBAC permissions, and user auditing',
    user: {
      name: 'Sh. Rajeshwar Verma',
      designation: 'System Administrator',
      department: 'National Informatics Center',
    },
    sidebarItems: [
      { id: 'dashboard', label: 'Administration Hub', icon: 'dashboard', href: '/dashboard/admin' },
      { id: 'users', label: 'User Directory', icon: 'manage_accounts', href: '/dashboard/admin/users' },
      { id: 'audit', label: 'System Audit Logs', icon: 'policy', href: '/dashboard/admin/audit' },
    ],
  },
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
      { id: 'corridor', label: 'Corridor Definition', icon: 'route', href: '/dashboard/agency/corridor' },
      { id: 'parcels', label: 'Parcel Monitoring', icon: 'grid_view', href: '/dashboard/agency/parcels' },
      { id: 'risk', label: 'Risk Scoring (ML)', icon: 'warning', href: '/dashboard/agency/risk' },
      { id: 'affected-persons', label: 'Affected Population Schedule', icon: 'groups', href: '/dashboard/agency/affected-persons' },
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
      { id: 'ai-audit', label: 'AI Asset Audit', icon: 'smart_toy', href: '/dashboard/lao/ai-audit' },
      { id: 'vegetation', label: 'Vegetation Analysis', icon: 'eco', href: '/dashboard/lao/vegetation' },
      { id: 'hearing', label: 'Hearing Management', icon: 'gavel', href: '/dashboard/lao/hearing-management' },
      { id: 'beneficiaries', label: 'DBT Disbursement', icon: 'currency_rupee', href: '/dashboard/lao/beneficiaries' },
      { id: 'affected-persons', label: 'Affected Persons & PAFs', icon: 'groups', href: '/dashboard/lao/affected-persons' },
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
      { id: 'intersection', label: 'Spatial Overlay Review', icon: 'layers', href: '/dashboard/forest/intersection' },
      { id: 'doc-review', label: 'Document Review', icon: 'description', href: '/dashboard/forest/document-review' },
      { id: 'impact', label: 'Environmental Impact', icon: 'eco', href: '/dashboard/forest/impact-review' },
      { id: 'noc', label: 'Clearance / NOC Process', icon: 'task_alt', href: '/dashboard/forest/noc-processing' },
      { id: 'affected-persons', label: 'Forest Dweller & Tribal PAFs', icon: 'groups', href: '/dashboard/forest/affected-persons' },
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
      { id: 'parcels', label: 'Land & Parcel Overview', icon: 'landscape', href: '/dashboard/collector/parcels' },
      { id: 'workflow', label: 'Workflow Pipeline', icon: 'schema', href: '/dashboard/collector/workflow' },
      { id: 'approvals', label: 'e-Sign Approvals', icon: 'verified', href: '/dashboard/collector/approvals' },
      { id: 'proposal-review', label: 'Proposal Review & Decision', icon: 'rate_review', href: '/dashboard/collector/proposal-review' },
      { id: 'objection-oversight', label: 'Statutory Objection Oversight', icon: 'gavel', href: '/dashboard/collector/objection-oversight' },
      { id: 'inter-dept', label: 'Inter-Dept Coordination', icon: 'hub', href: '/dashboard/collector/inter-dept' },
      { id: 'compensation-monitoring', label: 'Compensation & Award Monitoring', icon: 'payments', href: '/dashboard/collector/compensation-monitoring' },
      { id: 'possession-rr', label: 'Possession & R&R Monitoring', icon: 'home_work', href: '/dashboard/collector/possession-rr' },
      { id: 'delay-exceptions', label: 'Delay & Exception Management', icon: 'warning', href: '/dashboard/collector/delay-exceptions' },
      { id: 'escalations', label: 'Escalation Management', icon: 'priority_high', href: '/dashboard/collector/escalations' },
      { id: 'mis-reports', label: 'District MIS & Reports', icon: 'analytics', href: '/dashboard/collector/mis-reports' },
      { id: 'audit-trail', label: 'Audit & Activity Oversight', icon: 'history', href: '/dashboard/collector/audit-trail' },
      { id: 'notifications', label: 'Notifications & Alerts', icon: 'notifications', href: '/dashboard/collector/notifications' },
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
      { id: 'dashboard', label: 'Court Dashboard', icon: 'dashboard', href: '/dashboard/tehsildar' },
      { id: 'hearing-manager', label: 'Hearing Manager', icon: 'gavel', href: '/dashboard/tehsildar/hearing-manager' },
      { id: 'disputes', label: 'Dispute Cases', icon: 'folder_open', href: '/dashboard/tehsildar/disputes' },
      { id: 'affected-persons', label: 'Affected Persons & Disbursement', icon: 'groups', href: '/dashboard/tehsildar/affected-persons' },
      { id: 'revenue-verification', label: 'Land Record & RoR Verification', icon: 'fact_check', href: '/dashboard/tehsildar/revenue-verification' },
      { id: 'mutation-tracking', label: 'Mutation Tracking', icon: 'swap_horiz', href: '/dashboard/tehsildar/mutation-tracking' },
      { id: 'parcels', label: 'Acquisition Parcel Overview', icon: 'landscape', href: '/dashboard/tehsildar/parcels' },
      { id: 'documents', label: 'Case & Document Records', icon: 'description', href: '/dashboard/tehsildar/documents' },
      { id: 'alerts', label: 'Pending Actions & Alerts', icon: 'notifications_active', href: '/dashboard/tehsildar/alerts' },
      { id: 'reports', label: 'Tehsil-Level Reports', icon: 'analytics', href: '/dashboard/tehsildar/reports' },
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
// Context & State
// ============================================

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  roleConfig: RoleConfig;
  allRoles: UserRole[];
  allRoleConfigs: Record<UserRole, RoleConfig>;
  activeSidebarItem: string;
  setActiveSidebarItem: (id: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>('AGENCY');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
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
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed: setIsSidebarCollapsed,
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
