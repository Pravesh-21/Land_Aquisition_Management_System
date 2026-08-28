'use client';

import { useNotifications, AppNotification, NotificationCategory, NotificationPriority } from '@/contexts/NotificationContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const CATEGORY_META: Record<NotificationCategory, { label: string; color: string; bg: string }> = {
  CASE_UPDATE: { label: 'Case', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  PAYMENT:     { label: 'Payment', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  HEARING:     { label: 'Hearing', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  DOCUMENT:    { label: 'Document', color: '#f9a8d4', bg: 'rgba(249,168,212,0.12)' },
  ALERT:       { label: 'Alert', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  WORKFLOW:    { label: 'Workflow', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  SYSTEM:      { label: 'System', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  LOW:      '#94a3b8',
  NORMAL:   '#60a5fa',
  HIGH:     '#fbbf24',
  CRITICAL: '#f87171',
};

type FilterTab = 'ALL' | 'UNREAD' | 'CRITICAL';

// ── main component ─────────────────────────────────────────────────────────────

export default function NotificationPanel() {
  const { notifications, unreadCount, isPanelOpen, closePanel, markRead, markAllRead, isLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [animateIn, setAnimateIn] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in/out
  useEffect(() => {
    if (isPanelOpen) {
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
    }
  }, [isPanelOpen]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    if (isPanelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isPanelOpen, closePanel]);

  const filtered = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.is_read;
    if (activeTab === 'CRITICAL') return n.priority === 'CRITICAL';
    return true;
  });

  if (!isPanelOpen && !animateIn) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(0,0,0,0.35)',
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
          transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: '16px',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: '22px' }}>notifications_active</span>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.3px' }}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  padding: '2px 8px',
                  minWidth: '20px',
                  textAlign: 'center',
                  boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(96,165,250,0.3)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={closePanel}
                style={{
                  background: 'none', border: 'none', padding: '6px',
                  cursor: 'pointer', borderRadius: '6px',
                  color: '#94a3b8', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
            {(['ALL', 'UNREAD', 'CRITICAL'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.25))'
                    : 'none',
                  border: activeTab === tab ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                  borderRadius: '6px',
                  color: activeTab === tab ? '#93c5fd' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px',
                }}
              >
                {tab}
                {tab === 'UNREAD' && unreadCount > 0 && (
                  <span style={{ marginLeft: '5px', color: '#f87171', fontWeight: 800 }}>{unreadCount}</span>
                )}
                {tab === 'CRITICAL' && (
                  <span style={{ marginLeft: '5px', color: '#f87171' }}>
                    {notifications.filter(n => n.priority === 'CRITICAL').length || ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', animation: 'spin 1s linear infinite' }}>refresh</span>
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', color: '#334155' }}>notifications_none</span>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>No notifications here</p>
            </div>
          ) : (
            filtered.map(notif => (
              <NotificationItem key={notif.id} notification={notif} onMarkRead={markRead} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <span style={{ fontSize: '11px', color: '#334155', letterSpacing: '0.5px' }}>
            BHU-NIRIKSHAN · Real-Time Notifications
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </>
  );
}

// ── notification item ──────────────────────────────────────────────────────────

function NotificationItem({ notification: n, onMarkRead }: { notification: AppNotification; onMarkRead: (id: string) => void }) {
  const meta = CATEGORY_META[n.category] ?? CATEGORY_META.SYSTEM;
  const priorityColor = PRIORITY_COLORS[n.priority as NotificationPriority] ?? '#60a5fa';
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!n.is_read) onMarkRead(n.id); }}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '14px 18px',
        cursor: n.is_read ? 'default' : 'pointer',
        background: hovered
          ? 'rgba(255,255,255,0.04)'
          : n.is_read ? 'transparent' : 'rgba(59,130,246,0.04)',
        borderLeft: n.is_read ? '3px solid transparent' : `3px solid ${priorityColor}`,
        transition: 'all 0.15s ease',
        animation: 'slideIn 0.25s ease',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: meta.bg,
        border: `1px solid ${meta.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '2px',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: meta.color }}>
          {n.icon}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: n.is_read ? 500 : 700,
            color: n.is_read ? '#94a3b8' : '#e2e8f0',
            lineHeight: 1.3,
            flex: 1,
          }}>
            {n.title}
          </span>
          <span style={{ fontSize: '10px', color: '#475569', flexShrink: 0, marginTop: '2px', letterSpacing: '0.3px' }}>
            {timeAgo(n.timestamp)}
          </span>
        </div>

        <p style={{
          margin: '0 0 8px',
          fontSize: '12px',
          color: n.is_read ? '#475569' : '#64748b',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {n.message}
        </p>

        {/* Tags row */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            color: meta.color,
            background: meta.bg,
            padding: '2px 7px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            {meta.label}
          </span>
          {n.priority !== 'NORMAL' && n.priority !== 'LOW' && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.6px',
              color: priorityColor,
              background: `${priorityColor}18`,
              padding: '2px 7px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}>
              {n.priority}
            </span>
          )}
          {!n.is_read && (
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: priorityColor,
              boxShadow: `0 0 6px ${priorityColor}80`,
              marginLeft: 'auto',
              flexShrink: 0,
              animation: n.priority === 'CRITICAL' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }} />
          )}
        </div>
      </div>
    </div>
  );

  return n.action_url && !n.is_read ? (
    <Link href={n.action_url} style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </Link>
  ) : content;
}
