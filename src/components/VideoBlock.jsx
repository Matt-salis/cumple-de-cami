import { useEffect, useRef, useState } from "react";
import { eventConfig } from "../config/event.js";
import { mediaExists } from "../lib/api.js";
import { publicUrl } from "../lib/publicUrl.js";

export function VideoBlock() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(null);
  const [posterReady, setPosterReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");

  useEffect(() => {
    let ignore = false;
    mediaExists(eventConfig.videoSrc).then((exists) => {
      if (!ignore) setVideoReady(exists);
    });
    if (eventConfig.videoPoster) {
      mediaExists(eventConfig.videoPoster).then((exists) => {
        if (!ignore) setPosterReady(exists);
      });
    }
    return () => {
      ignore = true;
    };
  }, []);

  async function play() {
    setPlayError("");
    try {
      await videoRef.current?.play();
      setPlaying(true);
    } catch {
      setPlayError("No se pudo reproducir el video en este dispositivo.");
    }
  }

  return (
    <section className="block cream" id="video">
      <div className="wrap">
        <h2>La toma</h2>
        <p className="line">Mensaje de {eventConfig.hostName} para el rodaje.</p>
        <div className="monitor">
          <div className="monitor-bar">
            <span className="rec">Rodaje</span>
            <span>16:9</span>
          </div>
          <div className="ratio">
            {videoReady ? (
              <video
                ref={videoRef}
                src={publicUrl(eventConfig.videoSrc)}
                poster={posterReady ? publicUrl(eventConfig.videoPoster) : undefined}
                playsInline
                preload="metadata"
                controls={playing}
                onError={() => {
                  setVideoReady(false);
                  setPlaying(false);
                }}
              />
            ) : null}
            {videoReady && !playing ? (
              <button
                type="button"
                className="play"
                onClick={play}
                aria-label={`Reproducir el mensaje de ${eventConfig.hostName}`}
              >
                <span className="play-icon" aria-hidden="true" />
              </button>
            ) : null}
            {videoReady === false ? (
              <div className="cover">
                <button type="button" className="play" disabled>
                  <span className="play-icon" aria-hidden="true" />
                  <span className="sr-only">Toma próximamente</span>
                </button>
                <p className="soon">Toma próximamente</p>
              </div>
            ) : null}
          </div>
        </div>
        {playError ? (
          <p className="alert" role="alert">
            {playError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
