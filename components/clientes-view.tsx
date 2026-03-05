"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Phone, MapPin, Plus, Pencil } from "lucide-react"
import CrearClienteModal from "./crear-cliente-modal"
import EditarClienteModal from "./editar-cliente-modal"

export function ClientesView() {
  const [clientes, setClientes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteAEditar, setClienteAEditar] = useState<any>(null)

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('Clientes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setClientes(data)
  }

  useEffect(() => {
    fetchClientes()

    const channel = supabase
      .channel('cambios-clientes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Clientes' },
        () => fetchClientes()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    return clientes.filter(
      (c) =>
        !search ||
        c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        c.dni_cuit?.includes(search) ||
        c.direccion_principal?.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, clientes])

  function exportToCSV() {
    const headers = ["ID", "Nombre", "DNI/CUIT", "WhatsApp", "Direccion"]
    const rows = filtered.map((c) => [
      c.id,
      c.nombre,
      c.dni_cuit,
      c.whatsapp,
      c.direccion_principal,
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "clientes.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Directorio de clientes registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setModalAbierto(true)} 
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="size-4 mr-1.5" />
            Agregar Cliente
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="w-fit h-10">
            <Download className="size-4 mr-1.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CUIT o direccion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">DNI/CUIT</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="hidden md:table-cell">Direccion</TableHead>
              <TableHead className="w-20">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            )}
            
            {filtered.length > 0 && filtered.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">
                  {cliente.nombre}
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                  {cliente.dni_cuit || "-"}
                </TableCell>
                <TableCell>
                  {cliente.whatsapp ? (
                    <a
                      href={`https://wa.me/${cliente.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Phone className="size-3.5" />
                      {cliente.whatsapp}
                    </a>
                  ) : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate max-w-xs">
                      {cliente.direccion_principal || "-"}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setClienteAEditar(cliente)}
                  >
                    <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground px-1">
        {filtered.length} clientes
      </div>

      {modalAbierto && (
        <CrearClienteModal 
          onClose={() => setModalAbierto(false)}
          onClienteCreado={(id, nombre) => {
            setModalAbierto(false)
            fetchClientes()
          }}
        />
      )}

      {clienteAEditar && (
        <EditarClienteModal 
          cliente={clienteAEditar}
          onClose={() => setClienteAEditar(null)}
          onClienteEditado={() => {
            setClienteAEditar(null)
            fetchClientes()
          }}
        />
      )}
    </div>
  )
}