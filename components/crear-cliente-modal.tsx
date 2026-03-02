'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CrearClienteModalProps {
  onClose: () => void;
  // Esta función devolverá el ID del cliente recién creado al modal principal
  onClienteCreado: (nuevoClienteId: number, nombreCliente: string) => void; 
}

export default function CrearClienteModal({ onClose, onClienteCreado }: CrearClienteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    dni_cuit: '',
    whatsapp: '',
    email: '',
    direccion_principal: '',
    departamento: '',
    link_ubi: '',
    categoria: 'particular', // Valor por defecto
    estado_cliente: true,
    fecha_nacimiento: '',
    sexo: 'no_especifica',
    obra_social: '',
    coseguro: '',
    latitud: '',
    longitud: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData({
      ...formData,
      [name]: isCheckbox ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insertamos el cliente con la FECHA Y HORA EXACTA actual
      const { data, error } = await supabase
        .from('Clientes')
        .insert([
          {
            nombre: formData.nombre,
            dni_cuit: formData.dni_cuit || null,
            whatsapp: formData.whatsapp || null,
            email: formData.email || null,
            direccion_principal: formData.direccion_principal || null,
            departamento: formData.departamento || null,
            link_ubi: formData.link_ubi || null,
            categoria: formData.categoria,
            estado_cliente: formData.estado_cliente,
            fecha_nacimiento: formData.fecha_nacimiento ? formData.fecha_nacimiento : null,
            sexo: formData.sexo,
            obra_social: formData.obra_social || null,
            coseguro: formData.coseguro || null,
            latitud: formData.latitud ? parseFloat(formData.latitud) : null,
            longitud: formData.longitud ? parseFloat(formData.longitud) : null,
            created_at: new Date().toISOString() // <-- NUEVO: Guarda fecha y hora exacta
          }
        ])
        .select('id, nombre')
        .single();

      if (error) throw error;
      
      alert('¡Cliente creado con éxito!');
      // Le pasamos el ID y el nombre al modal de pedidos para que lo seleccione automáticamente
      onClienteCreado(data.id, data.nombre); 
    } catch (error: any) {
      console.error('Error al guardar cliente:', error?.message || error);
      alert(`Hubo un error al guardar el cliente: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Agregar Nuevo Cliente</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* --- DATOS PERSONALES --- */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Datos Personales</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">DNI / CUIT</label>
            <input type="text" name="dni_cuit" value={formData.dni_cuit} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
              <option value="no_especifica">No especifica</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* --- CONTACTO Y UBICACIÓN --- */}
          <div className="col-span-1 md:col-span-2 mt-2">
            <h3 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Contacto y Ubicación</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Ej: +549..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección Principal</label>
            <input type="text" name="direccion_principal" value={formData.direccion_principal} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <input type="text" name="departamento" value={formData.departamento} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link de Ubicación (Maps)</label>
            <input type="text" name="link_ubi" value={formData.link_ubi} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>

          {/* --- DATOS MÉDICOS --- */}
          <div className="col-span-1 md:col-span-2 mt-2">
            <h3 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Datos Médicos</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Obra Social</label>
            <input type="text" name="obra_social" value={formData.obra_social} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Coseguro</label>
            <input type="text" name="coseguro" value={formData.coseguro} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center mt-2">
            <input type="checkbox" name="estado_cliente" checked={formData.estado_cliente} onChange={handleChange} className="mr-2 h-4 w-4" id="estado_cliente" />
            <label htmlFor="estado_cliente" className="text-sm font-medium">Cliente Activo</label>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t dark:border-zinc-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear y Seleccionar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}