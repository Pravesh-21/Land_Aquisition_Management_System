'use client';

import { mockWorkflowSteps } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">Feature 5 • BPMN 2.0 Engine</div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Camunda BPMN 2.0 Multi-Department Workflow Engine</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Inter-departmental approval orchestration tracking files across Requisite Agency → LAO → Forest Dept → Revenue Court → District Collector with statutory timer escalations (&gt;15 days).
          </p>
        </div>
      </div>

      {/* BPMN Pipeline Visualization */}
      <div className="gov-card p-6 space-y-6">
        <h3 className="text-[18px] font-bold text-[var(--color-gov-navy)]">Active Pipeline • NH-44 Nagpur-Hyderabad Expressway (PRJ-001)</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {mockWorkflowSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-4 border-2 ${
                step.status === 'completed'
                  ? 'border-[var(--color-land-green)] bg-[var(--color-status-success-bg)]'
                  : step.status === 'current'
                  ? 'border-[var(--color-gov-ochre-bright)] bg-[var(--color-status-warning-bg)]'
                  : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]'
              } flex flex-col justify-between h-[180px]`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[11px] font-bold text-[var(--color-gov-navy)]">STAGE {idx + 1}</span>
                  <StatusBadge
                    status={step.status.toUpperCase()}
                    variant={step.status === 'completed' ? 'success' : step.status === 'current' ? 'warning' : 'neutral'}
                  />
                </div>
                <div className="text-[14px] font-bold text-[var(--color-on-surface)] leading-tight">{step.name}</div>
                <div className="text-xs text-[var(--color-on-surface-variant)] mt-1">Dept: {step.department}</div>
              </div>

              <div className="text-[11px] text-[var(--color-on-surface-variant)] border-t border-[var(--color-outline-variant)] pt-2 mt-2">
                {step.assignee && <div>Assignee: <span className="font-semibold text-[var(--color-on-surface)]">{step.assignee}</span></div>}
                {step.completedDate && <div>Completed: {step.completedDate}</div>}
                {step.dueDate && <div>Due: {step.dueDate}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
