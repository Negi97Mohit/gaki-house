# Caption Cam Studio - Web UI

The frontend application for Caption Cam Studio. This is a highly complex React application that mimics the functionality of OBS Studio in the browser.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + custom Radix UI components (`packages/ui`)
- **State**: Zustand (modular slices for Canvas, UI, Scenes, and Media)
- **Animation**: GSAP for advanced banner and overlay animations

## Core Features

- **Video Canvas**: A multi-layered rendering area supporting draggable elements, pip controls, and HTML overlays.
- **OBS Import**: Ability to parse and render standard OBS `.json` scene collection files.
- **Scene Management**: Create, duplicate, and transition between distinct scenes using custom WebGL stingers.

## Development

```sh
pnpm dev
```
