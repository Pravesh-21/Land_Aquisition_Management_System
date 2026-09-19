'use client';

interface StepTrackerProps {
  steps: { id: string; label: string; status: 'completed' | 'current' | 'pending' }[];
  direction?: 'horizontal' | 'vertical';
}

export default function StepTracker({ steps, direction = 'horizontal' }: StepTrackerProps) {
  if (direction === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${
                step.status === 'completed' ? 'step-complete' : step.status === 'current' ? 'step-current' : 'step-pending'
              }`}>
                {step.status === 'completed' && (
                  <span className="material-symbols-outlined text-[12px] text-white">check</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-[2px] h-8 ${
                  step.status === 'completed' ? 'bg-[var(--color-gov-navy)]' : step.status === 'current' ? 'bg-[var(--color-gov-ochre-bright)]' : 'bg-[var(--color-surface-variant)]'
                }`}></div>
              )}
            </div>
            <div className="pb-6">
              <span className={`text-[12px] font-medium ${
                step.status === 'completed' ? 'text-[var(--color-gov-navy)]' : step.status === 'current' ? 'text-[var(--color-gov-ochre)] font-bold' : 'text-[var(--color-on-surface-variant)]'
              }`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 flex items-center justify-center ${
              step.status === 'completed' ? 'step-complete' : step.status === 'current' ? 'step-current' : 'step-pending'
            }`}>
              {step.status === 'completed' && (
                <span className="material-symbols-outlined text-[10px] text-white">check</span>
              )}
            </div>
            <span className={`text-[12px] font-medium whitespace-nowrap ${
              step.status === 'completed' ? 'text-[var(--color-gov-navy)]' : step.status === 'current' ? 'text-[var(--color-gov-ochre)] font-bold' : 'text-[var(--color-on-surface-variant)]'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 h-[2px] mx-2 ${
              step.status === 'completed' ? 'bg-[var(--color-gov-navy)]' : step.status === 'current' ? 'bg-[var(--color-gov-ochre-bright)]' : 'bg-[var(--color-surface-variant)]'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
