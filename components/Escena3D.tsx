"use client";

import { useMemo } from "react";
import { Text, Billboard, Line } from "@react-three/drei";
import { CanvasTexture, DoubleSide, Quaternion, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import * as D from "@/data/plano";

export type Ambiente = "dia" | "tarde" | "noche";

type Amb = { bg: string; hemi: number; sun: number; sunColor: string; sunPos: D.Vec3; lamps: number; ground: string };
const AMB: Record<Ambiente, Amb> = {
  dia: { bg: "#cfe3f2", hemi: 0.9, sun: 1.5, sunColor: "#fff4e0", sunPos: [12, 26, 10], lamps: 0, ground: "#9fb391" },
  tarde: { bg: "#f2c9a0", hemi: 0.55, sun: 1.1, sunColor: "#ffb36b", sunPos: [-22, 9, 8], lamps: 3, ground: "#8a7d6a" },
  noche: { bg: "#0b1020", hemi: 0.2, sun: 0.1, sunColor: "#8aa0ff", sunPos: [10, 20, 10], lamps: 6, ground: "#1f2a36" },
};

/* ---------- Texturas dibujadas con código (no necesitan imágenes) ---------- */
type Tipo = "deck" | "madera" | "azulejo";
const TIPOS: Tipo[] = ["deck", "madera", "azulejo", "azulejo", "azulejo"]; // mismo orden que D.pisos
const OFF = [0, 0, 0, 0, 0.012]; // el piso de baños va un poco más arriba para evitar parpadeos

function crearTextura(tipo: Tipo, rx: number, ry: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  if (tipo === "azulejo") {
    g.fillStyle = "#e6ebee";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "#a9b4bb";
    g.lineWidth = 3;
    for (let i = 0; i <= 256; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
    }
  } else {
    const base = tipo === "deck" ? ["#a9794c", "#9b6e44"] : ["#c19563", "#b58455"];
    for (let i = 0; i < 8; i++) {
      const y = i * 32;
      g.fillStyle = base[i % 2];
      g.fillRect(0, y, 256, 32);
      g.fillStyle = "rgba(50,30,12,0.55)";
      g.fillRect(0, y, 256, 2);
      g.fillRect((i * 97) % 256, y, 2, 32);
      for (let k = 0; k < 12; k++) {
        g.fillStyle = "rgba(80,50,25,0.14)";
        g.fillRect(Math.random() * 256, y + Math.random() * 30, 30 + Math.random() * 60, 1);
      }
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function Piso({ d, i }: { d: (typeof D.pisos)[number]; i: number }) {
  const [x1, y1, x2, y2] = d;
  const w = (x2 - x1) * D.S;
  const l = (y2 - y1) * D.S;
  const tipo = TIPOS[i] ?? "azulejo";
  const tam = tipo === "azulejo" ? 1.2 : 2;
  const tex = useMemo(() => crearTextura(tipo, w / tam, l / tam), [tipo, w, l, tam]);
  return (
    <mesh position={D.v([(x1 + x2) / 2, (y1 + y2) / 2], -0.05 + (OFF[i] ?? 0))} receiveShadow>
      <boxGeometry args={[w, 0.1, l]} />
      <meshStandardMaterial map={tex} roughness={tipo === "azulejo" ? 0.35 : 0.75} />
    </mesh>
  );
}

/* ---------- Piezas ---------- */
function Muro({ m, opacidad }: { m: D.Muro; opacidad: number }) {
  const [x1, y1, x2, y2, alto, grosor] = m;
  const largo = Math.hypot(x2 - x1, y2 - y1) * D.S;
  return (
    <mesh position={D.v([(x1 + x2) / 2, (y1 + y2) / 2], alto / 2)} rotation={[0, -Math.atan2(y2 - y1, x2 - x1), 0]} castShadow={opacidad >= 1} receiveShadow>
      <boxGeometry args={[largo, alto, grosor]} />
      <meshStandardMaterial color="#f4f0e8" roughness={0.9} transparent={opacidad < 1} opacity={opacidad} depthWrite={opacidad >= 1} />
    </mesh>
  );
}

function Puerta({ r }: { r: D.Rect }) {
  const [x1, y1, x2, y2] = r;
  const largo = Math.hypot(x2 - x1, y2 - y1) * D.S;
  return (
    <group position={D.v([(x1 + x2) / 2, (y1 + y2) / 2])} rotation={[0, -Math.atan2(y2 - y1, x2 - x1), 0]}>
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[largo, 0.6, 0.24]} />
        <meshStandardMaterial color="#6e4524" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * largo) / 2, 1.2, 0]} castShadow>
          <boxGeometry args={[0.12, 2.4, 0.24]} />
          <meshStandardMaterial color="#6e4524" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Bloque({ p, size, color, y0 = 0, rough = 0.7, metal = 0 }: { p: D.Pt; size: D.Vec3; color: string; y0?: number; rough?: number; metal?: number }) {
  const [x, , z] = D.v(p);
  return (
    <mesh position={[x, y0 + size[1] / 2, z]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Silla({ a }: { a: number }) {
  return (
    <group position={[Math.cos(a) * 0.98, 0, Math.sin(a) * 0.98]} rotation={[0, -a, 0]}>
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.05, 0.44]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color="#3d6b8c" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 0.74, 0]} castShadow>
        <boxGeometry args={[0.05, 0.5, 0.44]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.6} />
      </mesh>
      {[[-0.19, -0.19], [-0.19, 0.19], [0.19, -0.19], [0.19, 0.19]].map(([lx, lz], j) => (
        <mesh key={j} position={[lx, 0.21, lz]} castShadow>
          <boxGeometry args={[0.04, 0.42, 0.04]} />
          <meshStandardMaterial color="#2b1b10" />
        </mesh>
      ))}
    </group>
  );
}

function Mesa({ p }: { p: D.Pt }) {
  const [x, , z] = D.v(p);
  const mantel = "#f7f3ea";
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.75, 10]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.02, 20]} />
        <meshStandardMaterial color="#2b1b10" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.05, 28]} />
        <meshStandardMaterial color="#7a4b2a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.66, 0.02, 28]} />
        <meshStandardMaterial color={mantel} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.66, 0.76, 0.36, 28, 1, true]} />
        <meshStandardMaterial color={mantel} roughness={0.95} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.2, 10]} />
        <meshStandardMaterial color="#2e6f8e" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#d8455f" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        return (
          <group key={i}>
            <mesh position={[Math.cos(a) * 0.4, 0.8, Math.sin(a) * 0.4]} castShadow>
              <cylinderGeometry args={[0.13, 0.11, 0.015, 18]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[Math.cos(a) * 0.3, 0.84, Math.sin(a) * 0.3 + 0.12]}>
              <cylinderGeometry args={[0.035, 0.03, 0.1, 10]} />
              <meshStandardMaterial color="#bcd7e6" transparent opacity={0.55} roughness={0.05} />
            </mesh>
          </group>
        );
      })}
      {[0, 1, 2, 3].map((i) => <Silla key={i} a={(i * Math.PI) / 2} />)}
    </group>
  );
}

