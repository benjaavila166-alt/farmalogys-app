"use client"

import { useState, useEffect } from "react"
// IMPORTANTE: Ahora usamos usePedidos que creamos anteriormente
import { usePedidos } from "@/hooks/use-pedidos"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Search, Plus } from "lucide-react"
import AgregarPedidoModal from "@/components/agregar-pedido-modal"

function estadoPagoLabel(estado: string) {
  switch (estado) {
    case "cobrado":
      return { label: "Cobrado", variant: "default" as const }
    case "pendiente":
      return { label: "Pendiente", variant: "secondary" as const }
    default:
      return { label: "No cobrado", variant: "destructive" as const }
  }
}

export function PedidosView() {
  // Usamos el hook centralizado para traer los pedidos reales
  const { pedidos, fetchPedidos } = usePedidos()
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  // El valor de las pestañas debe coincidir con lo que guardas en la BD
  const [tipoTab, setTipoTab] = useState<string>("envio") 
  const [modalAbierto, setModalAbierto] = useState(false)

  // --- FILTRADO EN CLIENTE CON DATOS REALES ---
  const filtered = pedidos.filter((p) => {
    // 1. Filtro de búsqueda (nombre cliente, detalle o ID)
    const matchSearch =
      !search ||
      p.Clientes?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.detalle_pedido?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    
    // 2. Filtro de fecha
    const matchDate = !dateFilter || p.fecha_programada === dateFilter;
    
    // 3. Filtro de estado de pago
    const matchEstado = estadoFilter === "todos" || p.estado_pago === estadoFilter;
    
    // 4. CORRECCIÓN CRÍTICA: Filtrar por tipo_servicio (envio/retiro) y no por tipo_pedido
    // También ajustamos para que "envio" coincida con la pestaña "Envíos"
    const matchTipo = p.tipo_servicio?.toLowerCase() === tipoTab.toLowerCase();

    return matchSearch && matchDate && matchEstado && matchTipo;
  });

  const totalMonto = filtered.reduce((sum, p) => sum + (Number(p.monto_a_cobrar) || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gestión de pedidos programados</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setModalAbierto(true)} 
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="size-4 mr-1.5" />
            Agregar Pedido
          </Button>

          <Button variant="outline" size="sm" className="w-fit h-10">
            <Download className="size-4 mr-1.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Tabs value={tipoTab} onValueChange={setTipoTab} className="w-full">
        {/* Los values de las pestañas deben coincidir con la BD ('envio' y 'retiro') */}
        <TabsList className="grid w-full max-w-96 grid-cols-2 mb-4">
          <TabsTrigger value="envio">Envíos</TabsTrigger>
          <TabsTrigger value="retiro">Retiros</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, detalle o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="cobrado">Cobrado</SelectItem>
              <SelectItem value="no_cobrado">No cobrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TablaPedidos filtered={filtered} />
      </Tabs>

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>{filtered.length} pedidos</span>
        <span className="font-medium text-foreground">
          Total: ${totalMonto.toLocaleString("es-AR")}
        </span>
      </div>

      {modalAbierto && (
        <AgregarPedidoModal 
          onClose={() => setModalAbierto(false)}
          // Esta es la otra corrección clave: Recargar los datos al agregar
          onPedidoAgregado={fetchPedidos}
        />
      )}
    </div>
  )
}

// Subcomponente de tabla corregido
function TablaPedidos({ filtered }: { filtered: any[] }) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Detalle</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado Pago</TableHead>
            <TableHead>Servicio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No se encontraron pedidos
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((pedido) => {
              const estado = estadoPagoLabel(pedido.estado_pago)
              return (
                <TableRow key={pedido.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{pedido.id}</TableCell>
                  <TableCell className="font-medium">
                    {new Date(pedido.fecha_programada).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell className="font-medium">{pedido.Clientes?.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">{pedido.detalle_pedido}</TableCell>
                  <TableCell className="text-right font-medium">${pedido.monto_a_cobrar}</TableCell>
                  <TableCell><Badge variant={estado.variant}>{estado.label}</Badge></TableCell>
                  {/* Mostramos el tipo de servicio real (envio/retiro) */}
                  <TableCell><Badge variant="outline" className="capitalize">{pedido.tipo_servicio}</Badge></TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}