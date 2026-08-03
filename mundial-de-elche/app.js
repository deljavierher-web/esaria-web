(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════
     0 · CONTEXTO
     ══════════════════════════════════════════════════════════ */
  const REDUCIR = window.matchMedia("(prefers-reduced-motion: reduce)");
  const PUNTERO_FINO = window.matchMedia("(hover: hover) and (pointer: fine)");
  // Permite probar el diseño con datos de ejemplo: index.html?datos=datos_prueba.json
  const FUENTE_DATOS = new URLSearchParams(location.search).get("datos") || "datos.json";

  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));

  /** Escapa el texto que llega del bot (nombres de equipos y jugadores). */
  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ══════════════════════════════════════════════════════════
     1 · MOTOR DE ANIMACIONES
     ══════════════════════════════════════════════════════════ */
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      revelar(entrada.target);
      observador.unobserve(entrada.target);
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  function revelar(el) {
    el.classList.add("visible");
    const destino = el.dataset.contador;
    if (destino != null) animarContador(el, Number(destino));
    $$("[data-contador]", el).forEach(n => animarContador(n, Number(n.dataset.contador)));
  }

  /** Observa los elementos animables de una raíz. Si ya están en pantalla
      (por ejemplo tras repintar una sección visible) se muestran sin repetir. */
  function observarAnimables(raiz) {
    const candidatos = $$("[data-animar]:not(.visible), .stat-fila:not(.visible), .cabecera:not(.visible)", raiz || document);
    if (raiz && raiz.matches && raiz.matches("[data-animar], .stat-fila, .cabecera")) candidatos.unshift(raiz);
    for (const el of candidatos) {
      const caja = el.getBoundingClientRect();
      const yaVisible = caja.top < window.innerHeight * 0.9 && caja.bottom > 0;
      if (yaVisible) revelar(el);
      else observador.observe(el);
    }
  }

  function animarContador(el, destino) {
    if (!isFinite(destino)) return;
    if (REDUCIR.matches) { el.textContent = String(destino); return; }
    const duracion = 1100, inicio = performance.now();
    (function paso(ahora) {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 4);
      el.textContent = String(Math.round(destino * suave));
      if (t < 1) requestAnimationFrame(paso);
    })(inicio);
  }

  /* ─── Parallax del hero ─── */
  function iniciarParallax() {
    if (REDUCIR.matches) return;
    const capas = $$("[data-parallax]");
    if (!capas.length) return;
    let pendiente = false;
    function pintar() {
      pendiente = false;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      for (const capa of capas) {
        capa.style.transform = "translate3d(0," + (y * Number(capa.dataset.parallax)).toFixed(1) + "px,0)";
      }
    }
    window.addEventListener("scroll", () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    pintar();
  }

  /* ─── Inclinación 3D de las tarjetas ─── */
  function activarInclinacion(raiz) {
    if (REDUCIR.matches || !PUNTERO_FINO.matches) return;
    for (const carta of $$(".club, .premio", raiz || document)) {
      if (carta.dataset.inclinada) continue;
      carta.dataset.inclinada = "1";
      let pendiente = false, ultimo = null;
      carta.addEventListener("pointermove", (ev) => {
        ultimo = ev;
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => {
          pendiente = false;
          const caja = carta.getBoundingClientRect();
          const px = (ultimo.clientX - caja.left) / caja.width;
          const py = (ultimo.clientY - caja.top) / caja.height;
          carta.style.setProperty("--px", (px * 100).toFixed(1) + "%");
          carta.style.setProperty("--py", (py * 100).toFixed(1) + "%");
          carta.style.transform =
            "perspective(900px) rotateY(" + ((px - 0.5) * 9).toFixed(2) + "deg) rotateX(" +
            ((0.5 - py) * 9).toFixed(2) + "deg) translateY(-4px)";
        });
      });
      carta.addEventListener("pointerleave", () => { carta.style.transform = ""; });
    }
  }

  /* ─── Título del hero letra a letra ─── */
  let tituloPartido = false;
  function partirTitulo() {
    const h1 = $("[data-titulo]");
    if (!h1 || tituloPartido) return;
    tituloPartido = true;
    if (REDUCIR.matches) { h1.closest(".hero").classList.add("arranca"); return; }
    let indice = 0;
    // Solo se parten las líneas marcadas: cada palabra queda en un bloque
    // que no se corta, y dentro cada letra entra escalonada.
    for (const linea of $$(".linea[data-partir]", h1)) {
      const palabras = linea.textContent.split(" ");
      linea.textContent = "";
      palabras.forEach((palabra, i) => {
        const caja = document.createElement("span");
        caja.className = "palabra";
        for (const caracter of palabra) {
          const span = document.createElement("span");
          span.className = "letra";
          span.textContent = caracter;
          span.style.setProperty("--i", indice++);
          caja.appendChild(span);
        }
        linea.appendChild(caja);
        if (i < palabras.length - 1) linea.appendChild(document.createTextNode(" "));
      });
    }
    h1.style.setProperty("--letras", indice);
    h1.closest(".hero").classList.add("arranca");
  }

  /* ══════════════════════════════════════════════════════════
     2 · CABECERA (menú, progreso, compactado)
     ══════════════════════════════════════════════════════════ */
  function iniciarCabecera() {
    const barra = $("#barra-superior");
    const progreso = $("#progreso");
    const boton = $(".menu-boton");
    const menu = $("#menu-nav");

    boton.addEventListener("click", () => {
      const abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      boton.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      if (abierto) menu.removeAttribute("data-abierto");
      else menu.setAttribute("data-abierto", "");
    });
    menu.addEventListener("click", (ev) => {
      if (ev.target.tagName !== "A") return;
      menu.removeAttribute("data-abierto");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
    });

    let pendiente = false;
    function pintar() {
      pendiente = false;
      const y = window.scrollY;
      barra.classList.toggle("compacta", y > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progreso.style.transform = "scaleX(" + (total > 0 ? Math.min(1, y / total) : 0) + ")";
    }
    window.addEventListener("scroll", () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    pintar();
  }

  /* ══════════════════════════════════════════════════════════
     3 · PREMIOS (contenido fijo)
     ══════════════════════════════════════════════════════════ */
  const PREMIOS = [
    { clase: "destacado",  icono: "mvp",       titulo: "MVP de la Copa" },
    { clase: "antipremio", icono: "decepcion", titulo: "Decepción del torneo" },
    { clase: "",           icono: "bota",      titulo: "Bota de Oro" },
    { clase: "",           icono: "guante",    titulo: "Guante de Oro" },
    { clase: "",           icono: "chispa",    titulo: "Jugador revelación" },
    { clase: "",           icono: "golazo",    titulo: "Mejor golazo" }
  ];

  const ICONOS = {
    mvp:       '<svg class="icono" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden="true"><path d="M12 2 L18 9 L12 22 L6 9 Z"/></svg>',
    decepcion: '<svg class="icono" viewBox="0 0 24 24" fill="#E23D3D" aria-hidden="true"><path d="M12 22 L18 15 L14 15 L14 2 L10 2 L10 15 L6 15 Z"/></svg>',
    bota:      '<svg class="icono" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden="true"><path d="M3 5 H10 L12 12 H21 L22 18 H3 Z"/></svg>',
    guante:    '<svg class="icono" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden="true"><path d="M7 2 H17 V12 L12 22 L7 12 Z"/></svg>',
    chispa:    '<svg class="icono" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden="true"><path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"/></svg>',
    golazo:    '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" stroke-width="2.5"/><path d="M12 8 L15.8 10.8 L14.3 15.2 H9.7 L8.2 10.8 Z" fill="#D4AF37"/></svg>'
  };

  function pintarPremios() {
    $("#rejilla-premios").innerHTML = PREMIOS.map((p, i) => `
      <article class="premio ${p.clase}" data-animar="subir" style="--i:${i}">
        ${ICONOS[p.icono] || ""}
        <h3>${esc(p.titulo)}</h3>
        <div class="ganador pendiente">Por decidir</div>
        <p class="detalle">Se entrega al cierre de la Copa Mundial de Elche.</p>
      </article>`).join("");
  }

  /* ══════════════════════════════════════════════════════════
     4 · MOTOR DE DATOS
     ══════════════════════════════════════════════════════════ */
  let datosActuales = null;
  const huellas = {};

  /** Devuelve true solo si esa parte de los datos ha cambiado desde el último pintado. */
  function haCambiado(clave, valor) {
    const huella = JSON.stringify(valor == null ? null : valor);
    if (huellas[clave] === huella) return false;
    huellas[clave] = huella;
    return true;
  }

  function cargarDatos() {
    fetch(FUENTE_DATOS, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(datos => { if (datos) { datosActuales = datos; pintarDatos(datos); } })
      .catch(() => {});
  }

  const EMOJI_EVENTO = { gol: "⚽", autogol: "🥅", amarilla: "🟨", roja: "🟥" };

  /** "2026-08-01" → "1 ago". El mediodía evita que el huso cambie el día. */
  function fechaCorta(iso) {
    if (!iso) return "";
    const fecha = new Date(iso + "T12:00:00");
    if (isNaN(fecha)) return iso;
    return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
  }

  function textoEvento(ev) {
    if (ev.tipo === "gol") {
      return "Gol de " + ev.jugador + (ev.asistencia ? " (asistencia: " + ev.asistencia + ")" : "");
    }
    if (ev.tipo === "autogol") return "Gol en propia puerta de " + ev.jugador;
    return "Tarjeta " + ev.tipo + " a " + ev.jugador;
  }

  function htmlEvento(ev) {
    if (ev.tipo === "gol") {
      return "Gol de <b>" + esc(ev.jugador) + "</b>" +
        (ev.asistencia ? " <span class='apunte'>(asist. " + esc(ev.asistencia) + ")</span>" : "");
    }
    if (ev.tipo === "autogol") return "Gol en propia puerta de <b>" + esc(ev.jugador) + "</b>";
    return "Tarjeta " + esc(ev.tipo) + " a <b>" + esc(ev.jugador) + "</b>";
  }

  function textoCronograma(p) {
    const lineas = [
      "🏆 " + ((datosActuales && datosActuales.competicion) || "Copa Mundial de Elche"),
      p.local + " " + p.goles_local + " - " + p.goles_visitante + " " + p.visitante + (p.fecha ? " (" + p.fecha + ")" : ""),
      "──────────"
    ];
    if (p.cronologia && p.cronologia.length) {
      for (const ev of p.cronologia) {
        lineas.push((ev.minuto != null ? ev.minuto + "'" : "—") + " " + (EMOJI_EVENTO[ev.tipo] || "") + " " + textoEvento(ev) + " · " + ev.equipo);
      }
    } else {
      lineas.push("Sin goles ni tarjetas.");
    }
    return lineas.join("\n");
  }

  /* ─── Marcador en directo ─── */
  let ultimoMarcador = null;

  function actualizarEnVivo() {
    const caja = $("#en-vivo");
    const partido = datosActuales && datosActuales.partido_en_vivo;
    if (!partido) { caja.hidden = true; ultimoMarcador = null; return; }

    const enSegunda = Boolean(partido.inicio_segunda_en);
    const inicioParteActual = new Date(enSegunda ? partido.inicio_segunda_en : partido.inicio_primera_en);
    const minutosBase = enSegunda ? partido.duracion_parte_minutos : 0;
    const transcurridos = Math.max(0, Math.floor((Date.now() - inicioParteActual.getTime()) / 60000));
    const minuto = Math.max(1, minutosBase + transcurridos);

    caja.hidden = false;
    $(".equipos", caja).innerHTML = esc(partido.local) + " <span>vs</span> " + esc(partido.visitante);

    const marcador = $(".marcador", caja);
    const texto = partido.goles_local + " – " + partido.goles_visitante;
    if (ultimoMarcador !== null && ultimoMarcador !== texto) {
      marcador.classList.remove("cambio");
      void marcador.offsetWidth;   // reinicia la animación
      marcador.classList.add("cambio");
    }
    marcador.textContent = texto;
    ultimoMarcador = texto;

    $(".minuto", caja).textContent =
      (enSegunda ? "2ª parte" : "1ª parte") + " · " + minuto + "' (partes de " + partido.duracion_parte_minutos + "')";
  }

  /* ─── Clasificación ─── */
  function pintarClasificacion(tabla) {
    if (!tabla || !tabla.length) return;
    $("#contenedor-clasificacion").innerHTML = `
      <div class="tabla-caja">
        <table>
          <thead><tr>
            <th>#</th><th>Equipo</th>
            <th class="n">PJ</th><th class="n">G</th><th class="n">E</th><th class="n">P</th>
            <th class="n">GF</th><th class="n">GC</th><th class="n">DG</th><th class="n">Pts</th>
          </tr></thead>
          <tbody>${tabla.map((e, i) => `
            <tr class="${i === 0 ? "lider" : ""}">
              <td class="pos"><b>${i + 1}</b></td>
              <td class="equipo">${esc(e.equipo)}</td>
              <td class="n">${e.pj}</td><td class="n">${e.g}</td><td class="n">${e.e}</td><td class="n">${e.p}</td>
              <td class="n">${e.gf}</td><td class="n">${e.gc}</td>
              <td class="n">${e.dg > 0 ? "+" + e.dg : e.dg}</td>
              <td class="n pts">${e.pts}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="leyenda">PJ partidos jugados · G ganados · E empatados · P perdidos · GF goles a favor · GC goles en contra · DG diferencia de goles.</p>`;
  }

  /* ─── Resultados y calendario ─── */
  function pintarResultados(datos) {
    const partidos = datos.partidos || [];
    if (!partidos.length) return;

    const caja = $("#contenedor-resultados");
    // Conserva qué partidos estaban desplegados antes de repintar
    const abiertos = new Set($$("details[open]", caja).map(d => d.dataset.indice));

    const pendientes = partidos.filter(p => p.estado === "pendiente");
    const jugados = partidos.filter(p => p.estado !== "pendiente");

    let html = "";

    if (jugados.length) {
      html += '<div class="grupo"><h3>Partidos disputados</h3><div class="lista">' + jugados.map(p => {
        const indice = partidos.indexOf(p);
        const meta = p.estado === "en_juego"
          ? '<span class="meta vivo">⏱ En juego</span>'
          : p.estado === "cancelado"
            ? '<span class="meta cancelado">Cancelado</span>'
            : '<span class="meta">' + esc(fechaCorta(p.fecha)) + "</span>";
        return `
        <details class="encuentro" data-indice="${indice}" ${abiertos.has(String(indice)) ? "open" : ""}>
          <summary>
            <span class="flecha" aria-hidden="true">▶</span>
            <span class="duelo">
              <span class="lado">${esc(p.local)}</span>
              <span class="tanteo cifra">${p.goles_local} – ${p.goles_visitante}</span>
              <span class="lado visita">${esc(p.visitante)}</span>
            </span>
            ${meta}
          </summary>
          <div class="cuerpo">
            ${p.cronologia && p.cronologia.length
              ? '<div class="crono">' + p.cronologia.map((ev, i) => `
                  <div class="evento" style="--i:${i}">
                    <span class="min cifra">${ev.minuto != null ? ev.minuto + "'" : "—"}</span>
                    <span class="icono" aria-hidden="true">${EMOJI_EVENTO[ev.tipo] || "•"}</span>
                    <span class="quien">${htmlEvento(ev)} <span class="apunte">· ${esc(ev.equipo)}</span></span>
                  </div>`).join("") + "</div>"
              : '<p class="crono-vacio">Sin goles ni tarjetas en este partido.</p>'}
            <button type="button" class="btn-copiar" data-indice="${indice}">📋 Copiar cronograma</button>
          </div>
        </details>`;
      }).join("") + "</div></div>";
    }

    if (pendientes.length) {
      html += '<div class="grupo"><h3>Próximos partidos</h3><div class="lista">' + pendientes.map(p => `
        <div class="proximo">
          <span class="lado">${esc(p.local)}</span>
          <span class="vs">VS</span>
          <span class="lado">${esc(p.visitante)}</span>
          <span class="meta">${p.fecha ? esc(fechaCorta(p.fecha)) : "Fecha por confirmar"}</span>
        </div>`).join("") + "</div></div>";
    }

    caja.innerHTML = html;

    for (const boton of $$(".btn-copiar", caja)) {
      boton.addEventListener("click", () => {
        const partido = datosActuales.partidos[Number(boton.dataset.indice)];
        navigator.clipboard.writeText(textoCronograma(partido)).then(() => {
          boton.textContent = "✅ ¡Copiado!";
          boton.classList.add("hecho");
          setTimeout(() => { boton.textContent = "📋 Copiar cronograma"; boton.classList.remove("hecho"); }, 2000);
        }).catch(() => {
          boton.textContent = "No se pudo copiar";
          setTimeout(() => { boton.textContent = "📋 Copiar cronograma"; }, 2000);
        });
      });
    }
  }

  /* ─── Equipos ─── */
  function pintarEquipos(equipos) {
    if (!equipos || !equipos.length) return;
    $("#contenedor-equipos").innerHTML = `
      <div class="rejilla-equipos">${equipos.map((e, i) => `
        <article class="club" data-animar="subir" style="--i:${i}">
          ${e.escudo
            ? `<img class="escudo" src="${esc(e.escudo)}" alt="Escudo de ${esc(e.nombre)}" loading="lazy">`
            : '<div class="escudo-vacio" aria-hidden="true"></div>'}
          <h3 class="display">${esc(e.nombre)}</h3>
          ${e.capitan ? `<p class="capitan">Capitán: <b>${esc(e.capitan)}</b></p>` : '<p class="capitan">Sin capitán asignado</p>'}
          ${e.pj
            ? `<div class="registro">
                 <i class="g">${e.g} G</i><i>${e.e} E</i><i class="p">${e.p} P</i>
                 <i>${e.pj} PJ</i>
               </div>`
            : '<p class="sin-partidos">Aún sin partidos jugados</p>'}
        </article>`).join("")}
      </div>`;

    // Si el escudo subido por Telegram ya no existe, cae al escudo genérico
    for (const img of $$(".club .escudo", $("#contenedor-equipos"))) {
      img.addEventListener("error", () => {
        const hueco = document.createElement("div");
        hueco.className = "escudo-vacio";
        hueco.setAttribute("aria-hidden", "true");
        img.replaceWith(hueco);
      });
    }
  }

  /* ─── Estadísticas ─── */
  function pintarEstadisticas(est) {
    const bloques = [
      { titulo: "Máximos goleadores", filas: est.goleadores, valor: f => f.goles,        peso: f => f.goles },
      { titulo: "Máximos asistentes", filas: est.asistentes, valor: f => f.asistencias,  peso: f => f.asistencias },
      { titulo: "Ranking de tarjetas", filas: est.tarjetas,  valor: f => `${f.amarillas}🟨 ${f.rojas}🟥`, peso: f => f.amarillas + f.rojas * 2 }
    ].filter(b => b.filas && b.filas.length);

    if (!bloques.length) return;

    $("#contenedor-estadisticas").innerHTML = `
      <div class="rejilla-stats">${bloques.map((b, bi) => {
        const filas = b.filas.slice(0, 5);
        const maximo = Math.max(...filas.map(b.peso), 1);
        return `
        <div class="stat-caja" data-animar="subir" style="--i:${bi}">
          <h3>${esc(b.titulo)}</h3>
          ${filas.map((f, i) => `
            <div class="stat-fila" style="--i:${i}">
              <div class="cima">
                <span class="rango cifra">${i + 1}</span>
                <span class="quien">${esc(f.jugador)} <span class="club-mini">· ${esc(f.equipo)}</span></span>
                <span class="valor">${b.valor(f)}</span>
              </div>
              <div class="barra"><i style="--proporcion:${(b.peso(f) / maximo).toFixed(3)}"></i></div>
            </div>`).join("")}
        </div>`;
      }).join("")}
      </div>`;
  }

  /* ─── Cifras del hero ─── */
  function pintarCifras(datos) {
    const partidos = datos.partidos || [];
    const jugados = partidos.filter(p => p.estado === "finalizado" || p.estado === "en_juego");
    const goles = jugados.reduce((suma, p) => suma + (p.goles_local || 0) + (p.goles_visitante || 0), 0);
    const valores = {
      "cifra-equipos": (datos.equipos || []).length,
      "cifra-partidos": jugados.length,
      "cifra-goles": goles
    };
    for (const id in valores) {
      const el = document.getElementById(id);
      const n = valores[id];
      if (!n) { el.textContent = "—"; el.classList.add("pendiente"); el.removeAttribute("data-contador"); continue; }
      el.classList.remove("pendiente");
      el.dataset.contador = String(n);
      const caja = el.getBoundingClientRect();
      if (caja.top < window.innerHeight && caja.bottom > 0) animarContador(el, n);
      else el.textContent = "0";
    }
  }

  /* ─── Pintado general ─── */
  function pintarDatos(datos) {
    actualizarEnVivo();

    if (haCambiado("cifras", [datos.equipos, datos.partidos])) pintarCifras(datos);

    if (haCambiado("clasificacion", datos.clasificacion)) {
      pintarClasificacion(datos.clasificacion);
      observarAnimables($("#contenedor-clasificacion"));
    }
    if (haCambiado("partidos", datos.partidos)) {
      pintarResultados(datos);
      observarAnimables($("#contenedor-resultados"));
    }
    if (haCambiado("equipos", datos.equipos)) {
      pintarEquipos(datos.equipos);
      observarAnimables($("#contenedor-equipos"));
      activarInclinacion($("#contenedor-equipos"));
    }
    if (haCambiado("estadisticas", datos.estadisticas)) {
      pintarEstadisticas(datos.estadisticas || {});
      observarAnimables($("#contenedor-estadisticas"));
    }

    if (datos.actualizado_en) {
      const fecha = new Date(datos.actualizado_en);
      $("#actualizado").textContent = isNaN(fecha)
        ? ""
        : "Datos actualizados el " + fecha.toLocaleString("es-ES", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
    }
  }

  /* ══════════════════════════════════════════════════════════
     5 · ARRANQUE
     ══════════════════════════════════════════════════════════ */
  pintarPremios();
  iniciarCabecera();
  iniciarParallax();
  observarAnimables(document);
  activarInclinacion(document);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(partirTitulo);
    setTimeout(partirTitulo, 1200);   // por si las fuentes no llegan
  } else {
    partirTitulo();
  }

  cargarDatos();
  setInterval(cargarDatos, 20000);
  setInterval(actualizarEnVivo, 15000);
})();
