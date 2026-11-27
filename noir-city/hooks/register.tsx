import type { Register, ThemeAmbience, ThemeMessageRule, ThemeResult, ThemeSetArgs, ThemeSound } from 'claude-code'

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

// Typed case notes: the person's messages are aged index cards pinned at a slant,
// Claude's replies are typed on a dark file card with a red margin line.
const card: ThemeMessageRule = {
  color: '#1b1a18',
  backgroundColor: '#e6e0cf',
  radius: 2,
  padding: 16,
  shadow: { x: 0, y: 4, blur: 12, color: '#00000099' },
}

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
// Kept small on purpose: the app refuses a sound that is too much to work out,
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
  // brushes on the snare, keeping time
  { wave: 'pink', scatter: 2.2, gain: 0.03, attack: 0.03, release: 0.12, filter: { type: 'bandpass', hz: 3200 } },
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
    Text: { fontFamily: ['mono'], fontSize: 15, lineHeight: 24, letterSpacing: 0.2 },
    Heading: { fontFamily: ['serif'], fontWeight: 'bold', letterSpacing: 1.5 },
    UserMessage: [
      { ...card, rotate: -1 },
      { ...card, backgroundColor: '#ddd6c2', rotate: 0.8 },
    ],
    AssistantMessage: {
      color: '#ededeb',
      backgroundColor: '#121213',
      borderColor: '#2c2c2e',
      borderWidth: 1,
      radius: 2,
      padding: 18,
      paddingLeft: 26,
      fill: { vector: { viewBox: 64, slice: 16, paths: [
        { d: 'M0 0H64V64H0Z', color: '#121213' },
        { d: 'M14 0H16V64H14Z', color: '#c43d48' },
      ] } },
    },
    ToolUse: { color: '#c4c4c0', fontFamily: ['mono'], backgroundColor: '#0f0f10', radius: 2, paddingX: 8 },
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
}
