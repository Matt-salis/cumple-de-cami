function answerLabel(status) {
  return status === "confirmed" ? "Sí, voy. No me lo pierdo" : "No puedo participar de esta producción";
}

function activationError(message) {
  return /activ|confirm your email|confirmation link|verificar|confirme su correo/i.test(message || "");
}

export async function sendConfirmationMail({ firstName, lastName, status }) {
  const coming = status === "confirmed";
  const answer = answerLabel(status);
  const sentAt = new Date();
  const when = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(sentAt);
  const subject = coming
    ? `Cumple de Cami: ${firstName} confirmó`
    : `Cumple de Cami: ${firstName} no puede ir`;

  let response;
  try {
    response = await fetch("https://formsubmit.co/ajax/arruguete2001@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Nombre: firstName,
        Apellido: lastName,
        Respuesta: answer,
        "Fecha y hora": `${when} (${sentAt.toISOString()})`,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    });
  } catch {
    throw new Error("El mail no se envió. Tu respuesta no salió.");
  }

  const data = await response.json().catch(() => null);
  const success = data?.success === true || data?.success === "true";
  if (!response.ok || !success) {
    const message = String(data?.message || "");
    if (activationError(message)) {
      throw new Error(
        "Falta activar el mail. Cami tiene que abrir el correo de FormSubmit y tocar el enlace, una sola vez.",
      );
    }
    if (/web server|html files/i.test(message)) {
      throw new Error("El mail no se envió. La página tiene que abrirse desde el servidor, no como archivo suelto.");
    }
    throw new Error("El mail no se envió. Tu respuesta no salió.");
  }

  return { sentAt: sentAt.toISOString(), answer };
}

export async function saveLocalCopy(payload) {
  try {
    await fetch("/api/confirmaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // La copia en texto es opcional. El mail ya salió.
  }
}
