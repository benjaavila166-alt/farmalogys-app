"use client"

import { useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { usePedidos } from "@/hooks/use-pedidos"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  DollarSign,
  GripVertical,
  LockKeyhole,
  User,
  Clock,
  ArrowRightLeft,
  Search,
  Plus
} from "lucide-react"
import { useSession } from "@/lib/session-context"
import { PinUnlockDialog } from "@/components/pin-unlock-dialog"
import AgregarPedidoModal from "@/components/agregar-pedido-modal"

const COLUMNAS_ENVIOS = [
  { id: "sin_atender", label: "Sin atender" },
  { id: "pendiente", label: "Pendiente" },
  { id: "retirar_drogueria", label: "Retirar de droguería" },
  { id: "entregar_cadete", label: "Entregar a cadete" },
  { id: "en_camino", label: "En camino" },
  { id: "entregado", label: "Entregado" },
  { id: "reprogramado", label: "Reprogramado" },
  { id: "cancelado", label: "Cancelado" },
]

const COLUMNAS_RETIROS = [
  { id: "sin_atender", label: "Sin atender" },
  { id: "pendiente", label: "Pendiente" },
  { id: "listo_para_entregar", label: "Listo para entregar" },
  { id: "entregado", label: "Entregado" },
  { id: "reprogramado", label: "Reprogramado" },
  { id: "cancelado", label: "Cancelado" },
]

function columnColor(col: string): string {
  switch (col) {
    case "sin_atender": return "bg-slate-500/10 text-slate-500"
    case "pendiente": return "bg-muted-foreground/10 text-muted-foreground"
    case "entregar_cadete":
    case "listo_para_entregar": return "bg-chart-1/10 text-chart-1"
    case "retirar_drogueria": return "bg-warning/10 text-warning-foreground"
    case "en_camino": return "bg-primary/10 text-primary"
    case "entregado": return "bg-success/10 text-success"
    case "cancelado": return "bg-destructive/10 text-destructive"
    case "reprogramado": return "bg-chart-5/10 text-chart-5"
    default: return "bg-muted text-muted-foreground"
  }
}

function columnDot(col: string): string {
  switch (col) {
    case "sin_atender": return "bg-slate-500"
    case "pendiente": return "bg-muted-foreground"
    case "entregar_cadete":
    case "listo_para_entregar": return "bg-chart-1"
    case "retirar_drogueria": return "bg-warning"
    case "en_camino": return "bg-primary"
    case "entregado": return "bg-success"
    case "cancelado": return "bg-destructive"
    case "reprogramado": return "bg-chart-5"
    default: return "bg-muted"
  }
}

const normalize = (str?: string) => 
  str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

