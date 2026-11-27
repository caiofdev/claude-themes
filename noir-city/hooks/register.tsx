import type { Register, ThemeMessageRule, ThemeSetArgs, ThemeSound } from 'claude-code'

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

// Rain on the window, the city's low hum and a lonely horn now and then; typewriter keys and a carriage bell for the cues.
const SOUND: ThemeSound = {
  ambience: {
    reverb: 0.35,
    layers: [
      { wave: 'pink', drone: true, gain: 0.22, filter: { type: 'lowpass', hz: 2600 } },
      { wave: 'crackle', scatter: 5, gain: 0.1, release: 0.05, filter: { type: 'highpass', hz: 1800 } },
      { wave: 'brown', drone: true, gain: 0.14, filter: { type: 'lowpass', hz: 180 } },
      {
        wave: 'triangle',
        notes: ['A3', 'C4', 'D4', 'Eb4', 'E4', 'G4'],
        scatter: 0.05,
        gain: 0.1,
        attack: 0.4,
        release: 2.6,
        filter: { type: 'lowpass', hz: 1300 },
        tremolo: { hz: 5, depth: 0.15 },
      },
    ],
  },
  cues: {
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
  },
}

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
    let set

    try {
      set = await $.theme.set({ ...STYLED, sound: SOUND })
    } catch (soundError) {
      // A build that doesn't take `sound` or `style`, or a value out of range: step down until one takes.
      $.ui.log(String(soundError))
      try {
        set = await $.theme.set(STYLED)
      } catch (styleError) {
        $.ui.log(String(styleError))
        set = await $.theme.set(LOOK)
      }
    }

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
