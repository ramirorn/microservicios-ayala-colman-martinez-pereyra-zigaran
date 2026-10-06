const servicios = [
  { nombre: "usuarios", titulo: "Usuarios", puerto: 3001, detalle: "Alta y consulta de clientes" },
  { nombre: "pedidos", titulo: "Pedidos", puerto: 3002, detalle: "Orquesta la compra" },
  { nombre: "pagos", titulo: "Pagos", puerto: 3003, detalle: "Aprueba hasta $100.000" }
];

export default function EstadoServicios({ estado }) {
  // estado es null hasta recibir la primera respuesta del Gateway
  const cargando = estado === null;
  const gatewayOk = !cargando && Object.keys(estado).length > 0;

  return (
    <section className="mt-8 grid border-2 border-tinta sm:grid-cols-2 lg:grid-cols-4">
      <Celda codigo="00" titulo="API Gateway" puerto={3000} detalle="Puerta de entrada única" ok={gatewayOk} cargando={cargando} />
      {servicios.map((s, i) => (
        <Celda key={s.nombre} codigo={`0${i + 1}`} {...s} ok={estado?.[s.nombre] === "ok"} cargando={cargando} />
      ))}
    </section>
  );
}

function Celda({ codigo, titulo, puerto, detalle, ok, cargando }) {
  if (cargando) ok = true;
  return (
    <div
      className={`border-tinta p-4 not-last:border-b-2 sm:odd:border-r-2 lg:not-last:border-r-2 lg:not-last:border-b-0 ${
        ok ? "bg-papel-claro" : "bg-tomate text-papel-claro"
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
        <span className={ok ? "text-gris" : ""}>{codigo} · :{puerto}</span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className={`h-2.5 w-2.5 ${cargando ? "animate-pulse bg-linea" : ok ? "bg-verde" : "animate-pulse bg-papel-claro"}`} />
          {cargando ? "Conectando…" : ok ? "Operativo" : "Fuera de servicio"}
        </span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">{titulo}</h3>
      <p className={`text-sm ${ok ? "text-gris" : ""}`}>{detalle}</p>
    </div>
  );
}
