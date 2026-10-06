import { formatearMonto } from "../api.js";
import EstadoPedido from "./EstadoPedido.jsx";

export default function Pedidos({ pedidos, ejecutar }) {
  return (
    <section className="seccion">
      <div className="encabezado">
        <span className="numero">02</span>
        <h2>Pedidos</h2>
        <span className="ml-auto font-mono text-[11px] text-gris">{pedidos.length} registrados</span>
      </div>

      {pedidos.length === 0 ? (
        <Vacio texto="Todavía no hay pedidos. Hacé una compra para empezar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm">
            <thead>
              <tr className="border-b border-tinta text-left font-mono text-[11px] uppercase tracking-widest text-gris">
                <th className="px-5 py-2 font-medium">N°</th>
                <th className="px-2 py-2 font-medium">Cliente</th>
                <th className="px-2 py-2 font-medium">Producto</th>
                <th className="px-2 py-2 text-right font-medium">Monto</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody>
              {[...pedidos].reverse().map((p) => (
                <tr key={p.id} className="border-b border-dashed border-linea last:border-0 hover:bg-papel">
                  <td className="px-5 py-3 font-mono text-gris">{String(p.id).padStart(3, "0")}</td>
                  <td className="px-2 py-3 font-medium">{p.cliente}</td>
                  <td className="px-2 py-3">{p.producto}</td>
                  <td className="px-2 py-3 text-right font-mono">{formatearMonto(p.monto)}</td>
                  <td className="px-4 py-3"><EstadoPedido estado={p.estado} /></td>
                  <td className="px-5 py-3 text-right">
                    {p.estado === "PENDIENTE_PAGO" && (
                      <button
                        onClick={() => ejecutar("POST", `/api/pedidos/${p.id}/reintentar-pago`)}
                        className="boton-secundario border-mostaza text-mostaza hover:border-tinta"
                      >
                        Reintentar pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function Vacio({ texto }) {
  return <p className="px-5 py-10 text-center font-mono text-xs text-gris">— {texto} —</p>;
}
