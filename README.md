# Cumple 25 de Cami

Invitación en una sola página. Cada respuesta se manda por mail a arruguete2001@gmail.com con FormSubmit. No hace falta una clave en el código.

## Cómo verla

```bash
cd the-girls-cafe
npm install
npm run build
npm start
```

En esta computadora está en http://localhost:3000

## Activar el mail, una sola vez

La primera respuesta dispara un correo de FormSubmit a arruguete2001@gmail.com. Cami tiene que abrirlo y tocar el enlace de confirmación. Hasta ese clic, el formulario no marca el envío como hecho: avisa que falta activar el mail.

Después de eso, cada confirmación llega sola a esa casilla.

## Editar el evento

`src/config/event.js`

Ahí están la fecha, el horario, el lugar, el link de Google Maps, el vestuario, el menú y el video. Si la fecha, el horario o el lugar quedan vacíos, no se inventan.

## Video

`public/videos/casting-cami.mp4`

El poster, si lo hay: `public/videos/casting-cami-poster.jpg`

Si el archivo no está, se ve «Video próximamente». El formato es horizontal, 16:9.

Después de cambiar datos o el video, corré de nuevo `npm run build`.
