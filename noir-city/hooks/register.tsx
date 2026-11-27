import type { Register, ThemeAmbience, ThemeMessageRule, ThemeResult, ThemeSetArgs, ThemeSound } from 'claude-code'

import { LABELS, iconSvg, kindOf } from './icons.js'
import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// Black and white film: neutral charcoal surfaces, silver text, one note of red.
const { theme, problems } = makeColors({
  label: 'Noir City',
  only: 'dark',
  roles: { accent: '#c43d48', danger: '#e0564f', success: '#6fa37a', warning: '#d1a54e', pro: '#9a90c8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0c0c0d',
        'surface-1': '#121213',
        'surface-2': '#171718',
        'surface-3': '#1c1c1e',
        'text-primary': '#ededeb',
        'text-secondary': '#c4c4c0',
        'text-muted': '#9a9a96',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'noir-city', glass: { blur: 14, tint: '#0c0c0d', opacity: 0.6 } },
}

// Typed case notes. The person's messages are sheets just pulled from the typewriter:
// aged paper with a red header rule and a faint blue line, a paperclip at the top and a
// coffee ring in the corner. Claude's replies are a dark carbon copy with a red margin
// and a typed double rule across the top.
//
// The drawings are cut in nine (`slice`: top, right, bottom and left, in viewBox units,
// two points each, as `size` doubles the drawing): the corners draw once, so the paperclip and the stain keep their size,
// and the edges and middle stretch to fit any message.
const sheet = (paper: `#${string}`): ThemeMessageRule => ({
  color: '#1b1a18',
  backgroundColor: paper,
  paddingTop: 44,
  paddingRight: 24,
  paddingBottom: 22,
  paddingLeft: 22,
  shadow: { x: 0, y: 4, blur: 12, color: '#00000099' },
  fill: {
    vector: {
      viewBox: [64, 48],
      size: [128, 96],
      slice: [20, 22, 14, 10],
      paths: [
        { d: 'M0 0H64V48H0Z', color: paper }, // the paper
        { d: 'M0 45H64V48H0Z', color: '#cfc6ae' }, // an aged lower edge
        { d: 'M0 12H64V13H0Z', color: '#d0606a' }, // the red header rule
        { d: 'M0 17H64V17.6H0Z', color: '#9fb3c8' }, // a faint blue line
        // a paperclip over the top edge
        { d: 'M50 1V13Q50 16 53 16Q56 16 56 13V3Q56 1 54 1Q52 1 52 3V12', strokeWidth: 1.8, color: '#7d8287' },
        // a coffee ring in the lower right corner
        { d: 'M57 41A5 5 0 1 1 47 41A5 5 0 1 1 57 41Z', strokeWidth: 1.5, color: '#b39a6e' },
      ],
    },
  },
})

type Layers = ThemeAmbience['layers']

// Rain on the window and the city's low hum: always the loudest thing.
const RAIN: Layers = [
  { wave: 'pink', drone: true, gain: 0.22, filter: { type: 'lowpass', hz: 2600 } },
  { wave: 'crackle', scatter: 5, gain: 0.1, release: 0.05, filter: { type: 'highpass', hz: 1800 } },
  { wave: 'brown', drone: true, gain: 0.14, filter: { type: 'lowpass', hz: 180 } },
]

// A slow, dark jazz from a bar down the street, under the rain: a lone tenor sax over
// a low bass and a half-diminished chord, in D minor. The app plays a layer's notes in
// order, `step` seconds apart, each time it falls, so each layer is a whole phrase,
// and each falls often enough that one phrase follows another, as in a song.
// Kept small on purpose: an ambience holds at most 8 layers (3 are the rain), and the
// app refuses a sound that is too much to work out;
// and many notes, long releases and reverb cost the most.
const sax = (notes: string[]) => ({
  // A sawtooth through a low filter reads as a reed; the tremolo is its vibrato,
  // and each note sags a little at the end, as a tired player's does.
  wave: 'saw' as const,
  notes,
  step: 0.7,
  scatter: 0.09,
  gain: 0.1,
  attack: 0.12,
  release: 0.7,
  glide: -0.4,
  filter: { type: 'lowpass' as const, hz: 900 },
  tremolo: { hz: 4.5, depth: 0.18 },
})

const JAZZ: Layers = [
  // a slow bass, one note to the bar: D, A, F, A
  {
    wave: 'triangle',
    notes: ['D2', 'A1', 'F1', 'A1'],
    step: 1,
    scatter: 0.26,
    gain: 0.12,
    attack: 0.02,
    release: 0.6,
    filter: { type: 'lowpass', hz: 300 },
  },
  // a low half-diminished chord, Dm7b5, held under it all and breathing slowly
  { wave: 'sine', notes: ['D3', 'F3', 'Ab3', 'C4'], drone: true, gain: 0.04, filter: { type: 'lowpass', hz: 800 }, tremolo: { hz: 0.15, depth: 0.35 } },
  // the sax: three falling minor phrases, with the flat fifth of the blues
  sax(['A3', 'C4', 'D4', 'Ab3', 'G3']),
  sax(['D4', 'F4', 'E4', 'C4', 'A3']),
  sax(['F3', 'Ab3', 'G3', 'F3', 'D3']),
]

// Typewriter keys, a carriage bell and a few low notes for the moments the app marks.
const CUES: ThemeSound['cues'] = {
  send: { layers: [{ wave: 'white', gain: 0.35, attack: 0.002, release: 0.04, filter: { type: 'bandpass', hz: 3200 } }] },
  tool: { layers: [{ wave: 'crackle', gain: 0.12, attack: 0.002, release: 0.03, filter: { type: 'highpass', hz: 2500 } }] },
  click: { layers: [{ wave: 'white', gain: 0.12, attack: 0.002, release: 0.02, filter: { type: 'bandpass', hz: 4000 } }] },
  done: {
    reverb: 0.25,
    layers: [
      { wave: 'white', gain: 0.18, attack: 0.01, release: 0.3, filter: { type: 'bandpass', hz: 1400, to: 500 } },
      { wave: 'bell', notes: ['A6'], gain: 0.22, release: 1.2 },
    ],
  },
  ask: { layers: [{ wave: 'triangle', notes: ['E4', 'G4'], step: 0.18, gain: 0.25, release: 0.6, filter: { type: 'lowpass', hz: 1800 } }] },
  error: { layers: [{ wave: 'triangle', notes: ['A2', 'Ab2'], step: 0.25, gain: 0.3, release: 0.7, glide: -1 }] },
  compact: { layers: [{ wave: 'pink', gain: 0.2, attack: 0.05, release: 0.4, filter: { type: 'bandpass', hz: 900, to: 2600 } }] },
}

const SOUND: ThemeSound = { ambience: { layers: [...RAIN, ...JAZZ] }, cues: CUES }

// If the app finds the band too much to work out, the rain plays alone.
const RAIN_ONLY: ThemeSound = { ambience: { layers: RAIN }, cues: CUES }

const STYLED: ThemeSetArgs = {
  ...LOOK,
  style: {
    // Typewriter type: monospaced, a little loose, as each key strikes its own cell.
    Text: { fontFamily: ['mono'], fontSize: 15, lineHeight: 25, letterSpacing: 0.5 },
    Heading: { fontFamily: ['mono'], fontWeight: 'bold', letterSpacing: 2.5 },
    UserMessage: [
      { ...sheet('#e6e0cf'), rotate: -1 },
      { ...sheet('#ddd6c2'), rotate: 0.8 },
    ],
    AssistantMessage: {
      color: '#ededeb',
      backgroundColor: '#121213',
      borderColor: '#2c2c2e',
      borderWidth: 1,
      radius: 2,
      padding: 18,
      paddingTop: 24,
      paddingLeft: 26,
      shadow: { x: 0, y: 3, blur: 10, color: '#00000088' },
      fill: { vector: { viewBox: 64, slice: 16, paths: [
        { d: 'M0 0H64V64H0Z', color: '#121213' }, // the carbon sheet
        { d: 'M14 0H16V64H14Z', color: '#c43d48' }, // the red margin
        { d: 'M0 6H64V7H0ZM0 9H64V9.6H0Z', color: '#3a3a3d' }, // a typed double rule
      ] } },
    },
    // A tool call reads as a line typed on a paper label.
    ToolUse: { color: '#1b1a18', fontFamily: ['mono'], backgroundColor: '#d6cfba', radius: 1, paddingX: 8 },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    let set: ThemeResult | undefined

    // Step down until one takes: the whole band, the rain alone, no sound, no style.
    const tries: ThemeSetArgs[] = [{ ...STYLED, sound: SOUND }, { ...STYLED, sound: RAIN_ONLY }, STYLED]

    for (const [i, look] of tries.entries()) {
      try {
        set = await $.theme.set(look)
        break
      } catch (error) {
        $.ui.log(String(error))

        if (i === 0) {
          // Say why the band was dropped, so the sound can be tuned.
          $.ui.toast(`noir-city: jazz off, rain only. ${String(error)}`)
        }
      }
    }
    set ??= await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'noir-city') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A rainy black-and-white city at night, a lone figure in a hat under a street lamp" />
  })

  // An ink-stamp icon beside each tool row, so it reads at a glance what is being done.
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (e.surface !== 'desktop') {
      return next(e)
    }
    const row = await next(e)
    const { Box, Svg } = $.ui.resolve(e)
    const kind = kindOf(e.props.tool)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={iconSvg(kind, e.props.isErrored)} alt={LABELS[kind]} width={16} height={16} />
        {row}
      </Box>
    )
  })

  // A folded run of calls ("read 3 files, searched code") gets one icon for each kind in it.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (e.surface !== 'desktop') {
      return next(e)
    }
    const row = await next(e)
    const { Box, Svg } = $.ui.resolve(e)
    const kinds = [...new Set(e.props.calls.map(call => kindOf(call.tool)))].slice(0, 4)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        {kinds.map(kind => (
          <Svg source={iconSvg(kind)} alt={LABELS[kind]} width={16} height={16} />
        ))}
        {row}
      </Box>
    )
  })
}
