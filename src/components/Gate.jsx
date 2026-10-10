import { useId, useState } from "react";
import { Clapper } from "./Clapper.jsx";
import { cleanName, nameError } from "../lib/names.js";

export function Gate({ onEnter }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [error, setError] = useState("");
  const errorId = useId();
  const titleId = useId();
  const ready = !nameError(first, "nombre") && !nameError(last, "apellido");

  function submit(event) {
    event.preventDefault();
    const firstErr = nameError(first, "nombre");
    const lastErr = nameError(last, "apellido");
    if (firstErr || lastErr) {
      setError(firstErr || lastErr);
      return;
    }
    onEnter({ firstName: cleanName(first), lastName: cleanName(last) });
  }

  return (
    <div className="modal-backdrop">
      <section
        className="gate-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <form onSubmit={submit}>
          <Clapper />
          <p className="kicker">25 años</p>
          <h1 id={titleId}>Cumple de Cami</h1>
          <p className="line">Invitada.</p>
          <div className="name-grid">
            <label className="field">
              <span>Nombre</span>
              <input
                name="given-name"
                autoComplete="given-name"
                autoCapitalize="words"
                autoFocus
                placeholder="Nombre"
                value={first}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setFirst(event.target.value);
                  setError("");
                }}
              />
            </label>
            <label className="field">
              <span>Apellido</span>
              <input
                name="family-name"
                autoComplete="family-name"
                autoCapitalize="words"
                placeholder="Apellido"
                value={last}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setLast(event.target.value);
                  setError("");
                }}
              />
            </label>
          </div>
          {error ? (
            <p className="alert" id={errorId} role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn" type="submit" disabled={!ready}>
            Entrar al rodaje
          </button>
        </form>
      </section>
    </div>
  );
}
