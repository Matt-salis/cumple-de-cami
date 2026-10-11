import { useEffect, useRef, useState } from "react";
import { eventConfig } from "../config/event.js";
import { publicUrl } from "../lib/publicUrl.js";

async function canRead(path) {
  if (!path) return false;
  const url = publicUrl(path);
  try {
    let response = await fetch(url, { method: "HEAD" });
    if (response.ok) return true;
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { headers: { Range: "bytes=0-1" } });
      return response.ok || response.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}

export function VideoBlock() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(null);
  const [posterReady, setPosterReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");

  useEffect(() => {
    let ignore = false;
    canRead(eventConfig.videoSrc).then((exists) => {
      if (!ignore) setVideoReady(exists);
    });
    if (eventConfig.videoPoster) {
      canRead(eventConfig.videoPoster).then((exists) => {
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
                controls
                onError={() => {
                  setVideoReady(false);
                  setPlaying(false);
                  setPlayError("No se pudo cargar el video.");
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
                  <span className="sr-only">No se pudo cargar el video.</span>
                </button>
                <p className="soon">No se pudo cargar el video.</p>
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
