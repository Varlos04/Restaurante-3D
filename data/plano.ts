// Todas las coordenadas están en PÍXELES de tus imágenes (planos).
// La función v() las convierte a metros para Three.js.
export type Pt = [number, number];
export type Rect = [number, number, number, number];
export type Muro = [number, number, number, number, number, number]; // x1, y1, x2, y2, alto, grosor
export type Vec3 = [number, number, number];

export const S = 1 / 50; // 50 px = 1 metro
const CX = 780;
const CY = 460;
export const v = (p: Pt, h = 0): Vec3 => [(p[0] - CX) * S, h, (p[1] - CY) * S];

export const pisos: [number, number, number, number, string][] = [
  [95, 135, 500, 455, "#c9a57a"], // terraza (termina donde empieza el salón)
  [500, 135, 1030, 790, "#e3d9c6"], // salón
  [1030, 135, 1450, 570, "#bfc7cc"], // cocina
  [1030, 570, 1450, 790, "#cfd3d6"], // bodega
  [820, 665, 1210, 790, "#d5dde2"], // baños
];

export const muros: Muro[] = [
  [95, 135, 525, 135, 1.1, 0.15], [95, 135, 95, 455, 1.1, 0.15], [95, 455, 505, 455, 1.1, 0.15],
  [525, 135, 1450, 135, 3, 0.18], [1450, 135, 1450, 790, 3, 0.18], [500, 790, 1450, 790, 3, 0.18],
  [505, 455, 505, 620, 3, 0.18], [505, 760, 505, 790, 3, 0.18],
  [1030, 135, 1030, 400, 3, 0.18], [1030, 460, 1030, 570, 3, 0.18],
  [1030, 570, 1075, 570, 3, 0.18], [1165, 570, 1385, 570, 3, 0.18],
  [820, 665, 940, 665, 3, 0.18], [1000, 665, 1060, 665, 3, 0.18], [1110, 665, 1210, 665, 3, 0.18], [1030, 665, 1030, 790, 3, 0.18],
  [820, 665, 820, 790, 3, 0.18], [1210, 665, 1210, 790, 3, 0.18],
];

// Huecos de puertas (se dibuja marco y dintel)
export const puertas: Rect[] = [
  [505, 620, 505, 760], // entrada
  [1030, 400, 1030, 460], // salón -> cocina
  [1075, 570, 1165, 570], // cocina -> bodega
  [1385, 570, 1445, 570], // cocina -> bodega (puerta oriente)
  [940, 665, 1000, 665], // baño 1
  [1060, 665, 1110, 665], // baño 2
];

export const mesas: Pt[] = [
  [225, 225], [405, 225], [325, 340], [750, 220], [913, 280], [645, 335],
  [790, 385], [625, 515], [880, 485], [755, 575], [915, 590],
];

// Detalles
export const plantas: Pt[] = [[130, 175], [130, 415], [490, 175], [490, 415]];
export const wcs: [number, number, number][] = [
  [860, 695, -1], [860, 725, -1], [860, 755, -1], [1165, 695, 1], [1165, 725, 1], [1165, 755, 1],
];
export const lavabos: Pt[] = [[1065, 640], [1130, 640]];
export const estufas: Pt[] = [[1205, 250], [1255, 250]];
export const refrigeradores: Pt[] = [[1415, 220], [1415, 275], [1415, 325]];
export const estantes: Pt[] = [[1250, 750], [1310, 750], [1370, 750]];
export const fregadero: Pt = [1240, 535];

export const etiquetas: [string, number, number][] = [
  ["TERRAZA · 48 m²", 250, 300], ["SALÓN · 240 m²", 720, 450], ["COCINA · 96 m²", 1240, 330],
  ["BAÑOS · 7 m²", 1015, 730], ["BODEGA", 1320, 690], ["ENTRADA", 580, 700], ["EMPLEADOS", 1058, 262],
];

// ---- HIDRÁULICA ----
export const aguaFria: Pt[][] = [
  [[305, 760], [1375, 770], [1375, 215]],
  [[105, 145], [1440, 145]],
  [[160, 145], [160, 200]], [[462, 145], [462, 200]],
  [[1125, 145], [1125, 440], [1365, 440]],
  [[820, 655], [820, 760]], [[820, 655], [1020, 655]],
  [[1030, 645], [1230, 645], [1230, 770]],
];
export const aguaCaliente: Pt[][] = [
  [[1135, 225], [1365, 225], [1365, 470], [995, 480], [995, 650]],
  [[1135, 225], [1135, 430]],
  [[905, 650], [995, 650]], [[905, 650], [905, 760]],
  [[1110, 650], [1030, 650]], [[1110, 650], [1110, 760]],
];
export const medidor: Pt = [405, 762];
export const calentador: Pt = [1030, 610];
export const valvulas: Pt[] = [[430, 762], [1125, 200], [1375, 300], [820, 700], [1230, 700], [160, 175], [462, 175]];

