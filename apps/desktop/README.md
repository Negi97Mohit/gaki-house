_(Electron specifics)_

````markdown
# Caption Cam - Desktop App

The Electron shell for Caption Cam Studio. This package provides native capabilities that the browser cannot handle alone.

## Native Responsibilities

1. **Local RTMP Server**: Runs a lightweight Node Media Server instance to accept incoming RTMP feeds from mobile devices or other software.
2. **Filesystem Recording**: Directly pipes canvas output to `.mp4`/`.mkv` files on the user's hard drive without memory constraints.
3. **Hardware Encoding**: Utilizes native OS bindings to access NVENC or VideoToolbox for efficient stream encoding.

## Build Process

We use `electron-builder` to package the application.

```sh
# Build for current OS
pnpm run build

# Generate Windows installer
pnpm run release:win
```
````
