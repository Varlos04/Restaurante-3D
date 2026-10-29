"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import * as D from "@/data/plano";
import Escena3D, { Ambiente } from "./Escena3D";

type Vista = { id: string; n: number };

/* ---------- Cámara con vistas animadas ---------- */
function Camara({ vista, girar }: { vista: Vista; girar: boolean }) {
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const anim = useRef<{ t: number; p0: Vector3; t0: Vector3; p1: Vector3; t1: Vector3 } | null>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const vi = D.vistas[vista.id];
    anim.current = {
      t: 0,
      p0: camera.position.clone(),
      t0: c.target.clone(),
      p1: new Vector3(...vi.pos),
      t1: new Vector3(...vi.target),
    };
  }, [vista, camera]);

  useFrame((_, dt) => {
    const a = anim.current;
    const c = controls.current;
    if (!a || !c) return;
    a.t = Math.min(1, a.t + dt * 1.2);
    const k = a.t * a.t * (3 - 2 * a.t);
    camera.position.lerpVectors(a.p0, a.p1, k);
    c.target.lerpVectors(a.t0, a.t1, k);
    c.update();
    if (a.t >= 1) anim.current = null;
  });

  return <OrbitControls ref={controls} makeDefault autoRotate={girar} autoRotateSpeed={1.2} maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={70} />;
}

/* ---------- Datos del menú ---------- */
const CIRC = D.circuitos.map((c) => "c:" + c.id);
const TODO = ["muros", "mobiliario", "equipo", "detalles", "etiquetas", "fria", "caliente", "hidEquipos", "lamparas", "tomas", "cotas", ...CIRC];

const PRESETS = [
  { id: "todo", icono: "🏠", nombre: "Todo", capas: TODO, opacidad: 1 },
  { id: "estructura", icono: "🏗️", nombre: "Estructura", capas: ["muros", "mobiliario", "equipo", "detalles", "etiquetas"], opacidad: 1 },
  { id: "agua", icono: "💧", nombre: "Agua", capas: ["muros", "etiquetas", "fria", "caliente", "hidEquipos"], opacidad: 0.25 },
  { id: "electrica", icono: "⚡", nombre: "Electricidad", capas: ["muros", "etiquetas", "lamparas", "tomas", ...CIRC], opacidad: 0.25 },
];

const ICONOS_VISTA: Record<string, string> = { general: "🧭", aerea: "🗺️", salon: "🍽️", terraza: "🌿", cocina: "👨‍🍳", banos: "🚻", entrada: "🚪" };

const GRUPOS: { titulo: string; items: { k: string; n: string; color?: string }[] }[] = [
  { titulo: "🏗️ Estructura", items: [
    { k: "muros", n: "Muros y pisos" }, { k: "mobiliario", n: "Mesas y sillas" },
    { k: "equipo", n: "Cocina, baños y bodega" }, { k: "detalles", n: "Puertas, plantas y pérgola" } ] },
  { titulo: "💧 Agua", items: [
    { k: "fria", n: "Agua fría", color: "#1f6fe0" }, { k: "caliente", n: "Agua caliente", color: "#e02b2b" },
    { k: "hidEquipos", n: "Medidor, calentador y válvulas" } ] },
  { titulo: "⚡ Electricidad", items: [
    { k: "lamparas", n: "Luminarias" }, { k: "tomas", n: "Tablero y tomacorrientes" },
    ...D.circuitos.map((c) => ({ k: "c:" + c.id, n: c.nombre, color: c.color })) ] },
  { titulo: "🏷️ Rótulos", items: [{ k: "etiquetas", n: "Nombres de zonas" }, { k: "mesasNum", n: "Numerar mesas" }, { k: "cotas", n: "Ejes y medidas" }] },
];

const LEYENDA: { titulo: string; items: [string, string][] }[] = [
  { titulo: "💧 Hidráulica", items: [["#1f6fe0", "Agua fría"], ["#e02b2b", "Agua caliente"], ["#0d2a66", "Válvula de seccionamiento"], ["#0a3d91", "Medidor y llave general"], ["#d62020", "Calentador"]] },
  { titulo: "⚡ Eléctrica", items: [["#ffd98a", "Luminaria de techo"], ["#222222", "Tomacorriente 110 V"], ["#8a8f94", "Tablero eléctrico"], ["#ff8a00", "PE-ESTUFA · salida de fuerza para estufa"], ["#00b7d4", "PE-REFRIG · salida de fuerza para refrigeración"], ...D.circuitos.map((c): [string, string] => [c.color, c.nombre])] },
];

