'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserRecord {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  roles: string[];
  permissions: string[];
  departments: string[];
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'AGENCY',
    department_code: 'NHAI',
  });

  // Role Edit Form State
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // Reset Password State
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('is_active', statusFilter === 'ACTIVE' ? 'true' : 'false');

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setMessage({ text: 'Failed to load user directory.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error loading user records.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers, token]);

  const handleToggleStatus = async (user: UserRecord) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        setMessage({
          text: `User ${user.username} has been ${!user.is_active ? 'activated' : 'deactivated'}.`,
          type: 'success',
        });
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ text: err.detail || 'Status update failed.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error updating user status.', type: 'error' });
    }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        setMessage({ text: `Officer ${createForm.username} successfully provisioned!`, type: 'success' });
        setIsCreateOpen(false);
        setCreateForm({
          username: '',
          email: '',
          password: '',
          full_name: '',
          phone: '',
          role: 'AGENCY',
          department_code: 'NHAI',
        });
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ text: err.detail || 'Failed to provision officer.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error submitting officer provision request.', type: 'error' });
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUser.id}/roles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ roles: selectedRoles }),
      });
      if (res.ok) {
        setMessage({ text: `Roles updated for ${selectedUser.username}.`, type: 'success' });
        setIsRoleModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ text: err.detail || 'Role update failed.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error updating roles.', type: 'error' });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (res.ok) {
        setMessage({ text: `Password reset successfully for ${selectedUser.username}.`, type: 'success' });
        setIsResetModalOpen(false);
        setNewPassword('');
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ text: err.detail || 'Password reset failed.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error resetting password.', type: 'error' });
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-slate-800 text-white';
      case 'AGENCY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LAO':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'FOREST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'COLLECTOR':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'TEHSILDAR':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-outline-variant)] pb-4 gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            System Administration
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-gov-navy)]">Officer & User Management Directory</h1>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            Provision statutory government authorities, manage role assignments, and govern account lifecycles.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gov-navy)] text-white text-xs font-semibold rounded hover:bg-slate-800 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Provision Government Officer
        </button>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-semibold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)]"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)]"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="AGENCY">AGENCY (NHAI)</option>
            <option value="LAO">LAO (Competent Authority)</option>
            <option value="FOREST">FOREST (MoEFCC)</option>
            <option value="COLLECTOR">COLLECTOR (District Magistrate)</option>
            <option value="TEHSILDAR">TEHSILDAR (Revenue Court)</option>
            <option value="CITIZEN">CITIZEN</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gov-navy)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading statutory directory records...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No user records matching the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Official / Name</th>
                  <th className="py-3 px-4">Username & Email</th>
                  <th className="py-3 px-4">Statutory Role(s)</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{u.full_name}</div>
                      {u.phone && <div className="text-[10px] text-slate-500 font-normal">{u.phone}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800">{u.username}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeStyle(r)}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.departments.join(', ') || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setSelectedRoles(u.roles);
                          setIsRoleModalOpen(true);
                        }}
                        title="Manage Roles"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Roles
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsResetModalOpen(true);
                        }}
                        title="Reset Password"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.is_active ? 'Deactivate account' : 'Activate account'}
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${
                          u.is_active
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Officer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-[var(--color-gov-navy)] mb-1">
              Provision Government Officer
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter official details to establish a persistent PostgreSQL identity and assign statutory roles.
            </p>

            <form onSubmit={handleCreateOfficer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sh. Rajesh Deshmukh"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[var(--color-gov-navy)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. lao_nagpur"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lao@gov.in"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temporary Password (min 8 chars, A-Z, 0-9, symbol)
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. Officer@123"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statutory Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="AGENCY">AGENCY (NHAI)</option>
                    <option value="LAO">LAO (Competent Authority)</option>
                    <option value="FOREST">FOREST (MoEFCC)</option>
                    <option value="COLLECTOR">COLLECTOR (District Magistrate)</option>
                    <option value="TEHSILDAR">TEHSILDAR (Revenue Court)</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={createForm.department_code}
                    onChange={(e) => setCreateForm({ ...createForm, department_code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="NHAI">NHAI</option>
                    <option value="LAND_ACQUISITION">Land Acquisition</option>
                    <option value="FOREST_ENVIRONMENT">Forest & Env.</option>
                    <option value="DISTRICT_ADMINISTRATION">District Admin</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="SYSTEM_ADMIN">NIC / Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--color-gov-navy)] text-white rounded text-xs font-semibold hover:bg-slate-800"
                >
                  Establish Officer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 border border-slate-200 animate-in fade-in">
            <h2 className="text-sm font-bold text-[var(--color-gov-navy)] mb-1">
              Modify Statutory Roles
            </h2>
            <p className="text-xs text-slate-500 mb-3">User: {selectedUser.full_name} ({selectedUser.username})</p>

            <div className="space-y-2 mb-4">
              {['ADMIN', 'AGENCY', 'LAO', 'FOREST', 'COLLECTOR', 'TEHSILDAR', 'CITIZEN'].map((r) => (
                <label key={r} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, r]);
                      } else {
                        setSelectedRoles(selectedRoles.filter((item) => item !== r));
                      }
                    }}
                    className="rounded text-blue-900"
                  />
                  <span className="font-semibold">{r}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                className="px-4 py-1.5 bg-[var(--color-gov-navy)] text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Apply Roles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 border border-slate-200 animate-in fade-in">
            <h2 className="text-sm font-bold text-[var(--color-gov-navy)] mb-1">
              Admin Password Reset
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Reset password for {selectedUser.full_name}. This will invalidate all active sessions.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 8 chars, upper, lower, digit, symbol)
              </label>
              <input
                type="password"
                placeholder="NewPassword@123"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="px-4 py-1.5 bg-[var(--color-gov-navy)] text-white rounded text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
