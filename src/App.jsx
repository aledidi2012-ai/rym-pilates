import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, LayoutGrid, Clock, ChevronLeft, Plus, X, Check, Instagram, MessageCircle, MapPin, ArrowRight } from "lucide-react";

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

// ---- DATOS DEL ESTUDIO: editá estas 3 líneas cuando quieras ----
const STUDIO_ADDRESS = "Belgrano 10, Bernal";
const STUDIO_WHATSAPP = "https://wa.me/5491161626800";
const STUDIO_INSTAGRAM = "https://instagram.com/rympilates";
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

function Spot({ taken }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: taken ? "none" : `1.5px solid ${MUTE}55`,
        background: taken ? `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS})` : "transparent",
        boxShadow: taken ? SHADOW_SM : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {taken && <Check size={16} color={STONE} strokeWidth={2.5} />}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ margin: "10px 18px", padding: "12px 14px", borderRadius: 14, background: CLAY_LIGHT, color: "#7A2E14", fontSize: 12.5, boxShadow: SHADOW_SM }}>
      {msg}
    </div>
  );
}

function ClientView({ clases, alumnoDemo, reload, error }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!clases) {
    return <div style={{ padding: 20, fontSize: 13, color: MUTE, fontFamily: FONT_BODY }}>Cargando clases...</div>;
  }

  if (selected) {
    const c = clases.find((x) => x.id === selected.id) || selected;
    const libres = c.cupos_totales - c.cupos_ocupados;
    const miReserva = c._misReservas && c._misReservas.length > 0;

    const reservar = async () => {
      if (!alumnoDemo) return;
      setBusy(true);
      try {
        await sb("reservas", {
          method: "POST",
          body: JSON.stringify({ alumno_id: alumnoDemo.id, clase_id: c.id }),
        });
        await sb(`clases?id=eq.${c.id}`, {
          method: "PATCH",
          body: JSON.stringify({ cupos_ocupados: c.cupos_ocupados + 1 }),
        });
        await reload();
      } catch (e) {
        console.error(e);
      }
      setBusy(false);
    };

    const cancelar = async () => {
      if (!alumnoDemo) return;
      setBusy(true);
      try {
        const reservaId = c._misReservas[0].id;
        await sb(`reservas?id=eq.${reservaId}`, { method: "DELETE" });
        await sb(`clases?id=eq.${c.id}`, {
          method: "PATCH",
          body: JSON.stringify({ cupos_ocupados: Math.max(0, c.cupos_ocupados - 1) }),
        });
        await reload();
      } catch (e) {
        console.error(e);
      }
      setBusy(false);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px 8px" }}>
          <button onClick={() => setSelected(null)} style={{ background: BG, border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: SHADOW_SM }} aria-label="Volver">
            <ChevronLeft size={19} color={INK} />
          </button>
          <span style={{ fontSize: 13, color: MUTE, fontWeight: 500 }}>{c.fecha}</span>
        </div>
        <div style={{ padding: "6px 20px 0" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 500, color: INK, margin: "4px 0 2px", letterSpacing: -0.3 }}>{c.nombre}</h2>
          <p style={{ fontSize: 14, color: MUTE, margin: 0 }}>{c.hora} · con {c.instructor}</p>
        </div>
        <div style={{ padding: "24px 20px 10px" }}>
          <p style={{ fontSize: 12, color: MUTE, margin: "0 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {libres} {libres === 1 ? "lugar libre" : "lugares libres"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 230 }}>
            {Array.from({ length: c.cupos_totales }).map((_, i) => (
              <Spot key={i} taken={i < c.cupos_ocupados} />
            ))}
          </div>
        </div>
        <ErrorBanner msg={error} />
        <div style={{ marginTop: "auto", padding: 20 }}>
          {miReserva ? (
            <button onClick={cancelar} disabled={busy} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: `1.5px solid ${CLAY}`, background: "transparent", color: CLAY, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              {busy ? "..." : "Cancelar reserva"}
            </button>
          ) : (
            <button
              disabled={libres === 0 || busy}
              onClick={reservar}
              style={{
                width: "100%",
                padding: "15px 0",
                borderRadius: 14,
                border: "none",
                background: libres === 0 ? MUTE : `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`,
                color: STONE,
                fontSize: 15,
                fontWeight: 600,
                cursor: libres === 0 ? "default" : "pointer",
                boxShadow: libres === 0 ? "none" : SHADOW_MD,
                fontFamily: FONT_BODY,
              }}
            >
              {libres === 0 ? "Sin lugares" : busy ? "..." : "Reservar clase"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT_BODY }}>
      <div style={{ padding: "22px 20px 10px" }}>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 2px", fontWeight: 500 }}>{alumnoDemo ? `Hola, ${alumnoDemo.nombre.split(" ")[0]}` : "Cargando..."}</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 500, color: INK, margin: 0, letterSpacing: -0.3 }}>Clases</h2>
      </div>
      <div style={{ padding: "12px 16px 100px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {clases.length === 0 && (
          <p style={{ fontSize: 13, color: MUTE, padding: "20px 8px" }}>
            Todavía no hay clases cargadas. Agregalas desde el panel admin.
          </p>
        )}
        {clases.map((c) => {
          const libres = c.cupos_totales - c.cupos_ocupados;
          const reservada = c._misReservas && c._misReservas.length > 0;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 14px",
                borderRadius: 16,
                border: "none",
                background: STONE,
                boxShadow: SHADOW_SM,
                cursor: "pointer",
              }}
            >
              <div style={{ width: 54, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{c.hora}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: INK, fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>
                  {c.instructor} · {libres === 0 ? "completo" : `${libres} libres de ${c.cupos_totales}`}
                </div>
              </div>
              {reservada && (
                <span style={{ fontSize: 10.5, color: MOSS_DARK, background: `${MOSS}1c`, padding: "4px 9px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>reservada</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NuevaClaseForm({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ nombre: "", instructor: "", fecha: "", hora: "", cupos_totales: 8 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = { width: "100%", padding: 12, marginBottom: 9, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: STONE, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY, color: INK };

  const submit = async () => {
    if (!form.nombre || !form.fecha || !form.hora) {
      setErr("Completá nombre, fecha y hora.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await sb("clases", {
        method: "POST",
        token,
        body: JSON.stringify({ ...form, cupos_totales: Number(form.cupos_totales), cupos_ocupados: 0 }),
      });
      onCreated();
      onClose();
    } catch (e) {
      setErr("No se pudo crear. Revisá los permisos (RLS) de la tabla clases.");
    }
    setBusy(false);
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(28,27,25,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", zIndex: 10 }}>
      <div style={{ background: BG, width: "100%", borderRadius: "24px 24px 0 0", padding: 20, boxShadow: SHADOW_LG }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Nueva clase</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        {["nombre", "instructor"].map((f) => (
          <input
            key={f}
            placeholder={f === "nombre" ? "Nombre (ej. Reformer Nivel 1)" : "Instructor"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            style={inputStyle}
          />
        ))}
        <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
        </div>
        <input type="number" min="1" placeholder="Cupos" value={form.cupos_totales} onChange={(e) => setForm({ ...form, cupos_totales: e.target.value })} style={{ ...inputStyle, marginBottom: 12 }} />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", fontFamily: FONT_BODY }}>
      <div style={{ padding: "22px 20px 12px" }}>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 2px", fontWeight: 500 }}>RYM Pilates — panel</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: INK, margin: 0, letterSpacing: -0.3 }}>{tab === "clases" ? "Clases" : "Alumnos"}</h2>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 20px 12px" }}>
        {[["clases", "Clases"], ["alumnos", "Alumnos"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: "none",
              background: tab === key ? MOSS_DARK : STONE,
              color: tab === key ? STONE : MUTE,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: tab === key ? SHADOW_SM : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 16px 100px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {tab === "clases"
          ? (clases || []).map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px", borderRadius: 16, background: STONE, boxShadow: SHADOW_SM }}>
                <div style={{ width: 62, fontSize: 12.5, color: MUTE, fontWeight: 500 }}>{c.fecha}</div>
                <div style={{ width: 44, fontSize: 15, fontWeight: 700, color: INK }}>{c.hora?.slice(0, 5)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: INK, fontWeight: 600 }}>{c.nombre}</div>
                  <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{c.instructor}</div>
                </div>
                <div style={{ fontSize: 12, color: c.cupos_ocupados === c.cupos_totales ? CLAY : MOSS_DARK, fontWeight: 700, background: c.cupos_ocupados === c.cupos_totales ? CLAY_LIGHT : `${MOSS}1c`, padding: "4px 9px", borderRadius: 10 }}>{c.cupos_ocupados}/{c.cupos_totales}</div>
              </div>
            ))
          : (alumnos || []).map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 16, background: STONE, boxShadow: SHADOW_SM }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${CLAY_LIGHT}, #fff)`, color: CLAY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
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
      {tab === "clases" && (
        <button
          onClick={() => setShowForm(true)}
          style={{ position: "absolute", right: 18, bottom: 92, width: 50, height: 50, borderRadius: 16, background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: SHADOW_MD }}
          aria-label="Agregar clase"
        >
          <Plus size={22} color={STONE} />
        </button>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,25,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, fontFamily: FONT_BODY }}>
      <div style={{ background: BG, width: 300, borderRadius: 22, padding: 22, boxShadow: SHADOW_LG }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, margin: 0, color: INK }}>Acceso del estudio</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 9, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: STONE, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 12, border: `1.5px solid ${MUTE}33`, background: STONE, fontSize: 14, boxSizing: "border-box", fontFamily: FONT_BODY }}
        />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_MD, fontFamily: FONT_BODY }}>
          {busy ? "Entrando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

function NavBar({ mode }) {
  const clientTabs = [[Calendar, "Clases"], [Clock, "Reservas"]];
  const adminTabs = [[LayoutGrid, "Gestion"], [Users, "Alumnos"]];
  const tabs = mode === "cliente" ? clientTabs : adminTabs;
  return (
    <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, display: "flex", justifyContent: "space-around", background: STONE, borderRadius: 20, padding: "10px 8px", boxShadow: SHADOW_MD }}>
      {tabs.map(([Icon, label], i) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Icon size={19} color={i === 0 ? MOSS_DARK : MUTE} strokeWidth={i === 0 ? 2 : 1.6} />
          <span style={{ fontSize: 10.5, color: i === 0 ? MOSS_DARK : MUTE, fontWeight: i === 0 ? 700 : 500, fontFamily: FONT_BODY }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Landing({ onEnter }) {
  const pill = { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 30, fontSize: 13.5, fontWeight: 600, fontFamily: FONT_BODY, textDecoration: "none", cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT_BODY, color: INK }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "60px 24px 90px",
          background: `radial-gradient(circle at 15% 20%, ${MOSS}22, transparent 55%), radial-gradient(circle at 85% 0%, ${CLAY}22, transparent 45%)`,
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <img
            src="/logo.png"
            alt="RYM Pilates"
            style={{ width: 140, height: 140, borderRadius: 28, boxShadow: SHADOW_MD, marginBottom: 26, objectFit: "cover" }}
          />
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: MOSS_DARK, margin: "0 0 18px" }}>
            Estudio de Reformer Pilates
          </p>
          <p style={{ fontSize: 17, color: MUTE, maxWidth: 460, lineHeight: 1.6, margin: "0 0 34px" }}>
            Movimiento consciente, control y respiración sobre la cama de reformer. Clases reducidas, seguimiento personalizado.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onEnter}
              style={{ ...pill, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, boxShadow: SHADOW_MD }}
            >
              Reservar una clase <ArrowRight size={16} />
            </button>
            <a href={STUDIO_WHATSAPP} target="_blank" rel="noreferrer" style={{ ...pill, border: `1.5px solid ${INK}22`, background: "transparent", color: INK }}>
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Sobre el estudio */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "70px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 36 }}>
        {[
          ["Grupos reducidos", "Máximo de alumnos por clase para que cada ejercicio se corrija en el momento."],
          ["Nivel por alumno", "Progresás a tu ritmo: principiante, intermedio o avanzado, todo sobre la misma máquina."],
          ["Reservá desde acá", "Elegís horario y cama de reformer disponible al instante, sin llamadas ni mensajes."],
        ].map(([title, desc]) => (
          <div key={title}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, margin: "0 0 8px" }}>{title}</h3>
            <p style={{ fontSize: 14, color: MUTE, lineHeight: 1.6, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Ubicación + contacto */}
      <div style={{ background: STONE, boxShadow: `inset 0 1px 0 ${INK}0f` }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 340 }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, margin: "0 0 12px" }}>Dónde estamos</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: MUTE, fontSize: 14, lineHeight: 1.6 }}>
              <MapPin size={17} color={CLAY} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{STUDIO_ADDRESS}</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, margin: "0 0 12px" }}>Seguinos</h3>
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

      {/* CTA final */}
      <div style={{ padding: "70px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 30, margin: "0 0 20px" }}>¿Lista para tu próxima clase?</h2>
        <button onClick={onEnter} style={{ ...pill, border: "none", background: `linear-gradient(135deg, ${MOSS_LIGHT}, ${MOSS_DARK})`, color: STONE, boxShadow: SHADOW_MD, padding: "13px 26px", fontSize: 14.5 }}>
          Ver horarios y reservar <ArrowRight size={16} />
        </button>
        <p style={{ marginTop: 40, fontSize: 12, color: MUTE }}>RYM Pilates</p>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0", fontFamily: FONT_BODY, background: "transparent" }}>
      <button
        onClick={() => setEntered(false)}
        style={{ background: "none", border: "none", color: MUTE, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: FONT_BODY }}
      >
        <ChevronLeft size={14} /> Volver al inicio
      </button>

      {adminToken && (
        <div style={{ display: "flex", gap: 8, background: STONE, padding: 5, borderRadius: 20, boxShadow: SHADOW_SM }}>
          {[["cliente", "Vista cliente"], ["admin", "Panel admin"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{ padding: "7px 16px", borderRadius: 16, border: "none", background: mode === key ? MOSS_DARK : "transparent", color: mode === key ? STONE : INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              setAdminToken(null);
              setMode("cliente");
            }}
            style={{ padding: "7px 16px", borderRadius: 16, border: "none", background: "transparent", color: CLAY, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {error && mode === "admin" && (
        <div style={{ maxWidth: 320, padding: "9px 14px", borderRadius: 14, background: CLAY_LIGHT, color: "#7A2E14", fontSize: 12.5, boxShadow: SHADOW_SM }}>{error}</div>
      )}

      <div style={{ width: 340, height: 660, borderRadius: 40, border: `8px solid ${INK}`, background: BG, overflow: "hidden", position: "relative", boxShadow: SHADOW_LG }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            {mode === "admin" && adminToken ? (
              <AdminView clases={clases} alumnos={alumnos} reload={cargarTodo} token={adminToken} />
            ) : (
              <ClientView clases={clases} alumnoDemo={alumnoDemo} reload={cargarTodo} error={error} />
            )}
            <NavBar mode={adminToken ? mode : "cliente"} />
          </div>
        </div>
      </div>

      {!adminToken && (
        <button
          onClick={() => setShowLogin(true)}
          style={{ background: "none", border: "none", color: MUTE, fontSize: 11, cursor: "pointer", padding: 6, fontFamily: FONT_BODY }}
        >
          Acceso del estudio
        </button>
      )}

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
