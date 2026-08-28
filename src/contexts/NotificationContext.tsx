'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type NotificationCategory =
  | 'CASE_UPDATE'
  | 'PAYMENT'
  | 'HEARING'
  | 'DOCUMENT'
  | 'ALERT'
  | 'WORKFLOW'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface AppNotification {
  id: string;
  role: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  priority: NotificationPriority;
  action_url?: string;
  icon: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Fallback mock data keyed by role — used when backend is unreachable
const FALLBACK_NOTIFICATIONS: Record<string, AppNotification[]> = {
  AGENCY: [
    { id: 'ag-1', role: 'AGENCY', category: 'WORKFLOW', title: 'SIA Report Submitted', message: 'Social Impact Assessment for Project NH-48 Expressway has been submitted by LAO Pune Division. Pending your review.', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), is_read: false, priority: 'HIGH', action_url: '/dashboard/agency/projects', icon: 'account_tree' },
    { id: 'ag-2', role: 'AGENCY', category: 'ALERT', title: 'Critical Delay — Parcel MH-NG-2041', message: 'Parcel MH-NG-2041 has breached the 45-day statutory deadline. XGBoost Risk Score: 87/100. Immediate escalation recommended.', timestamp: new Date(Date.now() - 22 * 60000).toISOString(), is_read: false, priority: 'CRITICAL', action_url: '/dashboard/agency/parcels', icon: 'warning' },
    { id: 'ag-3', role: 'AGENCY', category: 'DOCUMENT', title: 'Section 19 Notification Issued', message: 'District Collector Nagpur has issued Section 19 Declaration for NH-48 Phase 3. All landowners notified via CPGRAMS.', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), is_read: false, priority: 'NORMAL', icon: 'description' },
    { id: 'ag-4', role: 'AGENCY', category: 'WORKFLOW', title: 'Forest Clearance Pending', message: 'MoEFCC Stage-II Forest Clearance for 14.2 ha is awaiting DFO signature. Project timeline at risk.', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), is_read: true, priority: 'HIGH', icon: 'account_tree' },
    { id: 'ag-5', role: 'AGENCY', category: 'SYSTEM', title: 'BHU-NIRIKSHAN System Upgraded', message: 'Satellite audit module updated to YOLOv8-OBB v2.1. Improved building detection accuracy to 96.2%.', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), is_read: true, priority: 'LOW', icon: 'info' },
  ],
  LAO: [
    { id: 'lao-1', role: 'LAO', category: 'HEARING', title: 'Section 15 Hearing Tomorrow', message: 'Objection hearing for Parcel RJ-SK-0892 scheduled for tomorrow at 11:00 AM. 3 landowners have confirmed attendance.', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), is_read: false, priority: 'HIGH', action_url: '/dashboard/lao/hearings', icon: 'gavel' },
    { id: 'lao-2', role: 'LAO', category: 'PAYMENT', title: 'Compensation Award Ready', message: 'RFCTLARR compensation of ₹47.3 Lakhs calculated for Sh. Rajendra Patel (Parcel MH-NG-1056). Awaiting Collector approval.', timestamp: new Date(Date.now() - 18 * 60000).toISOString(), is_read: false, priority: 'HIGH', action_url: '/dashboard/lao/compensation', icon: 'payments' },
    { id: 'lao-3', role: 'LAO', category: 'CASE_UPDATE', title: '4D Award Passed', message: 'Section 23 Award for 7 parcels in NH-48 Phase 2 has been passed by Collector. Proceed with disbursement.', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), is_read: false, priority: 'NORMAL', icon: 'update' },
    { id: 'lao-4', role: 'LAO', category: 'ALERT', title: 'Aadhaar Verification Failed', message: 'Aadhaar seeding failed for 3 landowners in Parcel cluster RJ-SK-0800 to 0810. Manual verification required.', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), is_read: true, priority: 'HIGH', icon: 'warning' },
    { id: 'lao-5', role: 'LAO', category: 'SYSTEM', title: 'Data Sync Complete', message: 'DILRMP land records synced successfully. 142 parcels updated with latest ownership data.', timestamp: new Date(Date.now() - 300 * 60000).toISOString(), is_read: true, priority: 'LOW', icon: 'info' },
  ],
  FOREST: [
    { id: 'fo-1', role: 'FOREST', category: 'DOCUMENT', title: 'Forest Land Diversion Request', message: 'AGENCY has submitted Forest Land Diversion request for 14.2 ha under NH-48. Stage-I Clearance documents attached.', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'description' },
    { id: 'fo-2', role: 'FOREST', category: 'ALERT', title: 'Compensatory Afforestation Due', message: 'Compensatory Afforestation of 28.4 ha (2x) is due within 30 days per FCA 1980 mandate. 0 ha planted so far.', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), is_read: false, priority: 'CRITICAL', icon: 'warning' },
    { id: 'fo-3', role: 'FOREST', category: 'WORKFLOW', title: 'Wildlife Sanctuary Buffer Alert', message: 'YOLOv8 satellite audit detected potential encroachment within 500m buffer of Melghat Tiger Reserve. Site inspection ordered.', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'account_tree' },
    { id: 'fo-4', role: 'FOREST', category: 'SYSTEM', title: 'MoEFCC Portal Sync', message: 'Parivesh portal data synchronized. 3 pending applications imported.', timestamp: new Date(Date.now() - 200 * 60000).toISOString(), is_read: true, priority: 'LOW', icon: 'info' },
  ],
  COLLECTOR: [
    { id: 'col-1', role: 'COLLECTOR', category: 'CASE_UPDATE', title: 'Section 23 Award Pending Approval', message: 'LAO Pune has submitted Section 23 Award for 7 parcels totalling ₹3.2 Cr. Statutory 60-day window expires in 8 days.', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), is_read: false, priority: 'CRITICAL', icon: 'update' },
    { id: 'col-2', role: 'COLLECTOR', category: 'HEARING', title: 'Section 11 Enquiry Scheduled', message: 'Public enquiry under Section 11 for NH-48 Phase 3 project scheduled for next Monday. 47 affected landowners notified.', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'gavel' },
    { id: 'col-3', role: 'COLLECTOR', category: 'ALERT', title: 'Court Order Received', message: 'High Court of Bombay has issued stay order on possession of Parcel MH-NG-2041 pending litigation. Immediate halt required.', timestamp: new Date(Date.now() - 50 * 60000).toISOString(), is_read: false, priority: 'CRITICAL', icon: 'warning' },
    { id: 'col-4', role: 'COLLECTOR', category: 'DOCUMENT', title: 'Section 19 Draft Ready', message: 'Legal team has prepared Section 19 Declaration draft for NH-48 Phase 3. Awaiting your signature.', timestamp: new Date(Date.now() - 130 * 60000).toISOString(), is_read: true, priority: 'NORMAL', icon: 'description' },
    { id: 'col-5', role: 'COLLECTOR', category: 'SYSTEM', title: 'CPGRAMS Grievance Alert', message: '5 new CPGRAMS grievances received against land acquisition. Response due within 30 days.', timestamp: new Date(Date.now() - 250 * 60000).toISOString(), is_read: true, priority: 'NORMAL', icon: 'info' },
  ],
  TEHSILDAR: [
    { id: 'teh-1', role: 'TEHSILDAR', category: 'CASE_UPDATE', title: 'New Cases Assigned', message: '5 new land acquisition cases from Collector\'s office have been assigned to your docket. Deadline: 15 days.', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'update' },
    { id: 'teh-2', role: 'TEHSILDAR', category: 'HEARING', title: 'Mutation Hearing — RJ-SK-0892', message: 'Mutation hearing for Parcel RJ-SK-0892 confirmed for 10:30 AM. Landowner Sh. Vikram Yadav and his advocate will attend.', timestamp: new Date(Date.now() - 20 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'gavel' },
    { id: 'teh-3', role: 'TEHSILDAR', category: 'DOCUMENT', title: 'Survey Report Submitted', message: 'Revenue Surveyor has submitted measurement report for 3 parcels in Sikar Tehsil. Verification pending.', timestamp: new Date(Date.now() - 70 * 60000).toISOString(), is_read: false, priority: 'NORMAL', icon: 'description' },
    { id: 'teh-4', role: 'TEHSILDAR', category: 'ALERT', title: 'Boundary Dispute — Parcel RJ-SK-0901', message: 'GIS overlay shows 0.3 ha boundary discrepancy between DILRMP records and satellite imagery. Ground-truthing required.', timestamp: new Date(Date.now() - 150 * 60000).toISOString(), is_read: true, priority: 'HIGH', icon: 'warning' },
    { id: 'teh-5', role: 'TEHSILDAR', category: 'SYSTEM', title: 'Court Registry Updated', message: 'E-court integration pushed 12 case status updates. All mutation records are now current.', timestamp: new Date(Date.now() - 360 * 60000).toISOString(), is_read: true, priority: 'LOW', icon: 'info' },
  ],
  CITIZEN: [
    { id: 'cit-1', role: 'CITIZEN', category: 'PAYMENT', title: 'Compensation Credited — ₹47.3 Lakhs', message: 'Your RFCTLARR compensation of ₹47,38,500 has been credited to your Aadhaar-linked bank account (XXXX 4920). Reference: AWD-2024-1056.', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), is_read: false, priority: 'CRITICAL', icon: 'payments' },
    { id: 'cit-2', role: 'CITIZEN', category: 'HEARING', title: 'Hearing Notice — Section 15', message: 'You are required to appear before LAO Pune Division on 05-Sep-2024 at 11:00 AM regarding your objection. Bring original title documents.', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'gavel' },
    { id: 'cit-3', role: 'CITIZEN', category: 'CASE_UPDATE', title: 'Section 19 Declaration Published', message: 'The Government has published Section 19 Declaration for your land parcel MH-NG-1056. You have 60 days to file objections.', timestamp: new Date(Date.now() - 48 * 60000).toISOString(), is_read: false, priority: 'HIGH', icon: 'update' },
    { id: 'cit-4', role: 'CITIZEN', category: 'DOCUMENT', title: 'Title Verification Complete', message: 'Your land title (Survey No. 142/B, Nagpur) has been verified and linked to your Aadhaar. Records are now digitized.', timestamp: new Date(Date.now() - 96 * 60000).toISOString(), is_read: true, priority: 'NORMAL', icon: 'description' },
    { id: 'cit-5', role: 'CITIZEN', category: 'ALERT', title: 'Grievance Status Update', message: 'Your CPGRAMS grievance (Ref: GRV-2024-4412) has been escalated to the District Collector. Expected resolution in 15 days.', timestamp: new Date(Date.now() - 200 * 60000).toISOString(), is_read: true, priority: 'NORMAL', icon: 'warning' },
    { id: 'cit-6', role: 'CITIZEN', category: 'SYSTEM', title: 'Rehabilitation Package Announced', message: 'Government has announced an additional R&R package including house site allotment under Section 31. Apply by 30-Sep-2024.', timestamp: new Date(Date.now() - 400 * 60000).toISOString(), is_read: true, priority: 'NORMAL', icon: 'info' },
  ],
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { role, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!role || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${role}`
        : `/api/v1/notifications/${role}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data: AppNotification[] = await res.json();
        setNotifications(data);
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend offline — use fallback
    }
    setNotifications(FALLBACK_NOTIFICATIONS[role] ?? []);
    setIsLoading(false);
  }, [role, isAuthenticated]);

  // Fetch on mount and whenever role changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (!role) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${role}/read/${id}`
        : `/api/v1/notifications/${role}/read/${id}`;
      await fetch(apiUrl, { method: 'POST' });
    } catch {
      // Silently fail; UI already updated
    }
  }, [role]);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (!role) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${role}/read-all`
        : `/api/v1/notifications/${role}/read-all`;
      await fetch(apiUrl, { method: 'POST' });
    } catch {
      // Silently fail
    }
  }, [role]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      isPanelOpen,
      openPanel: () => setIsPanelOpen(true),
      closePanel: () => setIsPanelOpen(false),
      togglePanel: () => setIsPanelOpen(p => !p),
      markRead,
      markAllRead,
      refresh: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
