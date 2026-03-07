// components/ui/clientes-view.tsx
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
import { Badge } from "@/components/ui/badge"
import { Download, Search, Phone, MapPin, Plus, Pencil, Mail, User, Building, ExternalLink, CalendarDays, Activity } from "lucide-react"
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
        c.direccion_principal?.toLowerCase().includes(search.toLowerCase()) ||
        c.obra_social?.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, clientes])

  function exportToCSV() {
    const headers = ["ID", "Nombre", "DNI/CUIT", "Fecha Nac.", "Sexo", "WhatsApp", "Email", "Direccion", "Departamento", "Link Maps", "Obra Social", "Coseguro", "Nro Afiliado", "Estado"]
    const rows = filtered.map((c) => [
      c.id,
      c.nombre,
      c.dni_cuit || "",
      c.fecha_nacimiento || "",
      c.sexo || "",
      c.whatsapp || "",
      c.email || "",
      c.direccion_principal || "",
      c.departamento || "",
      c.link_ubi || "",
      c.obra_social || "",
      c.coseguro || "",
      c.numero_afiliado || "",
      c.estado_cliente ? "Activo" : "Inactivo"
    ])
    const csv = [headers, ...rows].map((r) => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
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
          placeholder="Buscar por nombre, CUIT, dirección u obra social..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-50">Cliente</TableHead>
              <TableHead className="min-w-30">DNI/CUIT</TableHead>
              <TableHead className="min-w-62.5">Contacto</TableHead>
              <TableHead className="min-w-62.5">Ubicación</TableHead>
              <TableHead className="min-w-50">Datos Médicos</TableHead>
              <TableHead className="min-w-25">Estado</TableHead>
              <TableHead className="w-16 sticky right-0 bg-card">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            )}
            
            {filtered.length > 0 && filtered.map((cliente) => (
              <TableRow key={cliente.id} className={!cliente.estado_cliente ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{cliente.nombre}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {cliente.fecha_nacimiento && (
                        <span className="flex items-center gap-1" title="Fecha de Nacimiento">
                          <CalendarDays className="size-3" />
                          {new Date(cliente.fecha_nacimiento).toLocaleDateString("es-AR")}
                        </span>
                      )}
                      {cliente.sexo && cliente.sexo !== 'No especifica' && (
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {cliente.sexo}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {cliente.dni_cuit || "-"}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1.5">
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
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                    {cliente.email && cliente.email !== 'null' && (
                       <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                         <Mail className="size-3.5" />
                         <span className="truncate max-w-45">{cliente.email}</span>
                       </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate max-w-50" title={cliente.direccion_principal}>
                        {cliente.direccion_principal || "-"}
                      </span>
                    </span>
                    {cliente.departamento && cliente.departamento !== 'null' && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground pl-5">
                        <Building className="size-3" />
                        Depto/Ref: {cliente.departamento}
                      </span>
                    )}
                    {cliente.link_ubi && cliente.link_ubi !== 'null' && (
                       <a href={cliente.link_ubi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline pl-5">
                         <ExternalLink className="size-3" />
                         Ver Mapa
                       </a>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    {cliente.obra_social && cliente.obra_social !== 'null' ? (
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-foreground">O.S:</span>
                        <span className="text-muted-foreground">{cliente.obra_social}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Sin Obra Social</span>
                    )}
                    
                    {cliente.coseguro && cliente.coseguro !== 'null' && (
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-foreground">Cos:</span>
                        <span className="text-muted-foreground">{cliente.coseguro}</span>
                      </div>
                    )}
                    
                    {cliente.numero_afiliado && cliente.numero_afiliado !== 'null' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-5">Nro: {cliente.numero_afiliado}</Badge>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {cliente.estado_cliente ? (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="sticky right-0 bg-card">
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
        Mostrando {filtered.length} clientes
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