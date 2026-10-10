import { useId, useRef, useState } from "react";
import { eventConfig } from "../config/event.js";
import { saveLocalCopy, sendConfirmationMail } from "../lib/mail.js";

const OPTIONS = [
  {
    value: "confirmed",
    title: "Sí, voy",
    detail: "No me lo pierdo",
  },
  {
    value: "unavailable",
    title: "No puedo participar de esta producción.",
    detail: "",
  },
];

export function Confirmation({ firstName, lastName }) {
  const [choice, setChoice] = useState("");
  const [phase, setPhase] = useState("form");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null);
  const lock = useRef(false);
  const statusId = useId();
  const errorId = useId();
  const selected = OPTIONS.find((option) => option.value === choice);

  async function commit() {
    if (lock.current) return;
    if (!choice) {
      setError("Elegí tu respuesta.");
      setPhase("error");
      return;
    }

    const person = { firstName, lastName, status: choice };
    lock.current = true;
    setPhase("loading");
    setError("");
    try {
      const result = await sendConfirmationMail(person);
      await saveLocalCopy(person);
      setSent({ ...person, ...result });
      setPhase("success");
    } catch (err) {
      setError(err.message || "No se pudo enviar el mail. Tu respuesta no salió.");
      setPhase("error");
    } finally {
      lock.current = false;
    }
  }

  if (phase === "success" && sent) {
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
          <button className="back" type="button" onClick={() => setPhase("form")}>
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (phase === "loading") return;
            if (!choice) {
              setError("Elegí tu respuesta.");
              return;
            }
            setError("");
            setPhase("confirm");
          }}
        >
          {firstName ? (
            <p className="who">
              <span>Ficha</span>
              {firstName} {lastName}
            </p>
          ) : null}
          <fieldset className="choices" disabled={phase === "loading"}>
            <legend>Respuesta de la convocatoria.</legend>
            {OPTIONS.map((option) => (
              <label key={option.value} className={choice === option.value ? "choice is-selected" : "choice"}>
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={choice === option.value}
                  onChange={() => {
                    setChoice(option.value);
                    setError("");
                    if (phase !== "loading") setPhase("form");
                  }}
                />
                <span>
                  <strong>{option.title}</strong>
                  {option.detail ? <small>{option.detail}</small> : null}
                </span>
              </label>
            ))}
          </fieldset>
          {phase === "confirm" && selected ? (
            <div className="confirm-box" role="region" aria-label="Confirmar respuesta">
              <p>Antes de cerrar la toma, confirmá.</p>
              <strong>
                {firstName} {lastName}
              </strong>
              <p>
                {selected.title} {selected.detail}
              </p>
              <div className="actions">
                <button className="back" type="button" onClick={() => setPhase("form")}>
                  Volver a elegir
                </button>
                <button className="btn" type="button" onClick={commit}>
                  Sí, enviar
                </button>
              </div>
            </div>
          ) : null}
          {phase === "loading" ? (
            <p className="note" id={statusId} role="status">
              Enviando a la producción…
            </p>
          ) : null}
          {error ? (
            <p className="alert" id={errorId} role="alert">
              {error}
            </p>
          ) : null}
          {phase === "error" ? (
            <button className="btn" type="button" onClick={commit}>
              Intentar de nuevo
            </button>
          ) : null}
          {phase === "form" ? (
            <button className="btn" type="submit" disabled={!choice}>
              Registrar respuesta
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
