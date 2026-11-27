// Generates the atacama-night SVG scene: a desert sky with the Milky Way, the Magellanic Clouds,
// a distant spiral galaxy, a dark desert ridge and an old abandoned bus.
// Usage: node gen-scene.js <path to hooks/scene.ts>
const fs = require('fs')
const out = process.argv[2]
let seed = 1977
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const r = (a, b) => a + rnd() * (b - a)
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd())
const f = n => n.toFixed(0)
const W = 1600, H = 900, HORIZON = 700

const starColors = ['#ffffff', '#dfe6ff', '#cfd8ff', '#fff1d6', '#e8dcff']

// Stars grouped by color, so each circle carries only its place and size.
function grouped(n, place, rMin, rMax, baseOpacity) {
  const g = starColors.map(() => '')
  for (let i = 0; i < n; i++) {
    const [x, y] = place()
    g[i % 5] += `<circle cx="${f(x)}" cy="${f(y)}" r="${r(rMin, rMax).toFixed(1)}"/>`
  }
  return g.map((c, i) => `<g fill="${starColors[i]}" opacity="${(baseOpacity + i * 0.08).toFixed(2)}">${c}</g>`).join('')
}

// Plain stars over the whole sky, a little thinner toward the horizon.
const field = n => grouped(n, () => [r(0, W), r(0, HORIZON) * Math.sqrt(rnd() * 0.4 + 0.6)], 0.4, 1.3, 0.6)

// Stars packed along the band, in the band's own frame (x along it, y across it).
const bandStars = n => grouped(n, () => [r(-300, 1900), gauss() * 60], 0.3, 1, 0.5)

// Mottled light and dark dust along the band.
function clumps(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const dark = rnd() < 0.35
    const x = r(-100, 1700), y = gauss() * (dark ? 14 : 30)
    const fill = dark ? '#050920' : ['#d9d2ff', '#b7adf0', '#f1e9ff'][i % 3]
    const op = dark ? r(0.35, 0.6) : r(0.15, 0.4)
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r(30, 110))}" ry="${f(r(8, 26))}" fill="${fill}" opacity="${op.toFixed(2)}"/>`
  }
  return s
}

// Bright stars with a soft glow; some twinkle slowly.
function bright(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const cls = i % 3 === 0 ? ` class="tw" style="animation-delay:-${r(0, 8).toFixed(1)}s"` : ''
    const x = f(r(0, W)), y = f(r(0, HORIZON - 40)), c = starColors[i % 5]
    s += `<g${cls}><circle cx="${x}" cy="${y}" r="5" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r(1.4, 2.2).toFixed(1)}" fill="${c}"/></g>`
  }
  return s
}

// The old bus, lower right, away from the words: a body with empty window frames.
function bus(x, y) {
  const w = 300, h = 120
  let win = ''
  for (let i = 0; i < 7; i++) {
    win += `<rect x="${x + 50 + i * 34}" y="${y + 20}" width="26" height="40" fill="url(#busWin)"/>`
  }
  return `<g>
<path d="M${x + 14} ${y + 6}Q${x + 4} ${y + 10} ${x + 2} ${y + 40}V${y + h - 12}H${x + w}V${y + 14}Q${x + w} ${y + 4} ${x + w - 14} ${y + 4}Z" fill="#223234"/>
<path d="M${x + 10} ${y + 4}H${x + w - 12}" stroke="#7d8a86" stroke-width="5" stroke-linecap="round" opacity=".7"/>
<path d="M${x + 4} ${y + 68}H${x + w}" stroke="#2f4144" stroke-width="3"/>
<rect x="${x + 8}" y="${y + 18}" width="30" height="44" rx="6" fill="url(#busWin)"/>
${win}
<path d="M${x + 2} ${y + h - 14}H${x + w}" stroke="#0f1515" stroke-width="6"/>
<path d="M${x + 60} ${y + 90}l14 -6M${x + 180} ${y + 96}l22 -4M${x + 240} ${y + 84}l10 8" stroke="#5c4632" stroke-width="3" opacity=".6"/>
</g>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04071a"/><stop offset=".55" stop-color="#0b1840"/><stop offset=".78" stop-color="#1a3170"/><stop offset="1" stop-color="#2c4a8a"/></linearGradient>
<linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#1c1410"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b211b"/><stop offset="1" stop-color="#120d0a"/></linearGradient>
<linearGradient id="busWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16255a"/><stop offset="1" stop-color="#22386e"/></linearGradient>
<linearGradient id="meteor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient>
<radialGradient id="cloud" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e6e2ff" stop-opacity=".55"/><stop offset="1" stop-color="#e6e2ff" stop-opacity="0"/></radialGradient>
<radialGradient id="galaxy" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4e0"/><stop offset=".25" stop-color="#d9cfff" stop-opacity=".6"/><stop offset="1" stop-color="#9aa6ff" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".42" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<filter id="soft" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="26"/></filter>
<filter id="clump" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
</defs>
<style>
.tw{animation:tw 8s ease-in-out infinite}
.met{opacity:0;animation:met 22s linear infinite}
@keyframes tw{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes met{0%,93%{opacity:0;transform:translate(0,0)}95%{opacity:.9}100%{opacity:0;transform:translate(260px,120px)}}
</style>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g>${field(800)}</g>
<g transform="translate(260 40) rotate(30)">
<g filter="url(#soft)">
<ellipse cx="800" cy="0" rx="1100" ry="120" fill="#5b5fb8" opacity=".35"/>
<ellipse cx="760" cy="-10" rx="820" ry="70" fill="#9a8fe0" opacity=".3"/>
<ellipse cx="640" cy="0" rx="420" ry="48" fill="#d9d2ff" opacity=".28"/>
<ellipse cx="1050" cy="12" rx="360" ry="40" fill="#c8c2f5" opacity=".22"/>
</g>
<g filter="url(#clump)">${clumps(70)}</g>
${bandStars(1900)}
</g>
<g filter="url(#softer)">
<ellipse cx="1330" cy="150" rx="70" ry="42" fill="url(#cloud)" transform="rotate(-20 1330 150)"/>
<ellipse cx="1460" cy="250" rx="38" ry="24" fill="url(#cloud)" opacity=".8"/>
</g>
<ellipse cx="230" cy="470" rx="46" ry="12" fill="url(#galaxy)" transform="rotate(-32 230 470)" opacity=".85"/>
${bright(40)}
<g class="met"><path d="M120 120l170 78" stroke="url(#meteor)" stroke-width="2" stroke-linecap="round"/></g>
<path d="M0 ${HORIZON - 10}Q120 ${HORIZON - 40} 260 ${HORIZON - 20}T520 ${HORIZON - 8}Q700 ${HORIZON + 10} 900 ${HORIZON - 30}T1240 ${HORIZON - 22}T1600 ${HORIZON - 40}V${H}H0Z" fill="url(#ridge)"/>
<path d="M0 ${HORIZON + 50}Q400 ${HORIZON + 36} 800 ${HORIZON + 52}T1600 ${HORIZON + 44}V${H}H0Z" fill="url(#ground)"/>
${bus(1120, HORIZON - 40)}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`

fs.writeFileSync(out, `// Generated by tools/gen-scene.js: a desert night sky with the Milky Way, galaxies and an old bus.\nexport const SCENE = ${JSON.stringify(svg)}\n`)
console.log('chars', svg.length)
