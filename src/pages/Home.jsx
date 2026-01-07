import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../Firebase";
import { useAdmin } from "../context/AdminContext";


const TOTAL_SEMANAS = 52;

const MESES = [
  { nombre: "ENERO", desde: 1, hasta: 5 },
  { nombre: "FEBRERO", desde: 6, hasta: 9 },
  { nombre: "MARZO", desde: 10, hasta: 13 },
  { nombre: "ABRIL", desde: 14, hasta: 17 },
  { nombre: "MAYO", desde: 18, hasta: 22 },
  { nombre: "JUNIO", desde: 23, hasta: 26 },
  { nombre: "JULIO", desde: 27, hasta: 30 },
  { nombre: "AGOSTO", desde: 31, hasta: 35 },
  { nombre: "SEPTIEMBRE", desde: 36, hasta: 39 },
  { nombre: "OCTUBRE", desde: 40, hasta: 44 },
  { nombre: "NOVIEMBRE", desde: 45, hasta: 48 },
  { nombre: "DICIEMBRE", desde: 49, hasta: 53 },
];

const normalizarSemana = (entrada) => {
  if (!entrada) return {};
  if (typeof entrada === "number") return { valor: entrada };
  return entrada;
};

function formatearFechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calcularPuntosDeJugador(opciones) {
  if (!opciones) return 0;
  if (opciones.nosuma) return 0;

  let puntos = opciones.penal1 || opciones.penal10 ? 0 : 1;
  if (opciones.oro) puntos++;
  if (opciones.doble) puntos++;
  if (opciones.triple) puntos += 2;
  if (opciones.penal1) puntos -= 1;
  if (opciones.penal10) puntos -= 10;

  return puntos;
}

function recalcularJugadoresDesdeFirestore(jugadoresBase, semanasDetalle) {
  if (!jugadoresBase.length) return jugadoresBase;

  const indice = {};
  jugadoresBase.forEach((j, i) => (indice[j.nombre] = i));

  const resultado = jugadoresBase.map((j) => ({
    ...j,
    semanas: Array.from({ length: TOTAL_SEMANAS }, () => ({})),
    total: 0,
  }));

  Object.entries(semanasDetalle).forEach(([semanaStr, eventos]) => {
    const iSemana = Number(semanaStr) - 1;
    if (iSemana < 0 || iSemana >= TOTAL_SEMANAS) return;

// ===============================
// SUMA CORRECTA POR DÍA (LDN)
// ===============================

// Agrupar eventos por fecha
const eventosPorDia = {};

eventos.forEach((evento) => {
  if (!evento.fecha || !evento.opciones) return;

  if (!eventosPorDia[evento.fecha]) {
    eventosPorDia[evento.fecha] = [];
  }

  eventosPorDia[evento.fecha].push(evento);
});

// Procesar día por día
Object.values(eventosPorDia).forEach((eventosDelDia) => {
  const baseSumada = {}; // jugador → true

  eventosDelDia.forEach((evento) => {
    Object.entries(evento.opciones).forEach(([nombre, opts]) => {
      if (!opts.selected) return;

      const idx = indice[nombre];
      if (idx === undefined) return;

      let puntos = 0;

      // 👉 BASE: solo una vez por día
      if (
        !baseSumada[nombre] &&
        !opts.nosuma &&
        !opts.penal1 &&
        !opts.penal10
      ) {
        puntos += 1;
        baseSumada[nombre] = true;
      }

      // 👉 BONOS (siempre suman)
      if (opts.oro) puntos += 1;
      if (opts.doble) puntos += 1;
      if (opts.triple) puntos += 2;

      // 👉 PENALES
      if (opts.penal1) puntos -= 1;
      if (opts.penal10) puntos -= 10;

const sem = resultado[idx].semanas[iSemana];
const viejo = typeof sem.valor === "number" ? sem.valor : null;

// Si puntos da 0 (ej: NO SUMA), igual queremos:
// - guardar nosuma=true
// - y si la celda no tenía nada, mostrar 0 (gris) como antes
if (puntos === 0) {
  resultado[idx].semanas[iSemana] = {
    ...sem,
    valor: viejo === null ? 0 : viejo, // si ya había algo (1,2,3, etc) NO lo pisamos
    oro: sem.oro || opts.oro,
    doble: sem.doble || opts.doble,
    triple: sem.triple || opts.triple,
    penal1: sem.penal1 || opts.penal1,
    penal10: sem.penal10 || opts.penal10,
    nosuma: sem.nosuma || opts.nosuma,
  };
  return;
}

// Si hay puntos != 0, sumamos normal
resultado[idx].semanas[iSemana] = {
  ...sem,
  valor: (viejo === null ? 0 : viejo) + puntos,
  oro: sem.oro || opts.oro,
  doble: sem.doble || opts.doble,
  triple: sem.triple || opts.triple,
  penal1: sem.penal1 || opts.penal1,
  penal10: sem.penal10 || opts.penal10,
  nosuma: sem.nosuma || opts.nosuma,
};

resultado[idx].total += puntos;

    });
  });
});

  });

  resultado.sort((a, b) => b.total - a.total);
  return resultado;
}