function Planta({ p }: { p: D.Pt }) {
  const [x, , z] = D.v(p);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.18, 0.5, 14]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
      {[[0, 0.9, 0, 0.4], [0.2, 1.1, 0.1, 0.28], [-0.18, 1.05, -0.1, 0.3]].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color={i % 2 ? "#3b9b4a" : "#2e7d3a"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Pergola() {
  const postes: [number, number][] = [[-13.4, -6.2], [-5.5, -6.2], [-13.4, -0.4], [-5.5, -0.4]];
  return (
    <group>
      {postes.map(([x, z], i) => (
        <mesh key={i} position={[x, 1.3, z]} castShadow>
          <boxGeometry args={[0.14, 2.6, 0.14]} />
          <meshStandardMaterial color="#6e4524" roughness={0.7} />
        </mesh>
      ))}
      {[-6.2, -0.4].map((z) => (
        <mesh key={z} position={[-9.45, 2.65, z]} castShadow>
          <boxGeometry args={[8.2, 0.14, 0.16]} />
          <meshStandardMaterial color="#6e4524" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-13.4 + i * 0.8, 2.75, -3.3]} castShadow>
          <boxGeometry args={[0.08, 0.06, 6.2]} />
          <meshStandardMaterial color="#8a5a32" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Wc({ w }: { w: [number, number, number] }) {
  const [x, , z] = D.v([w[0], w[1]]);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[-w[2] * 0.05, 0.22, 0]} castShadow>
        <boxGeometry args={[0.5, 0.42, 0.38]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} />
      </mesh>
      <mesh position={[w[2] * 0.22, 0.65, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.38]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.2} />
      </mesh>
      <mesh position={[-w[2] * 0.05, 0.45, 0]}>
        <boxGeometry args={[0.46, 0.03, 0.34]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Estufa({ p }: { p: D.Pt }) {
  const [x, , z] = D.v(p);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.9, 0.9]} />
        <meshStandardMaterial color="#9aa5ad" roughness={0.35} metalness={0.25} />
      </mesh>
      {[[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 0.91, bz]}>
          <cylinderGeometry args={[0.13, 0.13, 0.025, 18]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Refri({ p }: { p: D.Pt }) {
  const [x, , z] = D.v(p);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.8, 0.9]} />
        <meshStandardMaterial color="#d6e4ec" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.47, 1.1, 0.25]}>
        <boxGeometry args={[0.03, 0.6, 0.05]} />
        <meshStandardMaterial color="#555" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Rotulo({ texto, p, h = 3.6, tam = 0.45 }: { texto: string; p: D.Pt; h?: number; tam?: number }) {
  return (
    <Billboard position={D.v(p, h)}>
      <Text fontSize={tam} color="#ffffff" outlineWidth={0.05} outlineColor="#16212b" renderOrder={20} material-depthTest={false}>
        {texto}
      </Text>
    </Billboard>
  );
}

/* Tubos con grosor real (cilindros entre punto y punto) */
function Tuberia({ pts, h, color, r = 0.05 }: { pts: D.Pt[]; h: number; color: string; r?: number }) {
  const { segs, vs } = useMemo(() => {
    const vs = pts.map((p) => new Vector3(...D.v(p, h)));
    const segs = vs.slice(1).map((b, i) => {
      const a = vs[i];
      const d = b.clone().sub(a);
      const L = d.length();
      const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize());
      return { pos: a.clone().add(b).multiplyScalar(0.5), q, L };
    });
    return { segs, vs };
  }, [pts, h]);
  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={s.pos} quaternion={s.q} castShadow={r >= 0.04}>
          <cylinderGeometry args={[r, r, s.L, 10]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
      {vs.map((v, i) => (
        <mesh key={i} position={v}>
          <sphereGeometry args={[r * 1.15, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Lampara({ p, color, luz }: { p: D.Pt; color: string; luz: number }) {
  const enc = luz > 0;
  return (
    <group position={D.v(p, 2.2)}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.28, 0.22, 20, 1, true]} />
        <meshStandardMaterial color={enc ? "#ffd98a" : color} emissive={enc ? "#ffbf4d" : "#000000"} emissiveIntensity={enc ? 0.8 : 0} side={DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshBasicMaterial color={enc ? "#fff3c4" : "#ffe9a8"} />
      </mesh>
      {enc && <pointLight position={[0, -0.15, 0]} intensity={luz} distance={8} decay={1.6} color="#ffd9a0" />}
    </group>
  );
}

function SalidaFuerza({ p, tipo }: { p: D.Pt; tipo: "estufa" | "refri" }) {
  return (
    <group>
      <Bloque p={p} size={[0.3, 0.15, 0.3]} color={tipo === "estufa" ? "#ff8a00" : "#00b7d4"} rough={0.4} />
      <Rotulo texto={tipo === "estufa" ? "PE-ESTUFA" : "PE-REFRIG"} p={p} h={3.3} tam={0.22} />
    </group>
  );
}

function Ejes() {
  const linea = { color: "#6f6f6f", dashed: true, dashSize: 0.5, gapSize: 0.3, lineWidth: 1 };
  return (
    <group>
      {D.ejesColumnas.map(([n, x]) => (
        <group key={"c" + n}>
          <Line points={[D.v([x, 95], 0.03), D.v([x, 825], 0.03)]} {...linea} />
          <Rotulo texto={n} p={[x, 65]} h={0.6} tam={0.8} />
        </group>
      ))}
      {D.ejesFilas.map(([n, y]) => (
        <group key={"f" + n}>
          <Line points={[D.v([60, y], 0.03), D.v([1480, y], 0.03)]} {...linea} />
          <Rotulo texto={n} p={[25, y]} h={0.6} tam={0.8} />
        </group>
      ))}
    </group>
  );
}

/* ---------- Escena completa ---------- */
type Props = { on: Set<string>; opacidad: number; ambiente: Ambiente; sombras: boolean };

export default function Escena3D({ on, opacidad, ambiente, sombras }: Props) {
  const a = AMB[ambiente];
  const h = (k: string) => on.has(k);
  const colorCircuito = (id: string) => D.circuitos.find((c) => c.id === id)?.color ?? "#ffd34d";
  const t = D.v(D.tablero);

  return (
    <>
      <color attach="background" args={[a.bg]} />
      <fog attach="fog" args={[a.bg, 70, 150]} />
      <hemisphereLight args={["#ffffff", "#8899aa", a.hemi]} />
      <directionalLight
        position={a.sunPos}
        intensity={a.sun}
        color={a.sunColor}
        castShadow={sombras}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <circleGeometry args={[90, 48]} />
        <meshStandardMaterial color={a.ground} roughness={1} />
      </mesh>

      {h("muros") && (
        <group>
          {D.pisos.map((p, i) => <Piso key={i} d={p} i={i} />)}
          {D.muros.map((m, i) => <Muro key={i} m={m} opacidad={opacidad} />)}
        </group>
      )}

      {h("mobiliario") && <group>{D.mesas.map((p, i) => <Mesa key={i} p={p} />)}</group>}
      {h("mesasNum") && D.mesas.map((p, i) => <Rotulo key={i} texto={`M${i + 1}`} p={p} h={1.6} tam={0.3} />)}

      {h("equipo") && (
        <group>
          {D.estufas.map((p, i) => <Estufa key={i} p={p} />)}
          {D.estufasPared.map((p, i) => <Estufa key={"p" + i} p={p} />)}
          <Bloque p={[1220, 168]} size={[2.6, 0.4, 1]} color="#b9c2c8" y0={2} rough={0.35} metal={0.25} />
          <Bloque p={[1230, 250]} size={[3.2, 0.4, 1.4]} color="#b9c2c8" y0={2} rough={0.35} metal={0.25} />
          <Bloque p={[1230, 250]} size={[0.6, 0.6, 0.6]} color="#b9c2c8" y0={2.4} rough={0.35} metal={0.25} />
          <Bloque p={[1235, 365]} size={[3, 0.88, 0.9]} color="#9aa5ad" rough={0.35} metal={0.25} />
          <Bloque p={[1235, 365]} size={[3.1, 0.05, 1]} color="#dde2e5" y0={0.88} rough={0.25} metal={0.25} />
          <Bloque p={[1058, 265]} size={[0.7, 1.8, 2.6]} color="#7a8a99" rough={0.5} />
          {D.refrigeradores.map((p, i) => <Refri key={i} p={p} />)}
          <Bloque p={D.fregadero} size={[1.2, 0.9, 0.7]} color="#c9d2d8" rough={0.3} metal={0.2} />
          <Bloque p={D.fregadero} size={[0.8, 0.02, 0.45]} color="#4a5560" y0={0.9} />
          {D.estantes.map((p, i) => <Bloque key={i} p={p} size={[1.1, 1.8, 0.5]} color="#9c7a4f" />)}
          {D.wcs.map((w, i) => <Wc key={i} w={w} />)}
          {[710, 740].map((y) => <Bloque key={"l" + y} p={[870, y]} size={[2, 1.8, 0.05]} color="#cfd8de" />)}
          {[710, 740].map((y) => <Bloque key={"r" + y} p={[1160, y]} size={[2, 1.8, 0.05]} color="#cfd8de" />)}
          {D.lavabos.map((p, i) => <Bloque key={i} p={p} size={[0.6, 0.12, 0.4]} color="#ffffff" y0={0.85} rough={0.15} />)}
        </group>
      )}

      {h("detalles") && (
        <group>
          {D.puertas.map((r, i) => <Puerta key={i} r={r} />)}
          {D.plantas.map((p, i) => <Planta key={i} p={p} />)}
          <Pergola />
          {[620, 740, 880].map((x) => (
            <group key={x}>
              <Bloque p={[x, 140.5]} size={[1.1, 0.75, 0.04]} color="#4b3a2c" y0={1.5} />
              <Bloque p={[x, 140.8]} size={[0.9, 0.55, 0.05]} color="#d0b48a" y0={1.6} />
            </group>
          ))}
        </group>
      )}

      {h("etiquetas") && D.etiquetas.map(([n, x, y]) => <Rotulo key={n} texto={n} p={[x, y]} />)}
      {h("cotas") && <Ejes />}

      {h("fria") && D.aguaFria.map((l, i) => <Tuberia key={i} pts={l} h={0.3} color="#1f6fe0" />)}
      {h("caliente") && D.aguaCaliente.map((l, i) => <Tuberia key={i} pts={l} h={0.5} color="#e02b2b" />)}
      {h("hidEquipos") && (
        <group>
          <Bloque p={D.medidor} size={[0.45, 0.3, 0.45]} color="#0a3d91" y0={0.3} />
          <Rotulo texto="Medidor" p={D.medidor} h={3.4} tam={0.3} />
          <mesh position={D.v(D.calentador, 0.7)} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 1.2, 20]} />
            <meshStandardMaterial color="#d62020" roughness={0.35} metalness={0.2} />
          </mesh>
          <Rotulo texto="Calentador" p={D.calentador} h={3.4} tam={0.3} />
          {D.valvulas.map((p, i) => (
            <mesh key={i} position={D.v(p, 0.4)} castShadow>
              <octahedronGeometry args={[0.14]} />
              <meshStandardMaterial color="#0d2a66" roughness={0.4} metalness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {h("lamparas") && D.lamparas.map(({ p, c }, i) => <Lampara key={i} p={p} color={colorCircuito(c)} luz={a.lamps} />)}
      {D.circuitos.map((c) => h("c:" + c.id) && c.rutas.map((r, i) => <Tuberia key={c.id + i} pts={r} h={c.alto} color={c.color} r={0.025} />))}

      {h("tomas") && (
        <group>
          <mesh position={[t[0], 1.5, t[2]]} castShadow>
            <boxGeometry args={[0.5, 0.8, 0.2]} />
            <meshStandardMaterial color="#8a8f94" roughness={0.4} metalness={0.2} />
          </mesh>
          <Rotulo texto="Tablero" p={D.tablero} h={3.4} tam={0.3} />
          {D.tomacorrientes.map((p, i) => <Bloque key={i} p={p} size={[0.25, 0.18, 0.25]} color="#222222" y0={0.4} />)}
          {D.salidasFuerza.map(({ p, tipo }, i) => <SalidaFuerza key={i} p={p} tipo={tipo} />)}
        </group>
      )}
    </>
  );
}