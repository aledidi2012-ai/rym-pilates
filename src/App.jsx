import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, LayoutGrid, ChevronLeft, Plus, X, Check, Instagram, MessageCircle, MapPin, ArrowRight, LogOut, Clock } from "lucide-react";

const SUPABASE_URL = "https://hkcbwsrsemppvyidwhlt.supabase.co";
const SUPABASE_KEY = "sb_publishable_RRAMcqXuHdFstAgi_LKaMQ_FAF9uFMc";

const INK = "#1C1B19";
const BG = "#F7F4EC";
const MOSS = "#3F5A45";
const MOSS_LIGHT = "#5C7A5E";
const MOSS_DARK = "#2C4030";
const CLAY = "#C1633E";
const CLAY_LIGHT = "#F3DED2";
const MUTE = "#8A8478";
const STONE = "#F7F4EC";

const SHADOW_SM = "0 1px 3px rgba(28,27,25,0.06)";
const SHADOW_MD = "0 6px 20px rgba(28,27,25,0.09)";
const SHADOW_LG = "0 20px 48px rgba(28,27,25,0.22)";

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Manrope', -apple-system, Helvetica, Arial, sans-serif";

// ---- DATOS DEL ESTUDIO: editá estas líneas cuando quieras ----
const STUDIO_ADDRESS = "Belgrano 10, Bernal";
const STUDIO_HOURS = [
  { dias: "Lunes a viernes", horario: "8:00 a 21:00 hs" },
  { dias: "Sábados", horario: "9:00 a 13:00 hs" },
];
const STUDIO_WHATSAPP = "https://wa.me/5491161626800";
const STUDIO_INSTAGRAM = "https://instagram.com/rympilates";
const ADMIN_EMAIL = "aledidi2012@gmail.com";
const PLANES = [
  { veces: "Pack de 4 clases al mes", precio: "$35.000" },
  { veces: "Pack de 8 clases al mes", precio: "$45.000" },
  { veces: "Pack de 12 clases al mes", precio: "$50.000" },
];
// ------------------------------------------------------------------

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${options.token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const pill = { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 30, fontSize: 13.5, fontWeight: 600, fontFamily: FONT_BODY, textDecoration: "none", cursor: "pointer" };
const container = { maxWidth: 1040, margin: "0 auto", padding: "0 24px" };

function Spot({ taken }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        border: taken ? "none" : `1.5px solid ${MUTE}55`,
        background: taken ? `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS})` : "transparent",
        boxShadow: taken ? SHADOW_SM : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {taken && <Check size={17} color={STONE} strokeWidth={2.5} />}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ margin: "0 0 20px", padding: "12px 16px", borderRadius: 14, background: CLAY_LIGHT, color: "#7A2E14", fontSize: 13, boxShadow: SHADOW_SM }}>
      {msg}
    </div>
  );
}

