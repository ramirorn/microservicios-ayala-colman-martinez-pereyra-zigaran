// Los estados se muestran como "sellos" de ticket
const colores = {
  CREADO: "text-gris border-gris",
  CONFIRMADO: "text-verde border-verde",
  APROBADO: "text-verde border-verde",
  CANCELADO: "text-tomate border-tomate",
  RECHAZADO: "text-tomate border-tomate",
  PENDIENTE_PAGO: "text-mostaza border-mostaza"
};

export default function EstadoPedido({ estado }) {
  return (
    <span
      className={`inline-block -rotate-2 border-2 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
        colores[estado] || colores.CREADO
      }`}
    >
      {estado.replace("_", " ")}
    </span>
  );
}
