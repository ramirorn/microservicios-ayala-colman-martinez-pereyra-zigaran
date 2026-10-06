# Guía de la demo: dónde empieza y dónde termina todo

TLP IV — Microservicios
Ayala, Santiago · Colman, Máximo · Martínez, Javier · Pereyra, Nicolás · Zigarán, Lucas

---

## 1. Qué hay en la carpeta

```
demo-microservicios/
├── docker-compose.yml      Levanta los 4 contenedores y los conecta
├── package.json            Solo para correr SIN Docker (plan B)
├── requests.http           Pruebas listas para VS Code (extensión REST Client)
├── gateway/                Puerta de entrada única (puerto 3000)
│   ├── index.js
│   └── public/index.html   La "tienda" que usamos en la demo (el cliente)
├── usuarios/               Servicio de Usuarios (3001)
├── pedidos/                Servicio de Pedidos  (3002)  ← el que orquesta la compra
└── pagos/                  Servicio de Pagos    (3003)
```

Cada servicio tiene su propio `index.js`, `package.json` y `Dockerfile`. No comparten código ni datos: eso es lo que los hace microservicios.

La "base de datos" de cada servicio es un arreglo en memoria (`const usuarios = []`, `const pedidos = []`, `const pagos = []`). Si un servicio se reinicia, pierde sus datos. Es a propósito: simple para la demo.

---

## 2. Cómo se levanta

### Opción A — Docker (la que usamos en la presentación)

```bash
docker compose up --build
```

Abrir http://localhost:3000

Solo el Gateway publica puerto (3000). Usuarios, Pedidos y Pagos quedan en la red interna de Docker y se encuentran por nombre (`http://pagos:3003`). Eso se configura en `docker-compose.yml` con las variables `USUARIOS_URL`, `PEDIDOS_URL`, `PAGOS_URL`.

Apagar todo: `Ctrl + C` y luego `docker compose down`.

### Opción B — Sin Docker (plan B si falla Docker el día de la presentación)

```bash
npm run instalar
npm start
```

Corre los 4 servicios juntos con `concurrently`. Sin variables de entorno, cada servicio usa `http://localhost:300X` por defecto.

---

## 3. Dónde EMPIEZA cada servicio

Todos arrancan igual, en la **última línea** de su `index.js`:

| Servicio | Archivo | Línea | Qué hace |
|---|---|---|---|
| Gateway | `gateway/index.js` | 57 | `app.listen(3000)` |
| Usuarios | `usuarios/index.js` | 38 | `app.listen(3001)` |
| Pedidos | `pedidos/index.js` | 96 | `app.listen(3002)` |
| Pagos | `pagos/index.js` | 36 | `app.listen(3003)` |

Arriba de esa línea, cada archivo solo **declara rutas** (`app.get`, `app.post`). Ninguna se ejecuta hasta que llega una petición.

---

## 4. Recorrido completo de una COMPRA (el flujo de la demo)

Este es el camino exacto, en orden, desde que se aprieta "Comprar" hasta que aparece la respuesta.

### Paso 1 — INICIO: el cliente (navegador)
`gateway/public/index.html`, función `comprar()` (línea 87)

```js
llamar("POST", "/api/pedidos", { usuarioId, producto, monto })
```
El navegador **solo conoce al Gateway**. No sabe que existen Usuarios, Pedidos ni Pagos.

### Paso 2 — Gateway recibe y reenvía
`gateway/index.js`

- Línea 14: imprime en consola `[Gateway] POST /api/pedidos` (sirve para mostrar en vivo).
- Línea 32: `app.use("/api/:servicio", ...)` toma `pedidos` de la URL.
- Línea 39: arma la URL de destino → `http://pedidos:3002/pedidos`.
- Línea 43: `fetch(url)` reenvía la petición al servicio de Pedidos.

### Paso 3 — Pedidos valida al usuario
`pedidos/index.js`

- Línea 48: `app.post("/pedidos")` recibe la petición.
- Línea 56: llama a `buscarUsuario()` (línea 11), que hace `fetch` al **servicio de Usuarios**.

### Paso 4 — Usuarios responde
`usuarios/index.js`, línea 15: `GET /usuarios/:id` busca en su arreglo y devuelve el usuario o `404`.

### Paso 5 — Pedidos guarda el pedido
`pedidos/index.js`, línea 72: `pedidos.push(pedido)` con estado `CREADO`.

### Paso 6 — Pedidos pide el cobro
`pedidos/index.js`, línea 74: `cobrar(pedido)` (definida en línea 19), que hace `fetch` al **servicio de Pagos**.

