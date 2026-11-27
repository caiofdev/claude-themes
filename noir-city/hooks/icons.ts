// Small ink-stamp icons for tool rows: one per kind of work, drawn as 16 by 16 line art.

export type IconKind = 'read' | 'edit' | 'write' | 'shell' | 'search' | 'web' | 'agent' | 'plan' | 'skill' | 'plug' | 'key'

const PATHS: Record<IconKind, string> = {
  // an eye: reading
  read: '<path d="M1 8Q8 1.5 15 8Q8 14.5 1 8Z"/><circle cx="8" cy="8" r="2.2"/>',
  // a pencil: editing
  edit: '<path d="M3 13L3.8 10.2L11 3L13 5L5.8 12.2Z"/><path d="M9.8 4.2L11.8 6.2"/>',
  // a typed sheet with a folded corner: writing a file
  write: '<path d="M4 1.5H10L13 4.5V14.5H4Z"/><path d="M10 1.5V4.5H13"/><path d="M6 8H11M6 10.5H11"/>',
  // a prompt: running a command
  shell: '<path d="M2 4L6 8L2 12"/><path d="M8 12.5H14"/>',
  // a magnifying glass: searching
  search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.4 10.4L14.5 14.5"/>',
  // a globe: the web or a browser
  web: '<circle cx="8" cy="8" r="6.5"/><path d="M1.5 8H14.5"/><path d="M8 1.5Q4 8 8 14.5Q12 8 8 1.5"/>',
  // a detective's hat: another agent on the case
  agent: '<path d="M1.5 10.5H14.5"/><path d="M4 10.5Q4 4 8 4Q12 4 12 10.5"/><path d="M4.5 8H11.5"/>',
  // a checklist: the plan
  plan: '<path d="M2 4L3.5 5.5L6 3"/><path d="M8 4.5H14"/><path d="M2 10L3.5 11.5L6 9"/><path d="M8 10.5H14"/>',
  // a four-point star: a skill
  skill: '<path d="M8 1.5L9.5 6.5L14.5 8L9.5 9.5L8 14.5L6.5 9.5L1.5 8L6.5 6.5Z"/>',
  // a plug: a connected tool
  plug: '<path d="M6 1.5V5M10 1.5V5"/><path d="M4 5H12V8Q12 12 8 12Q4 12 4 8Z"/><path d="M8 12V14.5"/>',
  // a round typewriter key: anything else
  key: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3.5"/>',
}

export const LABELS: Record<IconKind, string> = {
  read: 'Reading',
  edit: 'Editing',
  write: 'Writing a file',
  shell: 'Running a command',
  search: 'Searching',
  web: 'On the web',
  agent: 'Another agent',
  plan: 'Planning',
  skill: 'Using a skill',
  plug: 'A connected tool',
  key: 'A tool',
}

export function kindOf(tool: string): IconKind {
  if (/^(Read|NotebookRead)$/.test(tool)) return 'read'
  if (/^(Edit|MultiEdit|NotebookEdit)$/.test(tool)) return 'edit'
  if (tool === 'Write') return 'write'
  if (/^(Bash|PowerShell|Monitor|BashOutput|KillShell)$/.test(tool)) return 'shell'
  if (/^(Grep|Glob|LS|ToolSearch)$/.test(tool)) return 'search'
  if (/^(WebFetch|WebSearch)$/.test(tool) || /Browser|chrome/.test(tool)) return 'web'
  if (/^(Agent|Task|SendMessage)$/.test(tool)) return 'agent'
  if (/^(TodoWrite|ExitPlanMode|EnterPlanMode)$/.test(tool) || /update_plan|wrap_up/.test(tool)) return 'plan'
  if (tool === 'Skill') return 'skill'
  if (tool.startsWith('mcp__')) return 'plug'
  return 'key'
}

// Paper-colored ink on the dark page; red when the call went wrong.
export function iconSvg(kind: IconKind, isErrored = false): string {
  const ink = isErrored ? '#c43d48' : '#d6cfba'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${PATHS[kind]}</svg>`
}
