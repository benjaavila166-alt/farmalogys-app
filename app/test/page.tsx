import { supabase } from '../../lib/supabase'

export default async function TestClientes() {
  // 1. Le pedimos a Supabase que traiga todo de la tabla Clientes
  const { data: clientes, error } = await supabase.from('Clientes').select('*')

  // 2. Si hay un error de conexión, lo mostramos
  if (error) {
    return <div className="p-10 text-red-500">Error: {error.message}</div>
  }

  // 3. Si sale bien, mostramos la lista en pantalla
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Mis Clientes (Prueba de conexión)</h1>
      
      {clientes && clientes.length > 0 ? (
        <div className="grid gap-4">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="border p-4 rounded-lg shadow-sm bg-white text-black">
              <p className="font-bold text-lg">{cliente.nombre}</p>
              <p>WhatsApp: {cliente.whatsapp || 'No registrado'}</p>
              <p>Email: {cliente.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">La conexión funciona, pero la tabla está vacía. ¡Ve a Supabase y agrega tu primer cliente!</p>
      )}
    </div>
  )
}