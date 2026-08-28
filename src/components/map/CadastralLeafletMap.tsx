'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Marker Icon in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom Icon for Selected Survey Centroid
const customPillarIcon = L.divIcon({
  className: 'custom-pillar-marker',
  html: `<div style="background-color: #1B365D; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid #FE932C; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Sample Cadastral Land Acquisition Polygons around Nagpur-Hyderabad Corridor (MH/Telangana)
export interface ProjectParcelPolygon {
  id: string;
  ulpin: string;
  surveyNumber: string;
  ownerName: string;
  village: string;
  areaHa: number;
  status: 'Award Declared' | 'Under Survey' | 'Possession Taken' | 'Clearance Review';
  coordinates: [number, number][]; // [Lat, Lng]
  riskLevel?: 'Low' | 'Medium' | 'High';
  compensationINR?: string;
}

export const SAMPLE_PROJECT_PARCELS: ProjectParcelPolygon[] = [
  {
    id: 'P-1',
    ulpin: 'IN-MH-440001-A12B',
    surveyNumber: '442/1-A',
    ownerName: 'Sh. Rajendra Patel',
    village: 'Hingna, Nagpur',
    areaHa: 1.42,
    status: 'Award Declared',
    compensationINR: '₹ 47,38,500',
    riskLevel: 'Low',
    coordinates: [
      [21.0850, 79.0200],
      [21.0875, 79.0260],
      [21.0830, 79.0290],
      [21.0810, 79.0225],
    ],
  },
  {
    id: 'P-2',
    ulpin: 'IN-MH-440001-A12C',
    surveyNumber: '443/2-B',
    ownerName: 'Sh. Suresh Patel',
    village: 'Hingna, Nagpur',
    areaHa: 0.65,
    status: 'Award Declared',
    compensationINR: '₹ 21,80,000',
    riskLevel: 'Low',
    coordinates: [
      [21.0875, 79.0260],
      [21.0910, 79.0315],
      [21.0870, 79.0350],
      [21.0830, 79.0290],
    ],
  },
  {
    id: 'P-3',
    ulpin: 'IN-MH-440001-B04K',
    surveyNumber: '445/1',
    ownerName: 'Smt. Kamla Devi & Co-owners',
    village: 'Wanadongri, Nagpur',
    areaHa: 2.15,
    status: 'Under Survey',
    compensationINR: '₹ 72,15,000',
    riskLevel: 'Medium',
    coordinates: [
      [21.0910, 79.0315],
      [21.0950, 79.0380],
      [21.0915, 79.0420],
      [21.0870, 79.0350],
    ],
  },
  {
    id: 'P-4',
    ulpin: 'IN-MH-440001-C09M',
    surveyNumber: '448/3',
    ownerName: 'Maharashtra Forest Dept (Compartment 42-B)',
    village: 'Karanja Buffer Zone',
    areaHa: 4.80,
    status: 'Clearance Review',
    compensationINR: '₹ 98,40,000 (NPV)',
    riskLevel: 'High',
    coordinates: [
      [21.0950, 79.0380],
      [21.1010, 79.0465],
      [21.0965, 79.0515],
      [21.0915, 79.0420],
    ],
  },
  {
    id: 'P-5',
    ulpin: 'IN-MH-440001-D15P',
    surveyNumber: '450/2-A',
    ownerName: 'Gram Panchayat Common Land',
    village: 'Butibori Industrial Area',
    areaHa: 3.20,
    status: 'Possession Taken',
    compensationINR: '₹ 1,07,00,000',
    riskLevel: 'Low',
    coordinates: [
      [21.1010, 79.0465],
      [21.1065, 79.0550],
      [21.1020, 79.0595],
      [21.0965, 79.0515],
    ],
  },
];

// Corridor Alignment Centerline Coordinates
export const CORRIDOR_ALIGNMENT_LINE: [number, number][] = [
  [21.0780, 79.0120],
  [21.0840, 79.0220],
  [21.0890, 79.0300],
  [21.0935, 79.0370],
  [21.0985, 79.0450],
  [21.1040, 79.0540],
  [21.1110, 79.0650],
];

// Right-of-Way (RoW) 60-meter Corridor Buffer Polygon
export const CORRIDOR_BUFFER_POLYGON: [number, number][] = [
  [21.0795, 79.0105],
  [21.0855, 79.0205],
  [21.0905, 79.0285],
  [21.0950, 79.0355],
  [21.1000, 79.0435],
  [21.1055, 79.0525],
  [21.1125, 79.0635],
  [21.1095, 79.0665],
  [21.1025, 79.0555],
  [21.0970, 79.0465],
  [21.0920, 79.0385],
  [21.0875, 79.0315],
  [21.0825, 79.0235],
  [21.0765, 79.0135],
];

interface CadastralMapProps {
  height?: string;
  selectedUlpin?: string;
  onParcelSelect?: (parcel: ProjectParcelPolygon) => void;
  showLayerControls?: boolean;
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CadastralLeafletMap({
  height = '500px',
  selectedUlpin,
  onParcelSelect,
  showLayerControls = true,
}: CadastralMapProps) {
  const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'satellite' | 'topo'>('osm');
  const [showBuffer, setShowBuffer] = useState<boolean>(true);
  const [showAlignment, setShowAlignment] = useState<boolean>(true);
  const [activeParcel, setActiveParcel] = useState<ProjectParcelPolygon | null>(
    SAMPLE_PROJECT_PARCELS.find((p) => p.ulpin === selectedUlpin) || SAMPLE_PROJECT_PARCELS[0]
  );

  const mapCenter: [number, number] = [21.0935, 79.0370];
  const zoomLevel = 13;

  return (
    <div className="relative w-full border border-slate-300 rounded overflow-hidden shadow-sm bg-slate-100 flex flex-col">
      {/* Map Top Control Bar */}
      {showLayerControls && (
        <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--color-gov-navy)] flex items-center gap-1 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">layers</span> OpenStreetMap GIS Viewer
            </span>
            <span className="text-slate-400">|</span>
            {/* Basemap Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 font-semibold">
              <button
                onClick={() => setActiveBaseLayer('osm')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBaseLayer === 'osm' ? 'bg-[var(--color-gov-navy)] text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                OpenStreetMap
              </button>
              <button
                onClick={() => setActiveBaseLayer('satellite')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBaseLayer === 'satellite' ? 'bg-[var(--color-gov-navy)] text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Satellite ESRI
              </button>
              <button
                onClick={() => setActiveBaseLayer('topo')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeBaseLayer === 'topo' ? 'bg-[var(--color-gov-navy)] text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Topographic
              </button>
            </div>
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBuffer}
                onChange={(e) => setShowBuffer(e.target.checked)}
                className="rounded border-slate-300 text-[var(--color-gov-navy)] focus:ring-0 cursor-pointer"
              />
              <span>60m RoW Corridor Buffer</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showAlignment}
                onChange={(e) => setShowAlignment(e.target.checked)}
                className="rounded border-slate-300 text-[var(--color-gov-navy)] focus:ring-0 cursor-pointer"
              />
              <span>Highway Centerline</span>
            </label>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div style={{ height, width: '100%' }} className="relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapViewController center={mapCenter} zoom={zoomLevel} />

          {/* Dynamic Base Map Tile Layer */}
          {activeBaseLayer === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {activeBaseLayer === 'satellite' && (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          {activeBaseLayer === 'topo' && (
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* 60m RoW Acquisition Buffer Polygon */}
          {showBuffer && (
            <Polygon
              positions={CORRIDOR_BUFFER_POLYGON}
              pathOptions={{
                color: '#FE932C',
                fillColor: '#FE932C',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Tooltip sticky>
                <span className="font-bold text-xs">NH-44 Right-of-Way (RoW) 60m Corridor Buffer</span>
              </Tooltip>
            </Polygon>
          )}

          {/* Alignment Centerline */}
          {showAlignment && (
            <Polyline
              positions={CORRIDOR_ALIGNMENT_LINE}
              pathOptions={{
                color: '#D97706',
                weight: 4,
                opacity: 0.9,
              }}
            >
              <Tooltip sticky>
                <span className="font-bold text-xs">Proposed Highway Alignment Centerline</span>
              </Tooltip>
            </Polyline>
          )}

          {/* Selected Land Acquisition Survey Polygons */}
          {SAMPLE_PROJECT_PARCELS.map((parcel) => {
            const isSelected = activeParcel?.id === parcel.id;
            const isHighRisk = parcel.riskLevel === 'High';

            const fillColor = isHighRisk
              ? '#BA1A1A'
              : isSelected
              ? '#0072BC'
              : parcel.status === 'Award Declared'
              ? '#2E7D32'
              : '#FE932C';

            return (
              <Polygon
                key={parcel.id}
                positions={parcel.coordinates}
                pathOptions={{
                  color: isSelected ? '#1B365D' : isHighRisk ? '#BA1A1A' : '#2E7D32',
                  fillColor: fillColor,
                  fillOpacity: isSelected ? 0.6 : 0.4,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    setActiveParcel(parcel);
                    if (onParcelSelect) onParcelSelect(parcel);
                  },
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs">
                    <div className="font-mono font-bold text-[#0072BC]">{parcel.ulpin}</div>
                    <div className="font-bold text-slate-900 text-sm">Survey Plot #{parcel.surveyNumber}</div>
                    <div className="text-slate-700"><strong>Owner:</strong> {parcel.ownerName}</div>
                    <div className="text-slate-600"><strong>Location:</strong> {parcel.village}</div>
                    <div className="text-slate-600"><strong>Acquired Area:</strong> {parcel.areaHa} Hectares</div>
                    {parcel.compensationINR && (
                      <div className="text-emerald-800 font-bold"><strong>Compensation:</strong> {parcel.compensationINR}</div>
                    )}
                    <div className="pt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[10px]">
                        {parcel.status}
                      </span>
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="center" permanent={isSelected}>
                  <span className="font-bold text-[11px] bg-white/90 px-1 py-0.5 rounded shadow-sm">
                    Plot #{parcel.surveyNumber} ({parcel.areaHa} Ha)
                  </span>
                </Tooltip>
              </Polygon>
            );
          })}

          {/* Centroid Marker for Active Selected Parcel */}
          {activeParcel && (
            <Marker
              position={activeParcel.coordinates[0]}
              icon={customPillarIcon}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-[var(--color-gov-navy)]">Selected Plot #{activeParcel.surveyNumber}</div>
                  <div>ULPIN: {activeParcel.ulpin}</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating GIS Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-300 rounded p-3 text-xs z-[1000] shadow-md space-y-1.5 pointer-events-auto">
          <div className="font-bold text-[var(--color-gov-navy)] uppercase tracking-wider mb-1 text-[11px]">
            GIS Polygon Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3 bg-[#2E7D32] opacity-80 border border-[#1b5e20] rounded-sm"></div>
            <span>Award Declared Parcel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3 bg-[#FE932C] opacity-80 border border-[#b45309] rounded-sm"></div>
            <span>Under Survey / RoR Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3 bg-[#BA1A1A] opacity-80 border border-[#7f1d1d] rounded-sm"></div>
            <span>Forest / High Risk Intersect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-[#D97706] rounded-sm"></div>
            <span>NH-44 Alignment Centerline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
