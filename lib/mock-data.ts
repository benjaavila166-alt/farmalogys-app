import type { Cliente, Pedido, Envio } from "./types"

export const MOCK_CLIENTES: Cliente[] = [
  { id: "c1", nombre: "Maria Lopez", dni_cuit: "20-30123456-7", whatsapp: "+5491155551234", direccion_principal: "Av. Corrientes 1234, CABA", latitud: -34.604, longitud: -58.381 },
  { id: "c2", nombre: "Juan Perez", dni_cuit: "20-28654321-5", whatsapp: "+5491155555678", direccion_principal: "Av. Rivadavia 5678, CABA", latitud: -34.620, longitud: -58.423 },
  { id: "c3", nombre: "Ana Garcia", dni_cuit: "27-35987654-3", whatsapp: "+5491155559012", direccion_principal: "Av. Santa Fe 910, CABA", latitud: -34.595, longitud: -58.400 },
  { id: "c4", nombre: "Carlos Mendez", dni_cuit: "20-32456789-1", whatsapp: "+5491155553456", direccion_principal: "Calle Florida 345, CABA", latitud: -34.600, longitud: -58.375 },
  { id: "c5", nombre: "Laura Torres", dni_cuit: "27-29876543-9", whatsapp: "+5491155557890", direccion_principal: "Av. Belgrano 2345, CABA", latitud: -34.612, longitud: -58.383 },
  { id: "c6", nombre: "Roberto Diaz", dni_cuit: "20-31234567-4", whatsapp: "+5491155551111", direccion_principal: "Calle Defensa 678, San Telmo", latitud: -34.618, longitud: -58.372 },
  { id: "c7", nombre: "Sofia Martinez", dni_cuit: "27-33789012-6", whatsapp: "+5491155552222", direccion_principal: "Av. Callao 1590, Recoleta", latitud: -34.598, longitud: -58.393 },
  { id: "c8", nombre: "Pablo Fernandez", dni_cuit: "20-27654321-8", whatsapp: "+5491155553333", direccion_principal: "Calle Thames 1800, Palermo", latitud: -34.589, longitud: -58.428 },
]

export const MOCK_PEDIDOS: Pedido[] = [
  { id: "p1", fecha_programada: "2026-02-26", cliente_id: "c1", cliente_nombre: "Maria Lopez", detalle_pedido: "Medicamento A x2, Medicamento B x1", monto_a_cobrar: 4500, estado_pago: "pendiente", tipo_pedido: "envio" },
  { id: "p2", fecha_programada: "2026-02-26", cliente_id: "c2", cliente_nombre: "Juan Perez", detalle_pedido: "Suplemento C x3", monto_a_cobrar: 7200, estado_pago: "cobrado", tipo_pedido: "envio" },
  { id: "p3", fecha_programada: "2026-02-27", cliente_id: "c3", cliente_nombre: "Ana Garcia", detalle_pedido: "Medicamento D x1, Crema E x2", monto_a_cobrar: 3100, estado_pago: "pendiente", tipo_pedido: "retiro" },
  { id: "p4", fecha_programada: "2026-02-27", cliente_id: "c4", cliente_nombre: "Carlos Mendez", detalle_pedido: "Vitaminas F x5", monto_a_cobrar: 12000, estado_pago: "no_cobrado", tipo_pedido: "envio" },
  { id: "p5", fecha_programada: "2026-02-28", cliente_id: "c5", cliente_nombre: "Laura Torres", detalle_pedido: "Antibiotico G x2", monto_a_cobrar: 5800, estado_pago: "pendiente", tipo_pedido: "envio" },
  { id: "p6", fecha_programada: "2026-02-28", cliente_id: "c6", cliente_nombre: "Roberto Diaz", detalle_pedido: "Medicamento H x1", monto_a_cobrar: 2400, estado_pago: "cobrado", tipo_pedido: "retiro" },
  { id: "p7", fecha_programada: "2026-03-01", cliente_id: "c7", cliente_nombre: "Sofia Martinez", detalle_pedido: "Suplemento I x2, Crema J x1", monto_a_cobrar: 9300, estado_pago: "pendiente", tipo_pedido: "envio" },
  { id: "p8", fecha_programada: "2026-03-01", cliente_id: "c8", cliente_nombre: "Pablo Fernandez", detalle_pedido: "Medicamento K x3", monto_a_cobrar: 6700, estado_pago: "pendiente", tipo_pedido: "envio" },
  { id: "p9", fecha_programada: "2026-03-02", cliente_id: "c1", cliente_nombre: "Maria Lopez", detalle_pedido: "Crema L x1", monto_a_cobrar: 1800, estado_pago: "cobrado", tipo_pedido: "retiro" },
  { id: "p10", fecha_programada: "2026-03-02", cliente_id: "c3", cliente_nombre: "Ana Garcia", detalle_pedido: "Medicamento M x4", monto_a_cobrar: 15200, estado_pago: "pendiente", tipo_pedido: "envio" },
]

