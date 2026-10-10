import { eventConfig } from "../config/event.js";

export function Hero({ firstName }) {
  return (
    <section className="block cream" id="inicio">
      <div className="wrap">
        <p className="kicker">Convocatoria</p>
        <h1>{firstName ? `Hola, ${firstName}` : "Cumple de Cami"}</h1>
        <p className="line">Café y brunch de festejo</p>
        <ul className="facts">
          <li>
            <span>📅 Fecha</span>
            <strong>{eventConfig.date}</strong>
          </li>
          <li>
            <span>🕐 Hora</span>
            <strong>{eventConfig.time}</strong>
          </li>
          <li>
            <span>📍 Locación</span>
            <strong>{eventConfig.location}</strong>
          </li>
        </ul>
        <a className="map-link" href={eventConfig.mapsUrl} target="_blank" rel="noopener noreferrer">
          Ver la locación
        </a>
      </div>
    </section>
  );
}
