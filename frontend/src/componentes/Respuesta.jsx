function colorCodigo(codigo) {
  if (codigo === 202) return "bg-mostaza";
  if (codigo >= 200 && codigo < 300) return "bg-verde";
  return "bg-tomate";
}

// Muestra lo que devolvió el Gateway en la última acción, como un ticket impreso
export default function Respuesta({ respuesta }) {
  return (
    <section className="border-2 border-tinta bg-tinta text-papel-claro">
      <div className="flex items-baseline gap-3 border-b border-dashed border-papel/30 px-5 py-3">
        <span className="numero">03</span>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Última respuesta</h2>
      </div>

      {!respuesta ? (
        <p className="px-5 py-10 text-center font-mono text-xs text-papel/50">
          — Acá aparece la respuesta HTTP de cada acción —
        </p>
      ) : (
        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className={`px-2 py-1 font-semibold text-papel-claro ${colorCodigo(respuesta.codigo)}`}>
              HTTP {respuesta.codigo || "ERR"}
            </span>
            <span className="text-papel/70">
              {respuesta.metodo} {respuesta.ruta}
            </span>
          </div>
          <pre className="max-h-72 overflow-auto font-mono text-xs leading-relaxed text-papel/90">
            {JSON.stringify(respuesta.datos, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
