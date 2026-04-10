import modal
import shutil
import subprocess
import logging
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# 1. Define the Environment (The "Docker" part)
# We install the 'sharp' CLI directly from Apple's GitHub
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "wget")
    .pip_install(
        "git+https://github.com/apple/ml-sharp.git",  # Installs the 'sharp' command
        "torch",
        "torchvision",
        "numpy",
        "fastapi",
        "python-multipart"
    )
    # Optimization: Download the 2.3GB model weight during build
    # This saves you from downloading it every time the app starts
    .run_commands(
        "mkdir -p /root/models",
        "wget https://ml-site.cdn-apple.com/models/sharp/sharp_2572gikvuh.pt -O /root/models/sharp_checkpoint.pt"
    )
)

app = modal.App("ml-sharp-converter", image=image)

# 2. Define the Web API
web_app = FastAPI(title="ML-Sharp 2D to 3D")

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define the GPU Function
# We use a class to manage the environment, though Sharp is a CLI tool
@app.cls(gpu="T4", container_idle_timeout=300)
class SharpConverter:
    @modal.method()
    def run_conversion(self, image_bytes: bytes, filename: str) -> bytes:
        # Setup paths in the temporary cloud container
        input_dir = Path("/tmp/input")
        output_dir = Path("/tmp/output")
        model_path = "/root/models/sharp_checkpoint.pt"

        # Clean/Create directories
        if input_dir.exists(): shutil.rmtree(input_dir)
        if output_dir.exists(): shutil.rmtree(output_dir)
        input_dir.mkdir(parents=True)
        output_dir.mkdir(parents=True)

        # Save input file
        input_path = input_dir / filename
        with open(input_path, "wb") as f:
            f.write(image_bytes)

        print(f"🔧 Running Sharp on {filename}...")
        
        # Run the command
        # We point it to the pre-downloaded checkpoint (-c)
        command = [
            "sharp", "predict",
            "-i", str(input_dir),
            "-o", str(output_dir),
            "-c", model_path,
            "--device", "cuda" 
        ]

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode != 0:
                print(f"STDERR: {result.stderr}")
                raise Exception(f"Sharp Error: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            raise Exception("Processing timed out")

        # Find output PLY
        ply_files = list(output_dir.rglob("*.ply"))
        if not ply_files:
            raise Exception("No PLY file generated")
            
        # Read the file to memory to return it
        with open(ply_files[0], "rb") as f:
            return f.read()

# 4. Connect FastAPI to the GPU function
@web_app.post("/convert-to-3d")
async def convert_to_3d(file: UploadFile = File(...)):
    print(f"Received request: {file.filename}")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    try:
        content = await file.read()
        
        # Call the GPU function (runs on the cloud machine)
        ply_content = SharpConverter().run_conversion.remote(content, file.filename)
        
        return Response(
            content=ply_content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": "attachment; filename=model.ply"}
        )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(500, str(e))

@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    return web_app