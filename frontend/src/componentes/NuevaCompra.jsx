import { useEffect, useState } from "react";
import { formatearMonto } from "../api.js";

const productos = [
  { nombre: "Zapatillas", monto: 50000, codigo: "ZAP-01" },
  { nombre: "Remera", monto: 10000, codigo: "REM-02" },
  { nombre: "Auriculares", monto: 85000, codigo: "AUR-03" },
  { nombre: "Notebook", monto: 900000, codigo: "NBK-04" }
];

const LIMITE_APROBACION = 100000;

export default function NuevaCompra({ usuarios, ejecutar }) {
  const [usuarioId, setUsuarioId] = useState("");
  const [producto, setProducto] = useState("Zapatillas");
  const [monto, setMonto] = useState(50000);
  const [enviando, setEnviando] = useState(false);

  // Seleccionar el primer usuario cuando llega la lista
  useEffect(() => {
    if (!usuarioId && usuarios.length > 0) setUsuarioId(String(usuarios[0].id));
  }, [usuarios, usuarioId]);

  function elegir(p) {
    setProducto(p.nombre);
    setMonto(p.monto);
  }

  async function comprar(evento) {
    evento.preventDefault();
    setEnviando(true);
    await ejecutar("POST", "/api/pedidos", {
      usuarioId: Number(usuarioId),
      producto,
      monto: Number(monto)
    });
    setEnviando(false);
  }

  return (
    <section className="seccion">
      <div className="encabezado">
        <span className="numero">01</span>
        <h2>Nueva compra</h2>
        <span className="ml-auto font-mono text-[11px] text-gris">POST /api/pedidos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {productos.map((p) => {
          const elegido = p.nombre === producto;
          const superaLimite = p.monto > LIMITE_APROBACION;
          return (
            <button
              key={p.nombre}
              type="button"
              onClick={() => elegir(p)}
              className={`border-b-2 border-tinta p-4 text-left transition not-last:border-r-2 max-sm:nth-2:border-r-0 ${
                elegido ? "bg-tinta text-papel-claro" : "hover:bg-papel"
              }`}
            >
              <span className={`font-mono text-[11px] tracking-widest ${elegido ? "text-papel/60" : "text-gris"}`}>
                {p.codigo}
              </span>
              <p className="mt-6 font-display text-xl font-extrabold tracking-tight">{p.nombre}</p>
              <p className={`font-mono text-sm ${superaLimite ? "text-tomate" : ""}`}>
                {formatearMonto(p.monto)}
                {superaLimite && <span className="ml-1 text-[10px] uppercase">· excede</span>}
              </p>
            </button>
          );
        })}
      </div>

      <form onSubmit={comprar} className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label>
          <span className="etiqueta">Cliente</span>
          <select className="campo" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
            <option value="99">Usuario inexistente (id 99)</option>
          </select>
        </label>
        <label>
          <span className="etiqueta">Producto</span>
          <input className="campo" value={producto} onChange={(e) => setProducto(e.target.value)} />
        </label>
        <label>
          <span className="etiqueta">Monto</span>
          <input className="campo font-mono" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
        </label>
        <button className="boton" disabled={enviando || !usuarioId}>
          {enviando ? "Procesando…" : "Comprar →"}
        </button>
      </form>

      <p className="border-t border-dashed border-linea px-5 py-3 text-xs text-gris">
        Pagos aprueba montos de hasta <span className="font-mono">{formatearMonto(LIMITE_APROBACION)}</span>. Si Pagos
        está caído, el pedido queda <span className="font-semibold text-mostaza">pendiente de pago</span>.
      </p>
    </section>
  );
}
