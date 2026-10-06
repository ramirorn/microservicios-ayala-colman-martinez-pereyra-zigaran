const express = require("express");

const app = express();
app.use(express.json());

const USUARIOS_URL = process.env.USUARIOS_URL || "http://localhost:3001";
const PAGOS_URL = process.env.PAGOS_URL || "http://localhost:3003";

const pedidos = [];

async function buscarUsuario(usuarioId) {
  const respuesta = await fetch(`${USUARIOS_URL}/usuarios/${usuarioId}`, {
    signal: AbortSignal.timeout(3000)
  });
  if (respuesta.status === 404) return null;
  return respuesta.json();
}

async function cobrar(pedido) {
  try {
    const respuesta = await fetch(`${PAGOS_URL}/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: pedido.id, monto: pedido.monto }),
      signal: AbortSignal.timeout(3000)
    });
    const pago = await respuesta.json();
    pedido.pagoId = pago.id;
    pedido.estado = pago.estado === "APROBADO" ? "CONFIRMADO" : "CANCELADO";
  } catch (error) {
    pedido.estado = "PENDIENTE_PAGO";
  }
  return pedido;
}

app.get("/pedidos", (req, res) => {
  res.json(pedidos);
});

app.get("/pedidos/:id", (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.json(pedido);
});

app.post("/pedidos", async (req, res) => {
  const { usuarioId, producto, monto } = req.body;
  if (!usuarioId || !producto || !monto) {
    return res.status(400).json({ error: "usuarioId, producto y monto son obligatorios" });
  }

  let usuario;
  try {
    usuario = await buscarUsuario(usuarioId);
  } catch (error) {
    return res.status(503).json({ error: "Servicio de usuarios no disponible" });
  }
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const pedido = {
    id: pedidos.length + 1,
    usuarioId,
    cliente: usuario.nombre,
    producto,
    monto,
    estado: "CREADO"
  };
  pedidos.push(pedido);

  await cobrar(pedido);
  const codigo = pedido.estado === "PENDIENTE_PAGO" ? 202 : 201;
  res.status(codigo).json(pedido);
});

app.post("/pedidos/:id/reintentar-pago", async (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  if (pedido.estado !== "PENDIENTE_PAGO") {
    return res.status(409).json({ error: `El pedido ya está ${pedido.estado}` });
  }
  await cobrar(pedido);
  res.json(pedido);
});

app.get("/health", (req, res) => {
  res.json({ servicio: "pedidos", estado: "ok" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servicio de Pedidos en puerto ${PORT}`));
