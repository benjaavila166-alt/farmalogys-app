// components/agregar-pedido-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';
import CrearClienteModal from './crear-cliente-modal'; 

interface Cliente {
  id: number;
  nombre: string;
  direccion_principal: string | null;
  whatsapp: string | null;
  departamento: string | null;
  link_ubi: string | null;
}

interface AgregarPedidoModalProps {
  onClose: () => void;
  onPedidoAgregado: () => void;
}

export default function AgregarPedidoModal({ onClose, onPedidoAgregado }: AgregarPedidoModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);

  const [formData, setFormData] = useState({
    fecha_programada: '', 
    cliente_id: '', 
    detalle_pedido: '',
    monto_a_cobrar: 0,
    metodo_pago: 'efectivo',
    estado_pago: 'pendiente',
    tipo_servicio: 'envio', 
    estado_logistico: 'sin_atender',
    prioridad: false,
    tipo_pedido: 'particular',
    indicaciones_cadete: '',
    direccion_entrega: '',
    telefono_contacto: '',
    indicaciones_ubicacion: '',
    link_ubi: ''
  });

  const fetchClientes = async () => {
    try {
      setCargandoClientes(true);
      const { data, error } = await supabase
        .from('Clientes') 
        .select('id, nombre, direccion_principal, whatsapp, departamento, link_ubi') 
        .order('nombre');

      if (error) throw error;
      if (data) setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setFormData(prev => ({ ...prev, fecha_programada: new Date().toISOString().split('T')[0] }));
    fetchClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        return;
    }

    if (name === 'tipo_servicio') {
      setFormData(prev => ({ ...prev, [name]: value, estado_logistico: 'sin_atender' }));
      return;
    }

    if (name === 'cliente_id') {
      const selectedClient = clientes.find(c => c.id.toString() === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        direccion_entrega: selectedClient?.direccion_principal || '',
        telefono_contacto: selectedClient?.whatsapp || '',
        indicaciones_ubicacion: selectedClient?.departamento || '',
        link_ubi: selectedClient?.link_ubi || ''
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.cliente_id) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    setLoading(true);

    let detalleFinal = formData.detalle_pedido;

    if ((formData.estado_logistico === 'listo_para_entregar' || formData.estado_logistico === 'retirar_drogueria') && formData.indicaciones_cadete) {
      detalleFinal += `\n\n-- INDICACIONES PARA CADETE --\n${formData.indicaciones_cadete}`;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .insert([{
            fecha_programada: formData.fecha_programada,
            cliente_id: parseInt(formData.cliente_id),
            detalle_pedido: detalleFinal,
            monto_a_cobrar: parseFloat(formData.monto_a_cobrar.toString()), 
            metodo_pago: formData.metodo_pago,
            estado_pago: formData.estado_pago,
            tipo_servicio: formData.tipo_servicio,
            estado_logistico: formData.estado_logistico,
            prioridad: formData.prioridad,
            tipo_pedido: formData.tipo_servicio === 'envio' ? formData.tipo_pedido : 'particular',
            direccion_entrega: formData.tipo_servicio === 'envio' ? formData.direccion_entrega : null,
            telefono_contacto: formData.tipo_servicio === 'envio' ? formData.telefono_contacto : null,
            indicaciones_ubicacion: formData.tipo_servicio === 'envio' ? formData.indicaciones_ubicacion : null,
            link_ubi: formData.tipo_servicio === 'envio' ? formData.link_ubi : null,
            created_at: new Date().toISOString() 
        }]);

      if (error) throw error;
      
      onPedidoAgregado(); 
      onClose(); 
    } catch (error: any) { 
      console.error('Error al guardar:', error?.message || error);
      alert(`Hubo un error al guardar: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteCreado = (nuevoId: number, nuevoNombre: string) => {
    setClientes((prev) => [...prev, { id: nuevoId, nombre: nuevoNombre, direccion_principal: '', whatsapp: '', departamento: '', link_ubi: '' }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setFormData((prev) => ({ 
      ...prev, 
      cliente_id: nuevoId.toString(),
      direccion_entrega: '',
      telefono_contacto: '',
      indicaciones_ubicacion: '',
      link_ubi: ''
    }));
    setModalClienteAbierto(false);
  };

  if (!isMounted) {
    return null;
  }

  const estadosEnvio = [
    { value: 'sin_atender', label: 'Sin atender' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'retirar_drogueria', label: 'Retirar de droguería' },
    { value: 'entregar_cadete', label: 'Entregar a cadete' },
    { value: 'en_camino', label: 'En camino' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'reprogramado', label: 'Reprogramado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const estadosRetiro = [
    { value: 'sin_atender', label: 'Sin atender' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'listo_para_entregar', label: 'Listo para entregar' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'reprogramado', label: 'Reprogramado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const opcionesEstado = formData.tipo_servicio === 'envio' ? estadosEnvio : estadosRetiro;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
          <h2 className="text-xl font-bold mb-4">Agregar Nuevo Pedido</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <div className="flex gap-2">
                <select required name="cliente_id" value={formData.cliente_id} onChange={handleChange} className="flex-1 border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                  <option value="" disabled>
                    {cargandoClientes ? 'Cargando clientes...' : 'Seleccionar cliente...'}
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => setModalClienteAbierto(true)} 
                  className="px-3 py-2 bg-zinc-100 border rounded dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center gap-1.5 text-sm"
                >
                    <Plus className="size-4" />
                    Nuevo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha Programada</label>
              <input required type="date" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monto a Cobrar ($)</label>
              <input required type="number" name="monto_a_cobrar" value={formData.monto_a_cobrar} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Ej: 500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Detalle del Pedido</label>
              <textarea name="detalle_pedido" value={formData.detalle_pedido} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Ej: Bolsa con medicamentos..." rows={2}></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Servicio</label>
              <select name="tipo_servicio" value={formData.tipo_servicio} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="envio">Envío</option>
                <option value="retiro">Retiro</option>
              </select>
            </div>

            {formData.tipo_servicio === 'envio' && (
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Envío</label>
                <select name="tipo_pedido" value={formData.tipo_pedido} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                  <option value="particular">Particular</option>
                  <option value="internacion_domiciliaria">Internación Domiciliaria</option>
                  <option value="obra_social">Obra Social</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Estado Logístico</label>
              <select name="estado_logistico" value={formData.estado_logistico} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                {opcionesEstado.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Medio de Pago</label>
              <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="efectivo">Efectivo</option>
                <option value="posnet">Posnet</option>
                <option value="cobrado">Cobrado</option>
              </select>
            </div>

            {/* Este bloque entero ahora solo aparece si el servicio es envío */}
            {formData.tipo_servicio === 'envio' && (
              <div className="col-span-2 border-t pt-4 mt-2 dark:border-zinc-700">
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-md border dark:border-zinc-700/50">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium mb-1">Dirección de Destino</label>
                        <input type="text" name="direccion_entrega" value={formData.direccion_entrega} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Dirección..." />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium mb-1">Nro de Teléfono</label>
                        <input type="text" name="telefono_contacto" value={formData.telefono_contacto} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Teléfono..." />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium mb-1">Indicaciones de la Ubicación</label>
                        <textarea name="indicaciones_ubicacion" value={formData.indicaciones_ubicacion} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" rows={2} placeholder="Ej: Casa de rejas negras..."></textarea>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium mb-1">Link de Google Maps</label>
                        <textarea name="link_ubi" value={formData.link_ubi} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" rows={2} placeholder="https://maps.google.com/..."></textarea>
                    </div>
                </div>
              </div>
            )}

            {(formData.estado_logistico === 'listo_para_entregar' || formData.estado_logistico === 'retirar_drogueria') && (
              <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-900/50">
                  <label className="block text-sm font-bold mb-1 text-blue-700 dark:text-blue-400">Indicaciones exclusivas de Farmacia a Cadete</label>
                  <textarea name="indicaciones_cadete" value={formData.indicaciones_cadete} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700 mt-2" rows={2} placeholder="Ej: Tener cuidado con la caja, cobrar exacto..."></textarea>
              </div>
            )}

            <div className="col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" name="prioridad" id="prioridad" checked={formData.prioridad} onChange={handleChange} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="prioridad" className="text-sm font-medium text-red-600">Marcar como Alta Prioridad</label>
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-6 pt-6 border-t dark:border-zinc-700">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Agregando...' : 'Agregar Pedido'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {modalClienteAbierto && (
        <CrearClienteModal 
          onClose={() => setModalClienteAbierto(false)}
          onClienteCreado={handleClienteCreado}
        />
      )}
    </>
  );
}