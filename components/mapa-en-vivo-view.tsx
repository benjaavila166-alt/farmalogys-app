"use client"

import { useState, useEffect } from "react"
import Map, { NavigationControl, FullscreenControl, GeolocateControl, Marker, Popup } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { supabase } from '@/lib/supabase'

interface CadeteUbicacion {
  id: number;
  cadete_id: string;
  latitud: number;
  longitud: number;
  kilometraje_recorrido: number;
  activo: boolean;
  ultima_actualizacion: string;
}

export function MapaEnVivoView() {
  // Centrado inicialmente en San Juan
  const [viewState, setViewState] = useState({
    longitude: -68.5363, 
    latitude: -31.5375,
    zoom: 13
  })

  const [cadetes, setCadetes] = useState<Record<string, CadeteUbicacion>>({});
  const [selectedCadete, setSelectedCadete] = useState<CadeteUbicacion | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    const cargarUbicaciones = async () => {
      const { data } = await supabase
        .from('ubicacion_cadetes')
        .select('*')
        .eq('activo', true);
        
      if (data) {
        const estadoInicial: Record<string, CadeteUbicacion> = {};
        data.forEach((cadete: CadeteUbicacion) => { 
          estadoInicial[cadete.cadete_id] = cadete; 
        });
        setCadetes(estadoInicial);
      }
    };
    
    cargarUbicaciones();

    // Escucha en tiempo real de los movimientos de los cadetes
    const suscripcion = supabase
      .channel('mapa_en_vivo')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ubicacion_cadetes' },
        (payload) => {
          const nuevoDato = payload.new as CadeteUbicacion;
          setCadetes(prev => ({ ...prev, [nuevoDato.cadete_id]: nuevoDato }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(suscripcion);
    };
  }, []);

  if (!mapboxToken) {
    return <div className="p-4 text-red-500 font-bold">Falta configurar NEXT_PUBLIC_MAPBOX_TOKEN en el archivo .env.local</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Mapa en Vivo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Seguimiento en tiempo real de cadetes y rutas.
        </p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border shadow-sm relative">
        <Map
          {...viewState}
          onMove={(evt: any) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={mapboxToken}
          style={{ width: "100%", height: "100%" }}
        >
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          <NavigationControl position="top-right" />
          
          {/* Renderizamos los marcadores de los cadetes */}
          {Object.values(cadetes).map(cadete => (
            cadete.latitud && cadete.longitud && (
              <Marker 
                key={cadete.cadete_id} 
                longitude={cadete.longitud} 
                latitude={cadete.latitud}
                onClick={(e: any) => {
                  e.originalEvent.stopPropagation();
                  setSelectedCadete(cadete);
                }}
              >
                {/* Ícono personalizado para el cadete */}
                <div className="bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-lg">
                  🏍️
                </div>
              </Marker>
            )
          ))}

          {/* Popup con la info cuando hacés click en un cadete */}
          {selectedCadete && (
            <Popup
              longitude={selectedCadete.longitud}
              latitude={selectedCadete.latitud}
              anchor="bottom"
              onClose={() => setSelectedCadete(null)}
              closeOnClick={false}
              className="text-black"
            >
              <div className="p-1 text-sm">
                <strong className="block mb-1 border-b pb-1">Cadete ID: {selectedCadete.cadete_id.substring(0, 5)}...</strong>
                <p><strong>KM Recorridos:</strong> {selectedCadete.kilometraje_recorrido} km</p>
                <p><strong>Última act:</strong> {new Date(selectedCadete.ultima_actualizacion).toLocaleTimeString()}</p>
              </div>
            </Popup>
          )}

        </Map>
      </div>
    </div>
  )
}