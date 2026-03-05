'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EditarClienteModalProps {
  cliente: any;
  onClose: () => void;
  onClienteEditado: () => void;
}

export default function EditarClienteModal({ cliente, onClose, onClienteEditado }: EditarClienteModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Estados para las listas de Configuración (Maestros)
  const [obrasSociales, setObrasSociales] = useState<any[]>([]);
  const [coseguros, setCoseguros] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: cliente.nombre || '',
    dni_cuit: cliente.dni_cuit || '',
    fecha_nacimiento: cliente.fecha_nacimiento || '',
    sexo: cliente.sexo || 'no_especifica',
    whatsapp: cliente.whatsapp || '',
    email: cliente.email || '',
    direccion_principal: cliente.direccion_principal || '',
    departamento: cliente.departamento || '',
    link_ubi: cliente.link_ubi || '',
    latitud: cliente.latitud || '',
    longitud: cliente.longitud || '',
    obra_social: cliente.obra_social || '',
    coseguro: cliente.coseguro || '',
    numero_afiliado: cliente.numero_afiliado || '',
    categoria: cliente.categoria || '',
    estado_cliente: cliente.estado_cliente !== false,
  });

  // Cargamos las opciones de configuración al abrir el modal
  useEffect(() => {
    const cargarMaestros = async () => {
      const { data: os } = await supabase.from('obras_sociales').select('nombre').order('nombre');
      const { data: cos } = await supabase.from('coseguros').select('nombre').order('nombre');
      const { data: cat } = await supabase.from('categorias_cliente').select('nombre').order('nombre');

      if (os) setObrasSociales(os);
      if (cos) setCoseguros(cos);
      if (cat) setCategorias(cat);
    };
    cargarMaestros();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Lógica para extraer coordenadas de links de Google Maps
    if (name === 'link_ubi' && value.includes('@')) {
      const match = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setFormData(prev => ({ 
          ...prev, 
          link_ubi: value, 
          latitud: match[1], 
          longitud: match[2] 
        }));
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('Clientes') // Recordá usar comillas dobles en SQL si falla por mayúsculas
        .update({
            nombre: formData.nombre,
            dni_cuit: formData.dni_cuit || null,
            whatsapp: formData.whatsapp || null,
            email: formData.email || null,
            direccion_principal: formData.direccion_principal || null,
            departamento: formData.departamento || null,
            link_ubi: formData.link_ubi || null,
            latitud: formData.latitud ? parseFloat(formData.latitud.toString()) : null,
            longitud: formData.longitud ? parseFloat(formData.longitud.toString()) : null,
            categoria: formData.categoria || 'general',
            estado_cliente: formData.estado_cliente,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            sexo: formData.sexo,
            obra_social: formData.obra_social || null,
            coseguro: formData.coseguro || null,
            numero_afiliado: formData.numero_afiliado || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', cliente.id);

      if (error) throw error;
      
      onClienteEditado();
      onClose();
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error);
      alert(`Error: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Editar Cliente: {cliente.nombre}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="col-span-1 md:col-span-2 border-b pb-1">
            <h3 className="text-sm font-semibold text-blue-600">Datos Personales y Contacto</h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>

          <div className="col-span-1 md:col-span-2 border-b pb-1 mt-2">
            <h3 className="text-sm font-semibold text-blue-600">Ubicación</h3>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección Principal</label>
            <input type="text" name="direccion_principal" value={formData.direccion_principal} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link de Maps</label>
            <input type="text" name="link_ubi" value={formData.link_ubi} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <input type="text" name="departamento" value={formData.departamento} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>

          <div className="col-span-1 md:col-span-2 border-b pb-1 mt-2">
            <h3 className="text-sm font-semibold text-blue-600">Clasificación y Médicos</h3>
          </div>

          {/* SELECTOR DE OBRA SOCIAL */}
          <div>
            <label className="block text-sm font-medium mb-1">Obra Social</label>
            <select name="obra_social" value={formData.obra_social} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800">
              <option value="">Ninguna / Particular</option>
              {obrasSociales.map((os) => (
                <option key={os.nombre} value={os.nombre}>{os.nombre}</option>
              ))}
            </select>
          </div>

          {/* SELECTOR DE COSEGURO */}
          <div>
            <label className="block text-sm font-medium mb-1">Coseguro</label>
            <select name="coseguro" value={formData.coseguro} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800">
              <option value="">Ninguno</option>
              {coseguros.map((cs) => (
                <option key={cs.nombre} value={cs.nombre}>{cs.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nº Afiliado</label>
            <input type="text" name="numero_afiliado" value={formData.numero_afiliado} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800" />
          </div>

          {/* SELECTOR DE CATEGORÍA */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select 
              name="categoria" 
              value={formData.categoria} 
              onChange={handleChange} 
              className="w-full border rounded p-2 dark:bg-zinc-800"
            >
              <option value="">General</option>
              {categorias.map((cat) => (
                <option key={cat.nombre} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}