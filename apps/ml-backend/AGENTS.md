# ML Backend (`@gaki/ml-backend`)

## Purpose
Modal-hosted FastAPI service running on NVIDIA T4 GPUs that converts 2D images into 3D Gaussian/point-cloud meshes (`.ply`) via Apple's ML-Sharp CLI.

## Commands
```bash
modal deploy modal_backend.py
```

## Boundaries
- Consumed by `apps/web` / `apps/desktop` for 3D overlay generation.
- Deployed via Modal (`modal_backend.py`).

## Gotchas
- **Cold starts**: Modal T4 GPU containers take 10–30 seconds to cold-start; clients must use explicit timeouts and user feedback rather than silent spinners.
- **Pre-baked weights**: The 2.3GB checkpoint is downloaded during Docker image build (`modal.Image.run_commands`) to reduce boot latency.
- **Subprocess bridge**: Runs the `sharp` CLI via `subprocess.run` against `/tmp/`.

## "Never" Rules
- Never invoke the Apple Silicon local ML-Sharp subprocess path inside the Modal cloud container path.

## Common Mistakes
- Expecting instant responses from Modal endpoints without handling 10–30s cold-start timeouts.
