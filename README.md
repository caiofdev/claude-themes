# claude-themes

Themes (mods) for the Claude desktop and mobile apps. Each folder is one theme; this repository is a plugin marketplace, so any theme installs with one line.

## Themes

| Theme | What it looks like |
| --- | --- |
| [`pine-lake`](./pine-lake) | A dark pine forest above a turquoise lake, with slow drifting mist. Deep pine-green surfaces with a turquoise accent, dark mode. |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install pine-lake --marketplace caiofdev/claude-themes
```

Answer `y` to add the marketplace, then pick a scope (user scope is first; press Enter).

From a shell:

```
claude plugin install pine-lake --marketplace caiofdev/claude-themes
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `caiofdev/claude-themes`, then **Add plugin**.

The background draws in the desktop and mobile apps; the terminal and editors draw no theme.

## Editing pine-lake

The scene is generated SVG. Change counts, colors or mist in `pine-lake/tools/gen-scene.js`, then regenerate:

```
node pine-lake/tools/gen-scene.js pine-lake/hooks/scene.ts
```

Keep the scene under 131,072 characters. The app's color palette lives in `pine-lake/hooks/register.tsx`.

## License

MIT, except `make-colors.js` and `make-colors.d.ts` in each theme's `hooks/` folder. Those are color helpers distributed with Claude Code's mod authoring kit, copied unchanged, and stay under their original distributor's terms. See [LICENSE](./LICENSE).