function Header({ session, isAdmin, mode, setMode, onLogout, onShowLogin, onGoHome, onShowChangePassword }) {
  return (
    <div style={{ background: STONE, boxShadow: SHADOW_SM, position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ ...container, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "14px 24px", gap: 12 }}>
        <div />

        <button onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", justifySelf: "center" }}>
          <img src="/logo.png" alt="RYM Pilates" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: INK, fontWeight: 500 }}>RYM Pilates</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, justifySelf: "end" }}>
          {isAdmin && (
            <div style={{ display: "flex", gap: 4, background: BG, padding: 4, borderRadius: 14 }}>
              {[["cliente", "Vista cliente"], ["admin", "Panel admin"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  style={{ padding: "7px 14px", borderRadius: 10, border: "none", background: mode === key ? MOSS_DARK : "transparent", color: mode === key ? STONE : INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 12.5, color: MUTE, fontFamily: FONT_BODY }}>{session.email}</span>
              <button onClick={onShowChangePassword} style={{ background: "none", border: "none", color: MOSS_DARK, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                Cambiar contraseña
              </button>
              <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: CLAY, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                <LogOut size={15} /> Salir
              </button>
            </div>
          ) : (
            <button onClick={onShowLogin} style={{ background: "none", border: `1.5px solid ${INK}22`, borderRadius: 20, padding: "7px 14px", color: INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              Ingresar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function paqueteTotal(paqueteStr) {
  if (!paqueteStr) return null;
  const m = paqueteStr.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function MiPerfil({ alumno, session, reload }) {
  const [notas, setNotas] = useState(alumno.notas_salud || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const guardar = async () => {
    setBusy(true);
    setErr("");
    setOk(false);
    try {
      await sb(`alumnos?id=eq.${alumno.id}`, { method: "PATCH", token: session.token, body: JSON.stringify({ notas_salud: notas || null }) });
      await reload();
      setOk(true);
    } catch (e) {
      setErr(`No se pudo guardar: ${e.message}`);
    }
    setBusy(false);
  };

  const totalPaquete = paqueteTotal(alumno.paquete);
  const tomadas = totalPaquete != null && alumno.clases_restantes != null ? Math.max(0, totalPaquete - alumno.clases_restantes) : null;
  const hoy = new Date().toISOString().slice(0, 10);
  const vencido = alumno.fecha_vencimiento && alumno.fecha_vencimiento < hoy;

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 500, color: INK, margin: "0 0 8px", letterSpacing: -0.5 }}>Mi perfil</h1>
      <p style={{ fontSize: 14, color: MUTE, margin: "0 0 24px" }}>{alumno.nombre} · {alumno.paquete || "sin paquete"}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20, maxWidth: 660 }}>
        <div style={{ background: STONE, borderRadius: 16, boxShadow: SHADOW_SM, padding: 18 }}>
          <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>Progreso del paquete</p>
          {tomadas != null ? (
            <p style={{ fontSize: 18, color: INK, fontWeight: 700, margin: 0, fontFamily: FONT_DISPLAY }}>
              Clase Nº {tomadas + 1} de {totalPaquete}
            </p>
          ) : (
            <p style={{ fontSize: 18, color: INK, fontWeight: 700, margin: 0, fontFamily: FONT_DISPLAY }}>
              {alumno.clases_restantes ?? "—"} clases restantes
            </p>
          )}
        </div>
        <div style={{ background: STONE, borderRadius: 16, boxShadow: SHADOW_SM, padding: 18 }}>
          <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>Pago</p>
          <p style={{ fontSize: 13.5, color: INK, margin: "0 0 2px" }}>{alumno.fecha_pago ? `Pagado el ${alumno.fecha_pago}` : "Sin fecha de pago cargada"}</p>
          <p style={{ fontSize: 13.5, color: vencido ? CLAY : MUTE, fontWeight: vencido ? 700 : 400, margin: 0 }}>
            {alumno.fecha_vencimiento ? `${vencido ? "Venció" : "Vence"} el ${alumno.fecha_vencimiento}` : "Sin vencimiento cargado"}
          </p>
        </div>
      </div>

      <div style={{ background: STONE, borderRadius: 18, boxShadow: SHADOW_SM, padding: 22, maxWidth: 480 }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 18, margin: "0 0 8px", color: INK }}>Lesiones y salud</h3>
        <p style={{ fontSize: 12.5, color: MUTE, margin: "0 0 12px" }}>
          Contale al estudio si tenés alguna lesión, contraindicación, embarazo o cirugía reciente — así la clase se adapta a vos.
        </p>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          placeholder="Ej: dolor lumbar crónico, cirugía de rodilla en 2024..."
          style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK, resize: "vertical", marginBottom: 10 }}
        />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
        {ok && <p style={{ color: MOSS_DARK, fontSize: 12.5, margin: "0 0 8px" }}>Guardado.</p>}
        <button onClick={guardar} disabled={busy} style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function formatFechaCal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Calendario({ fechasConClases, fechasReservadas, fechaSeleccionada, onSelect }) {
  const inicial = fechaSeleccionada ? new Date(`${fechaSeleccionada}T00:00:00`) : new Date();
  const [mesVisible, setMesVisible] = useState(new Date(inicial.getFullYear(), inicial.getMonth(), 1));

  const nombreMes = mesVisible.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const primerDiaSemana = mesVisible.getDay();
  const offset = (primerDiaSemana + 6) % 7; // semana arranca en lunes
  const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const hoy = formatFechaCal(new Date());

  return (
    <div style={{ background: STONE, borderRadius: 18, boxShadow: SHADOW_SM, padding: 18, marginBottom: 22, maxWidth: 320, fontFamily: FONT_BODY }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ChevronLeft size={18} color={INK} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, textTransform: "capitalize" }}>{nombreMes}</span>
        <button onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transform: "rotate(180deg)" }}>
          <ChevronLeft size={18} color={INK} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10.5, color: MUTE, fontWeight: 700 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {celdas.map((d, i) => {
          if (d === null) return <div key={i} />;
          const fechaStr = formatFechaCal(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), d));
          const tieneClases = fechasConClases.has(fechaStr);
          const reservada = fechasReservadas && fechasReservadas.has(fechaStr);
          const esSeleccionado = fechaStr === fechaSeleccionada;
          const esHoy = fechaStr === hoy;
          return (
            <button
              key={i}
              onClick={() => onSelect(fechaStr)}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                border: esHoy && !esSeleccionado ? `1.5px solid ${MOSS}` : "none",
                background: esSeleccionado ? MOSS_DARK : reservada ? `${MOSS}2e` : "transparent",
                color: esSeleccionado ? STONE : reservada ? MOSS_DARK : INK,
                fontSize: 12.5,
                fontWeight: esSeleccionado || reservada ? 700 : 500,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                fontFamily: FONT_BODY,
                padding: 0,
              }}
            >
              {d}
              {tieneClases && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: esSeleccionado ? STONE : reservada ? MOSS_DARK : CLAY, position: "absolute", bottom: 5 }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: MUTE }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: CLAY, display: "inline-block" }} /> con clases
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: MOSS_DARK, display: "inline-block" }} /> reservado
        </span>
      </div>
    </div>
  );
}

