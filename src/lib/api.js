async function readJson(response) {
  return response.json().catch(() => null);
}

export async function saveConfirmation(payload) {
  let response;
  try {
    response = await fetch("/api/confirmaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("No hay conexión con producción. Tu respuesta no quedó anotada.");
  }

  const data = await readJson(response);
  if (!response.ok || !data?.ok || !data.record?.updatedAt) {
    throw new Error(data?.error || "Tu respuesta no quedó anotada. Intentá otra vez.");
  }
  return data.record;
}

export async function loadConfirmation(firstName, lastName) {
  const params = new URLSearchParams({ nombre: firstName, apellido: lastName });
  try {
    const response = await fetch(`/api/confirmaciones?${params}`, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await readJson(response);
    return data?.record || null;
  } catch {
    return null;
  }
}

export async function mediaExists(assetPath) {
  const params = new URLSearchParams({ path: assetPath });
  try {
    const response = await fetch(`/api/recurso?${params}`);
    if (!response.ok) return false;
    const data = await readJson(response);
    return Boolean(data?.exists);
  } catch {
    return false;
  }
}
