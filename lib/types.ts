export type EstadoPago = "pendiente" | "cobrado" | "no_cobrado"
export type TipoPedido = "envio" | "retiro"
export type EstadoEnvio =
  | "pendiente"
  | "listo_para_retirar"
  | "para_retirar_drogueria"
  | "en_camino"
  | "entregado"
  | "no_entregado"
  | "reprogramado"
export type EstadoRetiro = "pendiente" | "programado" | "retirado" | "cancelado"

export interface Cliente {
  id: string
  nombre: string
  dni_cuit: string
  whatsapp: string
  direccion_principal: string
  latitud: number
  longitud: number
}

export interface Pedido {
  id: string
  fecha_programada: string
  cliente_id: string
  cliente_nombre: string
  detalle_pedido: string
  monto_a_cobrar: number
  estado_pago: EstadoPago
  tipo_pedido: TipoPedido
}

export interface Envio {
  id: string
  pedido_id: string
  cadete_id: string
  estado_envio: EstadoEnvio
  direccion_de_entrega: string
  cliente_nombre: string
  monto_a_cobrar: number
  detalle_pedido: string
  fecha_programada: string
  ultima_modificacion_por: string | null
}

export interface Retiro {
  id: string
  pedido_id: string
  estado_retiro: EstadoRetiro
  fecha_hora_retiro: string
  cliente_nombre: string
  direccion: string
  monto_a_cobrar: number
  detalle_pedido: string
  ultima_modificacion_por: string | null
}

export type KanbanItem = Envio | Retiro

export interface PresenceUser {
  id: string
  nombre: string
  color: string
}

export interface SessionState {
  isUnlocked: boolean
  activeUser: PresenceUser | null
}

export const KANBAN_COLUMNS: { id: EstadoEnvio; label: string }[] = [
  { id: "pendiente", label: "Pendiente" },
  { id: "listo_para_retirar", label: "Listo para retirar" },
  { id: "para_retirar_drogueria", label: "Para retirar de drogueria" },
  { id: "en_camino", label: "En camino" },
  { id: "entregado", label: "Entregado" },
  { id: "no_entregado", label: "No entregado" },
  { id: "reprogramado", label: "Reprogramado" },
]
