import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, LayoutGrid, Clock, ChevronLeft, Plus, X, Check } from "lucide-react";

const SUPABASE_URL = "https://hkcbwsrsemppvyidwhlt.supabase.co";
const SUPABASE_KEY = "sb_publishable_RRAMcqXuHdFstAgi_LKaMQ_FAF9uFMc";

const INK = "#211F1C";
const STONE = "#EBE5D8";
const MOSS = "#4B5D45";
const MOSS_DARK = "#374530";
const CLAY = "#A85A3E";
const CLAY_LIGHT = "#F0DCD2";
const MUTE = "#8C8577";

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
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
        borderRadius: 6,
        border: `1.5px solid ${taken ? MOSS : MUTE}`,
        background: taken ? MOSS : "transparent",
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
    <div style={{ margin: "10px 18px", padding: "10px 12px", borderRadius: 8, background: "#F0DCD2", color: "#7A2E14", fontSize: 12.5 }}>
      {msg}
    </div>
  );
}

function ClientView({ clases, alumnoDemo, reload, error }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!clases) {
    return <div style={{ padding: 20, fontSize: 13, color: MUTE }}>Cargando clases...</div>;
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 8px" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }} aria-label="Volver">
            <ChevronLeft size={22} color={INK} />
          </button>
          <span style={{ fontSize: 13, color: MUTE }}>{c.fecha}</span>
        </div>
        <div style={{ padding: "4px 18px 0" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 400, color: INK, margin: "4px 0 2px" }}>{c.nombre}</h2>
          <p style={{ fontSize: 14, color: MUTE, margin: 0 }}>{c.hora} · con {c.instructor}</p>
        </div>
        <div style={{ padding: "22px 18px 10px" }}>
          <p style={{ fontSize: 12, color: MUTE, margin: "0 0 10px" }}>
            Camas de reformer — {libres} {libres === 1 ? "lugar libre" : "lugares libres"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 220 }}>
            {Array.from({ length: c.cupos_totales }).map((_, i) => (
              <Spot key={i} taken={i < c.cupos_ocupados} />
            ))}
          </div>
        </div>
        <ErrorBanner msg={error} />
        <div style={{ marginTop: "auto", padding: 18 }}>
          {miReserva ? (
            <button onClick={cancelar} disabled={busy} style={{ width: "100%", padding: "14px 0", borderRadius: 8, border: `1.5px solid ${CLAY}`, background: "transparent", color: CLAY, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
              {busy ? "..." : "Cancelar reserva"}
            </button>
          ) : (
            <button disabled={libres === 0 || busy} onClick={reservar} style={{ width: "100%", padding: "14px 0", borderRadius: 8, border: "none", background: libres === 0 ? MUTE : MOSS, color: STONE, fontSize: 15, fontWeight: 500, cursor: libres === 0 ? "default" : "pointer" }}>
              {libres === 0 ? "Sin lugares" : busy ? "..." : "Reservar clase"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 18px 6px" }}>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 2px" }}>{alumnoDemo ? `Hola, ${alumnoDemo.nombre.split(" ")[0]}` : "Cargando..."}</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 400, color: INK, margin: 0 }}>Clases</h2>
      </div>
      <div style={{ padding: "14px 18px 90px", overflowY: "auto", flex: 1 }}>
        {clases.length === 0 && (
          <p style={{ fontSize: 13, color: MUTE, padding: "20px 4px" }}>
            Todavía no hay clases cargadas. Agregalas desde el panel admin.
          </p>
        )}
        {clases.map((c, i) => {
          const libres = c.cupos_totales - c.cupos_ocupados;
          const reservada = c._misReservas && c._misReservas.length > 0;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "14px 4px", borderTop: i === 0 ? `1px solid ${MUTE}33` : "none", borderBottom: `1px solid ${MUTE}33`, background: "none", cursor: "pointer" }}
            >
              <div style={{ width: 52, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: INK }}>{c.hora}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: INK, fontWeight: 500 }}>{c.nombre}</div>
                <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>
                  {c.instructor} · {libres === 0 ? "completo" : `${libres} libres de ${c.cupos_totales}`}
                </div>
              </div>
              {reservada && (
                <span style={{ fontSize: 11, color: MOSS_DARK, background: `${MOSS}22`, padding: "3px 8px", borderRadius: 20, fontWeight: 500 }}>reservada</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NuevaClaseForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ nombre: "", instructor: "", fecha: "", hora: "", cupos_totales: 8 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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
    <div style={{ position: "absolute", inset: 0, background: "#00000055", display: "flex", alignItems: "flex-end", zIndex: 10 }}>
      <div style={{ background: STONE, width: "100%", borderRadius: "16px 16px 0 0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 18, margin: 0, color: INK }}>Nueva clase</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={INK} /></button>
        </div>
        {["nombre", "instructor"].map((f) => (
          <input
            key={f}
            placeholder={f === "nombre" ? "Nombre (ej. Reformer Nivel 1)" : "Instructor"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: `1px solid ${MUTE}66`, background: "white", fontSize: 14, boxSizing: "border-box" }}
          />
        ))}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${MUTE}66`, fontSize: 14 }} />
          <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${MUTE}66`, fontSize: 14 }} />
        </div>
        <input type="number" min="1" placeholder="Cupos" value={form.cupos_totales} onChange={(e) => setForm({ ...form, cupos_totales: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: `1px solid ${MUTE}66`, fontSize: 14, boxSizing: "border-box" }} />
        {err && <p style={{ color: CLAY, fontSize: 12.5, margin: "0 0 8px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: MOSS, color: STONE, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          {busy ? "Creando..." : "Crear clase"}
        </button>
      </div>
    </div>
  );
}

function AdminView({ clases, alumnos, reload }) {
  const [tab, setTab] = useState("clases");
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ padding: "20px 18px 14px" }}>
        <p style={{ fontSize: 13, color: MUTE, margin: "0 0 2px" }}>RYM Pilates — panel</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: INK, margin: 0 }}>{tab === "clases" ? "Clases" : "Alumnos"}</h2>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 18px 12px" }}>
        {[["clases", "Clases"], ["alumnos", "Alumnos"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${tab === key ? MOSS : MUTE}66`, background: tab === key ? MOSS : "transparent", color: tab === key ? STONE : MUTE, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 18px 90px", overflowY: "auto", flex: 1 }}>
        {tab === "clases"
          ? (clases || []).map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", borderTop: i === 0 ? `1px solid ${MUTE}33` : "none", borderBottom: `1px solid ${MUTE}33` }}>
                <div style={{ width: 60, fontSize: 13, color: MUTE }}>{c.fecha}</div>
                <div style={{ width: 48, fontSize: 15, fontWeight: 500, color: INK }}>{c.hora?.slice(0, 5)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: INK, fontWeight: 500 }}>{c.nombre}</div>
                  <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{c.instructor}</div>
                </div>
                <div style={{ fontSize: 12.5, color: c.cupos_ocupados === c.cupos_totales ? CLAY : MOSS_DARK, fontWeight: 500 }}>{c.cupos_ocupados}/{c.cupos_totales}</div>
              </div>
            ))
          : (alumnos || []).map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", borderTop: i === 0 ? `1px solid ${MUTE}33` : "none", borderBottom: `1px solid ${MUTE}33` }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: CLAY_LIGHT, color: CLAY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {a.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: INK, fontWeight: 500 }}>{a.nombre}</div>
                  <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{a.paquete || "sin paquete"}</div>
                </div>
                <div style={{ fontSize: 13, color: MOSS_DARK, fontWeight: 500 }}>{a.clases_restantes ?? "—"}</div>
              </div>
            ))}
      </div>
      {tab === "clases" && (
        <button onClick={() => setShowForm(true)} style={{ position: "absolute", right: 18, bottom: 84, width: 46, height: 46, borderRadius: "50%", background: MOSS, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Agregar clase">
          <Plus size={22} color={STONE} />
        </button>
      )}
      {showForm && <NuevaClaseForm onClose={() => setShowForm(false)} onCreated={reload} />}
    </div>
  );
}

function NavBar({ mode }) {
  const clientTabs = [[Calendar, "Clases"], [Clock, "Reservas"]];
  const adminTabs = [[LayoutGrid, "Gestion"], [Users, "Alumnos"]];
  const tabs = mode === "cliente" ? clientTabs : adminTabs;
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${MUTE}33`, background: STONE, padding: "10px 18px 14px" }}>
      {tabs.map(([Icon, label], i) => (
        <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: i === 0 ? 1 : 0.45 }}>
          <Icon size={20} color={INK} strokeWidth={1.6} />
          <span style={{ fontSize: 11, color: INK }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("cliente");
  const [clases, setClases] = useState(null);
  const [alumnos, setAlumnos] = useState(null);
  const [alumnoDemo, setAlumnoDemo] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0", fontFamily: "-apple-system, Helvetica, Arial, sans-serif" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[["cliente", "Vista cliente"], ["admin", "Panel admin"]].map(([key, label]) => (
          <button key={key} onClick={() => setMode(key)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${INK}33`, background: mode === key ? INK : "transparent", color: mode === key ? STONE : INK, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {error && mode === "admin" && (
        <div style={{ maxWidth: 320, padding: "8px 14px", borderRadius: 8, background: "#F0DCD2", color: "#7A2E14", fontSize: 12.5 }}>{error}</div>
      )}

      <div style={{ width: 340, height: 660, borderRadius: 34, border: `8px solid ${INK}`, background: STONE, overflow: "hidden", position: "relative", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            {mode === "cliente" ? (
              <ClientView clases={clases} alumnoDemo={alumnoDemo} reload={cargarTodo} error={mode === "cliente" ? error : ""} />
            ) : (
              <AdminView clases={clases} alumnos={alumnos} reload={cargarTodo} />
            )}
          </div>
          <NavBar mode={mode} />
        </div>
      </div>
    </div>
  );
}
