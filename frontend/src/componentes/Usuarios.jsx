import { useState } from "react";

export default function Usuarios({ usuarios, ejecutar }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [buscarId, setBuscarId] = useState("");

  async function crear(evento) {
    evento.preventDefault();
    const { codigo } = await ejecutar("POST", "/api/usuarios", { nombre, email });
    if (codigo === 201) {
      setNombre("");
      setEmail("");
    }
  }

  function buscar(evento) {
    evento.preventDefault();
    ejecutar("GET", `/api/usuarios/${buscarId}`);
  }

  return (
    <section className="seccion">
      <div className="encabezado">
        <span className="numero">04</span>
        <h2>Usuarios</h2>
        <span className="ml-auto font-mono text-[11px] text-gris">{usuarios.length}</span>
      </div>

      <ul>
        {usuarios.map((u) => (
          <li key={u.id} className="flex items-center gap-3 border-b border-dashed border-linea px-5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-tinta font-display text-sm font-extrabold text-papel-claro">
              {u.nombre.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{u.nombre}</p>
              <p className="truncate font-mono text-xs text-gris">{u.email}</p>
            </div>
            <span className="ml-auto font-mono text-xs text-gris">#{u.id}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={crear} className="space-y-3 p-5">
        <span className="etiqueta">Nuevo usuario</span>
        <input className="campo" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="campo" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="boton w-full">Crear usuario</button>
      </form>

      <form onSubmit={buscar} className="border-t-2 border-tinta p-5">
        <span className="etiqueta">Buscar por ID</span>
        <div className="flex gap-2">
          <input
            className="campo font-mono"
            type="number"
            min="1"
            placeholder="1"
            value={buscarId}
            onChange={(e) => setBuscarId(e.target.value)}
          />
          <button className="boton-secundario" disabled={!buscarId}>Buscar</button>
        </div>
      </form>
    </section>
  );
}
