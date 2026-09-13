import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, LayoutGrid, ChevronLeft, Plus, X, Check, Instagram, MessageCircle, MapPin, ArrowRight, LogOut } from "lucide-react";

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
const STUDIO_WHATSAPP = "https://wa.me/5491161626800";
const STUDIO_INSTAGRAM = "https://instagram.com/rympilates";
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

function Header({ adminToken, mode, setMode, onLogout, onShowLogin, onGoHome }) {
  return (
    <div style={{ background: STONE, boxShadow: SHADOW_SM, position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <button onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <img src="/logo.png" alt="RYM Pilates" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: INK, fontWeight: 500 }}>RYM Pilates</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {adminToken && (
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
          {adminToken ? (
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: CLAY, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              <LogOut size={15} /> Salir
            </button>
          ) : (
            <button onClick={onShowLogin} style={{ background: "none", border: `1.5px solid ${INK}22`, borderRadius: 20, padding: "7px 14px", color: INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              Acceso del estudio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ClienteView({ clases, alumnoDemo, reload, error }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [accionError, setAccionError] = useState("");

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

  const reservar = async (c) => {
    if (!alumnoDemo) return;
    setBusy(true);
    setAccionError("");
    try {
      await sb("reservas", { method: "POST", body: JSON.stringify({ alumno_id: alumnoDemo.id, clase_id: c.id }) });
      await reload();
    } catch (e) {
      setAccionError(`No se pudo reservar: ${e.message}`);
      console.error(e);
    }
    setBusy(false);
  };

  const cancelar = async (c) => {
    if (!alumnoDemo) return;
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

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <p style={{ fontSize: 14, color: MUTE, margin: "0 0 2px", fontWeight: 500 }}>{alumnoDemo ? `Hola, ${alumnoDemo.nombre.split(" ")[0]}` : "Cargando..."}</p>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 500, color: INK, margin: "0 0 28px", letterSpacing: -0.5 }}>Clases disponibles</h1>

      <ErrorBanner msg={error} />
      <ErrorBanner msg={accionError} />

      {clases.length === 0 && <p style={{ fontSize: 14, color: MUTE }}>Todavía no hay clases cargadas. Agregalas desde el panel admin.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
        {clases.map((c) => {
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
                <button onClick={() => cancelar(c)} disabled={busy} style={{ padding: "11px 0", borderRadius: 12, border: `1.5px solid ${CLAY}`, background: "transparent", color: CLAY, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                  {busy ? "..." : "Cancelar reserva"}
                </button>
              ) : (
                <button
                  disabled={libres === 0 || busy}
                  onClick={() => reservar(c)}
                  style={{
                    padding: "11px 0",
                    borderRadius: 12,
                    border: "none",
                    background: libres === 0 ? MUTE : `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`,
                    color: STONE,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: libres === 0 ? "default" : "pointer",
                    boxShadow: libres === 0 ? "none" : SHADOW_SM,
                    fontFamily: FONT_BODY,
                  }}
                >
                  {libres === 0 ? "Sin lugares" : busy ? "..." : "Reservar clase"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MAX_CAMAS_REFORMER = 3; // el estudio tiene 3 camas de reformer

function NuevaClaseForm({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ nombre: "", instructor: "", fecha: "", hora: "", cupos_totales: MAX_CAMAS_REFORMER });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const submit = async () => {
    if (!form.nombre || !form.fecha || !form.hora) {
      setErr("Completá nombre, fecha y hora.");
      return;
    }
    if (Number(form.cupos_totales) > MAX_CAMAS_REFORMER) {
      setErr(`El estudio tiene ${MAX_CAMAS_REFORMER} camas de reformer — no se pueden cargar más cupos que eso.`);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await sb("clases", { method: "POST", token, body: JSON.stringify({ ...form, cupos_totales: Number(form.cupos_totales), cupos_ocupados: 0 }) });
      onCreated();
      onClose();
    } catch (e) {
      setErr("No se pudo crear. Revisá los permisos (RLS) de la tabla clases.");
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40 }}>
      <div style={{ background: STONE, width: 380, maxWidth: "90vw", borderRadius: 22, padding: 24, boxShadow: SHADOW_LG, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, margin: 0, color: INK }}>Nueva clase</h3>
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
        <p style={{ fontSize: 11.5, color: MUTE, margin: "0 0 14px" }}>Máximo {MAX_CAMAS_REFORMER} camas disponibles en el estudio.</p>
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 10px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Creando..." : "Crear clase"}
        </button>
      </div>
    </div>
  );
}

function AdminView({ clases, alumnos, reload, token }) {
  const [tab, setTab] = useState("clases");
  const [showForm, setShowForm] = useState(false);

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
        </div>
      </div>

      {tab === "clases" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(clases || []).map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 20px", borderRadius: 16, background: STONE, boxShadow: SHADOW_SM }}>
              <div style={{ width: 90, fontSize: 12.5, color: MUTE, fontWeight: 500 }}>{c.fecha}</div>
              <div style={{ width: 54, fontSize: 15, fontWeight: 700, color: INK }}>{c.hora?.slice(0, 5)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: INK, fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{c.instructor}</div>
              </div>
              <div style={{ fontSize: 12, color: c.cupos_ocupados === c.cupos_totales ? CLAY : MOSS_DARK, fontWeight: 700, background: c.cupos_ocupados === c.cupos_totales ? CLAY_LIGHT : `${MOSS}1c`, padding: "5px 11px", borderRadius: 10 }}>
                {c.cupos_ocupados}/{c.cupos_totales}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: STONE, borderRadius: 18, boxShadow: SHADOW_SM, overflow: "hidden" }}>
          {(alumnos || []).map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${MUTE}22` }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${CLAY_LIGHT}, #fff)`, color: CLAY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {a.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, color: INK, fontWeight: 600 }}>{a.nombre}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{a.paquete || "sin paquete"}</div>
              </div>
              <div style={{ fontSize: 13, color: MOSS_DARK, fontWeight: 700 }}>{a.clases_restantes ?? "—"}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && <NuevaClaseForm onClose={() => setShowForm(false)} onCreated={reload} token={token} />}
    </div>
  );
}

function AdminLogin({ onClose, onLoggedIn }) {
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
      onLoggedIn(data.access_token);
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
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Acceso del estudio</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 9, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: BG, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }} />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Entrando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

function Landing({ onEnter }) {
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
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <img src="/logo.png" alt="RYM Pilates" style={{ width: 140, height: 140, borderRadius: 28, boxShadow: SHADOW_LG, marginBottom: 26, objectFit: "cover" }} />
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#D8CBB0", margin: "0 0 18px" }}>Estudio de Reformer Pilates</p>
          <p style={{ fontSize: 17, color: "#C9C2B4", maxWidth: 460, lineHeight: 1.6, margin: "0 0 34px" }}>
            Movimiento consciente, control y respiración sobre la cama de reformer. Clases reducidas, seguimiento personalizado.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onEnter} style={{ ...pill, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, boxShadow: SHADOW_MD }}>
              Reservar una clase <ArrowRight size={16} />
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
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: MUTE, fontSize: 14, lineHeight: 1.6 }}>
              <MapPin size={17} color={CLAY} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{STUDIO_ADDRESS}</span>
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
  const [clases, setClases] = useState(null);
  const [alumnos, setAlumnos] = useState(null);
  const [alumnoDemo, setAlumnoDemo] = useState(null);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [entered, setEntered] = useState(false);

  const cargarTodo = useCallback(async () => {
    try {
      setError("");
      const [clasesData, alumnosData] = await Promise.all([
        sb("clases?select=*&order=fecha,hora"),
        sb("alumnos?select=*&order=nombre&limit=200"),
      ]);
      let misReservas = [];
      const demo = alumnosData && alumnosData[0];
      if (demo) {
        misReservas = (await sb(`reservas?alumno_id=eq.${demo.id}&select=*`)) || [];
      }
      const clasesConReservas = (clasesData || []).map((c) => ({
        ...c,
        _misReservas: misReservas.filter((r) => r.clase_id === c.id),
      }));
      setClases(clasesConReservas);
      setAlumnos(alumnosData || []);
      setAlumnoDemo(demo || null);
    } catch (e) {
      setError(`No se pudo conectar a Supabase: ${e.message}`);
      console.error(e);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header
        adminToken={adminToken}
        mode={mode}
        setMode={setMode}
        onLogout={() => {
          setAdminToken(null);
          setMode("cliente");
        }}
        onShowLogin={() => setShowLogin(true)}
        onGoHome={() => setEntered(false)}
      />

      <div style={{ ...container, padding: "36px 24px 80px" }}>
        {mode === "admin" && adminToken ? (
          <AdminView clases={clases} alumnos={alumnos} reload={cargarTodo} token={adminToken} />
        ) : (
          <ClienteView clases={clases} alumnoDemo={alumnoDemo} reload={cargarTodo} error={error} />
        )}
      </div>

      {showLogin && (
        <AdminLogin
          onClose={() => setShowLogin(false)}
          onLoggedIn={(token) => {
            setAdminToken(token);
            setMode("admin");
          }}
        />
      )}
    </div>
  );
}
