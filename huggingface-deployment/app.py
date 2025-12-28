"""
ML-Sharp Backend for Hugging Face Spaces
Converts 2D images to 3D PLY models using Apple's ML-Sharp
"""
import os
import subprocess
import sys
import shutil
import logging
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ML-Sharp 2D to 3D Converter",
    description="Convert 2D images to 3D Gaussian Splatting PLY models",
    version="1.0.0"
)

# CORS middleware - allow all origins for public API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
INPUT_DIR = Path("input_images")
OUTPUT_DIR = Path("output_splats")

INPUT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
async def read_root():
    """Health check endpoint"""
    return {
        "status": "ML-Sharp Backend is Running",
        "version": "1.0.0",
        "model": "Apple ML-Sharp",
        "service": "2D to 3D Conversion"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "sharp_available": shutil.which("sharp") is not None
    }


@app.post("/convert-to-3d")
async def convert_to_3d(file: UploadFile = File(...)):
    """
    Convert a 2D image to a 3D PLY model
    
    Args:
        file: Image file (jpg, png, etc.)
        
    Returns:
        PLY file containing the 3D Gaussian Splatting model
    """
    start_time = datetime.now()
    logger.info(f"🎬 Starting conversion for: {file.filename}")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Please upload an image file."
        )
    
    # Clean previous runs
    try:
        if INPUT_DIR.exists():
            shutil.rmtree(INPUT_DIR)
        if OUTPUT_DIR.exists():
            shutil.rmtree(OUTPUT_DIR)
        INPUT_DIR.mkdir(exist_ok=True)
        OUTPUT_DIR.mkdir(exist_ok=True)
    except Exception as e:
        logger.error(f"Error cleaning directories: {e}")
    
    # Save uploaded file
    input_path = INPUT_DIR / file.filename
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"📁 Saved input file: {input_path}")
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Run ML-Sharp prediction
    logger.info("🔧 Running ML-Sharp prediction...")
    command = [
        "sharp", "predict",
        "-i", str(INPUT_DIR),
        "-o", str(OUTPUT_DIR)
    ]
    
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        logger.info(f"📊 ML-Sharp stdout: {result.stdout}")
        
        if result.returncode != 0:
            logger.error(f"❌ ML-Sharp error: {result.stderr}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Model generation failed",
                    "details": result.stderr
                }
            )
            
    except subprocess.TimeoutExpired:
        logger.error("⏱️ ML-Sharp processing timed out")
        raise HTTPException(
            status_code=504,
            detail="Processing timed out. Try a smaller image or simpler scene."
        )
    except Exception as e:
        logger.error(f"💥 Execution failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Execution failed: {str(e)}"
        )
    
    # Find generated PLY file
    generated_file = None
    for ply_file in OUTPUT_DIR.rglob("*.ply"):
        generated_file = ply_file
        logger.info(f"✅ Found PLY file: {generated_file}")
        break
    
    if not generated_file or not generated_file.exists():
        logger.error("❌ No PLY file was generated")
        raise HTTPException(
            status_code=500,
            detail="No PLY file was generated. The model may have failed to process the image."
        )
    
    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"🎉 Conversion completed in {elapsed:.2f} seconds")
    
    return FileResponse(
        path=str(generated_file),
        media_type="application/octet-stream",
        filename="model.ply",
        headers={
            "X-Processing-Time": f"{elapsed:.2f}s",
            "X-Model-Size": str(generated_file.stat().st_size)
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
