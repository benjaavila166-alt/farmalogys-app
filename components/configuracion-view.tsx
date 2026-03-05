"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Loader2 } from "lucide-react"

// Componente de tabla administrativa reutilizable
function AdminTable({ titulo, tabla }: { titulo: string, tabla: string }) {
  const [items, setItems] = useState<any[]>([])
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error(`Error cargando ${tabla}:`, error.message)
      return
    }
    if (data) setItems(data)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAgregar = async () => {
    if (!nuevoNombre.trim()) return
    setLoading(true)
    
    const { error } = await supabase
      .from(tabla)
      .insert([{ nombre: nuevoNombre.trim() }])
    
    if (!error) {
      setNuevoNombre("")
      fetchItems()
    } else {
      alert(`Error al agregar: ${error.message}`)
    }
    setLoading(false)
  }

  const handleEliminar = async (id: number) => {
    if (!confirm(`¿Estás seguro de eliminar este registro?`)) return

    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq('id', id)
    
    if (!error) {
      fetchItems()
    } else {
      alert(`No se pudo eliminar: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-5 border rounded-xl bg-card shadow-sm h-full">
      <h3 className="text-lg font-semibold border-b pb-2">{titulo}</h3>
      
      <div className="flex gap-2">
        <Input 
          placeholder={`Nuevo/a ${titulo.toLowerCase()}...`} 
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
          disabled={loading}
        />
        <Button 
          onClick={handleAgregar} 
          disabled={loading}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-1" />}
          Agregar
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-16 text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Sin registros cargados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-sm">{item.nombre}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEliminar(item.id)}
                        className="hover:bg-red-50 group"
                      >
                        <Trash2 className="size-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export function ConfiguracionView() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configuración de Catálogos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná las opciones que aparecen al crear o editar clientes.
        </p>
      </div>
      
      {/* Grilla responsiva para las 3 tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminTable titulo="Obras Sociales" tabla="obras_sociales" />
        <AdminTable titulo="Coseguros" tabla="coseguros" />
        <AdminTable titulo="Categorías" tabla="categorias_cliente" />
      </div>
    </div>
  )
}