export default function Home() {
  // ===============================
  // ESTADOS PRINCIPALES
  // ===============================
  const [jugadoresBase, setJugadoresBase] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [semanasDetalle, setSemanasDetalle] = useState({});
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);

  const [tapCount, setTapCount] = useState(0);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
const { isAdmin, login, logout } = useAdmin();
  const [addingEvent, setAddingEvent] = useState(false);

  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLugar, setNewEventLugar] = useState("");
  const [newEventContexto, setNewEventContexto] = useState("");
  const [newEventNota, setNewEventNota] = useState("");

  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const semanasArray = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1);
  // ===============================
// FECHA DE ORO (AUTO + OVERRIDE)
// ===============================

// ✅ 1) Pegá acá tu lista real (MM-DD). El año lo calcula solo.
const FECHAS_CUMPLE_ORO = [
{ nombre: "Oso", mmdd: "08-19" },
  { nombre: "Sombra", mmdd: "04-22" },
  { nombre: "Profesor", mmdd: "05-21" },
  { nombre: "Picante", mmdd: "01-08" },
  { nombre: "Potencia", mmdd: "21-03" },
  { nombre: "Tía", mmdd: "03-06" },
  { nombre: "Mistico", mmdd: "10-27" },
  { nombre: "German", mmdd: "02-06" },
  { nombre: "Navai", mmdd: "08-12" },
  { nombre: "Conejo", mmdd: "11-02" },
];

// Firestore override (si se reprograma)
const [oroOverrideISO, setOroOverrideISO] = useState(null); // "YYYY-MM-DD" o null
const [oroEditOpen, setOroEditOpen] = useState(false);
const [oroDraftISO, setOroDraftISO] = useState("");

// Helpers
const pad2 = (n) => String(n).padStart(2, "0");

function formatDDMMYYYYFromISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDaysCeil(fromDate, toDate) {
  const a = startOfDay(fromDate).getTime();
  const b = startOfDay(toDate).getTime();
  const ms = b - a;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mmddToNextDate(mmdd, baseDate = new Date()) {
  // mmdd: "MM-DD"
  const [mmStr, ddStr] = (mmdd || "").split("-");
  const mm = Number(mmStr);
  const dd = Number(ddStr);
  if (!mm || !dd) return null;

  const today = startOfDay(baseDate);
  const y = today.getFullYear();

  // usar mediodía para evitar quilombos por timezone/DST
  const candidateThisYear = new Date(y, mm - 1, dd, 12, 0, 0, 0);

  if (startOfDay(candidateThisYear) >= today) return candidateThisYear;

  return new Date(y + 1, mm - 1, dd, 12, 0, 0, 0);
}

function computeNextGoldDateISO(baseDate = new Date()) {
  const dates = FECHAS_CUMPLE_ORO
    .map((x) => mmddToNextDate(x.mmdd, baseDate))
    .filter(Boolean);

  if (!dates.length) return null;

  dates.sort((a, b) => a.getTime() - b.getTime());
  const d = dates[0];

  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}
    // ===============================
// LISTENER CONFIG (override fecha oro)
// ===============================
useEffect(() => {
  const ref = doc(db, "config", "fechasOro");
  const unsub = onSnapshot(ref, (snap) => {
    const data = snap.data() || {};
    setOroOverrideISO(data?.overrideISO || null);
  });

  return () => unsub();
}, []);
  const hoy = new Date();
const autoOroISO = computeNextGoldDateISO(hoy);

// Regla:
// - si hay overrideISO => se usa ese (aunque no esté en la lista)
// - si no hay => auto desde lista
const oroISO = oroOverrideISO || autoOroISO;

const oroDateObj = oroISO ? new Date(oroISO + "T12:00:00") : null;
const diasRestantes = oroDateObj ? diffDaysCeil(hoy, oroDateObj) : null;
  async function saveOroOverride(nextISOOrNull) {
  try {
    await setDoc(
      doc(db, "config", "fechasOro"),
      { overrideISO: nextISOOrNull || null, updatedAt: new Date() },
      { merge: true }
    );
    setOroEditOpen(false);
  } catch (e) {
    console.error("Error guardando override fecha oro:", e);
    alert("No se pudo guardar la Fecha de Oro. Mirá la consola.");
  }
}

  // ===============================
  // FIRESTORE REALTIME
  // ===============================
 useEffect(() => {
  const colRef = collection(db, "semanas");
  const unsub = onSnapshot(colRef, (snap) => {
    const data = {};
    snap.forEach((docu) => {
      const raw = docu.data();
      data[docu.id] = Array.isArray(raw.eventos) ? raw.eventos : [];
    });

    setSemanasDetalle(data);

    // ⭐ NUEVO: seleccionar última semana con fichas
    const semanasConDatos = Object.entries(data)
      .filter(([semana, eventos]) => eventos.length > 0)
      .map(([semana]) => Number(semana));

    if (semanasConDatos.length > 0) {
      const ultima = Math.max(...semanasConDatos);
      setSemanaSeleccionada(ultima);
    }
  });

  return () => unsub();
}, []);


  // ===============================
  // CARGAR JUGADORES
  // ===============================
  useEffect(() => {
    fetch("/jugadores.json")
      .then((res) => res.json())
      .then((data) => {
        const base = data.map((j) => ({
          ...j,
          semanas: Array.from({ length: TOTAL_SEMANAS }, () => ({})),
          total: 0,
        }));
        setJugadoresBase(base);
      });
  }, []);

  // ===============================
  // RECALCULAR TABLA
  // ===============================
  useEffect(() => {
    if (!jugadoresBase.length) return;

    const recalc = recalcularJugadoresDesdeFirestore(
      jugadoresBase,
      semanasDetalle
    );
    setJugadores(recalc);
  }, [jugadoresBase, semanasDetalle]);

  // ===============================
  // ADMIN
  // ===============================
  const checkPassword = () => {
if (passwordInput === "Cacona") {
  login(); // 🔥 ahora el admin es global
      setShowPasswordPrompt(false);
    } else {
      alert("Contraseña incorrecta");
    }
    setPasswordInput("");
  };

  function toggleOption(nombreJugador, opcion, value) {
    setSelectedPlayers((prev) => ({
      ...prev,
      [nombreJugador]: {
        ...(prev[nombreJugador] || {}),
        [opcion]: value,
        selected: true,
      },
    }));
  }

  // ===============================
  // GUARDAR EVENTO
  // ===============================
async function handleSaveEvent(e) {
  // 🔴 CLAVE: evita que el form haga submit silencioso
  if (e) e.preventDefault();

  try {
    console.log("CLICK GUARDAR FICHA");

    const semanaKey = String(semanaSeleccionada);
    const ref = doc(db, "semanas", semanaKey);

    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data().eventos || [] : [];

    const nuevaFicha = {
      fecha: newEventDate,
      lugar: newEventLugar,
      contexto: newEventContexto,
      nota: newEventNota,
      opciones: selectedPlayers,
      createdAt: new Date(),
    };

    const nuevos =
      editIndex !== null
        ? prev.map((e, i) => (i === editIndex ? nuevaFicha : e))
        : [...prev, nuevaFicha];

    await setDoc(
      ref,
      {
        eventos: nuevos,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // ✅ RESET UI (esto antes no se ejecutaba en prod)
    setEditIndex(null);
    setAddingEvent(false);
    setSelectedPlayers({});
    setNewEventDate("");
    setNewEventLugar("");
    setNewEventContexto("");
    setNewEventNota("");

    console.log("FICHA GUARDADA OK");
  } catch (err) {
    console.error("ERROR guardando ficha:", err);
    alert("No se pudo guardar la ficha");
  }
}






  // ===============================
  // BORRAR EVENTO
  // ===============================
  async function borrarFicha(index) {
    const semanaKey = String(semanaSeleccionada);
    const prev = semanasDetalle[semanaKey] || [];
    const nuevos = prev.filter((_, i) => i !== index);

    if (nuevos.length === 0) {
      await deleteDoc(doc(db, "semanas", semanaKey));
    } else {
      await setDoc(
  doc(db, "semanas", semanaKey),
  {
    eventos: nuevos,
    updatedAt: new Date(),
  },
  { merge: true }
);

    }
  }

  // ===============================
  // EDITAR EVENTO
  // ===============================
  function editarFicha(index) {
    const semanaKey = String(semanaSeleccionada);
    const evento = semanasDetalle[semanaKey][index];
    if (!evento) return;

    setEditIndex(index);
    setNewEventDate(evento.fecha || "");
    setNewEventLugar(evento.lugar || "");
    setNewEventContexto(evento.contexto || "");
    setNewEventNota(evento.nota || "");
    setSelectedPlayers(evento.opciones || {});
    setAddingEvent(true);
  }

  // ===============================
  // RENDER
  // ===============================
  const eventosSemana =
    semanasDetalle[String(semanaSeleccionada)] || [];

    return (
    <>

      <div className="page">

        {/* POPUP PASSWORD */}
        {showPasswordPrompt && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#241b3d",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #ff00c8",
                textAlign: "center",
                width: "300px",
                boxShadow: "0 0 20px #ff00c8",
              }}
            >
              <h3 style={{ color: "white" }}>Ingresá la contraseña</h3>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  width: "100%",
                  marginTop: "10px",
                }}
              />

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={checkPassword}
                  style={{
                    padding: "8px 15px",
                    background: "#ff00c8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "45%",
                  }}
                >
                  Aceptar
                </button>

                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  style={{
                    padding: "8px 15px",
                    background: "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "45%",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOGO */}
        <div
          className="logo-container"
          onClick={() => {
            setTapCount((prev) => {
              const nuevo = prev + 1;
              if (nuevo >= 5) {
                setShowPasswordPrompt(true);
                return 0;
              }
              return nuevo;
            });
          }}
        >
          <img src="/icons/logo-ldn.png" alt="LDN Logo" className="logo-ldn" />
        </div>

        {/* TÍTULO */}
        <h1 className="titulo">TORNEO LOS PITOS FRÍOS 2026</h1>
{/* ===============================
    CARTEL PRÓXIMA FECHA DE ORO
=============================== */}
<div className="oro-banner-wrap">
  <div className="oro-banner">
    <div className="oro-badge">✨ FECHA DE ORO</div>

    {oroISO ? (
      <>
        <div className="oro-main">
          Próxima fecha de oro <span className="oro-date">{formatDDMMYYYYFromISO(oroISO)}</span>
        </div>

        <div className="oro-sub">
          Faltan <span className="oro-days">{diasRestantes}</span> día{diasRestantes === 1 ? "" : "s"}
        </div>
      </>
    ) : (
      <div className="oro-main">Cargá la lista de cumpleaños para calcular la próxima Fecha de Oro</div>
    )}

    {isAdmin && (
      <div className="oro-actions">
        <button
          className="oro-btn"
          onClick={() => {
            setOroDraftISO(oroOverrideISO || autoOroISO || "");
            setOroEditOpen(true);
          }}
        >
          Editar
        </button>

        {oroOverrideISO && (
          <button className="oro-btn oro-btn-ghost" onClick={() => saveOroOverride(null)}>
            Volver a automático
          </button>
        )}
      </div>
    )}
  </div>
</div>

{/* MODAL EDITAR (solo admin) */}
{isAdmin && oroEditOpen && (
  <div className="oro-modal-backdrop" onClick={() => setOroEditOpen(false)}>
    <div className="oro-modal" onClick={(e) => e.stopPropagation()}>
      <h3 className="oro-modal-title">Editar Fecha de Oro</h3>

      <p className="oro-modal-desc">
        Si la reprogramás, guardamos un override en Firestore. Si lo dejás vacío y tocás “Volver a automático”, vuelve a calcularse por cumpleaños.
      </p>

      <label className="oro-modal-label">Fecha (override)</label>
      <input
        className="oro-modal-input"
        type="date"
        value={oroDraftISO}
        onChange={(e) => setOroDraftISO(e.target.value)}
      />

      <div className="oro-modal-row">
        <button className="oro-modal-save" onClick={() => saveOroOverride(oroDraftISO || null)}>
          Guardar
        </button>
        <button className="oro-modal-cancel" onClick={() => setOroEditOpen(false)}>
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

        {/* LEYENDA */}
        <div className="leyenda">
          <div className="leyenda-item">
            <span className="leyenda-color leyenda-oro"></span>
            <span>Fecha de Oro</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color leyenda-doble"></span>
            <span>Doble Puntuación</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color leyenda-triple"></span>
            <span>Triple Puntuación</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color leyenda-penal"></span>
            <span>Penalización</span>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="tabla-wrapper">
          <table className="tabla-torneo">
            <thead>
              <tr>
                <th>JUGADOR</th>
                <th>PUNTOS</th>
                {MESES.map((mes) => (
                  <th key={mes.nombre} colSpan={mes.hasta - mes.desde + 1}>
                    {mes.nombre}
                  </th>
                ))}
              </tr>
              <tr>
                <th></th>
                <th></th>
                {semanasArray.map((sem) => (
                  <th key={sem}>{sem}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jugadores.map((j, idx) => (
                <tr key={j.nombre}>
                  <td className="celda-jugador">
                    {idx + 1}° {j.nombre}
                  </td>
                  <td className="celda-total">{j.total}</td>

                  {semanasArray.map((sem) => {
                    const semana = normalizarSemana(j.semanas?.[sem - 1]);
                    const valor = semana.valor ?? "";

                    const esOro = semana.oro;
                    const esDoble = semana.doble;
                    const esTriple = semana.triple;
                    const esPenal1 = semana.penal1;
                    const esPenal10 = semana.penal10;
                    const esNoSuma = semana.nosuma;

                    if (valor === 0) {
                      return (
                        <td
                          key={sem}
                          style={{
                            backgroundColor: "#808080",
                            color: "white",
                          }}
                        >
                          {valor}
                        </td>
                      );
                    }

                    const style = {};

                    if ((esPenal1 || esPenal10) && valor < 0) {
                      style.backgroundColor = "#e74c3c";
                      style.color = "white";
                      return (
                        <td key={sem} style={style}>
                          {valor}
                        </td>
                      );
                    }

                    const colores = [];
                    if (esOro) colores.push("#f1c40f");
                    if (esDoble) colores.push("#3498db");
                    if (esTriple) colores.push("#9b59b6");

                    if (colores.length === 1 && valor !== "") {
                      style.backgroundColor = colores[0];
                      return (
                        <td key={sem} style={style}>
                          {valor}
                        </td>
                      );
                    }

                    if (colores.length > 1 && valor !== "") {
                      const partes = colores.map((c, i) => {
                        const start = (100 / colores.length) * i;
                        const end = (100 / colores.length) * (i + 1);
                        return `${c} ${start}% ${end}%`;
                      });

                      style.backgroundImage = `linear-gradient(135deg, ${partes.join(
                        ", "
                      )})`;

                      return (
                        <td key={sem} style={style}>
                          {valor}
                        </td>
                      );
                    }

                    if (esNoSuma && valor !== "") {
                      style.backgroundColor = "#808080";
                      style.color = "white";
                      return (
                        <td key={sem} style={style}>
                          {valor}
                        </td>
                      );
                    }

                    const esSimple =
                      !esOro &&
                      !esDoble &&
                      !esTriple &&
                      !esPenal1 &&
                      !esPenal10 &&
                      !esNoSuma &&
                      valor !== "";

                    if (esSimple) {
                      style.backgroundColor = "#c59bff";
                      return (
                        <td key={sem} style={style}>
                          {valor}
                        </td>
                      );
                    }

                    return <td key={sem}>{valor}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DESCRIPCIÓN DE PUNTOS */}
        <h2 className="detalle-titulo">Descripción de puntos</h2>

        {/* BOTÓN AGREGAR FICHA */}
        {isAdmin && !addingEvent && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <button
              onClick={() => setAddingEvent(true)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(90deg, #ff00c8, #7000ff)",
                border: "2px solid white",
                color: "white",
                fontWeight: "700",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 0 10px #ff00c8",
              }}
            >
              + AGREGAR FICHA
            </button>
          </div>
        )}

        {/* BARRA DE SEMANAS */}
        <div className="detalle-weeks-bar">
          {semanasArray.map((sem) => (
            <button
              key={sem}
              className={
                "week-btn" +
                (semanaSeleccionada === sem ? " week-selected" : "")
              }
              onClick={() => setSemanaSeleccionada(sem)}
            >
              {sem}
            </button>
          ))}
        </div>

        {/* FORMULARIO FICHA */}
        {isAdmin && addingEvent && (
          <div
            style={{
              background: "#1e1b2e",
              padding: "15px",
              borderRadius: "10px",
              border: "2px solid #ff00c8",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "10px",
                color: "white",
              }}
            >
              Nueva Ficha – Semana {semanaSeleccionada}
            </h3>

            {/* FECHA */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "white" }}>Fecha:</label>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {/* JUGADORES */}
            <div style={{ marginBottom: "10px", color: "white" }}>
              <label>Jugadores:</label>

              {jugadores.map((j) => (
                <div key={j.nombre} style={{ marginBottom: "5px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        selectedPlayers[j.nombre]?.selected || false
                      }
                      onChange={(e) => {
                        setSelectedPlayers((prev) => ({
                          ...prev,
                          [j.nombre]: {
                            ...(prev[j.nombre] || {}),
                            selected: e.target.checked,
                          },
                        }));
                      }}
                    />
                    {" " + j.nombre}
                  </label>

                  {selectedPlayers[j.nombre]?.selected && (
                    <div
                      style={{
                        marginLeft: "20px",
                        marginTop: "5px",
                      }}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPlayers[j.nombre]?.oro || false}
                          onChange={(e) =>
                            toggleOption(j.nombre, "oro", e.target.checked)
                          }
                        />{" "}
                        Oro (+1)
                      </label>
                      <br />

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPlayers[j.nombre]?.doble || false}
                          onChange={(e) =>
                            toggleOption(j.nombre, "doble", e.target.checked)
                          }
                        />{" "}
                        Doble (+1)
                      </label>
                      <br />

                      <label>
                        <input
                          type="checkbox"
                          checked={
                            selectedPlayers[j.nombre]?.triple || false
                          }
                          onChange={(e) =>
                            toggleOption(j.nombre, "triple", e.target.checked)
                          }
                        />{" "}
                        Triple (+2)
                      </label>
                      <br />

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPlayers[j.nombre]?.penal1 || false}
                          onChange={(e) =>
                            toggleOption(j.nombre, "penal1", e.target.checked)
                          }
                        />{" "}
                        Penal -1
                      </label>
                      <br />

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPlayers[j.nombre]?.penal10 || false}
                          onChange={(e) =>
                            toggleOption(j.nombre, "penal10", e.target.checked)
                          }
                        />{" "}
                        Penal -10
                      </label>
                      <br />

                      <label>
                        <input
                          type="checkbox"
                          checked={
                            selectedPlayers[j.nombre]?.nosuma || false
                          }
                          onChange={(e) =>
                            toggleOption(j.nombre, "nosuma", e.target.checked)
                          }
                        />{" "}
                        NO SUMA (0)
                      </label>
                      <br />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* LUGAR */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "white" }}>Lugar:</label>
              <input
                type="text"
                value={newEventLugar}
                onChange={(e) => setNewEventLugar(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {/* CONTEXTO */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "white" }}>Contexto:</label>
              <input
                type="text"
                value={newEventContexto}
                onChange={(e) => setNewEventContexto(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {/* NOTA */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "white" }}>Nota:</label>
              <input
                type="text"
                value={newEventNota}
                onChange={(e) => setNewEventNota(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {/* BOTONES */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={handleSaveEvent}
                style={{
                  padding: "10px",
                  background: "#00ff73",
                  color: "black",
                  fontWeight: "700",
                  borderRadius: "10px",
                  border: "none",
                  width: "48%",
                  cursor: "pointer",
                }}
              >
                GUARDAR FICHA
              </button>

              <button
                onClick={() => setAddingEvent(false)}
                style={{
                  padding: "10px",
                  background: "gray",
                  color: "white",
                  fontWeight: "700",
                  borderRadius: "10px",
                  border: "none",
                  width: "48%",
                  cursor: "pointer",
                }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        )}

        {/* LISTA DE FICHAS */}
        <div className="detalle-lista">
          {eventosSemana.length === 0 ? (
            <p className="detalle-vacio">
              No hay puntos registrados para esta semana.
            </p>
          ) : (
            eventosSemana.map((evento, index) => (
              <div key={index} className="detalle-item">
                <div
                  className="detalle-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="detalle-fecha">
                      {formatearFechaLarga(evento.fecha)}
                    </div>
                    <div className="detalle-sub">
                      {evento.opciones
                        ? (() => {
                            const sumaron = Object.entries(evento.opciones)
                              .filter(
                                ([_, opts]) =>
                                  opts.selected && !opts.nosuma
                              )
                              .map(([nombre]) => nombre);

                            return sumaron.length
                              ? "Sumaron: " + sumaron.join(", ")
                              : "Sin jugadores registrados";
                          })()
                        : "Sin jugadores registrados"}
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => editarFicha(index)}
                        style={{
                          background: "#00bfff",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        EDITAR
                      </button>

                      <button
                        onClick={() => borrarFicha(index)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>

                <div className="detalle-body">
                  {evento.lugar && (
                    <p>
                      <strong>Lugar:</strong> {evento.lugar}
                    </p>
                  )}
                  {evento.contexto && (
                    <p>
                      <strong>Contexto:</strong> {evento.contexto}
                    </p>
                  )}
                  {evento.nota && (
                    <p>
                      <strong>Notas:</strong> {evento.nota}
                    </p>
                  )}

                  {evento.opciones &&
                    Object.entries(evento.opciones).some(
                      ([_, opts]) =>
                        opts.oro ||
                        opts.doble ||
                        opts.triple ||
                        opts.penal1 ||
                        opts.penal10
                    ) && (
                      <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <strong>Detalles por jugador:</strong>
                        {Object.entries(evento.opciones)
                          .filter(
                            ([_, opts]) =>
                              opts.oro ||
                              opts.doble ||
                              opts.triple ||
                              opts.penal1 ||
                              opts.penal10
                          )
                          .map(([nombre, opts]) => (
                            <p key={nombre}>
                              <strong>{nombre}:</strong>{" "}
                              {opts.oro && "Oro (+1) "}
                              {opts.doble && "Doble (+1) "}
                              {opts.triple && "Triple (+2) "}
                              {opts.penal1 && "Penal -1 "}
                              {opts.penal10 && "Penal -10 "}
                            </p>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

}
