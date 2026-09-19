'use client';

import { Grievance, Hearing, LandParcel, Project } from '@/types';
import { mockGrievances, mockHearings, mockParcels, mockProjects } from '@/data/mockData';

// Shared localStorage Keys for Cross-Role Synchronization
export const STORAGE_KEYS = {
  GRIEVANCES: 'bhu_cross_role_grievances',
  HEARINGS: 'bhu_cross_role_hearings',
  PARCELS: 'bhu_cross_role_parcels',
  PROJECTS: 'bhu_cross_role_projects',
  COLLECTOR_SIGNED: 'bhu_collector_section11_signed',
  COLLECTOR_SIGN_TIME: 'bhu_collector_section11_signed_time',
  LAO_VERIFIED: 'bhu_lao_verified_cases',
  LATEST_ACTION_LOG: 'bhu_cross_role_latest_action',
};

// 1. Grievance & Dispute Sync
export function getSharedGrievances(): Grievance[] {
  if (typeof window === 'undefined') return mockGrievances;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GRIEVANCES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading shared grievances:', e);
  }
  return mockGrievances;
}

export function saveSharedGrievance(newGrievance: Grievance): Grievance[] {
  const current = getSharedGrievances();
  const updated = [newGrievance, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(updated));
      // Also automatically create a matching dispute docket in Tehsildar's court
      const currentHearings = getSharedHearings();
      const newHearing: Hearing = {
        id: `H-${Date.now()}`,
        caseId: newGrievance.trackingId,
        khasraNumber: newGrievance.parcelId || '442/1-A',
        village: 'Hingna',
        tehsil: 'Nagpur Rural',
        disputeType: newGrievance.category,
        applicant: { name: newGrievance.filedBy || 'Sh. Rajendra Patel (Landowner)', address: 'Hingna Zone' },
        respondent: { name: 'Requisite Agency / NHAI PIU Nagpur', address: 'Nagpur' },
        presidingOfficer: 'Shri Vikram Singh (Tehsildar)',
        scheduledDate: new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        scheduledTime: '11:30 AM',
        status: 'Scheduling',
        evidence: [
          { id: `E-${Date.now()}`, title: newGrievance.subject, type: 'Grievance Petition', dateFiled: newGrievance.dateFiled },
        ],
      };
      saveSharedHearing(newHearing);
      logCrossRoleAction(`Citizen filed objection: ${newGrievance.trackingId} -> Routed live to Tehsildar Court.`);
    } catch (e) {
      console.error('Error saving shared grievance:', e);
    }
  }
  return updated;
}

// 2. Tehsildar Hearings & Disputes Sync
export function getSharedHearings(): Hearing[] {
  if (typeof window === 'undefined') return mockHearings;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HEARINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading shared hearings:', e);
  }
  return mockHearings;
}

export function saveSharedHearing(hearing: Hearing): Hearing[] {
  const current = getSharedHearings();
  const existingIdx = current.findIndex((h) => h.caseId === hearing.caseId || h.id === hearing.id);
  let updated: Hearing[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = hearing;
  } else {
    updated = [hearing, ...current];
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.HEARINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving shared hearing:', e);
    }
  }
  return updated;
}

// 3. Collector Section 11 & Section 19 e-Signature Sync
export function getCollectorSignedStatus(): { isSigned: boolean; signTime?: string } {
  if (typeof window === 'undefined') return { isSigned: false };
  try {
    const isSigned = localStorage.getItem(STORAGE_KEYS.COLLECTOR_SIGNED) === 'true';
    const signTime = localStorage.getItem(STORAGE_KEYS.COLLECTOR_SIGN_TIME) || undefined;
    return { isSigned, signTime };
  } catch (e) {
    return { isSigned: false };
  }
}

export function setCollectorSignedStatus(isSigned: boolean, signTime?: string) {
  if (typeof window === 'undefined') return;
  try {
    if (isSigned) {
      const timeStr = signTime || new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      localStorage.setItem(STORAGE_KEYS.COLLECTOR_SIGNED, 'true');
      localStorage.setItem(STORAGE_KEYS.COLLECTOR_SIGN_TIME, timeStr);
      logCrossRoleAction(`Collector e-Signed Section 11 Gazette -> Award sanctioned for LAO & Citizen.`);
    } else {
      localStorage.removeItem(STORAGE_KEYS.COLLECTOR_SIGNED);
      localStorage.removeItem(STORAGE_KEYS.COLLECTOR_SIGN_TIME);
    }
  } catch (e) {
    console.error('Error setting collector sign status:', e);
  }
}

// 4. Activity Logger for Demonstrations
export function logCrossRoleAction(actionText: string) {
  if (typeof window === 'undefined') return;
  try {
    const logItem = {
      text: actionText,
      timestamp: new Date().toLocaleTimeString('en-IN'),
    };
    localStorage.setItem(STORAGE_KEYS.LATEST_ACTION_LOG, JSON.stringify(logItem));
    // Dispatch custom window event so open tabs or pages update instantly
    window.dispatchEvent(new Event('bhu_workflow_update'));
  } catch (e) {
    console.error('Error logging cross-role action:', e);
  }
}

export function getLatestCrossRoleAction(): { text: string; timestamp: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LATEST_ACTION_LOG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    return null;
  }
  return null;
}
