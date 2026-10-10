import { useEffect, useState } from "react";
import { Clapper } from "./components/Clapper.jsx";
import { Confirmation } from "./components/Confirmation.jsx";
import { Gate } from "./components/Gate.jsx";
import { Hero } from "./components/Hero.jsx";
import { VideoBlock } from "./components/VideoBlock.jsx";
import { eventConfig } from "./config/event.js";

const PORTRAITS = ["/fotos/cami-1.png", "/fotos/cami-2.png", "/fotos/cami-3.png", "/fotos/cami-4.png"];

function Portraits({ sources }) {
  return (
    <div className="portraits" aria-hidden="true">
      {sources.map((src, index) => (
        <img key={src} className={index % 2 ? "shot tilt-r" : "shot tilt-l"} src={src} alt="" />
      ))}
    </div>
  );
}

export default function App() {
  const [guest, setGuest] = useState(null);

  useEffect(() => {
    document.title = eventConfig.eventName;
  }, []);

  return (
    <div className={guest ? "page" : "page is-locked"}>
      <div className="page-body" inert={guest ? undefined : true}>
        <header className="topbar">
          <a className="brand" href="#inicio">
            <Clapper compact />
            <span>Convocatoria</span>
          </a>
          <nav>
            <a href="#video">Toma</a>
            <a href="#confirmar">Cierre</a>
          </nav>
        </header>
        <main>
          <Hero firstName={guest?.firstName || ""} />
          <Portraits sources={PORTRAITS} />
          <VideoBlock />
          <Confirmation firstName={guest?.firstName || ""} lastName={guest?.lastName || ""} />
        </main>
      </div>
      {guest ? null : <Gate onEnter={setGuest} />}
    </div>
  );
}
