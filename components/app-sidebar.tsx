"use client"

import { cn } from "@/lib/utils"
import {
  Package,
  Truck,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight, 
  MapPin,
  Settings // Importamos el ícono de configuración
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Actualizamos el tipo para incluir configuracion
export type View = "pedidos" | "kanban" | "clientes" | "reportes" | "mapa" | "configuracion"

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "pedidos", label: "Pedidos", icon: Package },
  { id: "kanban", label: "Envios y Retiros", icon: Truck },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "mapa", label: "Mapa en Vivo", icon: MapPin },
  { id: "configuracion", label: "Configuración", icon: Settings }, // Nuevo ítem
]

export function AppSidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: {
  currentView: View
  onViewChange: (view: View) => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-sm font-bold tracking-tight truncate">
            LogisticaPro
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="size-8 text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
          <span className="sr-only">
            {collapsed ? "Expandir menu" : "Colapsar menu"}
          </span>
        </Button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-1 px-2" role="list">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/40 text-center">
            v1.0.0
          </p>
        </div>
      )}
    </aside>
  )
}