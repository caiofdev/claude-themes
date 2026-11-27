// Generates the noir-city SVG scene: a black-and-white city at night in the rain,
// a lone street lamp, a figure in a hat and coat, wet pavement and blind shadows.
// Usage: node gen-scene.js <path to hooks/scene.ts>
const fs = require('fs')
const out = process.argv[2]
let seed = 1946
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const r = (a, b) => a + rnd() * (b - a)
const f = n => n.toFixed(0)
const W = 1600, H = 900, STREET = 690

// Skyline: rows of blocky buildings with a few lit windows.
function skyline(n, yMin, yMax, wMin, wMax, fill, litOpacity) {
  let body = '', lit = ''
  let x = -40
  for (let i = 0; i < n && x < W + 40; i++) {
    const w = r(wMin, wMax), top = r(yMin, yMax)
    body += `M${f(x)} ${STREET}V${f(top)}H${f(x + w)}V${STREET}Z`
    if (rnd() < 0.4) body += `M${f(x + w * 0.4)} ${f(top)}v-${f(r(14, 40))}h3v${f(r(14, 40))}Z`
    for (let wy = top + 16; wy < STREET - 30; wy += 22) {
      for (let wx = x + 8; wx < x + w - 14; wx += 16) {
        if (rnd() < 0.09) lit += `M${f(wx)} ${f(wy)}h8v12h-8Z`
      }
    }
    x += w + r(-6, 10)
  }
  return `<path d="${body}" fill="${fill}"/><path d="${lit}" fill="#d8d4c8" opacity="${litOpacity}"/>`
}

// Rain: thin slanted streaks over two stacked screens, sliding down one screen and looping.
function rain(n, len, dur, op) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = r(-100, W), y = r(0, H)
    for (const yy of [y, y - H]) d += `M${f(x)} ${f(yy)}l${f(len * 0.18)} ${f(len)}`
  }
  return `<g class="rain" style="animation-duration:${dur}s"><path d="${d}" stroke="#cfd3d6" stroke-width="1" opacity="${op}"/></g>`
}

// Ripples on the wet street, each one slow and faint.
function ripples(n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += `<ellipse class="rip" style="animation-delay:-${r(0, 6).toFixed(1)}s" cx="${f(r(0, W))}" cy="${f(r(STREET + 30, H - 10))}" rx="14" ry="3"/>`
  }
  return `<g fill="none" stroke="#9aa0a4" stroke-width="1">${s}</g>`
}

