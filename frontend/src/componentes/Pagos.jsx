import { formatearMonto } from "../api.js";
import EstadoPedido from "./EstadoPedido.jsx";
import { Vacio } from "./Pedidos.jsx";

export default function Pagos({ pagos }) {
  return (
    <section className="seccion">
      <div className="encabezado">
        <span className="numero">05</span>
        <h2>Pagos</h2>
        <span className="ml-auto font-mono text-[11px] text-gris">{pagos.length}</span>
      </div>

      {pagos.length === 0 ? (
        <Vacio texto="Sin pagos registrados" />
      ) : (
        <ul>
          {[...pagos].reverse().map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-b border-dashed border-linea px-5 py-3 last:border-0">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{formatearMonto(p.monto)}</p>
                <p className="font-mono text-[11px] text-gris">
                  Pedido {String(p.pedidoId).padStart(3, "0")} · {new Date(p.fecha).toLocaleTimeString("es-AR")}
                </p>
              </div>
              <span className="ml-auto"><EstadoPedido estado={p.estado} /></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
