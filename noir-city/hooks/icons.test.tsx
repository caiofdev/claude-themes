import { expect, test } from 'claude-code/testing'

test('a tool row gets an icon on desktop and stays plain elsewhere', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', () => ({ value: { isDrawn: true } }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const props = { tool_use_id: 't1', tool: 'Read', input: { file_path: '/a.ts' }, isRunning: false, isErrored: false, isInterrupted: false }
  const desk = await $.ui.mount({ plugin: 'noir-city', component: 'ToolUse', requestId: 't1', surface: 'desktop', props })
  const icon = await desk.find({ type: 'Svg' })
  expect(icon?.props.alt).toBe('Reading')
  await desk.unmount()

  const term = await $.ui.mount({ plugin: 'noir-city', component: 'ToolUse', requestId: 't1', surface: 'terminal', props })
  expect(await term.find({ type: 'Svg' })).toBeUndefined()
  await term.unmount()
})

test('a folded group gets one icon per kind of call', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', () => ({ value: { isDrawn: true } }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const call = (tool: string) => ({ tool, input: {}, isRunning: false, isErrored: false, isInterrupted: false })
  const ui = await $.ui.mount({
    plugin: 'noir-city',
    component: 'ToolGroup',
    requestId: 'g1',
    surface: 'desktop',
    props: { calls: [call('Read'), call('Edit'), call('Grep'), call('Read')], isActive: false, isExpanded: false },
  })
  const icons = await ui.findAll({ type: 'Svg' })
  expect(icons.map(icon => icon.props.alt)).toEqual(['Reading', 'Editing', 'Searching'])
  await ui.unmount()
})
