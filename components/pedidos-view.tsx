"use client"

import { useState, useMemo } from "react"
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
import { Download, Search, CalendarDays } from "lucide-react"
import { MOCK_PEDIDOS } from "@/lib/mock-data"
import type { EstadoPago } from "@/lib/types"

function estadoPagoLabel(estado: EstadoPago) {
  switch (estado) {
    case "cobrado":
      return { label: "Cobrado", variant: "default" as const }
    case "pendiente":
      return { label: "Pendiente", variant: "secondary" as const }
    case "no_cobrado":
      return { label: "No cobrado", variant: "destructive" as const }
  }
}

export function PedidosView() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [tipoTab, setTipoTab] = useState<string>("envios")

  const filtered = useMemo(() => {
    return MOCK_PEDIDOS.filter((p) => {
      const matchSearch =
        !search ||
        p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.detalle_pedido.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
      const matchDate = !dateFilter || p.fecha_programada === dateFilter
      const matchEstado =
        estadoFilter === "todos" || p.estado_pago === estadoFilter
      // Filtra por el tipo de pedido según la pestaña activa ("envios" o "retiros")
      const matchTipo = p.tipo_pedido.toLowerCase() === tipoTab.toLowerCase()

      return matchSearch && matchDate && matchEstado && matchTipo
    })
  }, [search, dateFilter, estadoFilter, tipoTab])

  const totalMonto = filtered.reduce((sum, p) => sum + p.monto_a_cobrar, 0)

  function exportToCSV() {
    const headers = ["ID", "Fecha", "Cliente", "Detalle", "Monto", "Estado Pago", "Tipo"]
    const rows = filtered.map((p) => [
      p.id,
      p.fecha_programada,
      p.cliente_nombre,
      p.detalle_pedido,
      p.monto_a_cobrar.toString(),
      p.estado_pago,
      p.tipo_pedido,
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pedidos-${tipoTab}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            Gestion de pedidos programados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="w-fit">
          <Download className="size-4 mr-1.5" />
          Exportar CSV
        </Button>
      </div>

      <Tabs defaultValue="envios" onValueChange={setTipoTab} className="w-full">
        <TabsList className="grid w-full max-w-96 grid-cols-2 mb-4">
          <TabsTrigger value="envios">Envíos</TabsTrigger>
          <TabsTrigger value="retiros">Retiros</TabsTrigger>
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
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 w-44"
            />
          </div>
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

        <TabsContent value="envios" className="m-0">
          <TablaPedidos filtered={filtered} />
        </TabsContent>
        
        <TabsContent value="retiros" className="m-0">
          <TablaPedidos filtered={filtered} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>{filtered.length} pedidos</span>
        <span className="font-medium text-foreground">
          Total: ${totalMonto.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  )
}

function TablaPedidos({ filtered }: { filtered: any[] }) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Detalle</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                No se encontraron pedidos
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((pedido) => {
              const estado = estadoPagoLabel(pedido.estado_pago)
              return (
                <TableRow key={pedido.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {pedido.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Date(pedido.fecha_programada + "T12:00:00").toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {pedido.cliente_nombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                    {pedido.detalle_pedido}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    ${pedido.monto_a_cobrar.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={estado.variant}>{estado.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {pedido.tipo_pedido}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}