function MoverReservaForm({ claseOrigen, clases, alumnoActual, onClose, onMoved }) {
  const [fecha, setFecha] = useState(claseOrigen.fecha);
  const [nuevaClaseId, setNuevaClaseId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const opciones = clases.filter((c) => c.fecha === fecha && c.id !== claseOrigen.id && c.cupos_ocupados < c.cupos_totales);

  const confirmar = async () => {
    if (!nuevaClaseId) {
      setErr("Elegí un horario disponible.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const reservaVieja = claseOrigen._misReservas[0].id;
      await sb(`reservas?id=eq.${reservaVieja}`, { method: "DELETE" });
      await sb("reservas", { method: "POST", body: JSON.stringify({ alumno_id: alumnoActual.id, clase_id: nuevaClaseId }) });
      await onMoved();
      onClose();
    } catch (e) {
      setErr(`No se pudo mover la reserva: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontFamily: FONT_BODY, padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ background: STONE, width: 360, maxWidth: "100%", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Cambiar de horario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 16px" }}>
          Reserva actual: {claseOrigen.nombre} · {claseOrigen.fecha} {claseOrigen.hora?.slice(0, 5)}
        </p>

        <Calendario
          fechasConClases={new Set(clases.filter((c) => c.id !== claseOrigen.id && c.cupos_ocupados < c.cupos_totales).map((c) => c.fecha))}
          fechasReservadas={new Set()}
          fechaSeleccionada={fecha}
          onSelect={(f) => {
            setFecha(f);
            setNuevaClaseId(null);
          }}
        />

        <p style={{ fontSize: 12.5, color: MUTE, margin: "0 0 8px", fontWeight: 600 }}>Horarios disponibles ese día</p>
        {opciones.length === 0 ? (
          <p style={{ fontSize: 13, color: MUTE, marginBottom: 14 }}>No hay horarios libres ese día. Elegí otro día en el calendario.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {opciones.map((c) => {
              const libres = c.cupos_totales - c.cupos_ocupados;
              const elegido = nuevaClaseId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setNuevaClaseId(c.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: elegido ? `1.5px solid ${MOSS}` : `1.5px solid ${MUTE}33`,
                    background: elegido ? `${MOSS}1c` : "transparent",
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>{c.hora?.slice(0, 5)} · {c.nombre}</span>
                  <span style={{ fontSize: 11.5, color: MUTE }}>{libres} libres</span>
                </button>
              );
            })}
          </div>
        )}

        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button
          onClick={confirmar}
          disabled={busy || !nuevaClaseId}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: nuevaClaseId ? `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})` : MUTE, color: STONE, fontSize: 14, fontWeight: 600, cursor: nuevaClaseId ? "pointer" : "default", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}
        >
          {busy ? "Moviendo..." : "Confirmar cambio"}
        </button>
      </div>
    </div>
  );
}

function ClienteView({ clases, alumnoActual, session, isAdmin, onGoAdmin, onNeedLogin, onGoHome, reload, error }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [accionError, setAccionError] = useState("");
  const [tab, setTab] = useState("clases");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(formatFechaCal(new Date()));
  const [moverClase, setMoverClase] = useState(null);

  useEffect(() => {
    if (selected && clases) {
      const fresh = clases.find((x) => x.id === selected.id);
      if (fresh) setSelected(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clases]);

  if (!clases) {
    return <p style={{ fontSize: 14, color: MUTE, fontFamily: FONT_BODY }}>Cargando clases...</p>;
  }

  if (!session) {
    return (
      <div style={{ fontFamily: FONT_BODY, textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 500, color: INK, margin: "0 0 12px" }}>Iniciá sesión para ver tus clases</h1>
        <p style={{ fontSize: 14, color: MUTE, margin: "0 0 24px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
          Los horarios y las reservas están disponibles solo para alumnos con acceso a la app.
        </p>
        <button
          onClick={onNeedLogin}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 30, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, boxShadow: SHADOW_SM, marginBottom: 14 }}
        >
          Ingresar
        </button>
        <div>
          <button
            onClick={onGoHome}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}
          >
            <ChevronLeft size={14} /> Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const reservar = async (c) => {
    if (!session) return onNeedLogin();
    if (!alumnoActual) return;
    setBusy(true);
    setAccionError("");
    try {
      await sb("reservas", { method: "POST", body: JSON.stringify({ alumno_id: alumnoActual.id, clase_id: c.id }) });
      if (c._esperaId) {
        await sb(`espera?id=eq.${c._esperaId}`, { method: "DELETE" });
      }
      await reload();
    } catch (e) {
      setAccionError(`No se pudo reservar: ${e.message}`);
      console.error(e);
    }
    setBusy(false);
  };

  const cancelar = async (c) => {
    if (!alumnoActual) return;
    setBusy(true);
    setAccionError("");
    try {
      const reservaId = c._misReservas[0].id;
      await sb(`reservas?id=eq.${reservaId}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setAccionError(`No se pudo cancelar: ${e.message}`);
      console.error(e);
    }
    setBusy(false);
  };

  const anotarseEspera = async (c) => {
    if (!session) return onNeedLogin();
    if (!alumnoActual) return;
    setBusy(true);
    setAccionError("");
    try {
      await sb("espera", { method: "POST", body: JSON.stringify({ alumno_id: alumnoActual.id, clase_id: c.id }) });
      await reload();
    } catch (e) {
      setAccionError(`No se pudo anotar en la lista de espera: ${e.message}`);
    }
    setBusy(false);
  };

  const salirEspera = async (c) => {
    setBusy(true);
    setAccionError("");
    try {
      await sb(`espera?id=eq.${c._esperaId}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setAccionError(`No se pudo sacar de la lista de espera: ${e.message}`);
    }
    setBusy(false);
  };

  const avisos = clases.filter((c) => c._enEspera && c.cupos_totales - c.cupos_ocupados > 0);

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      {isAdmin && (
        <button
          onClick={onGoAdmin}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1.5px solid ${INK}22`, borderRadius: 20, padding: "7px 14px", color: INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, marginBottom: 18 }}
        >
          <ChevronLeft size={15} /> Volver al panel admin
        </button>
      )}
      <p style={{ fontSize: 14, color: MUTE, margin: "0 0 2px", fontWeight: 500 }}>
        {alumnoActual ? `Hola, ${alumnoActual.nombre.split(" ")[0]}` : "Hola"}
      </p>

      {alumnoActual && (
        <div style={{ display: "flex", gap: 4, background: STONE, padding: 4, borderRadius: 14, width: "fit-content", marginBottom: 20, marginTop: 10 }}>
          {[["clases", "Clases"], ["perfil", "Mi perfil"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: tab === key ? MOSS_DARK : "transparent", color: tab === key ? STONE : MUTE, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {alumnoActual && tab === "perfil" ? (
        <MiPerfil alumno={alumnoActual} session={session} reload={reload} />
      ) : (
        <>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 500, color: INK, margin: "0 0 28px", letterSpacing: -0.5 }}>Clases disponibles</h1>

      <ErrorBanner msg={error} />
      <ErrorBanner msg={accionError} />
      {session && !alumnoActual && (
        <ErrorBanner msg="Tu email no está vinculado a ningún alumno todavía. Contactá al estudio para que lo vinculen." />
      )}

      {avisos.length > 0 && (
        <div style={{ background: `${MOSS}22`, border: `1.5px solid ${MOSS}`, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: MOSS_DARK, margin: "0 0 8px" }}>¡Se liberó un lugar en algo que esperabas!</p>
          {avisos.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <span style={{ fontSize: 13, color: INK }}>{c.nombre} · {c.fecha} {c.hora?.slice(0, 5)}</span>
              <button onClick={() => reservar(c)} disabled={busy} style={{ background: MOSS_DARK, color: STONE, border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                Reservar ahora
              </button>
            </div>
          ))}
        </div>
      )}

      {clases.length === 0 && <p style={{ fontSize: 14, color: MUTE }}>Todavía no hay clases cargadas. Agregalas desde el panel admin.</p>}

      {clases.length > 0 && (
        <Calendario
          fechasConClases={new Set(clases.map((c) => c.fecha))}
          fechasReservadas={new Set(clases.filter((c) => c._misReservas && c._misReservas.length > 0).map((c) => c.fecha))}
          fechaSeleccionada={fechaSeleccionada}
          onSelect={setFechaSeleccionada}
        />
      )}

      {clases.length > 0 && clases.filter((c) => c.fecha === fechaSeleccionada).length === 0 && (
        <p style={{ fontSize: 14, color: MUTE, marginBottom: 18 }}>No hay clases cargadas para ese día. Elegí otro día en el calendario.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
        {clases.filter((c) => c.fecha === fechaSeleccionada).map((c) => {
          const libres = c.cupos_totales - c.cupos_ocupados;
          const reservada = c._misReservas && c._misReservas.length > 0;
          const abierta = selected && selected.id === c.id;
          return (
            <div key={c.id} style={{ background: STONE, borderRadius: 20, boxShadow: SHADOW_SM, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, color: MUTE, fontWeight: 600 }}>{c.fecha} · {c.hora?.slice(0, 5)}</div>
                  <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 500, margin: "4px 0 0", color: INK }}>{c.nombre}</h3>
                  <p style={{ fontSize: 13, color: MUTE, margin: "4px 0 0" }}>con {c.instructor}</p>
                </div>
                {reservada && (
                  <span style={{ fontSize: 10.5, color: MOSS_DARK, background: `${MOSS}1c`, padding: "4px 9px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>Reservada</span>
                )}
                {!reservada && c._enEspera && (
                  <span style={{ fontSize: 10.5, color: "#7A2E14", background: CLAY_LIGHT, padding: "4px 9px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>En espera</span>
                )}
              </div>

              <button onClick={() => setSelected(abierta ? null : c)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: MOSS_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: FONT_BODY }}>
                {abierta ? "Ocultar cupos ↑" : `${libres === 0 ? "Completo" : `${libres} lugares libres`} — ver camas ↓`}
              </button>

              {abierta && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, maxWidth: 280 }}>
                  {Array.from({ length: c.cupos_totales }).map((_, i) => (
                    <Spot key={i} taken={i < c.cupos_ocupados} />
                  ))}
                </div>
              )}

              {reservada ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setMoverClase(c)} disabled={busy} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1.5px solid ${MOSS}`, background: "transparent", color: MOSS_DARK, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                    Cambiar horario
                  </button>
                  <button onClick={() => cancelar(c)} disabled={busy} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1.5px solid ${CLAY}`, background: "transparent", color: CLAY, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                    {busy ? "..." : "Cancelar"}
                  </button>
                </div>
              ) : libres === 0 ? (
                <button
                  onClick={() => (c._enEspera ? salirEspera(c) : anotarseEspera(c))}
                  disabled={busy}
                  style={{
                    padding: "11px 0",
                    borderRadius: 12,
                    border: `1.5px solid ${c._enEspera ? CLAY : MOSS}`,
                    background: c._enEspera ? CLAY_LIGHT : "transparent",
                    color: c._enEspera ? "#7A2E14" : MOSS_DARK,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                  }}
                >
                  {busy ? "..." : c._enEspera ? "Salir de la lista de espera" : "Avisarme si se libera"}
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => reservar(c)}
                  style={{
                    padding: "11px 0",
                    borderRadius: 12,
                    border: "none",
                    background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`,
                    color: STONE,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: SHADOW_SM,
                    fontFamily: FONT_BODY,
                  }}
                >
                  {busy ? "..." : session ? "Reservar clase" : "Iniciá sesión para reservar"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}

      {moverClase && (
        <MoverReservaForm
          claseOrigen={moverClase}
          clases={clases}
          alumnoActual={alumnoActual}
          onClose={() => setMoverClase(null)}
          onMoved={reload}
        />
      )}
    </div>
  );
}

const MAX_CAMAS_REFORMER = 3; // el estudio tiene 3 camas de reformer

const DIAS_SEMANA = [
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
];

function rangoHorarioPermitido(diaSemana) {
  // diaSemana: 0=domingo ... 6=sábado (Date.getDay())
  if (diaSemana === 0) return null; // cerrado los domingos
  if (diaSemana === 6) return { desde: "09:00", hasta: "13:00" };
  return { desde: "08:00", hasta: "21:00" };
}

function formatFecha(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function proximasFechas(diaSemana, cantidad) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== diaSemana) d.setDate(d.getDate() + 1);
  const fechas = [];
  for (let i = 0; i < cantidad; i++) {
    fechas.push(formatFecha(d));
    d.setDate(d.getDate() + 7);
  }
  return fechas;
}

function NuevaClaseForm({ onClose, onCreated, token, alumnos }) {
  const [form, setForm] = useState({ nombre: "", instructor: "", fecha: "", hora: "", cupos_totales: MAX_CAMAS_REFORMER });
  const [recurrente, setRecurrente] = useState(false);
  const [diaSemana, setDiaSemana] = useState(1);
  const [semanas, setSemanas] = useState(8);
  const [alumnosElegidos, setAlumnosElegidos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const toggleAlumno = (id) => {
    setAlumnosElegidos((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= Number(form.cupos_totales)) return prev; // no superar los cupos
      return [...prev, id];
    });
  };

  const submit = async () => {
    if (!form.nombre || !form.hora) {
      setErr("Completá nombre y hora.");
      return;
    }
    if (!recurrente && !form.fecha) {
      setErr("Completá la fecha.");
      return;
    }
    if (Number(form.cupos_totales) > MAX_CAMAS_REFORMER) {
      setErr(`El estudio tiene ${MAX_CAMAS_REFORMER} camas de reformer — no se pueden cargar más cupos que eso.`);
      return;
    }

    const diaParaValidar = recurrente ? diaSemana : new Date(`${form.fecha}T00:00:00`).getDay();
    const rango = rangoHorarioPermitido(diaParaValidar);
    if (!rango) {
      setErr("El estudio no abre los domingos.");
      return;
    }
    if (form.hora < rango.desde || form.hora > rango.hasta) {
      setErr(`Ese día el estudio atiende de ${rango.desde} a ${rango.hasta} hs.`);
      return;
    }

    setBusy(true);
    setErr("");
    try {
      if (recurrente) {
        const fechas = proximasFechas(diaSemana, Number(semanas));
        const filas = fechas.map((fecha) => ({
          nombre: form.nombre,
          instructor: form.instructor,
          fecha,
          hora: form.hora,
          cupos_totales: Number(form.cupos_totales),
          cupos_ocupados: 0,
        }));
        await sb("clases", { method: "POST", token, body: JSON.stringify(filas) });
      } else {
        const creadas = await sb("clases", { method: "POST", token, body: JSON.stringify({ ...form, cupos_totales: Number(form.cupos_totales), cupos_ocupados: 0 }) });
        const nuevaClaseId = creadas && creadas[0] && creadas[0].id;
        if (nuevaClaseId && alumnosElegidos.length > 0) {
          const filasReserva = alumnosElegidos.map((alumno_id) => ({ alumno_id, clase_id: nuevaClaseId }));
          await sb("reservas", { method: "POST", body: JSON.stringify(filasReserva) });
        }
      }
      onCreated();
      onClose();
    } catch (e) {
      setErr(`No se pudo crear: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40, overflowY: "auto", padding: "24px 0" }}>
      <div style={{ background: STONE, width: 380, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, margin: 0, color: INK }}>Nueva clase</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: INK, marginBottom: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={recurrente} onChange={(e) => setRecurrente(e.target.checked)} />
          Se repite todas las semanas
        </label>

        {["nombre", "instructor"].map((f) => (
          <input
            key={f}
            placeholder={f === "nombre" ? "Nombre (elegí un alumno o escribí uno nuevo)" : "Instructor"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            list={f === "nombre" ? "lista-alumnos-nombre" : undefined}
            style={inputStyle}
          />
        ))}
        {alumnos && (
          <datalist id="lista-alumnos-nombre">
            {alumnos.map((a) => (
              <option key={a.id} value={a.nombre} />
            ))}
          </datalist>
        )}

        {recurrente ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <select value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value))} style={{ ...inputStyle, flex: 1, marginBottom: 0 }}>
              {DIAS_SEMANA.map((d) => (
                <option key={d.valor} value={d.valor}>{d.nombre}</option>
              ))}
            </select>
            <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          </div>
        )}

        {recurrente && (
          <>
            <input type="number" min="1" max="52" value={semanas} onChange={(e) => setSemanas(e.target.value)} style={{ ...inputStyle, marginBottom: 4 }} />
            <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 14px" }}>Cantidad de semanas a generar (se crea una clase por cada {DIAS_SEMANA.find((d) => d.valor === diaSemana)?.nombre.toLowerCase()}).</p>
          </>
        )}

        <input type="number" min="1" max={MAX_CAMAS_REFORMER} placeholder="Cupos" value={form.cupos_totales} onChange={(e) => setForm({ ...form, cupos_totales: e.target.value })} style={{ ...inputStyle, marginBottom: 4 }} />
        <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 14px" }}>Máximo {MAX_CAMAS_REFORMER} camas disponibles en el estudio.</p>

        {!recurrente && alumnos && alumnos.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12.5, color: INK, fontWeight: 600, margin: "0 0 8px" }}>
              Anotar alumnos ahora ({alumnosElegidos.length}/{form.cupos_totales})
            </p>
            <div style={{ maxHeight: 160, overflowY: "auto", border: `1.5px solid ${MUTE}33`, borderRadius: 12, padding: 8 }}>
              {alumnos.map((a) => {
                const marcado = alumnosElegidos.includes(a.id);
                const deshabilitado = !marcado && alumnosElegidos.length >= Number(form.cupos_totales);
                return (
                  <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", fontSize: 13, color: deshabilitado ? MUTE : INK, cursor: deshabilitado ? "default" : "pointer" }}>
                    <input type="checkbox" checked={marcado} disabled={deshabilitado} onChange={() => toggleAlumno(a.id)} />
                    {a.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Creando..." : recurrente ? `Crear ${semanas} clases` : "Crear clase"}
        </button>
      </div>
    </div>
  );
}

function EditarClaseForm({ clase, onClose, onSaved, token }) {
  const [form, setForm] = useState({
    nombre: clase.nombre || "",
    instructor: clase.instructor || "",
    fecha: clase.fecha || "",
    hora: clase.hora ? clase.hora.slice(0, 5) : "",
    cupos_totales: clase.cupos_totales,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const guardar = async () => {
    if (!form.nombre || !form.fecha || !form.hora) {
      setErr("Completá nombre, fecha y hora.");
      return;
    }
    if (Number(form.cupos_totales) > MAX_CAMAS_REFORMER) {
      setErr(`El estudio tiene ${MAX_CAMAS_REFORMER} camas de reformer — no se pueden cargar más cupos que eso.`);
      return;
    }
    if (Number(form.cupos_totales) < clase.cupos_ocupados) {
      setErr(`Ya hay ${clase.cupos_ocupados} reservas hechas — no podés poner menos cupos que eso.`);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await sb(`clases?id=eq.${clase.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ ...form, cupos_totales: Number(form.cupos_totales) }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(`No se pudo guardar: ${e.message}`);
    }
    setBusy(false);
  };

  const borrar = async () => {
    if (!window.confirm("¿Seguro que querés borrar esta clase? También se van a borrar las reservas hechas para ella.")) return;
    setBusy(true);
    setErr("");
    try {
      await sb(`reservas?clase_id=eq.${clase.id}`, { method: "DELETE", token });
      await sb(`clases?id=eq.${clase.id}`, { method: "DELETE", token });
      onSaved();
      onClose();
    } catch (e) {
      setErr(`No se pudo borrar: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40 }}>
      <div style={{ background: STONE, width: 380, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, margin: 0, color: INK }}>Editar clase</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        {["nombre", "instructor"].map((f) => (
          <input key={f} placeholder={f === "nombre" ? "Nombre (ej. Reformer Nivel 1)" : "Instructor"} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} style={inputStyle} />
        ))}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
        </div>
        <input type="number" min="1" max={MAX_CAMAS_REFORMER} placeholder="Cupos" value={form.cupos_totales} onChange={(e) => setForm({ ...form, cupos_totales: e.target.value })} style={{ ...inputStyle, marginBottom: 4 }} />
        <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 14px" }}>
          Máximo {MAX_CAMAS_REFORMER} camas · ya tiene {clase.cupos_ocupados} {clase.cupos_ocupados === 1 ? "reserva" : "reservas"} hecha{clase.cupos_ocupados === 1 ? "" : "s"}.
        </p>
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button onClick={guardar} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY, marginBottom: 10 }}>
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>
        <button onClick={borrar} disabled={busy} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: `1.5px solid ${CLAY}`, background: "transparent", color: CLAY, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
          Borrar clase
        </button>
      </div>
    </div>
  );
}

function DarAccesoForm({ alumno, onClose, onDone, token }) {
  const [email, setEmail] = useState(alumno.email || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const submit = async () => {
    if (!email || !password) {
      setErr("Completá email y contraseña.");
      return;
    }
    if (password.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if ((data.msg || data.message || "").toLowerCase().includes("already")) {
          setErr("Ese email ya tiene una cuenta creada. Igual lo vinculamos al alumno.");
        } else {
          throw new Error(data.msg || data.message || "error desconocido");
        }
      }
      await sb(`alumnos?id=eq.${alumno.id}`, { method: "PATCH", token, body: JSON.stringify({ email }) });
      setOk(true);
      onDone();
    } catch (e) {
      setErr(`No se pudo dar de alta: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: STONE, width: 340, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Dar acceso</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 16px" }}>{alumno.nombre}</p>
        {ok ? (
          <p style={{ fontSize: 14, color: MOSS_DARK, margin: 0 }}>Listo, ya puede ingresar con ese email y contraseña.</p>
        ) : (
          <>
            <input placeholder="Email del alumno" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input placeholder="Contraseña inicial" type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <p style={{ fontSize: 11.5, color: MUTE, margin: "-4px 0 14px" }}>Pasásela vos al alumno — después la puede cambiar desde "Cambiar contraseña".</p>
            {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
            <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
              {busy ? "Creando..." : "Dar acceso"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NuevoAlumnoForm({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ nombre: "", paquete: "", clases_restantes: "", notas_salud: "", fecha_pago: "", fecha_vencimiento: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const submit = async () => {
    if (!form.nombre) {
      setErr("Completá al menos el nombre.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await sb("alumnos", {
        method: "POST",
        token,
        body: JSON.stringify({
          nombre: form.nombre,
          paquete: form.paquete || null,
          clases_restantes: form.clases_restantes === "" ? null : Number(form.clases_restantes),
          notas_salud: form.notas_salud || null,
          fecha_pago: form.fecha_pago || null,
          fecha_vencimiento: form.fecha_vencimiento || null,
        }),
      });
      onCreated();
      onClose();
    } catch (e) {
      setErr(`No se pudo crear: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px 0", overflowY: "auto" }}>
      <div style={{ background: STONE, width: 340, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Nuevo alumno</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <input placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
        <input placeholder="Paquete (ej. 8 clases)" value={form.paquete} onChange={(e) => setForm({ ...form, paquete: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Clases restantes" value={form.clases_restantes} onChange={(e) => setForm({ ...form, clases_restantes: e.target.value })} style={inputStyle} />
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: MUTE, marginBottom: 4, display: "block" }}>Fecha de pago</label>
            <input type="date" value={form.fecha_pago} onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: MUTE, marginBottom: 4, display: "block" }}>Vence</label>
            <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
        </div>
        <textarea placeholder="Lesiones, contraindicaciones, embarazo, cirugías (opcional)" value={form.notas_salud} onChange={(e) => setForm({ ...form, notas_salud: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <p style={{ fontSize: 11.5, color: MUTE, margin: "-4px 0 14px" }}>Después podés darle acceso a la app desde el botón "Dar acceso" en su fila.</p>
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Creando..." : "Crear alumno"}
        </button>
      </div>
    </div>
  );
}

function EditarAlumnoForm({ alumno, onClose, onSaved, token }) {
  const [form, setForm] = useState({
    nombre: alumno.nombre || "",
    paquete: alumno.paquete || "",
    clases_restantes: alumno.clases_restantes ?? "",
    notas_salud: alumno.notas_salud || "",
    fecha_pago: alumno.fecha_pago || "",
    fecha_vencimiento: alumno.fecha_vencimiento || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const guardar = async () => {
    if (!form.nombre) {
      setErr("El nombre no puede quedar vacío.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await sb(`alumnos?id=eq.${alumno.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          nombre: form.nombre,
          paquete: form.paquete || null,
          clases_restantes: form.clases_restantes === "" ? null : Number(form.clases_restantes),
          notas_salud: form.notas_salud || null,
          fecha_pago: form.fecha_pago || null,
          fecha_vencimiento: form.fecha_vencimiento || null,
        }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(`No se pudo guardar: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px 0", overflowY: "auto" }}>
      <div style={{ background: STONE, width: 340, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Editar alumno</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <input placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
        <input placeholder="Paquete (ej. 8 clases)" value={form.paquete} onChange={(e) => setForm({ ...form, paquete: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Clases restantes" value={form.clases_restantes} onChange={(e) => setForm({ ...form, clases_restantes: e.target.value })} style={inputStyle} />
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: MUTE, marginBottom: 4, display: "block" }}>Fecha de pago</label>
            <input type="date" value={form.fecha_pago} onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: MUTE, marginBottom: 4, display: "block" }}>Vence</label>
            <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
        </div>
        <textarea placeholder="Lesiones, contraindicaciones, embarazo, cirugías" value={form.notas_salud} onChange={(e) => setForm({ ...form, notas_salud: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button onClick={guardar} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function AdminView({ clases, alumnos, reload, token }) {
  const [tab, setTab] = useState("clases");
  const [showForm, setShowForm] = useState(false);
  const [showAlumnoForm, setShowAlumnoForm] = useState(false);
  const [accesoAlumno, setAccesoAlumno] = useState(null);
  const [editarClase, setEditarClase] = useState(null);
  const [editarAlumno, setEditarAlumno] = useState(null);

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ fontSize: 13, color: MUTE, margin: "0 0 2px", fontWeight: 500 }}>RYM Pilates — panel</p>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 500, color: INK, margin: 0, letterSpacing: -0.5 }}>{tab === "clases" ? "Clases" : "Alumnos"}</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: BG, padding: 4, borderRadius: 14 }}>
            {[["clases", "Clases"], ["alumnos", "Alumnos"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: tab === key ? MOSS_DARK : "transparent", color: tab === key ? STONE : MUTE, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                {label}
              </button>
            ))}
          </div>
          {tab === "clases" && (
            <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_SM, fontFamily: FONT_BODY }}>
              <Plus size={16} /> Nueva clase
            </button>
          )}
          {tab === "alumnos" && (
            <button onClick={() => setShowAlumnoForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_SM, fontFamily: FONT_BODY }}>
              <Plus size={16} /> Nuevo alumno
            </button>
          )}
        </div>
      </div>

      {tab === "clases" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(clases || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setEditarClase(c)}
              style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 20px", borderRadius: 16, background: STONE, boxShadow: SHADOW_SM, border: "none", cursor: "pointer", textAlign: "left", fontFamily: FONT_BODY, width: "100%" }}
            >
              <div style={{ width: 90, fontSize: 12.5, color: MUTE, fontWeight: 500 }}>{c.fecha}</div>
              <div style={{ width: 54, fontSize: 15, fontWeight: 700, color: INK }}>{c.hora?.slice(0, 5)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: INK, fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{c.instructor}</div>
              </div>
              <div style={{ fontSize: 12, color: c.cupos_ocupados === c.cupos_totales ? CLAY : MOSS_DARK, fontWeight: 700, background: c.cupos_ocupados === c.cupos_totales ? CLAY_LIGHT : `${MOSS}1c`, padding: "5px 11px", borderRadius: 10 }}>
                {c.cupos_ocupados}/{c.cupos_totales}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ background: STONE, borderRadius: 18, boxShadow: SHADOW_SM, overflow: "hidden" }}>
          {(alumnos || []).map((a, i) => (
            <div
              key={a.id}
              onClick={() => setEditarAlumno(a)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${MUTE}22`, cursor: "pointer" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${CLAY_LIGHT}, #fff)`, color: CLAY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {a.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, color: INK, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {a.nombre}
                  {a.notas_salud && (
                    <span title={a.notas_salud} style={{ fontSize: 10, color: CLAY, background: CLAY_LIGHT, padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>salud</span>
                  )}
                  {a.fecha_vencimiento && a.fecha_vencimiento < formatFechaCal(new Date()) && (
                    <span style={{ fontSize: 10, color: "#7A2E14", background: CLAY_LIGHT, padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>vencido</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>
                  {a.paquete || "sin paquete"}{a.email ? ` · ${a.email}` : ""}{a.fecha_vencimiento ? ` · vence ${a.fecha_vencimiento}` : ""}
                </div>
              </div>
              <div style={{ fontSize: 13, color: MOSS_DARK, fontWeight: 700 }}>{a.clases_restantes ?? "—"}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAccesoAlumno(a);
                }}
                style={{ background: "none", border: `1.5px solid ${INK}22`, borderRadius: 20, padding: "6px 12px", color: INK, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, flexShrink: 0 }}
              >
                {a.email ? "Cambiar acceso" : "Dar acceso"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && <NuevaClaseForm onClose={() => setShowForm(false)} onCreated={reload} token={token} alumnos={alumnos} />}
      {showAlumnoForm && <NuevoAlumnoForm onClose={() => setShowAlumnoForm(false)} onCreated={reload} token={token} />}
      {accesoAlumno && <DarAccesoForm alumno={accesoAlumno} onClose={() => setAccesoAlumno(null)} onDone={reload} token={token} />}
      {editarClase && <EditarClaseForm clase={editarClase} onClose={() => setEditarClase(null)} onSaved={reload} token={token} />}
      {editarAlumno && <EditarAlumnoForm alumno={editarAlumno} onClose={() => setEditarAlumno(null)} onSaved={reload} token={token} />}
    </div>
  );
}

function CambiarPassword({ session, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async () => {
    if (password.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setOk(true);
    } catch (e) {
      setErr("No se pudo cambiar la contraseña. Puede que haga falta volver a iniciar sesión.");
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontFamily: FONT_BODY }}>
      <div style={{ background: STONE, width: 320, borderRadius: 22, padding: 24, boxShadow: SHADOW_LG }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Cambiar contraseña</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        {ok ? (
          <p style={{ fontSize: 14, color: MOSS_DARK, margin: "0 0 4px" }}>Listo, tu contraseña se actualizó. Usala la próxima vez que ingreses.</p>
        ) : (
          <>
            <input placeholder="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 9, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
            <input placeholder="Repetí la contraseña" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
            {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
            <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
              {busy ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Login({ onClose, onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !password) {
      setErr("Completá email y contraseña.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr("Email o contraseña incorrectos.");
        setBusy(false);
        return;
      }
      onLoggedIn(data.access_token, data.user?.email || email);
      onClose();
    } catch (e) {
      setErr("No se pudo conectar.");
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontFamily: FONT_BODY }}>
      <div style={{ background: STONE, width: 320, borderRadius: 22, padding: 24, boxShadow: SHADOW_LG }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Ingresar</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} style={{ width: "100%", padding: 12, marginBottom: 9, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Entrando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

function Landing({ onEnter, onLogin }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: FONT_BODY,
        color: INK,
        backgroundColor: "#100F0E",
        backgroundImage: `
          radial-gradient(circle at 12% 8%, ${MOSS_LIGHT}55, transparent 42%),
          radial-gradient(circle at 88% 0%, ${CLAY}44, transparent 40%),
          radial-gradient(circle at 50% 70%, ${MOSS_DARK}44, transparent 55%),
          linear-gradient(180deg, #171613 0%, #100F0E 100%)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      <div style={{ position: "relative", padding: "70px 24px 100px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/logo.png" alt="RYM Pilates" style={{ width: 140, height: 140, borderRadius: 28, boxShadow: SHADOW_LG, marginBottom: 26, objectFit: "cover" }} />
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#D8CBB0", margin: "0 0 18px" }}>Estudio de Reformer Pilates</p>
          <p style={{ fontSize: 17, color: "#C9C2B4", maxWidth: 460, lineHeight: 1.6, margin: "0 0 34px" }}>
            Movimiento consciente, control y respiración sobre la cama de reformer. Clases reducidas, seguimiento personalizado.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => onLogin("cliente")} style={{ ...pill, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, boxShadow: SHADOW_MD }}>
              Acceso cliente <ArrowRight size={16} />
            </button>
            <button onClick={() => onLogin("admin")} style={{ ...pill, border: "1.5px solid #ffffff33", background: "#ffffff0d", color: "#F2EEE4" }}>
              Acceso admin
            </button>
            <a href={STUDIO_WHATSAPP} target="_blank" rel="noreferrer" style={{ ...pill, border: "1.5px solid #ffffff33", background: "#ffffff0d", color: "#F2EEE4" }}>
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "10px 24px 70px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {[
          ["Grupos reducidos", "Máximo de alumnos por clase para que cada ejercicio se corrija en el momento."],
          ["Nivel por alumno", "Progresás a tu ritmo: principiante, intermedio o avanzado, todo sobre la misma máquina."],
          ["Reservá desde acá", "Elegís horario y cama de reformer disponible al instante, sin llamadas ni mensajes."],
        ].map(([title, desc]) => (
          <div key={title} style={{ background: "#ffffff0d", border: "1px solid #ffffff1a", borderRadius: 18, padding: 22, backdropFilter: "blur(6px)" }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, margin: "0 0 8px", color: "#F2EEE4" }}>{title}</h3>
            <p style={{ fontSize: 14, color: "#C9C2B4", lineHeight: 1.6, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto 70px", padding: "0 24px" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 26, margin: "0 0 22px", color: "#F2EEE4", textAlign: "center" }}>Planes</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {PLANES.map((p, i) => (
            <div
              key={p.veces}
              style={{
                background: i === 1 ? `linear-gradient(160deg, ${MOSS_LIGHT}, ${MOSS_DARK})` : "#ffffff0d",
                border: i === 1 ? "none" : "1px solid #ffffff1a",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
                boxShadow: i === 1 ? SHADOW_MD : "none",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: i === 1 ? "#E7EFE6" : "#C9C2B4", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>{p.veces}</p>
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 500, color: i === 1 ? STONE : "#F2EEE4", margin: 0 }}>{p.precio}</p>
              <p style={{ fontSize: 12, color: i === 1 ? "#DCE5DA" : MUTE, margin: "6px 0 0" }}>por mes</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto 70px", padding: "0 24px" }}>
        <div style={{ background: STONE, borderRadius: 28, boxShadow: SHADOW_LG, padding: "44px 36px", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 340 }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, margin: "0 0 12px", color: INK }}>Dónde estamos</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: MUTE, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              <MapPin size={17} color={CLAY} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{STUDIO_ADDRESS}</span>
            </div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, margin: "0 0 12px", color: INK }}>Horarios</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {STUDIO_HOURS.map((h) => (
                <div key={h.dias} style={{ display: "flex", gap: 8, alignItems: "flex-start", color: MUTE, fontSize: 14, lineHeight: 1.6 }}>
                  <Clock size={17} color={CLAY} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{h.dias}: {h.horario}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, margin: "0 0 12px", color: INK }}>Seguinos</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <a href={STUDIO_INSTAGRAM} target="_blank" rel="noreferrer" style={{ ...pill, border: `1.5px solid ${INK}22`, background: "transparent", color: INK, padding: "9px 16px" }}>
                <Instagram size={16} /> Instagram
              </a>
              <a href={STUDIO_WHATSAPP} target="_blank" rel="noreferrer" style={{ ...pill, border: `1.5px solid ${INK}22`, background: "transparent", color: INK, padding: "9px 16px" }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 24px 80px", textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 30, margin: "0 0 20px", color: "#F2EEE4" }}>¿Lista para tu próxima clase?</h2>
        <button onClick={onEnter} style={{ ...pill, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, boxShadow: SHADOW_MD, padding: "13px 26px", fontSize: 14.5 }}>
          Ver horarios y reservar <ArrowRight size={16} />
        </button>
        <p style={{ marginTop: 40, fontSize: 12, color: "#8A8478" }}>RYM Pilates</p>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("cliente");
  const [clasesRaw, setClasesRaw] = useState(null);
  const [alumnos, setAlumnos] = useState(null);
  const [misReservas, setMisReservas] = useState([]);
  const [miEspera, setMiEspera] = useState([]);
  const [alumnoActual, setAlumnoActual] = useState(null);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [session, setSession] = useState(null); // { token, email }
  const [entered, setEntered] = useState(false);

  const isAdmin = !!session && session.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const cargarTodo = useCallback(async () => {
    try {
      setError("");
      const [clasesData, alumnosData] = await Promise.all([
        sb("clases?select=*&order=fecha,hora"),
        sb("alumnos?select=*&order=nombre&limit=200"),
      ]);
      setClasesRaw(clasesData || []);
      setAlumnos(alumnosData || []);
    } catch (e) {
      setError(`No se pudo conectar a Supabase: ${e.message}`);
      console.error(e);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // Cuando cambia la sesión o la lista de alumnos, buscamos qué alumno corresponde a ese email
  useEffect(() => {
    async function resolverAlumno() {
      if (!session || isAdmin || !alumnos) {
        setAlumnoActual(null);
        setMisReservas([]);
        setMiEspera([]);
        return;
      }
      const match = alumnos.find((a) => (a.email || "").trim().toLowerCase() === session.email.trim().toLowerCase());
      setAlumnoActual(match || null);
      if (match) {
        try {
          const [r, esp] = await Promise.all([
            sb(`reservas?alumno_id=eq.${match.id}&select=*`),
            sb(`espera?alumno_id=eq.${match.id}&select=*`),
          ]);
          setMisReservas(r || []);
          setMiEspera(esp || []);
        } catch (e) {
          setMisReservas([]);
          setMiEspera([]);
        }
      } else {
        setMisReservas([]);
        setMiEspera([]);
      }
    }
    resolverAlumno();
  }, [session, alumnos, isAdmin]);

  const clases = clasesRaw
    ? clasesRaw.map((c) => {
        const esperaRow = miEspera.find((e) => e.clase_id === c.id);
        return {
          ...c,
          _misReservas: misReservas.filter((r) => r.clase_id === c.id),
          _enEspera: !!esperaRow,
          _esperaId: esperaRow ? esperaRow.id : null,
        };
      })
    : null;

  if (!entered) {
    return (
      <Landing
        onEnter={() => setEntered(true)}
        onLogin={() => {
          setEntered(true);
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header
        session={session}
        isAdmin={isAdmin}
        mode={mode}
        setMode={setMode}
        onLogout={() => {
          setSession(null);
          setMode("cliente");
        }}
        onShowLogin={() => setShowLogin(true)}
        onShowChangePassword={() => setShowChangePassword(true)}
        onGoHome={() => setEntered(false)}
      />

      <div style={{ ...container, padding: "36px 24px 80px" }}>
        {mode === "admin" && isAdmin ? (
          <AdminView clases={clases} alumnos={alumnos} reload={cargarTodo} token={session.token} />
        ) : (
          <ClienteView clases={clases} alumnoActual={alumnoActual} session={session} isAdmin={isAdmin} onGoAdmin={() => setMode("admin")} onNeedLogin={() => setShowLogin(true)} onGoHome={() => setEntered(false)} reload={cargarTodo} error={error} />
        )}
      </div>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoggedIn={(token, email) => {
            setSession({ token, email });
            setMode(email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "cliente");
          }}
        />
      )}

      {showChangePassword && session && (
        <CambiarPassword session={session} onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
