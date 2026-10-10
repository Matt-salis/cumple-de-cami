import { publicUrl } from "../lib/publicUrl.js";

const CUTS = [
  { src: "acentos/cafe.jpg", note: "Café.", tilt: "tilt-l" },
  { src: "acentos/medialunas.jpg", note: "Medialunas.", tilt: "tilt-r" },
  { src: "acentos/bowls.jpg", note: "Bowls.", tilt: "tilt-l" },
];

export function Accents() {
  return (
    <section className="collage" aria-label="Café y brunch">
      <div className="film" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <p className="scribble">Día de rodaje.</p>
      <div className="cutouts">
        {CUTS.map((cut) => (
          <figure key={cut.src} className={`cut ${cut.tilt}`}>
            <img src={publicUrl(cut.src)} alt="" />
            <figcaption>{cut.note}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