// ---- ELÉCTRICA ----
export const tablero: Pt = [685, 690];
const T = tablero;
export type Circuito = { id: string; nombre: string; color: string; rutas: Pt[][]; alto: number };
export const circuitos: Circuito[] = [
  { id: "C1", nombre: "C1 · Iluminación terraza", color: "#ff4d4d", alto: 3.1,
    rutas: [[T, [530, 640], [530, 430], [325, 430], [325, 340], [405, 225]], [[325, 340], [225, 225]]] },
  { id: "C2", nombre: "C2 · Iluminación salón", color: "#ff9f1a", alto: 3.1,
    rutas: [[T, [755, 575], [625, 515], [645, 335], [750, 220]], [[790, 385], [913, 280]], [T, [915, 590], [880, 485], [790, 385], [645, 335]]] },
  { id: "C3", nombre: "C3 · Iluminación cocina", color: "#b84bff", alto: 3.1,
    rutas: [[T, [1000, 690], [1000, 440], [1115, 440], [1115, 375], [1115, 220], [1335, 220], [1335, 375]]] },
  { id: "C5", nombre: "C5 · Iluminación y baños", color: "#12b8a0", alto: 3.1,
    rutas: [[T, [930, 690], [930, 745]], [[930, 690], [1090, 690], [1090, 745]]] },
  { id: "F", nombre: "Fuerza · estufas y refrigeración", color: "#e6b800", alto: 0.9,
    rutas: [[T, [1000, 520], [1255, 520], [1255, 300]], [[1255, 520], [1400, 520], [1400, 430]]] },
];
const lc = (ps: Pt[], c: string) => ps.map((p) => ({ p, c }));
export const lamparas = [
  ...lc(mesas.slice(0, 3), "C1"), ...lc(mesas.slice(3), "C2"),
  ...lc([[1115, 220], [1335, 220], [1115, 375], [1335, 375]], "C3"), ...lc([[930, 745], [1090, 745]], "C5"),
];
export const tomacorrientes: Pt[] = [
  [160, 140], [405, 140], [635, 140], [885, 140], [1110, 140], [1330, 140],
  [108, 295], [145, 447], [322, 447], [465, 447], [627, 785], [775, 790], [1113, 790], [1315, 790],
  [1440, 218], [1440, 438], [1440, 710], [1028, 290], [1407, 222], [1407, 275], [1407, 328], [1323, 592],
];

// ---- VISTAS DE CÁMARA (en metros) ----
export const vistas: Record<string, { nombre: string; pos: Vec3; target: Vec3 }> = {
  general: { nombre: "General", pos: [18, 22, 22], target: [0, 0, 0] },
  aerea: { nombre: "Planta (arriba)", pos: [0, 42, 0.1], target: [0, 0, 0] },
  salon: { nombre: "Salón", pos: [-9, 7, 10], target: [-0.2, 0, 0] },
  terraza: { nombre: "Terraza", pos: [-8, 6, 5], target: [-9.4, 0, -3.3] },
  cocina: { nombre: "Cocina", pos: [14, 7, 6], target: [9.2, 0, -2.2] },
  banos: { nombre: "Baños y bodega", pos: [9, 8, 14], target: [8, 0, 6] },
  entrada: { nombre: "Entrada", pos: [-12, 4, 10], target: [-4, 1, 4.6] },
};

// ---- DETALLES TOMADOS DE LOS PLANOS ----
// Estufas sobre el muro norte de la cocina
export const estufasPared: Pt[] = [[1190, 168], [1250, 168]];
// Salidas de fuerza (PE-ESTUFA y PE-REFRIG) del plano eléctrico
export const salidasFuerza: { p: Pt; tipo: "estufa" | "refri" }[] = [
  { p: [1215, 198], tipo: "estufa" }, { p: [1175, 280], tipo: "estufa" },
  { p: [1252, 280], tipo: "estufa" }, { p: [1280, 494], tipo: "estufa" },
  { p: [1405, 430], tipo: "refri" }, { p: [1336, 538], tipo: "refri" },
];
// Ejes constructivos (círculos D, A, B, C y filas C, A de los planos)
export const ejesColumnas: [string, number][] = [["D", 95], ["A", 525], ["B", 1030], ["C", 1445]];
export const ejesFilas: [string, number][] = [["C", 155], ["A", 455]];