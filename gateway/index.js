const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const servicios = {
  usuarios: process.env.USUARIOS_URL || "http://localhost:3001",
  pedidos: process.env.PEDIDOS_URL || "http://localhost:3002",
  pagos: process.env.PAGOS_URL || "http://localhost:3003"
};

app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/estado", async (req, res) => {
  const estado = {};
  for (const nombre of Object.keys(servicios)) {
    try {
      await fetch(`${servicios[nombre]}/health`, { signal: AbortSignal.timeout(1500) });
      estado[nombre] = "ok";
    } catch (error) {
      estado[nombre] = "caido";
    }
  }
  res.json(estado);
});

app.use("/api/:servicio", async (req, res) => {
  const nombre = req.params.servicio;
  const destino = servicios[nombre];
  if (!destino) {
    return res.status(404).json({ error: `No existe el servicio ${nombre}` });
  }

  const url = `${destino}/${nombre}${req.url === "/" ? "" : req.url}`;
  const tieneCuerpo = !["GET", "HEAD"].includes(req.method);

  try {
    const respuesta = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: tieneCuerpo ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(8000)
    });
    const datos = await respuesta.json();
    res.status(respuesta.status).json(datos);
  } catch (error) {
    res.status(503).json({ error: `El servicio ${nombre} no está disponible` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway en http://localhost:${PORT}`));
