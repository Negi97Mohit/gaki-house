# @title 🚀 Launch ML-Sharp Backend (IMPROVED VERSION)
import os
import subprocess
import sys
import asyncio
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 1. INSTALL DEPENDENCIES
# ---------------------------------------------------------
print("Installing dependencies... (This takes ~2 mins)")
try:
    # We use subprocess to ensure it installs in the current runtime before importing
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "git+https://github.com/apple/ml-sharp.git"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "fastapi", "uvicorn", "python-multipart", "pyngrok", "nest_asyncio"])
    print("Dependencies installed.")
except Exception as e:
    print(f"Dependency installation warning: {e}")
    print("Trying to continue (assuming packages might already be installed)...")

# 2. IMPORTS
# ---------------------------------------------------------
from pyngrok import ngrok
import nest_asyncio
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import shutil

# Apply nest_asyncio to patch the event loop for Colab
nest_asyncio.apply()

# 3. SETUP FASTAPI
# ---------------------------------------------------------
# Clean/Create directories
if os.path.exists("input_images"): shutil.rmtree("input_images")
if os.path.exists("output_splats"): shutil.rmtree("output_splats")
os.makedirs("input_images", exist_ok=True)
os.makedirs("output_splats", exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ML-Sharp Backend is Running"}

@app.post("/convert-to-3d")
async def create_3d_splat(file: UploadFile = File(...)):
    start_time = datetime.now()
    logger.info(f"🎬 Starting conversion for: {file.filename}")
    
    # Clean previous run
    if os.path.exists("input_images"): shutil.rmtree("input_images")
    if os.path.exists("output_splats"): shutil.rmtree("output_splats")
    os.makedirs("input_images", exist_ok=True)
    os.makedirs("output_splats", exist_ok=True)

    # Save Upload
    input_path = f"input_images/{file.filename}"
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    logger.info(f"📁 Saved input file: {input_path}")
    logger.info(f"🔧 Running ML-Sharp prediction...")
    
    # Run ML-Sharp (Adjust command if specific flags changed in repo)
    command = [
        "sharp", "predict",
        "-i", "input_images", 
        "-o", "output_splats"
    ]
    
    try:
        # Use subprocess.run with timeout
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True,
            timeout=240  # 4 minute timeout for the subprocess
        )
        
        logger.info(f"📊 ML-Sharp stdout: {result.stdout}")
        
        if result.returncode != 0:
            logger.error(f"❌ ML-Sharp error: {result.stderr}")
            return JSONResponse(
                status_code=500,
                content={"error": "Model generation failed", "details": result.stderr}
            )
            
    except subprocess.TimeoutExpired:
        logger.error("⏱️ ML-Sharp processing timed out after 4 minutes")
        return JSONResponse(
            status_code=500,
            content={"error": "Processing timed out", "details": "The model took too long to generate. Try a smaller image."}
        )
    except Exception as e:
        logger.error(f"💥 Execution failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Execution failed", "details": str(e)}
        )

    # Find Output PLY
    generated_file = None
    for root, dirs, files in os.walk("output_splats"):
        for f in files:
            if f.endswith(".ply"):
                generated_file = os.path.join(root, f)
                logger.info(f"✅ Found PLY file: {generated_file}")
                break
        if generated_file: break
    
    if not generated_file:
        logger.error("❌ No PLY file was generated")
        return JSONResponse(
            status_code=500,
            content={"error": "No PLY file was generated. Check logs above."}
        )

    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"🎉 Conversion completed in {elapsed:.2f} seconds")
    
    return FileResponse(
        generated_file, 
        media_type="application/octet-stream", 
        filename="model.ply"
    )

# 4. START SERVER (ASYNC FIX)
# ---------------------------------------------------------
# !!! PASTE YOUR TOKEN BELOW !!!
NGROK_AUTH_TOKEN = "37TD69Btbyze1WdXNY4QSWjgHk9_7GXqQpG6ZHtwLPUHDKtg2" 

if NGROK_AUTH_TOKEN == "YOUR_NGROK_TOKEN_HERE":
    print("❌ ERROR: Please paste your Ngrok Token in the script!")
else:
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    ngrok.kill() # Kill any existing tunnels
    
    # Start Ngrok Tunnel
    ngrok_tunnel = ngrok.connect(8000)
    public_url = ngrok_tunnel.public_url

    print(f"\n========================================================")
    print(f"🚀 BACKEND READY!")
    print(f"👉 API URL: {public_url}")
    print(f"📋 Copy this to your .env.local as:")
    print(f"   VITE_MLSHARP_API_URL={public_url}")
    print(f"========================================================\n")

    # FIX: Use uvicorn.Config and server.serve() with await
    config = uvicorn.Config(app, port=8000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()