export const MOCK_ENVIOS: Envio[] = [
  { id: "e1", pedido_id: "p1", cadete_id: "cad1", estado_envio: "pendiente", direccion_de_entrega: "Av. Corrientes 1234, CABA", cliente_nombre: "Maria Lopez", monto_a_cobrar: 4500, detalle_pedido: "Medicamento A x2, Medicamento B x1", fecha_programada: "2026-02-26", ultima_modificacion_por: null },
  { id: "e2", pedido_id: "p2", cadete_id: "cad1", estado_envio: "en_camino", direccion_de_entrega: "Av. Rivadavia 5678, CABA", cliente_nombre: "Juan Perez", monto_a_cobrar: 7200, detalle_pedido: "Suplemento C x3", fecha_programada: "2026-02-26", ultima_modificacion_por: "Admin" },
  { id: "e3", pedido_id: "p4", cadete_id: "cad2", estado_envio: "listo_para_retirar", direccion_de_entrega: "Calle Florida 345, CABA", cliente_nombre: "Carlos Mendez", monto_a_cobrar: 12000, detalle_pedido: "Vitaminas F x5", fecha_programada: "2026-02-27", ultima_modificacion_por: null },
  { id: "e4", pedido_id: "p5", cadete_id: "cad1", estado_envio: "pendiente", direccion_de_entrega: "Av. Belgrano 2345, CABA", cliente_nombre: "Laura Torres", monto_a_cobrar: 5800, detalle_pedido: "Antibiotico G x2", fecha_programada: "2026-02-28", ultima_modificacion_por: null },
  { id: "e5", pedido_id: "p7", cadete_id: "cad2", estado_envio: "para_retirar_drogueria", direccion_de_entrega: "Av. Callao 1590, Recoleta", cliente_nombre: "Sofia Martinez", monto_a_cobrar: 9300, detalle_pedido: "Suplemento I x2, Crema J x1", fecha_programada: "2026-03-01", ultima_modificacion_por: "Carlos" },
  { id: "e6", pedido_id: "p8", cadete_id: "cad1", estado_envio: "entregado", direccion_de_entrega: "Calle Thames 1800, Palermo", cliente_nombre: "Pablo Fernandez", monto_a_cobrar: 6700, detalle_pedido: "Medicamento K x3", fecha_programada: "2026-03-01", ultima_modificacion_por: "Admin" },
  { id: "e7", pedido_id: "p10", cadete_id: "cad2", estado_envio: "no_entregado", direccion_de_entrega: "Av. Santa Fe 910, CABA", cliente_nombre: "Ana Garcia", monto_a_cobrar: 15200, detalle_pedido: "Medicamento M x4", fecha_programada: "2026-03-02", ultima_modificacion_por: "Carlos" },
  { id: "e8", pedido_id: "p1", cadete_id: "cad1", estado_envio: "reprogramado", direccion_de_entrega: "Av. Corrientes 1234, CABA", cliente_nombre: "Maria Lopez", monto_a_cobrar: 4500, detalle_pedido: "Medicamento A x2", fecha_programada: "2026-02-26", ultima_modificacion_por: "Admin" },
]

export const MOCK_PRESENCE_USERS = [
  { id: "u1", nombre: "Admin", color: "#5b7a9e" },
  { id: "u2", nombre: "Carlos", color: "#7a9e5b" },
]

export const VALID_PINS: Record<string, { nombre: string; color: string }> = {
  "1234": { nombre: "Admin", color: "#5b7a9e" },
  "5678": { nombre: "Carlos", color: "#7a9e5b" },
  "9012": { nombre: "Maria", color: "#9e5b7a" },
}
