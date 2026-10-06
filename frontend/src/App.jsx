import { useEffect, useState } from "react";
import { llamar } from "./api.js";
import EstadoServicios from "./componentes/EstadoServicios.jsx";
import NuevaCompra from "./componentes/NuevaCompra.jsx";
import Pedidos from "./componentes/Pedidos.jsx";
import Usuarios from "./componentes/Usuarios.jsx";
import Pagos from "./componentes/Pagos.jsx";
import Respuesta from "./componentes/Respuesta.jsx";

export default function App() {
  const [estado, setEstado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [respuesta, setRespuesta] = useState(null);

  async function cargarEstado() {
    const { datos } = await llamar("GET", "/estado");
    const nuevoEstado = datos.error ? {} : datos;
    setEstado(nuevoEstado);
    return nuevoEstado;
  }

  async function cargarUsuarios() {
    const { datos } = await llamar("GET", "/api/usuarios");
    if (Array.isArray(datos)) setUsuarios(datos);
  }

  async function cargarPedidos() {
    const { datos } = await llamar("GET", "/api/pedidos");
    if (Array.isArray(datos)) setPedidos(datos);
  }

  async function cargarPagos() {
    const { datos } = await llamar("GET", "/api/pagos");
    if (Array.isArray(datos)) setPagos(datos);
  }

  // Primero el estado: solo consultamos los servicios que están en línea,
  // así no sumamos llamadas que van a fallar y saturan al Gateway
  async function cargarTodo() {
    const actual = await cargarEstado();
    await Promise.all([
      actual.usuarios === "ok" && cargarUsuarios(),
      actual.pedidos === "ok" && cargarPedidos(),
      actual.pagos === "ok" && cargarPagos()
    ]);
  }

  // Cada acción muestra la respuesta del Gateway y refresca las listas
  async function ejecutar(metodo, ruta, cuerpo) {
    const resultado = await llamar(metodo, ruta, cuerpo);
    setRespuesta(resultado);
    cargarTodo();
    return resultado;
  }

  // Refresco cada 3 segundos, esperando que termine la consulta anterior
  useEffect(() => {
    let activo = true;
    let temporizador;
    async function ciclo() {
      await cargarTodo();
      if (activo) temporizador = setTimeout(ciclo, 3000);
    }
    ciclo();
    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="flex flex-wrap justify-between gap-2 border-b border-tinta py-2 font-mono text-[11px] uppercase tracking-widest text-gris">
        <span>TLP IV · Arquitectura de microservicios</span>
        <span>Cliente → API Gateway :3000</span>
      </div>

      <header className="flex flex-col gap-4 border-b-4 border-tinta py-8 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-6xl leading-[0.85] font-extrabold tracking-tighter sm:text-8xl">
          Tienda<span className="text-tomate">.</span>
          <br />
          Demo
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-gris">
          Un solo mostrador para todos los servicios. Cada acción pasa por el API Gateway; si un servicio cae,
          el resto sigue atendiendo.
        </p>
      </header>

      <EstadoServicios estado={estado} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <NuevaCompra usuarios={usuarios} ejecutar={ejecutar} />
          <Pedidos pedidos={pedidos} ejecutar={ejecutar} />
        </div>
        <div className="min-w-0 space-y-8">
          <Respuesta respuesta={respuesta} />
          <Usuarios usuarios={usuarios} ejecutar={ejecutar} />
          <Pagos pagos={pagos} />
        </div>
      </div>
    </div>
  );
}
