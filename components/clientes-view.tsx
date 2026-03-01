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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Phone, MapPin } from "lucide-react"
import { MOCK_CLIENTES } from "@/lib/mock-data"

export function ClientesView() {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return MOCK_CLIENTES.filter(
      (c) =>
        !search ||
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.dni_cuit.includes(search) ||
        c.direccion_principal.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

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
        <Button variant="outline" size="sm" onClick={exportToCSV} className="w-fit">
          <Download className="size-4 mr-1.5" />
          Exportar CSV
        </Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    {cliente.nombre}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                    {cliente.dni_cuit}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${cliente.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Phone className="size-3.5" />
                      {cliente.whatsapp}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate max-w-xs">
                        {cliente.direccion_principal}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground px-1">
        {filtered.length} clientes
      </div>
    </div>
  )
}
