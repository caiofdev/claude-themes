// Generates the pine-lake SVG scene and writes it as a TS module.
const fs = require('fs')
const out = process.argv[2]
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const r = (a, b) => a + rnd() * (b - a)
const W = 1600, H = 900, SHORE = 640

function tree(x, base, h, w) {
  const top = base - h
  const tiers = Math.max(5, Math.round(h / 45))
  const L = [], R = []
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers
    const y = top + t * h * 0.92
    const ww = w * (0.15 + 0.85 * t) * r(0.75, 1.15)
    L.push(`${(x - ww).toFixed(0)} ${y.toFixed(0)}`, `${(x - ww * 0.35).toFixed(0)} ${(y - 3).toFixed(0)}`)
    R.push(`${(x + ww * 0.35).toFixed(0)} ${(y - 3).toFixed(0)}`, `${(x + ww).toFixed(0)} ${y.toFixed(0)}`)
  }
  R.reverse()
  return `M${x.toFixed(0)} ${top.toFixed(0)}L${R.join(' ')} ${x + 2} ${base}H${x - 2}L${L.join(' ')}Z`
}

function layer(n, topMin, topMax, wMin, wMax, fill, extra = '') {
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = r(-30, W + 30)
    const top = r(topMin, topMax)
    const h = SHORE + 10 - top
    d += tree(x, SHORE + 10, h, r(wMin, wMax) * (h / 500))
  }
  return `<path d="${d}" fill="${fill}"${extra}/>`
}

function snags(n) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = r(20, W - 20), top = r(120, 460)
    d += `M${x.toFixed(0)} ${top.toFixed(0)}V${SHORE + 4}`
    for (let y = top + 20; y < SHORE - 60; y += r(18, 40)) {
      const s = rnd() < 0.5 ? -1 : 1
      d += `M${x.toFixed(0)} ${y.toFixed(0)}l${(s * r(6, 16)).toFixed(0)} ${(-r(4, 10)).toFixed(0)}`
    }
  }
  return `<path d="${d}" stroke="#8fd6d0" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".55"/>`
}

function rocks(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += `<ellipse cx="${r(0, W).toFixed(0)}" cy="${r(SHORE + 2, SHORE + 14).toFixed(0)}" rx="${r(5, 18).toFixed(0)}" ry="${r(3, 7).toFixed(0)}"/>`
  }
  return `<g fill="#6e9e9a" opacity=".55">${s}</g>`
}

function streaks(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += `<rect x="${r(0, W).toFixed(0)}" y="${SHORE + 18}" width="${r(1.5, 4).toFixed(1)}" height="${r(80, 230).toFixed(0)}"/>`
  }
  return `<g fill="url(#streak)" opacity=".5">${s}</g>`
}

function shimmer(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const y = r(SHORE + 16, SHORE + 70)
    s += `<rect class="sh" style="animation-delay:-${r(0, 12).toFixed(1)}s" x="${r(0, W).toFixed(0)}" y="${y.toFixed(0)}" width="${r(20, 90).toFixed(0)}" height="1.4" rx=".7"/>`
  }
  return `<g fill="#bff6f4">${s}</g>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c0a"/><stop offset="1" stop-color="#0a1a16"/></linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46e6df"/><stop offset=".15" stop-color="#25c9c8"/><stop offset=".5" stop-color="#14959a"/><stop offset="1" stop-color="#0a4b4f"/></linearGradient>
<linearGradient id="streak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe7e2" stop-opacity=".7"/><stop offset="1" stop-color="#9fe7e2" stop-opacity="0"/></linearGradient>
<linearGradient id="lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8a64"/><stop offset="1" stop-color="#1c4a3a"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<style>
.mist{animation:drift 90s ease-in-out infinite alternate}
.mist2{animation:drift 120s ease-in-out infinite alternate-reverse}
.sh{opacity:.25;animation:glint 9s ease-in-out infinite}
@keyframes drift{from{transform:translateX(-80px)}to{transform:translateX(80px)}}
@keyframes glint{0%,100%{opacity:.1}50%{opacity:.45}}
</style>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${layer(120, -80, 260, 40, 70, '#0b1d18')}
${layer(95, 40, 360, 45, 80, '#123328')}
${snags(26)}
${layer(55, 160, 460, 50, 90, 'url(#lit)', ' opacity=".9"')}
<rect y="${SHORE}" width="${W}" height="16" fill="#0d1f1b"/>
${rocks(40)}
<rect y="${SHORE + 14}" width="${W}" height="${H - SHORE - 14}" fill="url(#lake)"/>
${streaks(70)}
${shimmer(34)}
<g filter="url(#blur)" fill="#b4e3dc">
<ellipse class="mist" cx="400" cy="${SHORE - 30}" rx="420" ry="40" opacity=".27"/>
<ellipse class="mist2" cx="1150" cy="${SHORE - 20}" rx="460" ry="36" opacity=".24"/>
<ellipse class="mist" cx="800" cy="${SHORE - 70}" rx="600" ry="50" opacity=".14"/>
<ellipse class="mist2" cx="700" cy="${SHORE + 10}" rx="800" ry="30" opacity=".25"/>
<ellipse class="mist" cx="800" cy="${SHORE + 110}" rx="760" ry="50" opacity=".18"/>
<ellipse class="mist2" cx="300" cy="${SHORE + 180}" rx="560" ry="44" opacity=".15"/>
<ellipse class="mist" cx="1300" cy="${SHORE + 200}" rx="520" ry="40" opacity=".14"/>
</g>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`

fs.writeFileSync(out, `// Generated: a dark pine forest above a teal lake, with drifting mist.\nexport const SCENE = ${JSON.stringify(svg)}\n`)
console.log('chars', svg.length)
