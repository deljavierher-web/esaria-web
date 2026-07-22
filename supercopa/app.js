// Categorías de premios: los ganadores se rellenan al terminar la Copa Mundial de Elche
const PREMIOS = [
  { clase: "destacado",   icono: "mvp",       titulo: "MVP de la copa" },
  { clase: "antipremios", icono: "decepcion", titulo: "Decepción de la copa" },
  { clase: "",            icono: "bota",      titulo: "Bota de oro" },
  { clase: "",            icono: "guante",    titulo: "Guante de oro" },
  { clase: "",            icono: "chispa",    titulo: "Revelación" },
  { clase: "",            icono: "golazo",    titulo: "Golazo de la copa" }
];

const ICONOS = {
  mvp:       '<svg class="icono" viewBox="0 0 24 24" fill="#F5B90F"><path d="M12 2 L18 9 L12 22 L6 9 Z"/></svg>',
  decepcion: '<svg class="icono" viewBox="0 0 24 24" fill="#E04848"><path d="M12 22 L18 15 L14 15 L14 2 L10 2 L10 15 L6 15 Z"/></svg>',
  bota:      '<svg class="icono" viewBox="0 0 24 24" fill="#F5B90F"><path d="M3 5 H10 L12 12 H21 L22 18 H3 Z"/></svg>',
  guante:    '<svg class="icono" viewBox="0 0 24 24" fill="#F5B90F"><path d="M7 2 H17 V12 L12 22 L7 12 Z"/></svg>',
  chispa:    '<svg class="icono" viewBox="0 0 24 24" fill="#F5B90F"><path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"/></svg>',
  golazo:    '<svg class="icono" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#F5B90F" stroke-width="2.5"/><path d="M12 8 L15.8 10.8 L14.3 15.2 H9.7 L8.2 10.8 Z" fill="#F5B90F"/></svg>'
};

document.getElementById("rejilla-premios").innerHTML = PREMIOS.map(p => `
  <article class="premio ${p.clase}">
    ${ICONOS[p.icono] || ""}
    <h3>${p.titulo}</h3>
    <div class="ganador pendiente">Por decidir</div>
    <p class="detalle">Se entrega al cierre de la Copa Mundial de Elche.</p>
  </article>`).join("");

// Clasificación, equipos, estadísticas y el partido en directo los alimenta
// el bot árbitro de Telegram (bot/exportar_web.py -> datos.json). Si el
// fichero no existe o llega vacío, las secciones se quedan tal cual con su
// estado "Por confirmar" del HTML. Se refresca solo cada 20s para que el
// marcador y el minuto de un partido en curso se vean en directo.
let datosActuales = null;

function cargarDatos() {
  fetch("datos.json", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : null))
    .then(datos => { if (datos) { datosActuales = datos; pintarDatos(datos); } })
    .catch(() => {});
}

cargarDatos();
setInterval(cargarDatos, 20000);
setInterval(actualizarEnVivo, 15000);

function actualizarEnVivo() {
  const contenedor = document.getElementById("en-vivo");
  const partido = datosActuales && datosActuales.partido_en_vivo;
  if (!partido) { contenedor.hidden = true; return; }

  const enSegunda = Boolean(partido.inicio_segunda_en);
  const inicioParteActual = new Date(enSegunda ? partido.inicio_segunda_en : partido.inicio_primera_en);
  const minutosBase = enSegunda ? partido.duracion_parte_minutos : 0;
  const minutosTranscurridos = Math.max(0, Math.floor((Date.now() - inicioParteActual.getTime()) / 60000));
  const minuto = Math.max(1, minutosBase + minutosTranscurridos);

  contenedor.hidden = false;
  contenedor.querySelector(".en-vivo-equipos").textContent = `${partido.local} vs ${partido.visitante}`;
  contenedor.querySelector(".en-vivo-marcador").textContent = `${partido.goles_local} – ${partido.goles_visitante}`;
  contenedor.querySelector(".en-vivo-minuto").textContent =
    `${enSegunda ? "2ª parte" : "1ª parte"} · ${minuto}' (partes de ${partido.duracion_parte_minutos}')`;
}

const EMOJI_EVENTO = { gol: "⚽", autogol: "🥅", amarilla: "🟨", roja: "🟥" };

function textoEvento(ev) {
  if (ev.tipo === "gol") {
    return `Gol de ${ev.jugador}${ev.asistencia ? ` (asistencia: ${ev.asistencia})` : ""}`;
  }
  if (ev.tipo === "autogol") return `Gol en propia puerta de ${ev.jugador}`;
  return `Tarjeta ${ev.tipo} a ${ev.jugador}`;
}

function textoCronograma(p) {
  const lineas = [
    `🏆 ${(datosActuales && datosActuales.competicion) || "Copa Mundial de Elche"}`,
    `${p.local} ${p.goles_local} - ${p.goles_visitante} ${p.visitante}${p.fecha ? ` (${p.fecha})` : ""}`,
    "──────────",
  ];
  if (p.cronologia.length) {
    for (const ev of p.cronologia) {
      lineas.push(`${ev.minuto != null ? ev.minuto + "'" : "—"} ${EMOJI_EVENTO[ev.tipo] || ""} ${textoEvento(ev)} · ${ev.equipo}`);
    }
  } else {
    lineas.push("Sin goles ni tarjetas.");
  }
  return lineas.join("\n");
}

