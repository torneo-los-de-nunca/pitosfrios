import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../Firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "../styles/jugadores.css";

/**
 * ✅ PNGs:
 *   src/assets/jugadores/oso.png
 *   src/assets/jugadores/picante.png
 *   ...
 * El id debe coincidir con el nombre del archivo.
 */

// ===============================
// JUGADORES (por ahora hardcodeado)
// después lo conectamos a Admin/Firestore
// ===============================
const JUGADORES = [
  {
    id: "oso",
    nombre: "Oso",
    color: "#A855F7",
    tagline: "El Osesno",
    fechaOro: "30 de enero",
    edad: 30,
    trofeos: 2,
    resena: "Aparece cuando quiere… pero cuando aparece, pesa.",
    sonido: "/sounds/oso.mp3",
  },
  {
    id: "Pechuga",
    nombre: "Pechuga",
    color: "#EF4444",
    tagline: "Pega primero, pregunta después",
    fechaOro: "12 de marzo",
    edad: 29,
    trofeos: 1,
    resena: "Si hay asado, está. Si no hay asado… también.",
    sonido: "/sounds/picante.mp3",

  },
  {
    id: "Fede",
    nombre: "Fede",
    color: "#22D3EE",
    tagline: "No se lo ve… pero está",
    fechaOro: "5 de mayo",
    edad: 31,
    trofeos: 0,
    resena: "Se aparece de la nada y deja stats rarísimos.",
    sonido: "/sounds/mistico.mp3",

  },
  {
    id: "Luisito",
    nombre: "Luisito",
    color: "#F59E0B",
    tagline: "Energía infinita",
    fechaOro: "18 de junio",
    edad: 28,
    trofeos: 1,
    resena: "Si hay juntada, la prende fuego (metafóricamente).",
    sonido: "/sounds/potencia.mp3",

  },
  {
    id: "Carly",
    nombre: "Carly",
    color: "#94A3B8",
    tagline: "Oscuro… letal",
    fechaOro: "9 de abril",
    edad: 32,
    trofeos: 1,
    resena: "No habla mucho, pero cuando entra, sube el promedio.",
    sonido: "/sounds/sombra.mp3",

  },
  {
    id: "Cali",
    nombre: "Cali",
    color: "#60A5FA",
    tagline: "Cocinando al límite",
    fechaOro: "22 de febrero",
    edad: 30,
    trofeos: 0,
    resena: "A veces desaparece… y vuelve con +3.",
    sonido: "/sounds/german.mp3",

  },
  {
    id: "Achu",
    nombre: "Achu",
    color: "#34D399",
    tagline: "El que enseña como",
    fechaOro: "1 de agosto",
    edad: 33,
    trofeos: 2,
    resena: "Si hay regla, él la interpreta a su favor.",
    sonido: "/sounds/profesor.mp3",

  },
  {
    id: "Chiche",
    nombre: "Chiche",
    color: "#FB7185",
    tagline: "La jefa del postre",
    fechaOro: "15 de septiembre",
    edad: 35,
    trofeos: 1,
    resena: "Si falta uno, ella igual suma ambiente.",
    sonido: "/sounds/tia.mp3",

  },
  {
    id: "Pasca",
    nombre: "Pasca",
    color: "#C084FC",
    tagline: "Químico del caos",
    fechaOro: "10 de noviembre",
    edad: 31,
    trofeos: 0,
    resena: "Puede estar o no estar… pero siempre influye.",
    sonido: "/sounds/navai.mp3",

  },
  {
    id: "Fischer",
    nombre: "Fischer",
    color: "#FDE047",
    tagline: "Alcohol y Sexo",
    fechaOro: "3 de enero",
    edad: 29,
    trofeos: 0,
    resena: "Corre todo… excepto cuando hay que aparecer.",
    sonido: "/sounds/conejo.mp3",

  },
];

