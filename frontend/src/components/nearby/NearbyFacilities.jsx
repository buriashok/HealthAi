import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, Star, Building, Loader2, RefreshCw, Stethoscope, Pill, Hospital } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const GEOAPIFY_KEY = '3705653e35a043918c42d857717752e6';

// Category config for healthcare types
const CATEGORY_OPTIONS = [
  { value: 'healthcare', label: 'All Healthcare', icon: <Stethoscope size={14} /> },
  { value: 'healthcare.hospital', label: 'Hospitals', icon: <Hospital size={14} /> },
  { value: 'healthcare.clinic_or_praxis', label: 'Clinics', icon: <Building size={14} /> },
  { value: 'healthcare.pharmacy', label: 'Pharmacies', icon: <Pill size={14} /> },
  { value: 'healthcare.dentist', label: 'Dentists', icon: <Stethoscope size={14} /> },
];

const NearbyFacilities = () => {
  const [locationState, setLocationState] = useState('Requesting Location...');
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('healthcare');
  const [selectedFacility, setSelectedFacility] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // ---------- Geolocation ----------
  const fetchLocation = () => {
    setLocationState('GPS locating...');
    setErrorMsg('');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ lat, lon });
          setLocationState(`Showing facilities near: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
        },
        () => {
          // Fallback to a default location (New Delhi)
          const fallback = { lat: 28.6139, lon: 77.2090 };
          setCoords(fallback);
          setErrorMsg('Location access denied. Showing default area (New Delhi).');
          setLocationState('Using default location');
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLocationState('Location unavailable');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // ---------- Fetch Facilities from Geoapify Places API ----------
  const fetchFacilities = async (lat, lon, category) => {
    setLoading(true);
    try {
      const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const parsed = data.features.map((f, idx) => {
          const props = f.properties;
          const distance = props.distance || 0;
          return {
            id: idx,
            name: props.name || props.address_line1 || 'Healthcare Facility',
            type: formatCategory(props.categories),
            address: props.address_line2 || props.formatted || '',
            distance: distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`,
            distanceRaw: distance,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            phone: props.contact?.phone || null,
            website: props.website || props.contact?.website || null,
            openingHours: props.opening_hours || null,
          };
        });
        // Sort by distance
        parsed.sort((a, b) => a.distanceRaw - b.distanceRaw);
        setFacilities(parsed);
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.error('Geoapify fetch error:', err);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCategory = (categories) => {
    if (!categories || categories.length === 0) return 'Healthcare';
    const cat = categories[0];
    if (cat.includes('hospital')) return 'Hospital';
    if (cat.includes('pharmacy')) return 'Pharmacy';
    if (cat.includes('dentist')) return 'Dentist';
    if (cat.includes('clinic') || cat.includes('praxis')) return 'Clinic';
    return 'Healthcare';
  };

  // Fetch facilities when coords or category changes
  useEffect(() => {
    if (coords) {
      fetchFacilities(coords.lat, coords.lon, selectedCategory);
    }
  }, [coords, selectedCategory]);

  // ---------- Leaflet Map ----------
  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    // Initialize map if not already
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: 14,
        zoomControl: false,
      });

      // Geoapify dark-matter tile layer
      const isRetina = L.Browser.retina;
      const baseUrl = `https://maps.geoapify.com/v1/tile/dark-matter-purple-roads/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;
      const retinaUrl = `https://maps.geoapify.com/v1/tile/dark-matter-purple-roads/{z}/{x}/{y}@2x.png?apiKey=${GEOAPIFY_KEY}`;

      L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
        maxZoom: 20,
      }).addTo(mapRef.current);

      // Zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([coords.lat, coords.lon], 14);
    }

    // User location marker (pulsing blue dot)
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div style="
        width: 16px; height: 16px; border-radius: 50%;
        background: #4F46E5; border: 3px solid white;
        box-shadow: 0 0 12px rgba(79, 70, 229, 0.6), 0 0 24px rgba(79, 70, 229, 0.3);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add user marker
    const userMarker = L.marker([coords.lat, coords.lon], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup('<b>📍 Your Location</b>');
    markersRef.current.push(userMarker);

    // Add facility markers
    facilities.forEach((f, idx) => {
      const color = f.type === 'Hospital' ? '#EF4444' :
                    f.type === 'Pharmacy' ? '#10B981' :
                    f.type === 'Dentist' ? '#F59E0B' : '#4F46E5';
      
      const emoji = f.type === 'Hospital' ? '🏥' :
                    f.type === 'Pharmacy' ? '💊' :
                    f.type === 'Dentist' ? '🦷' : '🏨';

      const facilityIcon = L.divIcon({
        className: 'facility-marker',
        html: `<div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: ${color}; border: 2px solid rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        ">${emoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([f.lat, f.lon], { icon: facilityIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 180px;">
            <b style="font-size: 13px;">${f.name}</b><br/>
            <span style="color: #666; font-size: 11px;">${f.type} • ${f.distance}</span><br/>
            <span style="color: #888; font-size: 11px;">${f.address}</span>
            ${f.phone ? `<br/><a href="tel:${f.phone}" style="font-size: 11px;">📞 ${f.phone}</a>` : ''}
          </div>
        `);
      
      marker.on('click', () => setSelectedFacility(idx));
      markersRef.current.push(marker);
    });

    return () => {};
  }, [coords, facilities]);

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Pan map to selected facility
  const handleFacilityClick = (facility, idx) => {
    setSelectedFacility(idx);
    if (mapRef.current) {
      mapRef.current.setView([facility.lat, facility.lon], 16, { animate: true });
      // Open the popup for the matching marker (offset by 1 for user marker)
      if (markersRef.current[idx + 1]) {
        markersRef.current[idx + 1].openPopup();
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h2 className="page-title">Nearby Healthcare Facilities</h2>
        <p className="page-subtitle">Real-time results from Geoapify Places API • Powered by OpenStreetMap data</p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATEGORY_OPTIONS.map(cat => (
          <button
            key={cat.value}
            className={selectedCategory === cat.value ? 'btn' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '20px' }}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', flex: 1, minHeight: 0 }}>
        {/* Map */}
        <div className="glass-panel" style={{ flex: '1 1 450px', minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: errorMsg ? 'var(--warning-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} />
              {errorMsg ? errorMsg : locationState}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-accent" onClick={fetchLocation} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Navigation size={14} /> Locate Me
              </button>
            </div>
          </div>
          
          <div 
            ref={mapContainerRef}
            style={{ flex: 1, minHeight: '300px' }}
          />
        </div>

        {/* Facilities List */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
          {loading ? (
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '12px' }}>
              <Loader2 className="animate-spin" size={24} color="var(--primary-color)" />
              <span>Searching nearby facilities...</span>
            </div>
          ) : facilities.length === 0 ? (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
              <MapPin size={32} color="var(--text-secondary)" />
              <span style={{ color: 'var(--text-secondary)' }}>No facilities found in this area.</span>
              <button className="btn" onClick={() => fetchFacilities(coords?.lat, coords?.lon, selectedCategory)} style={{ marginTop: '8px' }}>
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
                Found <strong style={{ color: 'var(--accent-color)' }}>{facilities.length}</strong> facilities within 5km
              </div>
              {facilities.map((facility, idx) => {
                const typeColor = facility.type === 'Hospital' ? '#EF4444' :
                                  facility.type === 'Pharmacy' ? '#10B981' :
                                  facility.type === 'Dentist' ? '#F59E0B' : '#4F46E5';
                return (
                  <div 
                    key={facility.id} 
                    className="glass-panel animate-fade-in"
                    onClick={() => handleFacilityClick(facility, idx)}
                    style={{ 
                      padding: '16px', 
                      display: 'flex', flexDirection: 'column', gap: '8px',
                      cursor: 'pointer',
                      border: selectedFacility === idx ? `1px solid ${typeColor}` : '1px solid var(--surface-border)',
                      transition: 'all 0.2s ease',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', lineHeight: '1.3' }}>{facility.name}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 600,
                            background: `${typeColor}22`, color: typeColor,
                            padding: '2px 8px', borderRadius: '12px',
                          }}>
                            {facility.type}
                          </span>
                          {facility.address && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                              {facility.address}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(79, 70, 229, 0.15)', padding: '4px 10px', borderRadius: '12px',
                        fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        <Navigation size={12} /> {facility.distance}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button 
                        className="btn" 
                        style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`, '_blank');
                        }}
                      >
                        <Navigation size={14} /> Directions
                      </button>
                      {facility.phone && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${facility.phone}`, '_self');
                          }}
                        >
                          <Phone size={14} /> Call
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyFacilities;
