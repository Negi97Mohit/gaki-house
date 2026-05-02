_(SDK documentation)_

````markdown
# @gaki/handoff-sdk

A framework-agnostic TypeScript SDK for discovering sibling devices and synchronizing stream states.

## Installation

_(Managed via pnpm workspace)_

```json
"dependencies": {
  "@gaki/handoff-sdk": "workspace:*"
}
```
````

Usage Example
TypeScript
import { DeviceRegistry, HandoffCoordinator } from '@gaki/handoff-sdk';

// 1. Register the current device
const registry = new DeviceRegistry(firebaseToken);
await registry.announce({ deviceType: 'desktop', capabilities: ['rtmp', 'nvenc'] });

// 2. Listen for handoff requests
const coordinator = new HandoffCoordinator(signalingUrl);
coordinator.on('handoff-requested', async (payload) => {
// Apply the incoming scene state
applySceneState(payload.state);
// Assume broadcast control
await coordinator.acceptHandoff();
});
