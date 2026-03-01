"use client"

import { useState } from "react"
import { AppSidebar, type View } from "@/components/app-sidebar"
import { PresenceBar } from "@/components/presence-bar"
import { PedidosView } from "@/components/pedidos-view"
import { KanbanView } from "@/components/kanban-view"
import { ClientesView } from "@/components/clientes-view"
import { ReportesView } from "@/components/reportes-view"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/session-context"
import { PinUnlockDialog } from "@/components/pin-unlock-dialog"
import { LogOut, LockKeyhole, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

export function DashboardShell() {
  const [currentView, setCurrentView] = useState<View>("pedidos")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const { isUnlocked, activeUser, lock } = useSession()

  const viewComponent = {
    pedidos: <PedidosView />,
    kanban: <KanbanView />,
    clientes: <ClientesView />,
    reportes: <ReportesView />,
  }

  function handleViewChange(view: View) {
    setCurrentView(view)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AppSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <AppSidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            collapsed={false}
            onToggleCollapse={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 border-b border-border bg-card px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
            <PresenceBar />
          </div>
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Sesion activa: {activeUser?.nombre}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={lock}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="size-4 mr-1.5" />
                  <span className="hidden sm:inline">Cerrar turno</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setPinOpen(true)}>
                <LockKeyhole className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Iniciar Turno</span>
              </Button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {viewComponent[currentView]}
        </main>
      </div>

      <PinUnlockDialog open={pinOpen} onOpenChange={setPinOpen} />
    </div>
  )
}