function pintarResultados(datos) {
  const partidos = datos.partidos || [];
  if (!partidos.length) return;

  const pendientes = partidos.filter(p => p.estado === "pendiente");
  const jugados = partidos.filter(p => p.estado !== "pendiente");

  let html = '<div class="lista-resultados">';
  if (jugados.length) {
    html += '<div class="grupo-resultados"><h3>Partidos jugados</h3>' + jugados.map((p, i) => `
      <details class="resultado">
        <summary>
          <span class="res-flecha">▶</span>
          <span class="res-equipos">${p.local} – ${p.visitante}</span>
          <span class="res-marcador">${p.goles_local} – ${p.goles_visitante}</span>
          <span class="res-meta">${p.estado === "en_juego" ? "⏱ En juego" : p.estado === "cancelado" ? "🚫 Cancelado" : p.fecha || ""}</span>
        </summary>
        <div class="res-cuerpo">
          ${p.cronologia.length
            ? p.cronologia.map(ev => `
              <div class="crono-fila">
                <span class="crono-min">${ev.minuto != null ? ev.minuto + "'" : "—"}</span>
                <span class="crono-quien">${EMOJI_EVENTO[ev.tipo] || ""} ${textoEvento(ev)} <span class="crono-equipo">· ${ev.equipo}</span></span>
              </div>`).join("")
            : '<p class="crono-vacia">Sin goles ni tarjetas.</p>'}
          <button type="button" class="btn-copiar" data-indice="${datos.partidos.indexOf(p)}">📋 Copiar cronograma</button>
        </div>
      </details>`).join("") + '</div>';
  }
  if (pendientes.length) {
    html += '<div class="grupo-resultados"><h3>Próximos partidos</h3>' + pendientes.map(p => `
      <div class="partido-pendiente">
        <span class="res-equipos">${p.local} – ${p.visitante}</span>
        <span class="res-meta">Por jugar</span>
      </div>`).join("") + '</div>';
  }
  html += '</div>';

  const contenedor = document.getElementById("contenedor-resultados");
  contenedor.innerHTML = html;
  contenedor.querySelectorAll(".btn-copiar").forEach(boton => {
    boton.addEventListener("click", () => {
      const partido = datosActuales.partidos[Number(boton.dataset.indice)];
      navigator.clipboard.writeText(textoCronograma(partido)).then(() => {
        boton.textContent = "✅ ¡Copiado!";
        setTimeout(() => { boton.textContent = "📋 Copiar cronograma"; }, 2000);
      });
    });
  });
}

function pintarDatos(datos) {
  actualizarEnVivo();

  if (datos.clasificacion && datos.clasificacion.length) {
    document.getElementById("contenedor-clasificacion").innerHTML = `
      <div class="tabla-envoltura">
        <table>
          <thead><tr>
            <th>#</th><th>Equipo</th>
            <th class="n">PJ</th><th class="n">G</th><th class="n">E</th><th class="n">P</th>
            <th class="n">GF</th><th class="n">GC</th><th class="n">DG</th><th class="n">Pts</th>
          </tr></thead>
          <tbody>${datos.clasificacion.map((e, i) => `
            <tr${i === 0 ? ' class="campeon"' : ''}>
              <td class="pos">${i + 1}</td>
              <td class="equipo">${e.equipo}</td>
              <td class="n">${e.pj}</td><td class="n">${e.g}</td><td class="n">${e.e}</td><td class="n">${e.p}</td>
              <td class="n">${e.gf}</td><td class="n">${e.gc}</td><td class="n">${e.dg > 0 ? "+" + e.dg : e.dg}</td>
              <td class="n pts">${e.pts}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="leyenda">PJ partidos jugados · G ganados · E empatados · P perdidos · GF goles a favor · GC en contra · DG diferencia.</p>`;
  }

  pintarResultados(datos);

  if (datos.equipos && datos.equipos.length) {
    document.getElementById("contenedor-equipos").innerHTML = `
      <div class="rejilla-equipos">${datos.equipos.map(e => `
        <article class="equipo-carta">
          ${e.escudo ? `<img class="escudo-equipo" src="${e.escudo}" alt="Escudo de ${e.nombre}">` : '<div class="rombo"></div>'}
          <h3 class="display">${e.nombre}</h3>
          ${e.capitan ? `<p class="ficha">©️ Capitán: <b>${e.capitan}</b></p>` : ""}
          <p class="ficha">${e.pj ? `${e.pj} partidos · <b>${e.g}V ${e.e}E ${e.p}D</b>` : "Aún sin partidos jugados"}</p>
        </article>`).join("")}
      </div>`;
  }

  const est = datos.estadisticas || {};
  const bloques = [
    { titulo: "Máximos goleadores", filas: est.goleadores, valor: f => f.goles },
    { titulo: "Máximos asistentes", filas: est.asistentes, valor: f => f.asistencias },
    { titulo: "Tarjetas", filas: est.tarjetas, valor: f => `${f.amarillas}🟨 ${f.rojas}🟥` },
  ].filter(b => b.filas && b.filas.length);

  if (bloques.length) {
    document.getElementById("contenedor-estadisticas").innerHTML = `
      <div class="stats">${bloques.map(b => `
        <div class="stat-bloque">
          <h3>${b.titulo}</h3>
          ${b.filas.slice(0, 5).map((f, i) => `
            <div class="stat-fila">
              <span class="rango">${i + 1}</span>
              <span class="quien">${f.jugador} <span class="de-quien">· ${f.equipo}</span></span>
              <span class="valor">${b.valor(f)}</span>
            </div>`).join("")}
        </div>`).join("")}
      </div>`;
  }
}