/* ---------- Piezas del menú ---------- */
function Interruptor({ marcada, onCambio, texto, color }: { marcada: boolean; onCambio: () => void; texto: string; color?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
      <span className="flex items-center gap-2">
        {color && <span className="h-3 w-3 rounded-full" style={{ background: color }} />}
        {texto}
      </span>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input type="checkbox" checked={marcada} onChange={onCambio} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-sky-600" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function Pestana({ activa, onClick, texto }: { activa: boolean; onClick: () => void; texto: string }) {
  return (
    <button onClick={onClick} className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${activa ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
      {texto}
    </button>
  );
}

/* ---------- Pantalla principal ---------- */
export default function Restaurante3D() {
  const [on, setOn] = useState<Set<string>>(new Set(TODO));
  const [vista, setVista] = useState<Vista>({ id: "general", n: 0 });
  const [opacidad, setOpacidad] = useState(1);
  const [ambiente, setAmbiente] = useState<Ambiente>("dia");
  const [sombras, setSombras] = useState(true);
  const [girar, setGirar] = useState(false);
  const [panel, setPanel] = useState(false);
  const [tab, setTab] = useState<"capas" | "ambiente" | "leyenda" | "datos">("capas");
  const [preset, setPreset] = useState("todo");
  const lienzo = useRef<HTMLCanvasElement | null>(null);

  const ir = (id: string) => setVista((v) => ({ id, n: v.n + 1 }));
  const alternar = (k: string) => {
    setPreset("");
    setOn((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };
  const aplicar = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id);
    setOn(new Set(p.capas));
    setOpacidad(p.opacidad);
  };
  const captura = () => {
    if (!lienzo.current) return;
    const a = document.createElement("a");
    a.download = "restaurante-3d.png";
    a.href = lienzo.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="relative h-screen w-screen select-none">
      <Canvas shadows camera={{ position: D.vistas.general.pos, fov: 50 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => (lienzo.current = gl.domElement)}>
        <Escena3D on={on} opacidad={opacidad} ambiente={ambiente} sombras={sombras} />
        <Camara vista={vista} girar={girar} />
      </Canvas>

      {/* Título */}
      <div className="absolute left-3 top-3 rounded-2xl bg-white/85 px-4 py-2 text-slate-900 shadow backdrop-blur">
        <div className="text-sm font-bold">🍽️ Cocina Nacional</div>
        <div className="text-xs text-slate-600">96 clientes · arrastra para girar</div>
      </div>

      {/* Botón de opciones */}
      <button onClick={() => setPanel((p) => !p)} className="absolute right-3 top-3 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700">
        {panel ? "✕ Cerrar" : "⚙️ Opciones"}
      </button>

      {/* Panel con pestañas */}
      {panel && (
        <aside className="absolute right-3 top-14 max-h-[75vh] w-72 overflow-y-auto rounded-2xl bg-white/95 p-3 text-slate-900 shadow-lg backdrop-blur">
          <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
            <Pestana activa={tab === "capas"} onClick={() => setTab("capas")} texto="Capas" />
            <Pestana activa={tab === "ambiente"} onClick={() => setTab("ambiente")} texto="Ambiente" />
            <Pestana activa={tab === "leyenda"} onClick={() => setTab("leyenda")} texto="Leyenda" />
            <Pestana activa={tab === "datos"} onClick={() => setTab("datos")} texto="Datos" />
          </div>

          {tab === "capas" &&
            GRUPOS.map((g) => (
              <section key={g.titulo} className="mb-3">
                <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{g.titulo}</h3>
                {g.items.map((it) => <Interruptor key={it.k} marcada={on.has(it.k)} onCambio={() => alternar(it.k)} texto={it.n} color={it.color} />)}
              </section>
            ))}

          {tab === "ambiente" && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Momento del día</h3>
              <div className="mb-3 grid grid-cols-3 gap-1">
                {([["dia", "☀️ Día"], ["tarde", "🌇 Tarde"], ["noche", "🌙 Noche"]] as [Ambiente, string][]).map(([k, n]) => (
                  <button key={k} onClick={() => setAmbiente(k)} className={`rounded-xl border py-2 text-sm ${ambiente === k ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <label className="mb-2 block text-sm">
                Transparencia de muros: {Math.round(opacidad * 100)}%
                <input type="range" min={0.1} max={1} step={0.05} value={opacidad} onChange={(e) => { setOpacidad(Number(e.target.value)); setPreset(""); }} className="w-full" />
              </label>
              <Interruptor marcada={sombras} onCambio={() => setSombras((s) => !s)} texto="Sombras (apágalas si va lento)" />
              <Interruptor marcada={girar} onCambio={() => setGirar((g) => !g)} texto="Girar solo" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => ir("general")} className="rounded-xl border border-slate-200 py-2 text-sm">🔄 Restablecer vista</button>
                <button onClick={captura} className="rounded-xl border border-slate-200 py-2 text-sm">📸 Captura PNG</button>
              </div>
            </div>
          )}

          {tab === "leyenda" &&
            LEYENDA.map((g) => (
              <section key={g.titulo} className="mb-3">
                <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{g.titulo}</h3>
                {g.items.map(([c, n]) => (
                  <div key={n} className="flex items-center gap-2 py-1 text-sm">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c }} />
                    {n}
                  </div>
                ))}
              </section>
            ))}

          {tab === "datos" && (
            <div>
              <table className="w-full text-sm">
                <tbody>
                  {[["Terraza", "48 m²"], ["Salón", "240 m²"], ["Cocina", "96 m²"], ["Baño", "7 m²"],
                    ["Mesas modeladas", `${D.mesas.length}`], ["Sillas modeladas", `${D.mesas.length * 4}`],
                    ["Luminarias", `${D.lamparas.length}`], ["Capacidad indicada", "96 clientes"]].map(([a, b]) => (
                    <tr key={a} className="border-b border-slate-100"><td className="py-1.5">{a}</td><td className="py-1.5 text-right font-medium">{b}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-500">Modelo esquemático hecho a partir de los planos. Las medidas salen de las imágenes, no son exactas.</p>
            </div>
          )}
        </aside>
      )}

      {/* Barra inferior */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 px-2">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/85 p-1 shadow backdrop-blur">
          {Object.entries(D.vistas).map(([k, vi]) => (
            <button key={k} onClick={() => ir(k)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${vista.id === k ? "bg-sky-600 text-white" : "text-slate-700"}`}>
              {ICONOS_VISTA[k]} {vi.nombre}
            </button>
          ))}
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-slate-900/80 p-1 shadow backdrop-blur">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => aplicar(p)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${preset === p.id ? "bg-white text-slate-900" : "text-white"}`}>
              {p.icono} {p.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}