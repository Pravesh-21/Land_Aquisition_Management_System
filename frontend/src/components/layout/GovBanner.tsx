'use client';

export default function GovBanner() {
  return (
    <div className="gov-banner flex items-center justify-between px-8 w-full z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-3">
        <img src="/logo.png?v=2" alt="Emblem" className="w-5 h-5 object-contain rounded-full" />
        <span className="text-xs font-medium">Government of India</span>
        <span className="hidden md:inline border-l border-[var(--color-outline-variant)] h-4"></span>
        <span className="hidden md:inline text-xs">Ministry of Rural Development</span>
        <span className="hidden lg:inline border-l border-[var(--color-outline-variant)] h-4"></span>
        <span className="hidden lg:inline text-xs">Department of Land Resources</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="hover:text-[var(--color-gov-navy)] transition-colors flex items-center gap-1 text-xs" title="High Contrast">
          <span className="material-symbols-outlined text-[16px]">contrast</span>
        </button>
        <div className="flex gap-2 text-xs">
          <button className="hover:text-[var(--color-gov-navy)] transition-colors">A-</button>
          <button className="font-bold text-[var(--color-gov-navy)]">A</button>
          <button className="hover:text-[var(--color-gov-navy)] transition-colors">A+</button>
        </div>
        <span className="border-l border-[var(--color-outline-variant)] h-4"></span>
        <span className="text-xs">Screen Reader Access</span>
      </div>
    </div>
  );
}
