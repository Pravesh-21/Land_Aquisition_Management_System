'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';

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

// Standalone Land Acquisition Polygons (Distinct Separate Sites - No Adjacent Touching)
export interface ProjectParcelPolygon {
  id: string;
  projectName: string;
  ulpin: string;
  surveyNumber: string;
  ownerName: string;
  village: string;
  areaHa: number;
  status: 'Award Declared' | 'Under Survey' | 'Possession Taken' | 'Clearance Review';
  coordinates: [number, number][]; // [Lat, Lng]
  riskLevel?: 'Low' | 'Medium' | 'High';
  compensationINR?: string;
  assetCount: {
    structures: number;
    trees: number;
    wells: number;
    total: number;
  };
}

export const SAMPLE_PROJECT_PARCELS: ProjectParcelPolygon[] = [
  {
    id: 'P-1',
    projectName: 'NH-44 Nagpur-Hyderabad Corridor (Phase II)',
    ulpin: 'IN-MH-440001-A12B',
    surveyNumber: '442/1-A',
    ownerName: 'Sh. Rajendra Patel',
    village: 'Hingna Zone, Nagpur',
    areaHa: 1.42,
    status: 'Award Declared',
    compensationINR: '₹ 47,38,500',
    riskLevel: 'Low',
    assetCount: {
      structures: 1, // 1 Residential Pucca House
      trees: 24,    // 24 Fruit/Timber Trees (Mango, Teak)
      wells: 1,     // 1 Open Irrigation Well
      total: 26,
    },
    // Standalone Site 1 (South-West Alignment)
    coordinates: [
      [21.0810, 79.0140],
      [21.0865, 79.0195],
      [21.0835, 79.0255],
      [21.0780, 79.0200],
    ],
  },
  {
    id: 'P-2',
    projectName: 'NH-44 Nagpur-Hyderabad Corridor (Phase II)',
    ulpin: 'IN-MH-440001-B04K',
    surveyNumber: '445/1',
    ownerName: 'Smt. Kamla Devi & Co-owners',
    village: 'Wanadongri Interchange Zone, Nagpur',
    areaHa: 2.15,
    status: 'Under Survey',
    compensationINR: '₹ 72,15,000',
    riskLevel: 'Medium',
    assetCount: {
      structures: 2, // 2 Farm Houses
      trees: 38,    // 38 Trees
      wells: 2,     // 2 Borewells
      total: 42,
    },
    // Standalone Site 2 (Mid-Alignment Interchange)
    coordinates: [
      [21.0930, 79.0330],
      [21.0980, 79.0385],
      [21.0950, 79.0445],
      [21.0900, 79.0390],
    ],
  },
  {
    id: 'P-3',
    projectName: 'NH-44 Nagpur-Hyderabad Corridor (Phase II)',
    ulpin: 'IN-MH-440001-C09M',
    surveyNumber: '448/3',
    ownerName: 'Maharashtra Forest Dept (Compartment 42-B)',
    village: 'Karanja Wildlife Buffer Zone',
    areaHa: 4.80,
    status: 'Clearance Review',
    compensationINR: '₹ 98,40,000 (NPV)',
    riskLevel: 'High',
    assetCount: {
      structures: 0,
      trees: 1250,  // 1,250 Forest Trees
      wells: 0,
      total: 1250,
    },
    // Standalone Site 3 (North Forest Eco-Duct Area)
    coordinates: [
      [21.1050, 79.0520],
      [21.1110, 79.0585],
      [21.1070, 79.0665],
      [21.1010, 79.0600],
    ],
  },
  {
    id: 'P-4',
    projectName: 'NH-44 Nagpur-Hyderabad Corridor (Phase II)',
    ulpin: 'IN-MH-440001-D15P',
    surveyNumber: '450/2-A',
    ownerName: 'Gram Panchayat Common Land',
    village: 'Butibori Industrial Hub',
    areaHa: 3.20,
    status: 'Possession Taken',
    compensationINR: '₹ 1,07,00,000',
    riskLevel: 'Low',
    assetCount: {
      structures: 3, // 1 Community Hall, 2 Sheds
      trees: 45,    // 45 Trees
      wells: 1,     // 1 Public Borewell
      total: 49,
    },
    // Standalone Site 4 (North-East Terminal Area)
    coordinates: [
      [21.1170, 79.0710],
      [21.1235, 79.0775],
      [21.1195, 79.0855],
      [21.1130, 79.0790],
    ],
  },
];

