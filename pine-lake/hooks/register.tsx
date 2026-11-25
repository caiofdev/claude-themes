import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// Deep pine greens over a dark forest floor, with a turquoise lake for the accent.
const { theme, problems } = makeColors({
  label: 'Pine Lake',
  only: 'dark',
  roles: { accent: '#2bb8bd', danger: '#d0645a', success: '#5fae6e', warning: '#d6a24a', pro: '#8f8fd6' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a1613',
        'surface-1': '#0f1d19',
        'surface-2': '#13241f',
        'surface-3': '#172a25',
        'text-primary': '#e4f2ee',
        'text-secondary': '#b9d1ca',
        'text-muted': '#8fb0a7',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'pine-lake', glass: { blur: 18, tint: '#0a1613', opacity: 0.62 } },
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
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'pine-lake') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A dark pine forest above a turquoise lake, with mist drifting along the shore" />
  })
}
