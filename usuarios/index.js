const express = require("express");

const app = express();
app.use(express.json());

const usuarios = [
  { id: 1, nombre: "Ana López", email: "ana@mail.com" },
  { id: 2, nombre: "Bruno Díaz", email: "bruno@mail.com" }
];

app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

app.get("/usuarios/:id", (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json(usuario);
});

app.post("/usuarios", (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: "nombre y email son obligatorios" });
  }
  const usuario = { id: usuarios.length + 1, nombre, email };
  usuarios.push(usuario);
  res.status(201).json(usuario);
});

app.get("/health", (req, res) => {
  res.json({ servicio: "usuarios", estado: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servicio de Usuarios en puerto ${PORT}`));
