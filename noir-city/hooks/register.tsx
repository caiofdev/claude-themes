import type { Register, ThemeMessageRule, ThemeSetArgs } from 'claude-code'

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
      set = await $.theme.set(STYLED)
    } catch (error) {
      // A build that doesn't take `style`, or a value out of range: keep the look without it.
      $.ui.log(String(error))
      set = await $.theme.set(LOOK)
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
