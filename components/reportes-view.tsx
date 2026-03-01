"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Download,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { MOCK_PEDIDOS, MOCK_ENVIOS } from "@/lib/mock-data"

export function ReportesView() {
  const stats = useMemo(() => {
    const totalPedidos = MOCK_PEDIDOS.length
    const totalMonto = MOCK_PEDIDOS.reduce((s, p) => s + p.monto_a_cobrar, 0)
    const cobrados = MOCK_PEDIDOS.filter((p) => p.estado_pago === "cobrado")
    const montoCobrado = cobrados.reduce((s, p) => s + p.monto_a_cobrar, 0)
    const pendientes = MOCK_PEDIDOS.filter(
      (p) => p.estado_pago === "pendiente"
    ).length
    const enviosEntregados = MOCK_ENVIOS.filter(
      (e) => e.estado_envio === "entregado"
    ).length
    const enviosNoEntregados = MOCK_ENVIOS.filter(
      (e) => e.estado_envio === "no_entregado"
    ).length
    const enviosEnCamino = MOCK_ENVIOS.filter(
      (e) => e.estado_envio === "en_camino"
    ).length
    const totalEnvios = MOCK_ENVIOS.length
    const tasaEntrega =
      totalEnvios > 0
        ? ((enviosEntregados / totalEnvios) * 100).toFixed(1)
        : "0"

    return {
      totalPedidos,
      totalMonto,
      montoCobrado,
      pendientes,
      enviosEntregados,
      enviosNoEntregados,
      enviosEnCamino,
      totalEnvios,
      tasaEntrega,
    }
  }, [])

  function exportReport() {
    const lines = [
      "Reporte de Logistica",
      `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
      "",
      `Total Pedidos: ${stats.totalPedidos}`,
      `Monto Total: $${stats.totalMonto.toLocaleString("es-AR")}`,
      `Monto Cobrado: $${stats.montoCobrado.toLocaleString("es-AR")}`,
      `Pedidos Pendientes: ${stats.pendientes}`,
      "",
      `Total Envios: ${stats.totalEnvios}`,
      `Entregados: ${stats.enviosEntregados}`,
      `No Entregados: ${stats.enviosNoEntregados}`,
      `En Camino: ${stats.enviosEnCamino}`,
      `Tasa de Entrega: ${stats.tasaEntrega}%`,
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reporte-logistica.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const kpis = [
    {
      title: "Total Pedidos",
      value: stats.totalPedidos,
      icon: Package,
      description: `${stats.pendientes} pendientes de pago`,
    },
    {
      title: "Monto Total",
      value: `$${stats.totalMonto.toLocaleString("es-AR")}`,
      icon: DollarSign,
      description: `$${stats.montoCobrado.toLocaleString("es-AR")} cobrados`,
    },
    {
      title: "Tasa de Entrega",
      value: `${stats.tasaEntrega}%`,
      icon: TrendingUp,
      description: `${stats.enviosEntregados} de ${stats.totalEnvios} envios`,
    },
    {
      title: "Envios en Camino",
      value: stats.enviosEnCamino,
      icon: Truck,
      description: "Actualmente en transito",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Reportes</h2>
          <p className="text-sm text-muted-foreground">
            Resumen automatico de operaciones
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport} className="w-fit">
          <Download className="size-4 mr-1.5" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <StatusRow
                icon={<CheckCircle className="size-4 text-success" />}
                label="Entregados"
                count={stats.enviosEntregados}
                total={stats.totalEnvios}
              />
              <StatusRow
                icon={<Truck className="size-4 text-primary" />}
                label="En camino"
                count={stats.enviosEnCamino}
                total={stats.totalEnvios}
              />
              <StatusRow
                icon={<XCircle className="size-4 text-destructive" />}
                label="No entregados"
                count={stats.enviosNoEntregados}
                total={stats.totalEnvios}
              />
              <StatusRow
                icon={<Clock className="size-4 text-muted-foreground" />}
                label="Pendientes"
                count={
                  stats.totalEnvios -
                  stats.enviosEntregados -
                  stats.enviosEnCamino -
                  stats.enviosNoEntregados
                }
                total={stats.totalEnvios}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen de Cobros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Monto total
                </span>
                <span className="text-lg font-bold text-foreground">
                  ${stats.totalMonto.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(stats.montoCobrado / stats.totalMonto) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Cobrado</Badge>
                  <span className="text-muted-foreground">
                    ${stats.montoCobrado.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pendiente</Badge>
                  <span className="text-muted-foreground">
                    $
                    {(stats.totalMonto - stats.montoCobrado).toLocaleString(
                      "es-AR"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusRow({
  icon,
  label,
  count,
  total,
}: {
  icon: React.ReactNode
  label: string
  count: number
  total: number
}) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm text-foreground flex-1">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {count}
      </span>
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