const LAMP_X = 300

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset=".7" stop-color="#16181a"/><stop offset="1" stop-color="#26292b"/></linearGradient>
<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1e20"/><stop offset="1" stop-color="#070707"/></linearGradient>
<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2efe6" stop-opacity=".32"/><stop offset="1" stop-color="#f2efe6" stop-opacity=".04"/></linearGradient>
<radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f2efe6" stop-opacity=".35"/><stop offset="1" stop-color="#f2efe6" stop-opacity="0"/></radialGradient>
<radialGradient id="bulb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#f2efe6" stop-opacity=".6"/><stop offset="1" stop-color="#f2efe6" stop-opacity="0"/></radialGradient>
<linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2efe6" stop-opacity=".28"/><stop offset="1" stop-color="#f2efe6" stop-opacity="0"/></linearGradient>
<radialGradient id="moonGlow" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="#e8e6e0" stop-opacity=".25"/><stop offset="1" stop-color="#e8e6e0" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
<filter id="haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<style>
.rain{animation-name:fall;animation-timing-function:linear;animation-iteration-count:infinite}
.rip{opacity:0;animation:rip 6s ease-out infinite}
.hum{animation:hum 11s ease-in-out infinite}
.smoke{animation:smoke 14s ease-in-out infinite}
@keyframes fall{from{transform:translateY(0)}to{transform:translateY(${H}px)}}
@keyframes rip{0%{opacity:.5;transform:scale(.3)}100%{opacity:0;transform:scale(1.6)}}
@keyframes hum{0%,100%{opacity:1}50%{opacity:.85}}
@keyframes smoke{0%{opacity:0;transform:translate(0,0)}30%{opacity:.35}100%{opacity:0;transform:translate(18px,-90px)}}
</style>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="1240" cy="140" r="120" fill="url(#moonGlow)"/>
<circle cx="1240" cy="140" r="46" fill="#dedcd4" opacity=".75"/>
<g filter="url(#haze)" fill="#2a2d30" opacity=".6"><ellipse cx="1240" cy="150" rx="260" ry="26"/><ellipse cx="500" cy="260" rx="380" ry="30"/></g>
${skyline(22, 160, 380, 70, 150, '#141516', 0.35)}
${skyline(18, 330, 520, 90, 180, '#0c0c0d', 0.55)}
<rect y="${STREET}" width="${W}" height="${H - STREET}" fill="url(#street)"/>
<path d="M0 ${STREET}H${W}" stroke="#3a3d40" stroke-width="2"/>
<path d="M0 ${STREET + 60}H${W}" stroke="#202224" stroke-width="1" stroke-dasharray="60 40"/>
<g class="hum">
<path d="M${LAMP_X - 6} 360L${LAMP_X - 130} ${STREET}H${LAMP_X + 122}Z" fill="url(#cone)"/>
<ellipse cx="${LAMP_X}" cy="${STREET + 16}" rx="190" ry="34" fill="url(#pool)"/>
<rect x="${LAMP_X - 16}" y="${STREET + 10}" width="32" height="170" fill="url(#refl)"/>
<circle cx="${LAMP_X}" cy="352" r="42" fill="url(#bulb)"/>
</g>
<path d="M${LAMP_X - 4} ${STREET}V352H${LAMP_X + 4}V${STREET}Z" fill="#050505"/>
<path d="M${LAMP_X - 18} 344H${LAMP_X + 18}L${LAMP_X + 10} 332H${LAMP_X - 10}Z" fill="#050505"/>
<path d="M${LAMP_X - 14} ${STREET}h28l-4-14h-20Z" fill="#050505"/>
<!-- the figure in a hat and coat, just past the lamp -->
<g fill="#030303" transform="translate(-92 0)">
<path d="M436 ${STREET}l4-70q-8-40 6-86q10-14 26-14q16 0 26 14q14 46 6 86l4 70h-16l-8-56h-12l-8 56Z"/>
<ellipse cx="472" cy="${STREET - 182}" rx="13" ry="15"/>
<path d="M446 ${STREET - 190}h52v4h-52Z"/>
<path d="M458 ${STREET - 190}q2-16 14-16q12 0 14 16Z"/>
</g>
<ellipse cx="398" cy="${STREET + 4}" rx="60" ry="6" fill="#000" opacity=".5"/>
<g transform="translate(-92 0)"><g class="smoke"><path d="M488 ${STREET - 178}q6-10 0-20q-6-10 2-22" stroke="#b9bcbf" stroke-width="2" fill="none"/></g></g>
${rain(140, 34, 1.6, 0.22)}
${rain(70, 60, 1.1, 0.3)}
${ripples(24)}
<!-- blind shadows across the top right, as from a window behind the viewer -->
<g opacity=".16" fill="#000" transform="rotate(-8 1300 200)">
<rect x="900" y="0" width="900" height="16"/><rect x="900" y="40" width="900" height="16"/><rect x="900" y="80" width="900" height="16"/><rect x="900" y="120" width="900" height="16"/><rect x="900" y="160" width="900" height="16"/><rect x="900" y="200" width="900" height="16"/><rect x="900" y="240" width="900" height="16"/><rect x="900" y="280" width="900" height="16"/>
</g>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`

fs.writeFileSync(out, `// Generated by tools/gen-scene.js: a rainy black-and-white city night with a street lamp and a lone figure.\nexport const SCENE = ${JSON.stringify(svg)}\n`)
console.log('chars', svg.length)
