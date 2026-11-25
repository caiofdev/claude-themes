// Generates the christmas-eve SVG scene: a snowy night with a lit tree, a cabin and falling snow.
// Usage: node gen-scene.js <path to hooks/scene.ts>
const fs = require('fs')
const out = process.argv[2]
let seed = 2512
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const r = (a, b) => a + rnd() * (b - a)
const f = n => n.toFixed(0)
const W = 1600, H = 900

// A pine as stacked tiers, each with a snow cap along its top.
function pine(x, base, h, w, fill = '#123826', snow = '#e6eef8') {
  const tiers = 4
  let body = '', caps = ''
  for (let i = 0; i < tiers; i++) {
    const t0 = base - h + (h * i) / (tiers + 0.4)
    const t1 = t0 + h / (tiers - 0.6)
    const ww = w * (0.45 + 0.55 * ((i + 1) / tiers))
    body += `M${f(x)} ${f(t0)}L${f(x + ww)} ${f(t1)}H${f(x - ww)}Z`
    const cy = t0 + (t1 - t0) * 0.35
    const cw = ww * 0.35
    caps += `M${f(x)} ${f(t0)}L${f(x + cw)} ${f(cy)}Q${f(x)} ${f(cy - 6)} ${f(x - cw)} ${f(cy)}Z`
  }
  const trunk = `M${f(x - w * 0.08)} ${f(base - h * 0.06)}h${f(w * 0.16)}v${f(h * 0.08)}h${f(-w * 0.16)}Z`
  return { body, caps, trunk, fill, snow }
}

function forest(list) {
  const byFill = {}
  let caps = '', trunks = ''
  for (const p of list) {
    byFill[p.fill] = (byFill[p.fill] || '') + p.body
    caps += p.caps
    trunks += p.trunk
  }
  return `<path d="${trunks}" fill="#2a1a12"/>` +
    Object.entries(byFill).map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('') +
    `<path d="${caps}" fill="#e6eef8" opacity=".92"/>`
}

function stars(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const cls = rnd() < 0.3 ? ` class="tw" style="animation-delay:-${r(0, 6).toFixed(1)}s"` : ''
    s += `<circle${cls} cx="${f(r(0, W))}" cy="${f(r(0, 420))}" r="${r(0.6, 1.8).toFixed(1)}"/>`
  }
  return `<g fill="#fff6dd">${s}</g>`
}

// Snow: flakes over two stacked screens, the group slides down one screen and loops.
function snow(n, rMin, rMax, dur, op, cls) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = r(0, W), y = r(0, H), rr = r(rMin, rMax).toFixed(1)
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${rr}"/><circle cx="${f(x)}" cy="${f(y - H)}" r="${rr}"/>`
  }
  return `<g class="${cls}" fill="#ffffff" opacity="${op}" style="animation-duration:${dur}s">${s}</g>`
}

// The lit tree, right of center, away from the words.
function bigTree(x, base, h) {
  const p = pine(x, base, h, h * 0.36, '#17482f')
  const colors = ['#ff4d5e', '#ffd166', '#7ee081', '#6ec8ff', '#ff9ff3']
  let lights = ''
  for (let row = 1; row <= 7; row++) {
    const y = base - h + (h * row) / 8.2
    const half = (h * 0.36) * (0.25 + 0.75 * row / 8) * 0.85
    const k = 3 + row
    for (let j = 0; j < k; j++) {
      const lx = x - half + (2 * half * (j + 0.5)) / k
      const ly = y + Math.sin(j * 1.3 + row) * 6 + ((lx - x) / half) * 10
      lights += `<circle class="bulb" style="animation-delay:-${r(0, 5).toFixed(1)}s" cx="${f(lx)}" cy="${f(ly)}" r="4" fill="${colors[(j + row) % colors.length]}"/>`
    }
  }
  const sx = x, sy = base - h - 4
  const star = `<path d="M${sx} ${sy - 22}l6 14 15 1-11 10 4 15-14-8-14 8 4-15-11-10 15-1z" fill="#ffd166"/>`
  return { p, lights: `<g filter="url(#glow)">${lights}</g>`, star }
}

