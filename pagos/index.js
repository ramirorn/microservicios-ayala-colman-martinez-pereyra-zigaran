const express = require("express");

const app = express();
app.use(express.json());

const pagos = [];
const LIMITE_APROBACION = 100000;

app.get("/pagos", (req, res) => {
  res.json(pagos);
});

app.post("/pagos", (req, res) => {
  const { pedidoId, monto } = req.body;
  if (!pedidoId || !monto) {
    return res.status(400).json({ error: "pedidoId y monto son obligatorios" });
  }
  const estado = monto <= LIMITE_APROBACION ? "APROBADO" : "RECHAZADO";
  const pago = {
    id: pagos.length + 1,
    pedidoId,
    monto,
    estado,
    fecha: new Date().toISOString()
  };
  pagos.push(pago);
  console.log(`Pago ${pago.id} del pedido ${pedidoId}: ${estado}`);
  res.status(201).json(pago);
});

app.get("/health", (req, res) => {
  res.json({ servicio: "pagos", estado: "ok" });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Servicio de Pagos en puerto ${PORT}`));
