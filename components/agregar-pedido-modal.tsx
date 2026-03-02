'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';
import CrearClienteModal from './crear-cliente-modal'; 

interface Cliente {
  id: number;
  nombre: string;
}

interface AgregarPedidoModalProps {
  onClose: () => void;
  onPedidoAgregado: () => void;
}

export default function AgregarPedidoModal({ onClose, onPedidoAgregado }: AgregarPedidoModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);

  const [formData, setFormData] = useState({
    fecha_programada: new Date().toISOString().split('T')[0],
    cliente_id: '', 
    detalle_pedido: '',
    monto_a_cobrar: 0,
    metodo_pago: 'efectivo',
    estado_pago: 'pendiente',
    tipo_servicio: 'envio',
    prioridad: false,
    tipo_pedido: 'particular'
  });

  const fetchClientes = async () => {
    try {
      setCargandoClientes(true);
      const { data, error } = await supabase
        .from('Clientes') 
        .select('id, nombre') 
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
    fetchClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (!formData.cliente_id) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase
        .from('pedidos')
        .insert([{
            fecha_programada: formData.fecha_programada,
            cliente_id: parseInt(formData.cliente_id),
            detalle_pedido: formData.detalle_pedido,
            monto_a_cobrar: parseFloat(formData.monto_a_cobrar.toString()), 
            metodo_pago: formData.metodo_pago,
            estado_pago: formData.estado_pago,
            tipo_servicio: formData.tipo_servicio,
            prioridad: formData.prioridad,
            tipo_pedido: formData.tipo_pedido,
            created_at: new Date().toISOString() // <-- NUEVO: Guarda la hora exacta de carga del pedido
        }]);

      if (error) throw error;
      alert('¡Pedido agregado con éxito!');
      onPedidoAgregado(); // Esto refrescará la tabla en tu vista principal
      onClose(); 
    } catch (error: any) { 
      console.error('Error al guardar:', error?.message || error);
      alert(`Hubo un error al guardar: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteCreado = (nuevoId: number, nuevoNombre: string) => {
    setClientes((prev) => [...prev, { id: nuevoId, nombre: nuevoNombre }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setFormData((prev) => ({ ...prev, cliente_id: nuevoId.toString() }));
    setModalClienteAbierto(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
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
                  className="bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 px-3 py-2 rounded flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                  title="Crear nuevo cliente"
                >
                  <Plus className="size-4" />
                  <span className="text-sm font-medium">Nuevo</span>
                </button>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">Fecha Programada</label>
              <input required type="date" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">Monto a Cobrar ($)</label>
              <input type="number" step="0.01" name="monto_a_cobrar" value={formData.monto_a_cobrar} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">Método de Pago</label>
              <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">Tipo de Pedido</label>
              <select name="tipo_pedido" value={formData.tipo_pedido} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="particular">Particular</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Detalle del Pedido</label>
              <textarea name="detalle_pedido" value={formData.detalle_pedido} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" rows={3}></textarea>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">Tipo de Servicio</label>
              <select name="tipo_servicio" value={formData.tipo_servicio} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="envio">Envío</option>
                <option value="retiro">Retiro</option>
              </select>
            </div>

            <div className="col-span-2 flex items-center mt-2">
              <input type="checkbox" name="prioridad" checked={formData.prioridad} onChange={handleChange} className="mr-2 h-4 w-4" id="prioridad" />
              <label htmlFor="prioridad" className="text-sm font-medium">Marcar como Alta Prioridad</label>
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t dark:border-zinc-700">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar Pedido'}
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