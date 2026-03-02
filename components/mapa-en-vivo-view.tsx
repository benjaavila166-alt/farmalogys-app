import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/lib/supabase'; // CORRIGE ESTA RUTA según dónde esté tu cliente de Supabase
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Solución para iconos de Leaflet en React/Vite/Next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [cadetes, setCadetes] = useState<Record<string, CadeteUbicacion>>({});

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

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[-31.5375, -68.5364]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {Object.values(cadetes).map(cadete => (
          cadete.latitud && cadete.longitud && (
            <Marker key={cadete.cadete_id} position={[cadete.latitud, cadete.longitud]}>
              <Popup>
                <strong>Cadete ID:</strong> {cadete.cadete_id.substring(0, 8)}... <br/>
                <strong>KM Recorridos:</strong> {cadete.kilometraje_recorrido} km <br/>
                <strong>Última act:</strong> {new Date(cadete.ultima_actualizacion).toLocaleTimeString()}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}