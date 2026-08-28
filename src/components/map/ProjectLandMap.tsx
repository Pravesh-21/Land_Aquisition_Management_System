'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const CadastralLeafletMap = dynamic(
  () => import('./CadastralLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-3 border-[var(--color-gov-navy)] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Loading OpenStreetMap GIS Cadastral Engine...</span>
      </div>
    ),
  }
);

export { SAMPLE_PROJECT_PARCELS, CORRIDOR_ALIGNMENT_LINE, CORRIDOR_BUFFER_POLYGON } from './CadastralLeafletMap';
export type { ProjectParcelPolygon } from './CadastralLeafletMap';

interface ProjectLandMapProps {
  height?: string;
  selectedUlpin?: string;
  onParcelSelect?: (parcel: any) => void;
  showLayerControls?: boolean;
  showAssets?: boolean;
}

export default function ProjectLandMap(props: ProjectLandMapProps) {
  return <CadastralLeafletMap {...props} />;
}
