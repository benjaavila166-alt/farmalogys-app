'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Check, X, Loader2 } from 'lucide-react';

interface EditarClienteModalProps {
  cliente: any;
  onClose: () => void;
  onClienteEditado: () => void;
}

export default function EditarClienteModal({ cliente, onClose, onClienteEditado }: EditarClienteModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Estados para cargar las opciones desde la BD
  const [obrasSociales, setObrasSociales] = useState<any[]>([]);
  const [coseguros, setCoseguros] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  // Estados para la carga rápida (Quick Add)
  const [quickAddType, setQuickAddType] = useState<'os' | 'cos' | 'cat' | null>(null);
  const [quickAddValue, setQuickAddValue] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  // Estados para guardar las selecciones múltiples (IDs)
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<number[]>([]);
  const [selectedCoseguros, setSelectedCoseguros] = useState<number[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);

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
    numero_afiliado: cliente.numero_afiliado || '',
    estado_cliente: cliente.estado_cliente !== false,
  });

  const cargarDatosMaestros = async () => {
    const { data: os } = await supabase.from('obras_sociales').select('id, nombre').order('nombre');
    const { data: cos } = await supabase.from('coseguros').select('id, nombre').order('nombre');
    const { data: cat } = await supabase.from('categorias_cliente').select('id, nombre').order('nombre');

    if (os) setObrasSociales(os);
    if (cos) setCoseguros(cos);
    if (cat) setCategorias(cat);
  };

  const cargarRelacionesExistentes = async () => {
    // Cargar relaciones de Obra Social
    const { data: relOs } = await supabase.from('cliente_obra_social').select('obra_social_id').eq('cliente_id', cliente.id);
    if (relOs) setSelectedObrasSociales(relOs.map(r => r.obra_social_id));

    // Cargar relaciones de Coseguro
    const { data: relCos } = await supabase.from('cliente_coseguro').select('coseguro_id').eq('cliente_id', cliente.id);
    if (relCos) setSelectedCoseguros(relCos.map(r => r.coseguro_id));

    // Cargar relaciones de Categoría
    const { data: relCat } = await supabase.from('cliente_categoria').select('categoria_id').eq('cliente_id', cliente.id);
    if (relCat) setSelectedCategorias(relCat.map(r => r.categoria_id));
  };

  useEffect(() => {
    cargarDatosMaestros();
    cargarRelacionesExistentes();
  }, [cliente.id]);

  const handleQuickAdd = async () => {
    if (!quickAddValue.trim() || !quickAddType) return;
    setQuickAddLoading(true);

    const tableMap = {
      os: 'obras_sociales',
      cos: 'coseguros',
      cat: 'categorias_cliente'
    };

    try {
      const { data, error } = await supabase
        .from(tableMap[quickAddType])
        .insert([{ nombre: quickAddValue.trim() }])
        .select()
        .single();

      if (error) throw error;

      await cargarDatosMaestros();

      if (quickAddType === 'os') setSelectedObrasSociales(prev => [...prev, data.id]);
      if (quickAddType === 'cos') setSelectedCoseguros(prev => [...prev, data.id]);
      if (quickAddType === 'cat') setSelectedCategorias(prev => [...prev, data.id]);

      setQuickAddValue("");
      setQuickAddType(null);
    } catch (err: any) {
      alert("Error al añadir: " + err.message);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

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

    setFormData({ ...formData, [name]: isCheckbox ? checked : value });
  };

  const toggleSelection = (id: number, currentSelected: number[], setSelection: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (currentSelected.includes(id)) {
      setSelection(currentSelected.filter(item => item !== id));
    } else {
      setSelection([...currentSelected, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Acá también extraemos los nombres para guardarlos en la columna de texto simple de Clientes
    const osNames = selectedObrasSociales.map(id => obrasSociales.find(os => os.id === id)?.nombre).filter(Boolean).join(' - ');
    const cosNames = selectedCoseguros.map(id => coseguros.find(cos => cos.id === id)?.nombre).filter(Boolean).join(' - ');
    const catNames = selectedCategorias.map(id => categorias.find(cat => cat.id === id)?.nombre).filter(Boolean).join(' - ');

    try {
      // 1. Actualizar datos principales del cliente y las columnas de texto
      const { error: clienteError } = await supabase
        .from('Clientes')
        .update({
          nombre: formData.nombre,
          dni_cuit: formData.dni_cuit || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          sexo: formData.sexo,
          whatsapp: formData.whatsapp || null,
          email: formData.email || null,
          direccion_principal: formData.direccion_principal || null,
          departamento: formData.departamento || null,
          link_ubi: formData.link_ubi || null,
          latitud: formData.latitud ? parseFloat(formData.latitud.toString()) : null,
          longitud: formData.longitud ? parseFloat(formData.longitud.toString()) : null,
          numero_afiliado: formData.numero_afiliado || null,
          estado_cliente: formData.estado_cliente,
          obra_social: osNames || null, // <--- Guardado en texto para la tabla principal
          coseguro: cosNames || null, // <--- Guardado en texto para la tabla principal
          categoria: catNames || 'general', // <--- Guardado en texto para la tabla principal
          updated_at: new Date().toISOString()
        })
        .eq('id', cliente.id);

      if (clienteError) throw clienteError;

      // 2. Actualizar Obras Sociales (Borrar anteriores y crear nuevas)
      await supabase.from('cliente_obra_social').delete().eq('cliente_id', cliente.id);
      if (selectedObrasSociales.length > 0) {
        await supabase.from('cliente_obra_social').insert(selectedObrasSociales.map(id => ({ cliente_id: cliente.id, obra_social_id: id })));
      }

      // 3. Actualizar Coseguros
      await supabase.from('cliente_coseguro').delete().eq('cliente_id', cliente.id);
      if (selectedCoseguros.length > 0) {
        await supabase.from('cliente_coseguro').insert(selectedCoseguros.map(id => ({ cliente_id: cliente.id, coseguro_id: id })));
      }

      // 4. Actualizar Categorías
      await supabase.from('cliente_categoria').delete().eq('cliente_id', cliente.id);
      if (selectedCategorias.length > 0) {
        await supabase.from('cliente_categoria').insert(selectedCategorias.map(id => ({ cliente_id: cliente.id, categoria_id: id })));
      }

      onClienteEditado();
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error);
      alert(`Error: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const QuickAddHeader = ({ label, type }: { label: string, type: 'os' | 'cos' | 'cat' }) => (
    <div className="flex items-center justify-between mb-1">
      <label className="text-sm font-medium">{label}</label>
      {quickAddType === type ? (
        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
          <input 
            autoFocus
            type="text"
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAdd())}
            placeholder="Nombre..."
            className="h-6 text-xs border rounded px-1 w-24 dark:bg-zinc-800"
          />
          <button type="button" onClick={handleQuickAdd} className="text-green-600">
            {quickAddLoading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          </button>
          <button type="button" onClick={() => setQuickAddType(null)} className="text-red-500">
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          onClick={() => setQuickAddType(type)}
          className="text-[10px] flex items-center gap-0.5 text-blue-600 hover:underline font-semibold"
        >
          <Plus className="size-2.5" /> Añadir
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Editar Cliente: {cliente.nombre}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Datos Personales</h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500" />
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
            <label className="block text-sm font-medium mb-1">Link de Maps</label>
            <input type="text" name="link_ubi" value={formData.link_ubi} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" placeholder="Pegar link de Google Maps..." />
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <h3 className="text-sm font-semibold text-blue-600 mb-2 border-b pb-1">Datos Médicos y Clasificación</h3>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <QuickAddHeader label="Obras Sociales" type="os" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-3 dark:bg-zinc-800/50 dark:border-zinc-700">
              {obrasSociales.length === 0 && <p className="text-xs text-muted-foreground col-span-full">Sin opciones.</p>}
              {obrasSociales.map((os) => (
                <label key={os.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedObrasSociales.includes(os.id)}
                    onChange={() => toggleSelection(os.id, selectedObrasSociales, setSelectedObrasSociales)}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{os.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <QuickAddHeader label="Coseguros" type="cos" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-3 dark:bg-zinc-800/50 dark:border-zinc-700">
              {coseguros.length === 0 && <p className="text-xs text-muted-foreground col-span-full">Sin opciones.</p>}
              {coseguros.map((cs) => (
                <label key={cs.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCoseguros.includes(cs.id)}
                    onChange={() => toggleSelection(cs.id, selectedCoseguros, setSelectedCoseguros)}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{cs.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <QuickAddHeader label="Categorías" type="cat" />
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border rounded p-3 dark:bg-zinc-800/50 dark:border-zinc-700">
              {categorias.length === 0 && <p className="text-xs text-muted-foreground">Sin opciones.</p>}
              {categorias.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCategorias.includes(cat.id)}
                    onChange={() => toggleSelection(cat.id, selectedCategorias, setSelectedCategorias)}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{cat.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Número de Afiliado</label>
            <input type="text" name="numero_afiliado" value={formData.numero_afiliado} onChange={handleChange} className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700" />
            <div className="flex items-center mt-6">
              <input type="checkbox" name="estado_cliente" checked={formData.estado_cliente} onChange={handleChange} className="mr-2 h-4 w-4 rounded text-blue-600" id="estado_cliente_edit" />
              <label htmlFor="estado_cliente_edit" className="text-sm font-medium cursor-pointer">Cliente Activo</label>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t dark:border-zinc-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}