// Corridor Alignment Centerline Coordinates
export const CORRIDOR_ALIGNMENT_LINE: [number, number][] = [
  [21.0760, 79.0080],
  [21.0820, 79.0170],
  [21.0940, 79.0350],
  [21.1060, 79.0550],
  [21.1180, 79.0730],
  [21.1280, 79.0900],
];

// Right-of-Way (RoW) 60-meter Corridor Buffer Polygon
export const CORRIDOR_BUFFER_POLYGON: [number, number][] = [
  [21.0775, 79.0065],
  [21.0835, 79.0155],
  [21.0955, 79.0335],
  [21.1075, 79.0535],
  [21.1195, 79.0715],
  [21.1295, 79.0885],
  [21.1265, 79.0915],
  [21.1165, 79.0745],
  [21.1045, 79.0565],
  [21.0925, 79.0365],
  [21.0805, 79.0185],
  [21.0745, 79.0095],
];

interface CadastralMapProps {
  height?: string;
  selectedUlpin?: string;
  onParcelSelect?: (parcel: ProjectParcelPolygon) => void;
  showLayerControls?: boolean;
  showAssets?: boolean; // If false (e.g. for Citizen), asset counts are hidden
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
  showAssets,
}: CadastralMapProps) {
  const { role } = useAuth();
  // If showAssets is explicitly provided, use it; otherwise, hide for CITIZEN and show for all officers
  const displayAssets = showAssets !== undefined ? showAssets : role !== 'CITIZEN';

  const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'satellite' | 'topo'>('osm');
  const [showBuffer, setShowBuffer] = useState<boolean>(true);
  const [showAlignment, setShowAlignment] = useState<boolean>(true);
  const [activeParcel, setActiveParcel] = useState<ProjectParcelPolygon | null>(
    SAMPLE_PROJECT_PARCELS.find((p) => p.ulpin === selectedUlpin) || SAMPLE_PROJECT_PARCELS[0]
  );

  const isAuthority = role !== 'CITIZEN';
  const [bboxMode, setBboxMode] = useState<boolean>(false);
  const [activeBbox, setActiveBbox] = useState<[number, number][] | null>(null);

  const BBOX_PRESETS: { [key: string]: [number, number][] } = {
    'Hingna Sector': [
      [21.0750, 79.0100],
      [21.0900, 79.0100],
      [21.0900, 79.0300],
      [21.0750, 79.0300],
    ],
    'Interchange Zone': [
      [21.0880, 79.0280],
      [21.1020, 79.0280],
      [21.1020, 79.0480],
      [21.0880, 79.0480],
    ],
  };

  const selectBboxPreset = (name: string) => {
    setActiveBbox(BBOX_PRESETS[name]);
    setBboxMode(true);
  };

  const mapCenter: [number, number] = [21.1000, 79.0450];
  const zoomLevel = 12;

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

          {/* Layer Toggles & Authority Bounding Box Tool */}
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

            {/* Strict RBAC: Bounding Box Drawing Tool - Exclusive to Government Authorities */}
            {isAuthority && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    if (bboxMode) {
                      setBboxMode(false);
                      setActiveBbox(null);
                    } else {
                      selectBboxPreset('Hingna Sector');
                    }
                  }}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 font-bold transition-all shadow-xs ${
                    bboxMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-[#0072BC] hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Authority Tool: Draw square/rectangle bounding box to inspect enclosed cadastral parcels"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_square</span>
                  <span>{bboxMode ? 'Clear Bounding Box' : 'Bounding Box Tool (AOI)'}</span>
                </button>

                {bboxMode && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => selectBboxPreset('Hingna Sector')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px]"
                    >
                      Sector 1
                    </button>
                    <button
                      type="button"
                      onClick={() => selectBboxPreset('Interchange Zone')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px]"
                    >
                      Sector 2
                    </button>
                  </div>
                )}
              </div>
            )}
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
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Tooltip sticky>
                <div className="p-1 text-xs font-bold space-y-0.5">
                  <div className="text-[#1B365D]">🏗 Project: NH-44 Nagpur-Hyderabad Corridor (Phase II)</div>
                  <div className="text-amber-800 font-normal">Right-of-Way (RoW) 60m Corridor Buffer</div>
                </div>
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
                <div className="p-1 text-xs font-bold space-y-0.5">
                  <div className="text-[#1B365D]">🏗 Project: NH-44 Nagpur-Hyderabad Corridor (Phase II)</div>
                  <div className="text-slate-600 font-normal">Highway Centerline Trajectory</div>
                </div>
              </Tooltip>
            </Polyline>
          )}

          {/* Authority Bounding Box Rectangle Layer (AOI) */}
          {isAuthority && bboxMode && activeBbox && (
            <Polygon
              positions={activeBbox}
              pathOptions={{
                color: '#2563EB',
                fillColor: '#3B82F6',
                fillOpacity: 0.25,
                weight: 3,
                dashArray: '6, 6',
              }}
            >
              <Tooltip permanent sticky>
                <div className="p-1.5 text-xs font-bold space-y-0.5 bg-blue-900 text-white rounded">
                  <div>📐 Authority Bounding Box (AOI)</div>
                  <div className="text-[10px] font-normal text-blue-200">Enclosed Area: 8.42 Ha • Intersected Parcels: 2</div>
                </div>
              </Tooltip>
            </Polygon>
          )}

          {/* Standalone Separate Land Acquisition Polygons */}
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
                  fillOpacity: isSelected ? 0.65 : 0.45,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    setActiveParcel(parcel);
                    if (onParcelSelect) onParcelSelect(parcel);
                  },
                }}
              >
                {/* On-Click Popup showing Project Name, Parcel, and (if officer) Asset Count */}
                <Popup>
                  <div className="p-1.5 space-y-1.5 text-xs min-w-[240px]">
                    {/* Project Header */}
                    <div className="bg-[#1B365D] text-white p-2 rounded -mx-1 -mt-1 space-y-0.5">
                      <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Acquisition Project</div>
                      <div className="font-bold text-xs leading-tight">{parcel.projectName}</div>
                    </div>

                    <div className="pt-1">
                      <div className="font-mono font-bold text-[#0072BC]">{parcel.ulpin}</div>
                      <div className="font-bold text-slate-900 text-sm">Survey Plot #{parcel.surveyNumber}</div>
                    </div>

                    <div className="text-slate-700"><strong>Owner:</strong> {parcel.ownerName}</div>
                    <div className="text-slate-600"><strong>Location:</strong> {parcel.village}</div>
                    <div className="text-slate-600"><strong>Acquired Area:</strong> {parcel.areaHa} Hectares</div>

                    {/* Standing Asset Count Breakdown (Hidden for Citizens, Shown for Officers) */}
                    {displayAssets && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded my-1.5 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-[var(--color-gov-navy)] flex items-center justify-between">
                          <span>Section 29 Standing Assets</span>
                          <span className="font-mono text-xs">{parcel.assetCount.total} Total</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-700">
                          <div className="bg-white p-1 rounded border border-slate-100 text-center">
                            <div className="font-bold text-slate-900">{parcel.assetCount.structures}</div>
                            <div className="text-[9px] text-slate-500">Structures</div>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-100 text-center">
                            <div className="font-bold text-emerald-800">{parcel.assetCount.trees}</div>
                            <div className="text-[9px] text-slate-500">Trees</div>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-100 text-center">
                            <div className="font-bold text-blue-800">{parcel.assetCount.wells}</div>
                            <div className="text-[9px] text-slate-500">Wells</div>
                          </div>
                        </div>
                      </div>
                    )}

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

                {/* On-Hover Tooltip pointing Project Name and Parcel */}
                <Tooltip direction="top" sticky>
                  <div className="p-1 text-xs space-y-0.5">
                    <div className="font-bold text-[#1B365D] flex items-center gap-1">
                      <span>🏗 {parcel.projectName}</span>
                    </div>
                    <div className="text-slate-700 font-medium">
                      📍 Plot #{parcel.surveyNumber} ({parcel.areaHa} Ha)
                      {displayAssets && (
                        <> • <span className="text-amber-800 font-bold">{parcel.assetCount.total} Assets</span></>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Owner: {parcel.ownerName} ({parcel.village})
                    </div>
                  </div>
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
                <div className="p-1 text-xs space-y-0.5">
                  <div className="font-bold text-[var(--color-gov-navy)]">{activeParcel.projectName}</div>
                  <div className="font-medium text-slate-800">Plot #{activeParcel.surveyNumber} ({activeParcel.ulpin})</div>
                  <div className="text-slate-600">Area: {activeParcel.areaHa} Ha</div>
                  {displayAssets && (
                    <div className="text-slate-600">Assets: {activeParcel.assetCount.total} Items</div>
                  )}
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
