"use client"

import { useState, useCallback, useMemo } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  DollarSign,
  GripVertical,
  LockKeyhole,
  User,
  Clock,
  ArrowRightLeft
} from "lucide-react"
import { MOCK_ENVIOS } from "@/lib/mock-data"
import { useSession } from "@/lib/session-context"
import { PinUnlockDialog } from "@/components/pin-unlock-dialog"

const COLUMNAS_ENVIOS = [
  { id: "sin_atender", label: "Sin atender" },
  { id: "pendiente", label: "Pendiente" },
  { id: "para_retirar_drogueria", label: "Retirar de droguería" },
  { id: "entregar_a_cadete", label: "Entregar a cadete" },
  { id: "en_camino", label: "En camino" },
  { id: "entregado", label: "Entregado" },
  { id: "reprogramado", label: "Reprogramado" },
  { id: "cancelado", label: "Cancelado" },
]

const COLUMNAS_RETIROS = [
  { id: "sin_atender", label: "Sin atender" },
  { id: "pendiente", label: "Pendiente" },
  { id: "listo_para_entregar", label: "Listo para entregar" },
  { id: "reprogramado", label: "Reprogramado" },
  { id: "cancelado", label: "Cancelado" },
]

function columnColor(col: string): string {
  switch (col) {
    case "sin_atender":
      return "bg-slate-500/10 text-slate-500"
    case "pendiente":
      return "bg-muted-foreground/10 text-muted-foreground"
    case "entregar_a_cadete":
    case "listo_para_retirar":
    case "listo_para_entregar":
      return "bg-chart-1/10 text-chart-1"
    case "para_retirar_drogueria":
      return "bg-warning/10 text-warning-foreground"
    case "en_camino":
      return "bg-primary/10 text-primary"
    case "entregado":
      return "bg-success/10 text-success"
    case "no_entregado":
    case "cancelado":
      return "bg-destructive/10 text-destructive"
    case "reprogramado":
      return "bg-chart-5/10 text-chart-5"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function columnDot(col: string): string {
  switch (col) {
    case "sin_atender":
      return "bg-slate-500"
    case "pendiente":
      return "bg-muted-foreground"
    case "entregar_a_cadete":
    case "listo_para_retirar":
    case "listo_para_entregar":
      return "bg-chart-1"
    case "para_retirar_drogueria":
      return "bg-warning"
    case "en_camino":
      return "bg-primary"
    case "entregado":
      return "bg-success"
    case "no_entregado":
    case "cancelado":
      return "bg-destructive"
    case "reprogramado":
      return "bg-chart-5"
    default:
      return "bg-muted"
  }
}

export function KanbanView() {
  const { isUnlocked, activeUser } = useSession()
  const [envios, setEnvios] = useState<any[]>(MOCK_ENVIOS)
  const [selectedEnvio, setSelectedEnvio] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [tipoTab, setTipoTab] = useState<string>("envios")

  const columnasActivas = tipoTab === "envios" ? COLUMNAS_ENVIOS : COLUMNAS_RETIROS

  const enviosFiltrados = useMemo(() => {
    return envios.filter(
      (e) => (e.tipo_pedido || "envios").toLowerCase() === tipoTab.toLowerCase()
    )
  }, [envios, tipoTab])

  const handleDragStart = useCallback(
    (e: React.DragEvent, envioId: string) => {
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
    (e: React.DragEvent, targetColumn: string) => {
      e.preventDefault()
      if (!isUnlocked || !draggedId) return
      
      setEnvios((prev) =>
        prev.map((env) => {
          if (env.id === draggedId) {
            let nuevoEstado = targetColumn
            
            if (targetColumn === "reprogramado") {
              const esParaHoy = false // Reemplazar con validación de fecha real
              if (esParaHoy) {
                nuevoEstado = "en_camino"
              }
            }

            return {
              ...env,
              estado_envio: nuevoEstado,
              ultima_modificacion_por: activeUser?.nombre || null,
            }
          }
          return env
        })
      )
      setDraggedId(null)
    },
    [isUnlocked, draggedId, activeUser]
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

  function handleSaveDetail(updated: any) {
    setEnvios((prev) =>
      prev.map((e) =>
        e.id === updated.id
          ? { ...updated, ultima_modificacion_por: activeUser?.nombre || null }
          : e
      )
    )
    setSheetOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Envíos y Retiros
          </h2>
          <p className="text-sm text-muted-foreground">
            Tablero Kanban de gestión de pedidos
          </p>
        </div>
        {!isUnlocked && (
          <Button onClick={() => setPinOpen(true)} size="sm">
            <LockKeyhole className="size-4 mr-1.5" />
            Iniciar Turno
          </Button>
        )}
      </div>

      <Tabs defaultValue="envios" onValueChange={setTipoTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-96 grid-cols-2 mb-4 shrink-0">
          <TabsTrigger value="envios">Envíos</TabsTrigger>
          <TabsTrigger value="retiros">Retiros</TabsTrigger>
        </TabsList>

        {!isUnlocked && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground mb-4 shrink-0">
            <LockKeyhole className="size-4 shrink-0" />
            Modo solo lectura. Inicia turno para editar y mover tarjetas.
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="flex gap-4 pb-4 min-w-max">
            {columnasActivas.map((col) => {
              const items = enviosFiltrados.filter((e) => e.estado_envio === col.id)
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
                        <p className="font-medium text-sm text-card-foreground leading-tight mb-2">
                          {envio.cliente_nombre}
                        </p>
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {envio.direccion_de_entrega}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <DollarSign className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground tabular-nums">
                              ${envio.monto_a_cobrar.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "text-[10px] h-5 border-0",
                              columnColor(envio.estado_envio)
                            )}
                          >
                            {col.label}
                          </Badge>
                        </div>
                        {envio.ultima_modificacion_por && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                            <User className="size-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              Modificado por: {envio.ultima_modificacion_por}
                            </span>
                          </div>
                        )}
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
                ? `Pedido ${selectedEnvio.id} - ${selectedEnvio.cliente_nombre}`
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
  const esEnvio = (form.tipo_pedido || "envios").toLowerCase() === "envios"

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente">Cliente</Label>
        <Input
          id="cliente"
          value={form.cliente_nombre}
          disabled={!isUnlocked}
          onChange={(e) =>
            setForm({ ...form, cliente_nombre: e.target.value })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="direccion">Dirección de entrega</Label>
        <Input
          id="direccion"
          value={form.direccion_de_entrega}
          disabled={!isUnlocked}
          onChange={(e) =>
            setForm({ ...form, direccion_de_entrega: e.target.value })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="detalle">Detalle del pedido</Label>
        <Input
          id="detalle"
          value={form.detalle_pedido}
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
          value={form.monto_a_cobrar}
          disabled={!isUnlocked}
          onChange={(e) =>
            setForm({ ...form, monto_a_cobrar: Number(e.target.value) })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Estado del pedido</Label>
        <Select
          value={form.estado_envio}
          onValueChange={(val) =>
            setForm({ ...form, estado_envio: val })
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
              tipo_pedido: esEnvio ? "retiros" : "envios",
              estado_envio: "pendiente"
            })
          }
          className="w-full"
        >
          <ArrowRightLeft className="size-4 mr-2" />
          Cambiar a {esEnvio ? "Retiro" : "Envío"}
        </Button>
      </div>

      {form.ultima_modificacion_por && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground mt-2">
          <Clock className="size-3.5" />
          Última modificación por: {form.ultima_modificacion_por}
        </div>
      )}

      {isUnlocked && (
        <Button onClick={() => onSave(form)} className="mt-2">
          Guardar cambios
        </Button>
      )}
    </div>
  )
}