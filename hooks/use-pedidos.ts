import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, Clientes(*)') // Traemos los datos del pedido y del cliente asociado
      .order('created_at', { ascending: false });
    if (data) setPedidos(data);
  };

  useEffect(() => {
    // Carga inicial
    fetchPedidos();

    // --- ESCUCHA EN TIEMPO REAL ---
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => {
          // Se ejecuta automáticamente ante cualquier cambio en la tabla pedidos
          fetchPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { pedidos, fetchPedidos };
}