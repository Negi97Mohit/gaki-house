# ML Backend (`@gaki/ml-backend`)

## 🗺️ What This Is
A GPU-accelerated cloud function deployed via Modal. It provides a FastAPI endpoint that converts 2D images into 3D point cloud meshes (`.ply` format) using Apple's ML-Sharp architecture.

## 🔌 How It Connects to the Monorepo
- **Consumed by:** The web/desktop canvas studio (for 3D overlays).
- **Infrastructure:** Deployed on Modal (`modal_backend.py`) running on an NVIDIA T4 GPU.

## 📁 Directory Map
- `modal_backend.py` — The Modal container definition, FastAPI server, and subprocess bridge for the `sharp` CLI.

## ⚡ Key Business Logic
- **Pre-baked Weights:** The 2.3GB model checkpoint is explicitly downloaded via `wget` during the Docker image build phase (`modal.Image.run_commands`) to eliminate slow cold boots.
- **Subprocess Bridge:** The `sharp` CLI is executed via `subprocess.run` inside a temporary `/tmp/` filesystem wrapper, rather than as native Python bindings.
