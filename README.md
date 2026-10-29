# Restaurante 3D · Cocina Nacional

Visor 3D de un restaurante para 96 clientes.

Tecnologías: Next.js, React, TypeScript, Tailwind CSS, Three.js, React Three Fiber y drei.

## Qué muestra

- **Estructura:** terraza con pérgola, salón, cocina, bodega y baños, con muros, puertas, mesas y sillas.
- **Hidráulica:** agua fría (azul), agua caliente (roja), medidor, calentador y válvulas.
- **Eléctrica:** tablero, circuitos C1, C2, C3, C5 y fuerza, luminarias, tomacorrientes y salidas PE-ESTUFA / PE-REFRIG.
- **Vistas de cámara:** general, planta, salón, terraza, cocina, baños y entrada.
- **Ambientes:** día, tarde y noche, con sombras.
- Muros transparentes, leyenda, ejes y medidas, y captura PNG.

## Cómo usarlo

Necesitas tener instalado [Node.js](https://nodejs.org) (versión LTS).

```powershell
git clone https://github.com/TU-USUARIO/restaurante-3d.git
cd restaurante-3d
npm install
npm run dev
```

Abre http://localhost:3000 en el navegador.

También puedes usar el botón verde **Code → Download ZIP**, descomprimir la carpeta, abrir una terminal dentro de ella y correr `npm install` y `npm run dev`.

## Estructura

- `data/plano.ts`: coordenadas del plano (muros, mesas, tuberías, circuitos).
- `components/Escena3D.tsx`: modelo 3D (texturas, sombras, muebles, instalaciones).
- `components/Restaurante3D.tsx`: cámara, menú y controles.
- `app/page.tsx`: página principal.
