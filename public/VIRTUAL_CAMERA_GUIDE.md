# GAKI Virtual Camera Guide

## Overview

The GAKI Virtual Camera feature allows you to broadcast the final composed scene from your canvas instead of raw video or screen share. This means viewers see exactly what you see - including all layouts, overlays, effects, transitions, captions, stickers, and dynamic elements.

## How It Works

### 1. Automatic Composite Capture
When you use GAKI, the application automatically captures the final composed output from the canvas element. This includes:

- **Active Layout**: Split, grid, vertical, PiP, or solo layouts
- **Video Feeds**: Camera and screen share (properly composed)
- **Overlays**: HTML overlays, text, images, files
- **Effects**: Filters, neon edges, background effects
- **Transitions**: Scene transitions and animations
- **Dynamic Elements**: Live captions, stickers, browser windows

### 2. MediaStream Output
The composite output is available as a standard `MediaStream` object, which means you can:

- Use it with WebRTC for live streaming
- Record it with MediaRecorder
- Send it to streaming platforms (Twitch, YouTube, etc.)
- Share it in video conferencing apps (if they support custom video sources)

## Using the Virtual Camera

### Access the Composite Stream

The composite stream is automatically created and available in the browser console:

```javascript
// Check the console for:
[GAKI Virtual Camera] Composite stream ready: {
  streamId: "...",
  tracks: [...]
}
```

### For Developers

If you want to access the composite stream programmatically:

```javascript
// The composite stream is available via canvas.captureStream()
const canvas = document.querySelector('canvas');
const compositeStream = canvas.captureStream(30); // 30 FPS

// Use it for streaming
const peerConnection = new RTCPeerConnection(config);
compositeStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, compositeStream);
});
```

### Integration with Streaming Services

1. **OBS Virtual Camera**: Use OBS Browser Source to capture the GAKI app
2. **WebRTC Streaming**: Use the composite stream directly in WebRTC connections
3. **Recording**: Use `MediaRecorder` API with the composite stream

```javascript
const recorder = new MediaRecorder(compositeStream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000
});
```

## Performance Considerations

- **Frame Rate**: Default is 30 FPS, adjustable in code
- **Resolution**: Matches your canvas size (typically 1920x1080)
- **GPU Acceleration**: Leverages hardware acceleration when available
- **Efficient Rendering**: Uses canvas API for optimal performance

## Technical Details

### Canvas Rendering Pipeline

1. **Scene Composition**: All UI elements rendered to DOM
2. **Canvas Capture**: `HTMLCanvasElement.captureStream()` captures the canvas
3. **Stream Output**: MediaStream available for broadcasting

### Supported Browsers

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (limited support for canvas.captureStream())

## Troubleshooting

### Canvas Appears Black
- Ensure canvas is properly sized and visible
- Check that scene elements are rendering correctly
- Verify canvas context is 2D

### Stream Not Capturing Overlays
- Overlays must be rendered within the canvas coordinate space
- Check z-index and positioning
- Ensure overlays are visible when capturing

### Performance Issues
- Reduce canvas resolution
- Lower frame rate (15-24 FPS may be sufficient)
- Disable effects temporarily
- Close unnecessary browser tabs

## Future Enhancements

- [ ] OBS Plugin for direct integration
- [ ] Built-in RTMP streaming
- [ ] Cloud streaming to YouTube/Twitch
- [ ] Virtual camera driver for system-wide access

## FAQ

**Q: Can I use this with Zoom/Meet?**
A: Not directly - those apps don't allow custom MediaStreams. Use OBS Virtual Camera as a workaround.

**Q: What's the quality of the output?**
A: Depends on canvas resolution and bitrate. Default is 1920x1080 @ 30 FPS.

**Q: Does this work without screen sharing?**
A: Yes! The virtual camera captures the canvas directly, no screen share needed.

**Q: Can viewers see my GAKI UI?**
A: No! They only see the final composed scene, not your controls or workspace.

---

For more information, check the GAKI documentation or open an issue on GitHub.
