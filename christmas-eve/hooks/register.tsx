import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// A winter night: midnight-blue surfaces, snow-white text, Christmas red and gold.
const { theme, problems } = makeColors({
  label: 'Christmas Eve',
  only: 'dark',
  roles: { accent: '#d6334a', danger: '#e0564f', success: '#3fa365', warning: '#e8b13c', pro: '#8f8fe0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b1124',
        'surface-1': '#10172d',
        'surface-2': '#141c34',
        'surface-3': '#18203a',
        'text-primary': '#eef3fb',
        'text-secondary': '#c3cde0',
        'text-muted': '#97a4bf',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'christmas-eve', glass: { blur: 18, tint: '#0b1124', opacity: 0.6 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'christmas-eve') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A snowy Christmas night: a lit tree with gifts, a warm cabin, the moon and falling snow" />
  })
}