export function KanbanView() {
  const { isUnlocked } = useSession()
  const { pedidos, fetchPedidos } = usePedidos() 
  const [selectedEnvio, setSelectedEnvio] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  
  const [tipoTab, setTipoTab] = useState<string>("envio") 
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const columnasActivas = tipoTab === "envio" ? COLUMNAS_ENVIOS : COLUMNAS_RETIROS

  // Lógica de filtrado (Tipo de servicio + Búsqueda + Fecha)
  const enviosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const matchTipo = normalize(p.tipo_servicio) === normalize(tipoTab);
      
      const matchSearch =
        !search ||
        p.Clientes?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.detalle_pedido?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search);
      
      const matchDate = !dateFilter || p.fecha_programada === dateFilter;

      return matchTipo && matchSearch && matchDate;
    })
  }, [pedidos, tipoTab, search, dateFilter])

  const handleDragStart = useCallback(
    (e: React.DragEvent, envioId: number) => {
      if (!isUnlocked) {
        e.preventDefault()
        return
      }
      setDraggedId(envioId)
      e.dataTransfer.effectAllowed = "move"
    },
    [isUnlocked]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetColumn: string) => {
      e.preventDefault()
      if (!isUnlocked || !draggedId) return
      
      const { error } = await supabase
        .from('pedidos')
        .update({ estado_logistico: targetColumn })
        .eq('id', draggedId);

      if (error) {
        console.error("Error actualizando estado:", error);
        alert("Hubo un error al mover el pedido.");
      }

      setDraggedId(null)
    },
    [isUnlocked, draggedId]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isUnlocked) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    },
    [isUnlocked]
  )

  function openDetail(envio: any) {
    setSelectedEnvio(envio)
    setSheetOpen(true)
  }

  async function handleSaveDetail(updated: any) {
    const { error } = await supabase
      .from('pedidos')
      .update({
        detalle_pedido: updated.detalle_pedido,
        monto_a_cobrar: updated.monto_a_cobrar,
        estado_logistico: updated.estado_logistico,
        tipo_servicio: updated.tipo_servicio
      })
      .eq('id', updated.id);

    if (error) {
      console.error("Error actualizando pedido:", error);
      alert("Hubo un error al guardar los cambios.");
    } else {
      setSheetOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Envíos y Retiros
          </h2>
          <p className="text-sm text-muted-foreground">
            Tablero Kanban de gestión de pedidos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isUnlocked && (
            <Button onClick={() => setPinOpen(true)} variant="outline" className="h-10">
              <LockKeyhole className="size-4 mr-1.5" />
              Iniciar Turno
            </Button>
          )}
          <Button 
            onClick={() => setModalAbierto(true)} 
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white h-10"
          >
            <Plus className="size-4 mr-1.5" />
            Agregar Pedido
          </Button>
        </div>
      </div>

      <Tabs value={tipoTab} onValueChange={setTipoTab} className="flex-1 flex flex-col">
        
        {/* BARRA DE FILTROS Y PESTAÑAS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
          <TabsList className="grid w-full sm:w-64 grid-cols-2 shrink-0 h-10">
            <TabsTrigger value="envio">Envíos</TabsTrigger>
            <TabsTrigger value="retiro">Retiros</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o detalle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40 h-10"
            />
          </div>
        </div>

        {!isUnlocked && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground mb-4 shrink-0">
            <LockKeyhole className="size-4 shrink-0" />
            Modo solo lectura. Inicia turno para editar y mover tarjetas.
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="flex gap-4 pb-4 min-w-max">
            {columnasActivas.map((col) => {
              const items = enviosFiltrados.filter((e) => e.estado_logistico === col.id)
              return (
                <div
                  key={col.id}
                  className="flex flex-col w-72 shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        columnDot(col.id)
                      )}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {col.label}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 min-h-50 rounded-lg bg-muted/30 p-2">
                    {items.map((envio) => (
                      <div
                        key={envio.id}
                        draggable={isUnlocked}
                        onDragStart={(e) => handleDragStart(e, envio.id)}
                        onClick={() => openDetail(envio)}
                        className={cn(
                          "group relative rounded-lg border bg-card p-3 transition-shadow cursor-pointer hover:shadow-md",
                          isUnlocked && "cursor-grab active:cursor-grabbing",
                          draggedId === envio.id && "opacity-50"
                        )}
                      >
                        {isUnlocked && (
                          <GripVertical className="absolute top-3 right-2 size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <p className="font-medium text-sm text-card-foreground leading-tight mb-2 pr-4">
                          {envio.Clientes?.nombre || "Cliente desconocido"}
                        </p>
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {envio.Clientes?.direccion_principal || envio.detalle_pedido || "Sin dirección"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground tabular-nums">
                              ${Number(envio.monto_a_cobrar).toLocaleString("es-AR")}
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "text-[10px] h-5 border-0",
                              columnColor(envio.estado_logistico)
                            )}
                          >
                            {col.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                        Sin pedidos
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>

      <PinUnlockDialog open={pinOpen} onOpenChange={setPinOpen} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalle del Pedido</SheetTitle>
            <SheetDescription>
              {selectedEnvio
                ? `Pedido #${selectedEnvio.id} - ${selectedEnvio.Clientes?.nombre}`
                : ""}
            </SheetDescription>
          </SheetHeader>
          {selectedEnvio && (
            <EnvioDetailForm
              envio={selectedEnvio}
              isUnlocked={isUnlocked}
              columnasDisponibles={columnasActivas}
              onSave={handleSaveDetail}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* MODAL DE AGREGAR PEDIDO */}
      {modalAbierto && (
        <AgregarPedidoModal 
          onClose={() => setModalAbierto(false)}
          onPedidoAgregado={fetchPedidos}
        />
      )}
    </div>
  )
}

function EnvioDetailForm({
  envio,
  isUnlocked,
  columnasDisponibles,
  onSave,
}: {
  envio: any
  isUnlocked: boolean
  columnasDisponibles: { id: string; label: string }[]
  onSave: (updated: any) => void
}) {
  const [form, setForm] = useState(envio)
  const esEnvio = (form.tipo_servicio || "envio").toLowerCase() === "envio"

  return (
    <div className="flex flex-col gap-4 px-1 py-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente">Cliente (Solo Lectura)</Label>
        <Input
          id="cliente"
          value={form.Clientes?.nombre || ""}
          disabled={true}
          className="bg-muted/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="detalle">Detalle del pedido</Label>
        <Input
          id="detalle"
          value={form.detalle_pedido || ""}
          disabled={!isUnlocked}
          onChange={(e) =>
            setForm({ ...form, detalle_pedido: e.target.value })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="monto">Monto a cobrar</Label>
        <Input
          id="monto"
          type="number"
          value={form.monto_a_cobrar || 0}
          disabled={!isUnlocked}
          onChange={(e) =>
            setForm({ ...form, monto_a_cobrar: Number(e.target.value) })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Estado Logístico</Label>
        <Select
          value={form.estado_logistico}
          onValueChange={(val) =>
            setForm({ ...form, estado_logistico: val })
          }
          disabled={!isUnlocked}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columnasDisponibles.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!isUnlocked}
          onClick={() =>
            setForm({
              ...form,
              tipo_servicio: esEnvio ? "retiro" : "envio",
              estado_logistico: "sin_atender"
            })
          }
          className="w-full"
        >
          <ArrowRightLeft className="size-4 mr-2" />
          Cambiar a {esEnvio ? "Retiro" : "Envío"}
        </Button>
      </div>

      {isUnlocked && (
        <Button onClick={() => onSave(form)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
          Guardar cambios en Supabase
        </Button>
      )}
    </div>
  )
}