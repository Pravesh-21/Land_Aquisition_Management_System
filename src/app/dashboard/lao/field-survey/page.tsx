'use client';

import StatusBadge from '@/components/ui/StatusBadge';

export default function FieldSurveyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-outline-variant)] pb-5">
        <div>
          <div className="text-xs font-semibold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1">
            Ground Verification & Field Audit Suite
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-gov-navy)]">Geo-Fenced Mobile Field Survey Review</h1>
          <p className="text-[14px] text-[var(--color-on-surface-variant)] mt-1">
            Validates live GPS coordinates, geo-fence plot boundaries, EXIF metadata integrity, & cryptographic timestamping for ground verification survey photos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Status Cards */}
        <div className="lg:col-span-8 space-y-5">
          <div className="gov-card p-5 border-l-4 border-l-[var(--color-land-green)] flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase">Geo-Fence Check • IN-MH-440001-A12B</div>
              <div className="text-[16px] font-bold text-[var(--color-on-surface)] mt-1">Surveyor Location: 27.6001° N, 75.1004° E</div>
              <div className="text-xs text-[var(--color-land-green)] font-medium mt-0.5">
                ✓ Verified within Parcel Boundary (Distance to centroid: 14.2 meters)
              </div>
            </div>
            <StatusBadge status="GEO-FENCE PASSED" variant="success" icon="gpp_good" />
          </div>

          <div className="gov-card p-5 border-l-4 border-l-[var(--color-land-green)] flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase">Cryptographic Timestamp Check</div>
              <div className="text-[16px] font-bold text-[var(--color-on-surface)] mt-1">Time: 2024-08-28T09:42:15+05:30</div>
              <div className="text-xs text-[var(--color-land-green)] font-medium mt-0.5">
                ✓ SHA-256 Hash matches Mobile Device HSM Signature
              </div>
            </div>
            <StatusBadge status="TIMESTAMP VALID" variant="success" icon="lock" />
          </div>

          <div className="gov-card p-5 border-l-4 border-l-[var(--color-land-green)] flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase">EXIF Metadata Anti-Tamper Check</div>
              <div className="text-[16px] font-bold text-[var(--color-on-surface)] mt-1">Device: Samsung Galaxy Tab Active3 (Gov-Issued)</div>
              <div className="text-xs text-[var(--color-land-green)] font-medium mt-0.5">
                ✓ Original camera raw header verified • No Photoshop / mock location spoofing detected
              </div>
            </div>
            <StatusBadge status="EXIF CLEAN" variant="success" icon="verified" />
          </div>
        </div>

        {/* Survey Photo Upload Simulation */}
        <div className="lg:col-span-4 gov-card p-5 space-y-4">
          <h3 className="text-[16px] font-bold text-[var(--color-gov-navy)] border-b border-[var(--color-outline-variant)] pb-2">
            Field Upload Verification
          </h3>
          <div className="p-4 border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-center space-y-2 cursor-pointer">
            <span className="material-symbols-outlined text-[36px] text-[var(--color-gov-navy)]">add_a_photo</span>
            <div className="text-xs font-bold text-[var(--color-gov-navy)]">Upload Ground Survey Photo</div>
            <div className="text-[11px] text-[var(--color-on-surface-variant)]">Auto-extracts EXIF GPS, device ID, & timestamp</div>
          </div>
          <button className="w-full bg-[var(--color-gov-navy)] text-white text-xs font-semibold py-3 uppercase tracking-wider">
            Lock & Seal Survey Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