function gifts(x, base) {
  const g = [
    [x - 70, 46, 38, '#b3263a', '#ffd166'],
    [x - 22, 36, 30, '#1f6b45', '#e6eef8'],
    [x + 22, 50, 44, '#ffd166', '#b3263a'],
    [x + 76, 34, 28, '#2f5fa8', '#ffd166'],
  ]
  return g.map(([gx, w, h, c, rb]) =>
    `<rect x="${f(gx - w / 2)}" y="${f(base - h)}" width="${w}" height="${h}" rx="3" fill="${c}"/>` +
    `<rect x="${f(gx - 3)}" y="${f(base - h)}" width="6" height="${h}" fill="${rb}"/>` +
    `<rect x="${f(gx - w / 2)}" y="${f(base - h / 2 - 3)}" width="${w}" height="6" fill="${rb}"/>`
  ).join('')
}

const back = [], mid = []
for (let i = 0; i < 26; i++) back.push(pine(r(-20, W + 20), r(600, 640), r(90, 150), r(26, 40), '#0d2a22'))
for (const x of [60, 150, 230, 1400, 1490, 1570, 320, 1310]) mid.push(pine(x + r(-20, 20), r(700, 740), r(170, 250), r(48, 64), '#123826'))
const big = bigTree(1150, 760, 360)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070c1f"/><stop offset=".6" stop-color="#14224a"/><stop offset="1" stop-color="#2a3a6a"/></linearGradient>
<radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#fff8e6" stop-opacity=".9"/><stop offset=".6" stop-color="#fff2cc" stop-opacity=".25"/><stop offset="1" stop-color="#fff2cc" stop-opacity="0"/></radialGradient>
<radialGradient id="warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf70" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient>
<linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d6ea"/><stop offset="1" stop-color="#8fa2c4"/></linearGradient>
<linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3fb"/><stop offset="1" stop-color="#b7c6de"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.fall{animation-name:fall;animation-timing-function:linear;animation-iteration-count:infinite}
.tw{animation:tw 7s ease-in-out infinite}
.bulb{animation:bulb 5s ease-in-out infinite}
.win{animation:win 9s ease-in-out infinite}
@keyframes fall{from{transform:translateY(0)}to{transform:translateY(${H}px)}}
@keyframes tw{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes bulb{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes win{0%,100%{opacity:.9}50%{opacity:.7}}
</style>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars(150)}
<circle cx="1360" cy="150" r="110" fill="url(#moon)"/>
<circle cx="1360" cy="150" r="56" fill="#fff8e6"/>
<circle cx="1342" cy="138" r="9" fill="#efe4c8"/><circle cx="1378" cy="168" r="6" fill="#efe4c8"/>
${snow(70, 0.8, 1.6, 60, 0.55, 'fall')}
<path d="M0 640Q200 590 420 625T860 610T1300 630T1600 600V${H}H0Z" fill="url(#hill1)"/>
${forest(back)}
<path d="M0 720Q260 670 560 705T1100 700T1600 690V${H}H0Z" fill="url(#hill2)"/>
<g>
<ellipse cx="420" cy="705" rx="150" ry="70" fill="url(#warm)"/>
<rect x="350" y="640" width="140" height="80" fill="#4a2c1c"/>
<path d="M335 645L420 585L505 645Z" fill="#3a2016"/>
<path d="M330 648L420 580L510 648L500 652L420 592L340 652Z" fill="#eef3fb"/>
<rect x="455" y="592" width="18" height="34" fill="#3a2016"/><rect x="452" y="588" width="24" height="7" rx="3" fill="#eef3fb"/>
<rect class="win" x="368" y="660" width="34" height="28" fill="#ffcf70"/>
<rect class="win" x="440" y="660" width="34" height="28" fill="#ffcf70"/>
<path d="M385 660v28M368 674h34M457 660v28M440 674h34" stroke="#4a2c1c" stroke-width="3"/>
<rect x="404" y="682" width="28" height="38" fill="#2a1a12"/>
</g>
${forest(mid)}
${forest([big.p])}
${big.lights}
${big.star}
${gifts(1150, 770)}
<path d="M0 800Q400 770 800 795T1600 785V${H}H0Z" fill="#f4f7fc"/>
${snow(60, 1.4, 2.6, 34, 0.8, 'fall')}
${snow(26, 2.6, 4, 20, 0.9, 'fall')}
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`

fs.writeFileSync(out, `// Generated by tools/gen-scene.js: a snowy Christmas night with a lit tree, a cabin and falling snow.\nexport const SCENE = ${JSON.stringify(svg)}\n`)
console.log('chars', svg.length)
