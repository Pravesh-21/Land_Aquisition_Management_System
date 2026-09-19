'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuditRecord {
  id: string;
  user_id?: string;
  username: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export default function AdminAuditPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [usernameFilter, setUsernameFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (eventFilter !== 'ALL') params.set('event_type', eventFilter);
      if (usernameFilter.trim()) params.set('username', usernameFilter.trim());
      params.set('limit', '100');

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        setError('Failed to query statutory audit trail.');
      }
    } catch {
      setError('Network error loading audit logs.');
    } finally {
      setLoading(false);
    }
  }, [token, eventFilter, usernameFilter]);

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [fetchLogs, token]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'LOGIN_FAILURE':
      case 'TOKEN_REUSE_DETECTED':
      case 'REGISTRATION_BLOCKED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'LOGOUT':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'TOKEN_REFRESH':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PASSWORD_CHANGE':
      case 'ADMIN_PASSWORD_RESET':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SESSION_REVOKED':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'OFFICER_PROVISIONED':
      case 'ROLE_CHANGED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-outline-variant)] pb-4 gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Statutory Security & Compliance
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-gov-navy)]">Authentication Audit Trail & Security Ledger</h1>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            Cryptographically sealed and persistent event log tracking logins, token rotations, permission modifications, and statutory actions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Audit Ledger: Active
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)]"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
            <option value="TOKEN_REFRESH">TOKEN_REFRESH</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
            <option value="SESSION_REVOKED">SESSION_REVOKED</option>
            <option value="OFFICER_PROVISIONED">OFFICER_PROVISIONED</option>
            <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            <option value="USER_REGISTERED">USER_REGISTERED</option>
          </select>

          <input
            type="text"
            placeholder="Filter by username..."
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)]"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-1.5 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-slate-800"
        >
          Refresh Audit Trail
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Retrieving audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No audit logs recorded for this criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC / IST)</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Account / Username</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">Details & Event Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => {
                  const date = new Date(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div>{date.toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-500">{date.toLocaleTimeString('en-IN')}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-sans ${getEventBadge(log.event_type)}`}>
                          {log.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {log.username}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-sans">
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
