import { eventConfig } from "../config/event.js";
import { photos } from "../config/photos.js";

function shown(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

const ROWS = [
  ["Proyecto", eventConfig.eventName],
  ["Directora", eventConfig.hostName],
  ["Fecha", eventConfig.date],
  ["Horario de llegada", eventConfig.time],
  ["Lugar", eventConfig.location],
  ["Vestuario", eventConfig.dressCode],
  ["Para comer", eventConfig.menu],
  ["Si el clima no acompaña", eventConfig.weatherPlan],
];

export function EventInfo() {
  return (
    <section className="band" id="rodaje" style={{ backgroundImage: `url(${photos.event})` }}>
      <div className="veil veil-strong" />
      <div className="section">
        <p className="eyebrow">Ficha de rodaje</p>
        <h2>Antes de confirmar</h2>
        <p className="lede">Lo que conviene saber de la mañana.</p>
        <article className="sheet">
          <header className="sheet-head">
            <div>
              <p>Parte de producción</p>
              <h3>{eventConfig.shortName}</h3>
            </div>
            <span>Nº {eventConfig.callNumber}</span>
          </header>
          {ROWS.map(([label, value]) => {
            const text = shown(value);
            const isPlace = label === "Lugar";
            return (
              <div className="sheet-row" key={label}>
                <p>{label}</p>
                <div>
                  {text ? <strong>{text}</strong> : <em className="pending">Pendiente de producción</em>}
                  {isPlace && eventConfig.mapsUrl ? (
                    <a className="map-link" href={eventConfig.mapsUrl} target="_blank" rel="noopener noreferrer">
                      Abrir en Google Maps
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </article>
      </div>
    </section>
  );
}
