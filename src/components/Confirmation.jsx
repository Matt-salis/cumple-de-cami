import { useState } from "react";
import { eventConfig } from "../config/event.js";
import { saveLocalCopy, sendConfirmationMail } from "../lib/mail.js";

const OPTIONS = [
  {
    value: "confirmed",
    title: "Sí, voy",
    detail: "No me lo pierdo",
    href: "https://wa.link/co9lsv",
  },
  {
    value: "unavailable",
    title: "No puedo participar de esta producción.",
    detail: "",
    href: "https://wa.link/bdryo8",
  },
];

export function Confirmation({ firstName, lastName }) {
  const [sent, setSent] = useState(null);

  function choose(option) {
    const person = { firstName, lastName, status: option.value };
    setSent(person);
    sendConfirmationMail(person)
      .then(() => saveLocalCopy(person))
      .catch(() => {});
  }

  if (sent) {
    const coming = sent.status === "confirmed";
    const facts = [
      eventConfig.date.trim() ? ["📅 Fecha", eventConfig.date.trim()] : null,
      eventConfig.time.trim() ? ["🕐 Horario", eventConfig.time.trim()] : null,
      eventConfig.location.trim() ? ["📍 Lugar", eventConfig.location.trim()] : null,
    ].filter(Boolean);

    return (
      <section className="block peach" id="confirmar" aria-live="polite">
        <div className="wrap narrow">
          <h2>{coming ? "En el rodaje." : "Queda anotado."}</h2>
          <p className="line">Se abre WhatsApp.</p>
          <p className="line">
            {coming
              ? `La producción te espera, ${sent.firstName}.`
              : `La producción toma nota, ${sent.firstName}.`}
          </p>
          {coming && facts.length > 0 ? (
            <dl className="recap">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              {eventConfig.mapsUrl ? (
                <div>
                  <dt>Mapa</dt>
                  <dd>
                    <a className="map-link" href={eventConfig.mapsUrl} target="_blank" rel="noopener noreferrer">
                      Ver la locación
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <p className="status">{coming ? "Confirmada para el rodaje" : "Fuera de esta toma"}</p>
          <button className="back" type="button" onClick={() => setSent(null)}>
            Cambiar respuesta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="block peach" id="confirmar">
      <div className="wrap narrow">
        <h2>{firstName ? `¿Venís, ${firstName}?` : "¿Venís?"}</h2>
        <p className="line">Creeme, no te lo queres perder</p>
        {firstName ? (
          <p className="who">
            <span>Ficha</span>
            {firstName} {lastName}
          </p>
        ) : null}
        <div className="choices">
          <p className="choices-label">Respuesta de la convocatoria.</p>
          {OPTIONS.map((option) => (
            <a
              key={option.value}
              className="choice"
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => choose(option)}
            >
              <span>
                <strong>{option.title}</strong>
                {option.detail ? <small>{option.detail}</small> : null}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
