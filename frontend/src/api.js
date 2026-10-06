// Única forma de hablar con el backend: siempre a través del API Gateway
export async function llamar(metodo, ruta, cuerpo) {
  try {
    const respuesta = await fetch(ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    return { metodo, ruta, codigo: respuesta.status, datos: await respuesta.json() };
  } catch (error) {
    return { metodo, ruta, codigo: 0, datos: { error: "No se pudo contactar al API Gateway" } };
  }
}

export function formatearMonto(monto) {
  return "$" + Number(monto).toLocaleString("es-AR");
}
