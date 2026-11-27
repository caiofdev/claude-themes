import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// A desert night: deep night-blue surfaces, starlight text, Milky Way lavender and desert amber.
const { theme, problems } = makeColors({
  label: 'Atacama Night',
  only: 'dark',
  roles: { accent: '#8b8cf0', danger: '#e0645a', success: '#4fb08a', warning: '#d9a35a', pro: '#b48cf0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#080c1c',
        'surface-1': '#0d1226',
        'surface-2': '#11172e',
        'surface-3': '#151b34',
        'text-primary': '#eceffb',
        'text-secondary': '#c2c8e0',
        'text-muted': '#959dbd',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'atacama-night', glass: { blur: 16, tint: '#080c1c', opacity: 0.58 } },
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
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'atacama-night') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A desert night sky with the Milky Way, two small galaxies and an old bus on the horizon" />
  })
}