// ===============================
// PERFIL DE JUGADORES (EDITABLE)
// ===============================
const PERFIL_JUGADORES = {
  oso: {
    nombre: "Oso",
    color: "#00e676",
    tagline: "Bear beer",
    fechaOro: "19 de agosto",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Pechuga: {
    nombre: "Pechuga",
    color: "#EF4444",
    tagline: "Canasta",
    fechaOro: "8 de enero",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Fede: {
    nombre: "Fede",
    color: "#22D3EE",
    tagline: "Hombre compresor",
    fechaOro: "27 de octubre",
     puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Luisito: {
    nombre: "Luisito",
    color: "#F59E0B",
    tagline: "Garrafa Agonil",
    fechaOro: "21 de marzo",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Carly: {
    nombre: "Carly",
    color: "#94A3B8",
    tagline: "Turbio y morboso",
    fechaOro: "24 de marzo",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Cali: {
    nombre: "Cali",
    color: "#60A5FA",
    tagline: "Caligula",
    fechaOro: "6 de febrero",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Achu: {
    nombre: "Achu",
    color: "#34D399",
    tagline: "Otachu",
    fechaOro: "17 de enero",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Chiche: {
    nombre: "Chiche",
    color: "#FB7185",
    tagline: "Manos traviesas",
    fechaOro: "21 de mayo",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Pasca: {
    nombre: "Pasca",
    color: "#C084FC",
    tagline: "Contador del caos",
    fechaOro: "12 de agosto",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },

  Fischer: {
    nombre: "Fischer",
    color: "#FDE047",
    tagline: "el loco fischer",
    fechaOro: "2 de noviembre",
    puntajeHistoricoBase: 0,
    posiciones: {
      "2026": " Primer campeonato",
    },
  },
};


// ===============================
// ÚLTIMA VEZ QUE SE VIERON (BASE MANUAL)
// Clave: "JugadorA|JugadorB" (orden alfabético)
// ===============================
const ULTIMA_VEZ_BASE = {
  // OSO
  "Fischer|Oso": "2025-11-24",
  "Oso|Pechuga": "2025-10-01",
  "Fede|Oso": "2025-11-09",
  "Luisito|Oso": "2025-11-08",
  "Carly|Oso": "2025-11-30",
  "Cali|Oso": "2025-11-29",
  "Achu|Oso": "2025-11-08",
  "Chiche|Oso": "2025-11-08",
  "Oso|Pasca": "2025-11-15",

  // PECHUGA
  "Fischer|Pechuga": "2025-11-01",
  "Fede|Pechuga": "2025-11-28",
  "Luisito|Pechuga": "2025-06-28",
  "Carly|Pechuga": "2025-11-08",
  "Cali|Pechuga": "2025-11-08",
  "Achu|Pechuga": "2025-11-28",
  "Chiche|Pechuga": "2025-11-08",
  "Pasca|Pechuga": "2025-11-08",


  // FEDE
  "Fede|Fischer": "2025-11-01",
  "Fede|Luisito": "2025-11-28",
  "Carly|Fede": "2025-11-08",
  "Cali|Fede": "2025-11-08",
  "Achu|Fede": "2025-11-08",
  "Chiche|Fede": "2025-11-08",
  "Fede|Pasca": "2025-11-08",

  // LUISITO
  "Fischer|Luisito": "2025-11-01",
  "Carly|Luisito": "2025-11-28",
  "Cali|Luisito": "2025-06-28",
  "Achu|Luisito": "2025-11-09",
  "Chiche|Luisito": "2025-11-08",
  "Luisito|Pasca": "2025-11-08",


  // CARLY
  "Carly|Fischer": "2025-11-01",
  "Cali|Carly": "2025-10-25",
  "Achu|Carly": "2025-06-28",
  "Carly|Chiche": "2025-11-08",
  "Carly|Pasca": "2025-11-08",


  // CALI
  "Cali|Fischer": "2025-11-28",
  "Achu|Cali": "2025-10-30",
  "Cali|Chiche": "2025-08-24",
  "Cali|Pasca": "2025-08-23",

  // ACHU
  "Achu|Fischer": "2025-11-01",
  "Achu|Chiche": "2025-08-05",
  "Achu|Pasca": "2025-11-08",

  // CHICHE
  "Chiche|Fischer": "2025-11-01",
  "Chiche|Pasca": "2025-06-28",

  // PASCA
  "Fischer|Pasca": "2025-06-14",

};


// ===============================
// HELPERS FECHA + REGLA LDN
// ===============================
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;

  const hoy = new Date();
  const s = String(fechaStr).trim();

  // YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], iso[2] - 1, +iso[3]);

  // DD/MM(/YY)
  if (s.includes("/")) {
    const p = s.split("/");
    if (p.length >= 2) {
      let dd = +p[0];
      let mm = +p[1];
      let yy = p[2] ? +p[2] : hoy.getFullYear();
      if (yy < 100) yy += 2000;
      return new Date(yy, mm - 1, dd);
    }
  }

  // DD-MM(-YY)
  const dash = s.split("-");
  if (dash.length >= 2) {
    let dd = +dash[0];
    let mm = +dash[1];
    let yy = dash[2] ? +dash[2] : hoy.getFullYear();
    if (yy < 100) yy += 2000;
    return new Date(yy, mm - 1, dd);
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function diffDias(a, b) {
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

function fmtFechaAR(d) {
  if (!d) return "—";
  return d.toLocaleDateString("es-AR");
}

function diaKey(d) {
  return d.toISOString().slice(0, 10);
}
function getUltimaVezBase(a, b) {
  const key = [a, b].sort().join("|");
  const f = ULTIMA_VEZ_BASE[key];
  return f ? parseFecha(f) : null;
}

// ✅ Regla LDN: cuenta como “estuvo” si selected y NO es nosuma/penal
function estuvoYSumo1(ev, nombre) {
  const opts = ev?.opciones?.[nombre];
  if (!opts || !opts.selected) return false;
  if (opts.nosuma) return false;
  if (opts.penal1) return false;
  if (opts.penal10) return false;
  return true;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}


// ===============================
// UI mini component (barrita)
// ===============================
function StatBar({ label, value, pct, accent, hint, invertNote }) {
  return (
    <div className="statRow">
      <div className="statTop">
        <div className="statLabel">
          {label} {hint && <span className="statHint">{hint}</span>}
          {invertNote && <span className="statHint"> {invertNote}</span>}
        </div>
        <div className="statValue" style={{ color: accent }}>
          {value}
        </div>
      </div>
      <div className="statTrack">
        <div className="statFill" style={{ width: `${clamp(pct, 0, 100)}%`, background: accent }} />
      </div>
    </div>
  );
}

// ===============================
// COMPONENTE
// ===============================
export default function Participantes() {
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);

  // Firestore eventos (desde Home)
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
// ===============================
// AUDIO (1 solo sonido activo)
// ===============================
const audioRef = useRef(null);
  // ===============================
  // AUDIO: reproducir y cortar
  // ===============================
  function playSound(sound) {
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(sound);
    audio.volume = 0.7;

    audioRef.current = audio;
    audio.play();
  }

  const total = JUGADORES.length;
const base = JUGADORES[index];
const player = PERFIL_JUGADORES[base.id];

  // cargar eventos Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "semanas"), (snap) => {
      const lista = [];
      snap.forEach((docu) => {
        const raw = docu.data();
        const evs = raw?.eventos || [];
        evs.forEach((ev) => {
          const f = parseFecha(ev.fecha);
          if (!f) return;
          // 👇 clave: guardamos la semana desde el doc ID
          lista.push({ ...ev, fecha: f, semana: ev.semana ?? docu.id });
        });
      });
      lista.sort((a, b) => a.fecha - b.fecha);
      setEventos(lista);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  // Teclado ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Pequeño “impacto” al cambiar personaje
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.classList.remove("pulseChange");
    void el.offsetWidth; // reflow
    el.classList.add("pulseChange");
  }, [index]);
// ===============================
// AUDIO al cambiar de jugador
// ===============================
useEffect(() => {
  const base = JUGADORES[index];
  if (base?.sonido) {
    playSound(base.sonido);
  }
}, [index]);

  // Imagen PNG dinámica (sin import manual)
const imgSrc = useMemo(() => {
  try {
    return new URL(`../assets/jugadores/${base.id}.png`, import.meta.url).href;
  } catch {
    return "";
  }
}, [base.id]);


  // =========================================
  // TABLA GENERAL (puntaje actual) – igual lógica Home:
  // base 1 vez por día + oro/doble/triple + penales
  // =========================================
  const tablaGeneral = useMemo(() => {
    const totales = {};
    JUGADORES.forEach((j) => (totales[j.nombre] = 0));

    // Agrupar eventos por día
    const eventosPorDia = {};
    for (const ev of eventos) {
      if (!ev?.fecha || !ev?.opciones) continue;
      const k = diaKey(ev.fecha);
      if (!eventosPorDia[k]) eventosPorDia[k] = [];
      eventosPorDia[k].push(ev);
    }

    Object.values(eventosPorDia).forEach((evsDia) => {
      const baseSumada = {}; // jugador -> true (base 1 vez por día)

      evsDia.forEach((evento) => {
        Object.entries(evento.opciones || {}).forEach(([nombre, opts]) => {
          if (!opts?.selected) return;

          // si no está en los 11 (por errores), lo ignoramos
          if (!(nombre in totales)) return;

          // NO SUMA: no suma base ni extras ni penales (como Home)
          if (opts.nosuma) return;

          let puntos = 0;

          // BASE: solo 1 vez por día, si no es penal
          if (!baseSumada[nombre] && !opts.penal1 && !opts.penal10) {
            puntos += 1;
            baseSumada[nombre] = true;
          }

          // EXTRAS
          if (opts.oro) puntos += 1;
          if (opts.doble) puntos += 1;
          if (opts.triple) puntos += 2;

          // PENALES
          if (opts.penal1) puntos -= 1;
          if (opts.penal10) puntos -= 10;

          totales[nombre] += puntos;
        });
      });
    });

    return totales;
  }, [eventos]);

  // =========================================
  // STATS REALES (lo que pediste)
  // 1) Asistencia semanal %
  // 2) Mejor racha semanal
  // 3) Asistencia fechas de oro (x/11) -> contamos días donde opts.oro true
  // 4) Total de apariciones (días con al menos 1 positivo)
  // =========================================
  const statsJugador = useMemo(() => {
    // semanas presentes en el sistema (columnas)
    const semanasMap = {}; // semanaNum -> { asistio: bool }
    const aparicionesDias = new Set(); // día con al menos 1 positivo
    const oroDias = new Set(); // día donde opts.oro true y hubo positivo

    for (const ev of eventos) {
      if (!ev?.opciones) continue;

      // semana: doc id normalmente es "1", "2", ...
      const semanaNum = Number(ev.semana);
      if (!Number.isNaN(semanaNum)) {
        if (!semanasMap[semanaNum]) semanasMap[semanaNum] = { asistio: false };
      }

      const opts = ev.opciones?.[player.nombre];
      if (!opts) continue;

      const tuvoPositivo = opts.selected && !opts.nosuma && !opts.penal1 && !opts.penal10;

      if (tuvoPositivo) {
        if (!Number.isNaN(semanaNum)) semanasMap[semanaNum].asistio = true;
        aparicionesDias.add(diaKey(ev.fecha));
        if (opts.oro) oroDias.add(diaKey(ev.fecha));
      }
    }

    const semanasOrdenadas = Object.keys(semanasMap)
      .map(Number)
      .sort((a, b) => a - b);

    const semanasTotales = semanasOrdenadas.length;
    const semanasAsistidas = semanasOrdenadas.filter((w) => semanasMap[w].asistio).length;

    const asistenciaSemanalPct = semanasTotales ? Math.round((semanasAsistidas / semanasTotales) * 100) : 0;

    // Mejor racha semanal (consecutiva)
    let mejorRacha = 0;
    let racha = 0;
    let prev = null;

    for (const w of semanasOrdenadas) {
      const asistio = semanasMap[w].asistio;

      // si falta semana intermedia en data, corta racha
      if (prev !== null && w !== prev + 1) racha = 0;

      if (asistio) {
        racha += 1;
        if (racha > mejorRacha) mejorRacha = racha;
      } else {
        racha = 0;
      }
      prev = w;
    }

    const fechasOroAsistidas = oroDias.size;
    const fechasOroTotal = 11;

    const totalApariciones = aparicionesDias.size;

    return {
      asistenciaSemanalPct,
      mejorRacha,
      fechasOroAsistidas,
      fechasOroTotal,
      totalApariciones,
      semanasTotales,
      semanasAsistidas,
    };
  }, [eventos, player.nombre, player.id]);

  // =========================================
  // 1) RELACIONES + 2) DIAS SIN VERSE (pair stats)
  // =========================================
  const pairStats = useMemo(() => {
    const hoy = new Date();

    // startSeason: primera fecha existente (si no hay, hoy)
    const startSeason = eventos.length ? eventos[0].fecha : hoy;

    // Inicializar estructura por “otro”
    const others = JUGADORES.filter((j) => j.nombre !== player.nombre);

    const data = others.map((o) => ({
      nombre: o.nombre,
      color: o.color,
      juntadas: 0,
      ult: null, // Date
      diasSinVer: null, // number
      record: 0, // max gap
      rompeRecord: false,
      frecuencia: null, // avg days between meets
      _meetDates: [], // internal
    }));

    const idx = new Map(data.map((d, i) => [d.nombre, i]));

    // Recorrer eventos y acumular fechas donde se vieron
    for (const ev of eventos) {
      // el jugador “estuvo y sumó 1”
      if (!estuvoYSumo1(ev, player.nombre)) continue;

      // quién más estuvo con él
      for (const o of others) {
        if (!estuvoYSumo1(ev, o.nombre)) continue;

        const i = idx.get(o.nombre);
        if (i === undefined) continue;

        const key = diaKey(ev.fecha);

        // Evitar duplicar mismo día
        if (!data[i]._meetDates.includes(key)) {
          data[i]._meetDates.push(key);
        }
      }
    }

    // Calcular métricas por par
    for (const row of data) {
      row._meetDates.sort(); // YYYY-MM-DD lexicográfico = fecha ok
      row.juntadas = row._meetDates.length;

if (row._meetDates.length === 0) {
  // Nunca se vieron en fichas → usar fecha base manual
  const base = getUltimaVezBase(player.nombre, row.nombre);

  const ult = base ?? startSeason;
  const dias = diffDias(hoy, ult);

  row.ult = ult;
  row.diasSinVer = dias;
  row.record = dias;
row.rompeRecord = dias > 0; // primer récord histórico = NEW RECORD
  row.frecuencia = null;
  continue;
}



      const meetDates = row._meetDates.map((k) => new Date(k));
      const last = meetDates[meetDates.length - 1];
      row.ult = last;

      const currentGap = diffDias(hoy, last);
      row.diasSinVer = currentGap;

      // record previo: max gap entre juntadas
let recordPrev = 0;

// gap desde inicio de temporada a primera juntada
if (meetDates.length > 0) {
  const gapInicio = diffDias(meetDates[0], startSeason);
  recordPrev = gapInicio;
}

// gaps entre juntadas
for (let i = 1; i < meetDates.length; i++) {
  const gap = diffDias(meetDates[i], meetDates[i - 1]);
  if (gap > recordPrev) recordPrev = gap;
}

row.record = Math.max(recordPrev, currentGap);

// NEW RECORD si el récord actual es el vigente
row.rompeRecord = currentGap === row.record && currentGap > 0;


      // frecuencia: promedio entre primera y última / (n-1)
      if (meetDates.length >= 2) {
        const avg = Math.round(diffDias(last, meetDates[0]) / (meetDates.length - 1));
        row.frecuencia = avg;
      } else {
        row.frecuencia = null;
      }
    }

    // Orden para tabla relaciones
    const relaciones = [...data].sort((a, b) => b.juntadas - a.juntadas);

    // Orden para tabla dias sin verse (más días primero)
    const sinVer = [...data].sort((a, b) => (b.diasSinVer ?? 0) - (a.diasSinVer ?? 0));

    // Max juntadas para barritas
    const maxJ = Math.max(1, ...data.map((d) => d.juntadas));

    return { relaciones, sinVer, maxJ };
  }, [eventos, index, player.nombre]);

  const puntajeActual = tablaGeneral[player.nombre] ?? 0;
const histBase = player.puntajeHistoricoBase ?? 0;
  const puntajeHistoricoTotal = histBase + puntajeActual;
// ===============================
// AUDIO cleanup al salir de Jugadores
// ===============================
useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
}, []);

  return (
    <div className="jugadoresPage" ref={rootRef} style={{ "--accent": player.color }}>
      {/* HEADER */}
      <header className="jugadoresHeader">
        <div className="jugadoresTitleWrap">
          <h1 className="jugadoresTitle">JUGADORES</h1>
          <div className="jugadoresSubtitle"></div>
        </div>

        {/* Barra de nombres */}
        <div className="playerBar" role="tablist" aria-label="Selector de jugadores">
          {JUGADORES.map((j, i) => {
            const active = i === index;
            return (
              <button
                key={j.id}
                className={`playerChip ${active ? "active" : ""}`}
                style={{ "--chip": j.color }}
                onClick={() => setIndex(i)}
                role="tab"
                aria-selected={active}
                title={`Elegir a ${j.nombre}`}
              >
                <span className="chipDot" />
                <span className="chipName">{j.nombre}</span>
                {active && <span className="chipUnderline" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* SELECT SCREEN */}
      <section className="selectScreen" aria-label="Pantalla de selección de personaje">
        {/* Flecha izquierda */}
        <button className="navArrow left" onClick={goPrev} aria-label="Jugador anterior">
          <span className="arrowIcon">◀</span>
          <span className="arrowHint">Anterior</span>
        </button>

        {/* Centro personaje */}
        <div className="characterStage">
          <div className="stageTop">
            <div className="playerIdentity">
              <div className="identityName" style={{ color: player.color }}>
                {player.nombre}
              </div>
              <div className="identityTagline">{player.tagline}</div>
            </div>

            <div className="playerIndex">
              <span className="indexNum">{String(index + 1).padStart(2, "0")}</span>
              <span className="indexSlash">/</span>
              <span className="indexTotal">{String(total).padStart(2, "0")}</span>
            </div>
          </div>

          <div className="characterGlowWrap" aria-label="Imagen del personaje">
            <div className="glowRing" />
            {imgSrc ? (
              <img className="characterImg" src={imgSrc} alt={`Personaje ${player.nombre}`} draggable="false" />
            ) : (
              <div className="missingPng">
                Falta PNG: <b>{player.id}.png</b>
                <div className="missingHint">
                  Ponelo en <code>src/assets/jugadores/</code>
                </div>
              </div>
            )}
          </div>

          {/* Micro tips */}
          <div className="controlsTip">
            <span className="tipKey">←</span>
            <span className="tipTxt"> / </span>
            <span className="tipKey">→</span>
            <span className="tipTxt"> </span>
          </div>
        </div>

        {/* Flecha derecha */}
        <button className="navArrow right" onClick={goNext} aria-label="Jugador siguiente">
          <span className="arrowIcon">▶</span>
          <span className="arrowHint">Siguiente</span>
        </button>

        {/* Panel derecho (perfil + stats NUEVOS) */}
        <aside className="infoPanel" aria-label="Panel de información del jugador">
          {/* PERFIL */}
          <div className="panelHead">
            <div className="panelBadge" style={{ "--badge": player.color }}>
              PERFIL
            </div>
            <div className="panelGlowLine" />
          </div>

          <div className="panelCard">
            <div className="kvGrid">
              <div className="kv">
                <div className="k">Puntaje actual</div>
                <div className="v">{puntajeActual}</div>
              </div>

              <div className="kv">
                <div className="k">Puntaje histórico</div>
                <div className="v">{puntajeHistoricoTotal}</div>
              </div>

              <div className="kv">
                <div className="k">Fecha de Oro</div>
                <div className="v">⭐ {player.fechaOro
 ?? "—"}</div>
              </div>

              <div className="kv">
                <div className="k">Temporadas</div>
                <div className="v">
                  {Object.keys(player.posiciones ?? {}).length
 || "—"}
                </div>
              </div>
            </div>

            <div className="panelResena">
              <div className="resenaTitle">Historial de posiciones</div>
              {Object.entries(player.posiciones ?? {})
.length === 0 ? (
                <div className="resenaBody">—</div>
              ) : (
                Object.entries(player.posiciones ?? {})
.map(([temp, pos]) => (
                  <div key={temp} className="histPos">
                    <span>{temp}</span>
                    <b>{pos}</b>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STATS */}
          <div className="panelHead" style={{ marginTop: 14 }}>
            <div className="panelBadge" style={{ "--badge": player.color }}>
              STATS
            </div>
            <div className="panelGlowLine" />
          </div>

          <div className="statsCard">
            <StatBar
              label="Asistencia semanal"
              value={`${statsJugador.asistenciaSemanalPct}% (${statsJugador.semanasAsistidas}/${statsJugador.semanasTotales})`}
              pct={statsJugador.asistenciaSemanalPct}
              accent={player.color}
            />

            <StatBar
              label="Mejor racha semanal"
              value={`${statsJugador.mejorRacha} semanas`}
              pct={(statsJugador.mejorRacha / 20) * 100}
              accent={player.color}
            />

            <StatBar
              label="Asistencia Fechas de Oro"
              value={`${statsJugador.fechasOroAsistidas} / ${statsJugador.fechasOroTotal}`}
              pct={(statsJugador.fechasOroAsistidas / statsJugador.fechasOroTotal) * 100}
              accent={player.color}
            />

            <StatBar
              label="Total de apariciones"
              value={`${statsJugador.totalApariciones}`}
              pct={(statsJugador.totalApariciones / 80) * 100}
              accent={player.color}
            />
          </div>
        </aside>
      </section>

      {/* ===============================
          TABLAS NUEVAS (pro)
         =============================== */}
      <section className="playerTables">
        <div className="tablesHead">
          <div className="tablesBadge" style={{ "--badge": player.color }}>
            RELACIONES + DÍAS SIN VERSE
          </div>
          <div className="tablesLine" />
          {loading ? <span className="tablesLoading">Cargando fichas…</span> : <span className="tablesOk">LIVE</span>}
        </div>

        <div className="tablesGrid">
          {/* RELACIONES */}
          <div className="tableCard">
            <div className="tableTitle">
              🤝 Relaciones de <span style={{ color: player.color }}>{player.nombre}</span>
            </div>
            <div className="tableSubtitle">Cantidad de juntadas con cada jugador .</div>

            <table className="miniTable">
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Juntadas</th>
                  <th>Impacto</th>
                </tr>
              </thead>
              <tbody>
                {pairStats.relaciones.map((r) => {
                  const pct = Math.round((r.juntadas / pairStats.maxJ) * 100);
                  return (
                    <tr key={r.nombre}>
                      <td className="miniName" style={{ color: r.color }}>
                        {r.nombre}
                      </td>
                      <td className="miniNum">{r.juntadas}</td>
                      <td className="miniBarCell">
                        <div className="miniBarTrack">
                          <div className="miniBarFill" style={{ width: `${pct}%`, background: r.color }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DIAS SIN VERSE */}
          <div className="tableCard">
            <div className="tableTitle">
              🕒 Días sin verse con <span style={{ color: player.color }}>{player.nombre}</span>
            </div>
            <div className="tableSubtitle">Última fecha juntos → contador de días sin verse • </div>

            <table className="miniTable">
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Última vez</th>
                  <th>Días</th>
                  <th>Récord</th>
                  <th>Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {pairStats.sinVer.map((r) => {
                  const dias = r.diasSinVer ?? 0;
                  const rompe = r.rompeRecord;

                  return (
                    <tr key={r.nombre}>
                      <td className="miniName" style={{ color: r.color }}>
                        {r.nombre}
                      </td>

                      <td className="miniDate">{fmtFechaAR(r.ult)}</td>

                      <td className="miniNum" style={{ color: r.color }}>
                        {dias}
                      </td>

                      <td className="miniNum">
                        <div className={`numInline ${rompe ? "record-cell" : ""}`}>
                          {r.record}
                          {rompe && <span className="badge-record">NEW RECORD</span>}
                        </div>
                      </td>

                      <td className="miniFreq">
                        {r.frecuencia == null ? (
                          <span className="freqPill neutral">—</span>
                        ) : (
                          <span className="freqPill" style={{ "--pill": r.color }}>
                            1 cada {r.frecuencia}d
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="tableFootNote">
              Creado por Oso programaciones y soluciones infomáticas, na que ve  <b></b>  <b></b>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