### Paso 7 — Pagos decide
`pagos/index.js`, línea 18:

```js
const estado = monto <= LIMITE_APROBACION ? "APROBADO" : "RECHAZADO";
```
Hasta $100.000 aprueba, más que eso rechaza.

### Paso 8 — Pedidos actualiza el estado
De vuelta en `cobrar()`:

| Resultado de Pagos | Estado del pedido | HTTP |
|---|---|---|
| APROBADO | CONFIRMADO | 201 |
| RECHAZADO | CANCELADO | 201 |
| Pagos no responde (caído) | PENDIENTE_PAGO | 202 |

### Paso 9 — FIN: la respuesta vuelve
Pedidos → Gateway (línea 50 `res.status(...).json(datos)`) → navegador, que la muestra en el recuadro "Respuesta" y recarga la tabla de pedidos.

---

## 5. Otros flujos cortos

| Acción | Empieza | Termina |
|---|---|---|
| Ver estado de servicios (los cartelitos verde/rojo) | `index.html` `cargarEstado()` cada 2 s | `gateway/index.js` línea 19 `/estado`: llama a `/health` de cada servicio |
| Listar usuarios | `index.html` `cargarUsuarios()` | `usuarios/index.js` línea 11 |
| Reintentar pago | `index.html` `reintentar(id)` | `pedidos/index.js` línea 79 → vuelve a llamar `cobrar()` |

---

## 6. Guion de la demo en vivo (≈ 4 minutos)

1. `docker compose up --build` (hacerlo ANTES de empezar a hablar, tarda).
2. Abrir http://localhost:3000. Los 3 servicios en verde.
3. **Compra OK**: Ana, Zapatillas, 50000 → `CONFIRMADO`. Mostrar la consola: se ve el log del Gateway y de Pagos.
4. **Compra rechazada**: Bruno, Notebook, 900000 → `CANCELADO`.
5. **Tolerancia a fallos** (el momento clave). En otra terminal:
   ```bash
   docker compose stop pagos
   ```
   - El cartel de pagos pasa a rojo.
   - Comprar algo → `PENDIENTE_PAGO` (HTTP 202). **La tienda no se cayó.**
   - Los usuarios se siguen listando: Usuarios no se enteró de nada.
6. **Recuperación**:
   ```bash
   docker compose start pagos
   ```
   - Cartel vuelve a verde. Botón "Reintentar pago" → `CONFIRMADO`.
7. Frase de cierre: "En un monolito, si se caía el módulo de pagos, se caía toda la tienda."

---

## 7. Preguntas que nos pueden hacer

- **¿Por qué un Gateway?** Un único punto de entrada: el cliente no necesita conocer direcciones internas; ahí se pondría autenticación, logs, límites de uso.
- **¿Por qué cada uno tiene su base?** Para que un servicio no dependa del esquema de otro. Si Pagos cambia su tabla, Pedidos no se rompe.
- **¿Qué pasa con la consistencia?** Es el desafío: el pedido existe aunque el pago no. Por eso el estado `PENDIENTE_PAGO` y el reintento (en producción: colas de mensajes / patrón Saga).
- **¿Por qué el pagoId se repite después de reiniciar Pagos?** Porque la base es en memoria y se reinicia. En producción sería una base real (PostgreSQL, MongoDB).

---

## Frontend centralizado (React + Vite + Tailwind)

Carpeta `frontend/`. Es un contenedor más en `docker-compose.yml` (puerto **8080**).

```bash
docker compose up --build
```

Abrir http://localhost:8080

- Igual que la tienda original, **solo habla con el API Gateway**: nginx reenvía `/api/...` y `/estado` a `http://gateway:3000`.
- Desde una sola pantalla se usan todos los servicios: estado en vivo, compras, pedidos (con "Reintentar pago"), usuarios (listar, crear, buscar por ID) y pagos.
- El panel "Última respuesta" muestra el código HTTP y el JSON que devolvió el Gateway, ideal para explicar cada escenario.

| Archivo | Qué hace |
|---|---|
| `frontend/src/api.js` | Función `llamar()`: único punto de contacto con el Gateway |
| `frontend/src/App.jsx` | Carga los datos cada 3 segundos y arma la pantalla |
| `frontend/src/componentes/` | Un componente por sección (Usuarios, Pedidos, Pagos, etc.) |
| `frontend/nginx.conf` | Sirve la app y reenvía las llamadas al Gateway |

Sin Docker: `npm install --prefix frontend` y `npm run dev --prefix frontend` (abre en http://localhost:5173, con el Gateway corriendo en 3000).
