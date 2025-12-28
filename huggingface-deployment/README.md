---
title: ML-Sharp 2D to 3D Converter
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# ML-Sharp 2D to 3D Converter

Convert 2D images into 3D Gaussian Splatting PLY models using Apple's ML-Sharp.

## About

This Space provides a production-ready API for converting 2D images to 3D models using [Apple's ML-Sharp](https://github.com/apple/ml-sharp) technology. The generated PLY files can be viewed in 3D Gaussian Splatting viewers.

## API Endpoints

### `GET /`
Health check endpoint
```json
{
  "status": "ML-Sharp Backend is Running",
  "version": "1.0.0",
  "model": "Apple ML-Sharp",
  "service": "2D to 3D Conversion"
}
```

### `POST /convert-to-3d`
Convert an image to a 3D PLY model

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file (jpg, png, etc.)

**Response:**
- Content-Type: application/octet-stream
- Body: PLY file (3D model)

**Example using curl:**
```bash
curl -X POST \
  -F "file=@your-image.jpg" \
  https://YOUR-SPACE-NAME.hf.space/convert-to-3d \
  --output model.ply
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('https://YOUR-SPACE-NAME.hf.space/convert-to-3d', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
```

## Usage Limits

- Maximum processing time: 5 minutes per image
- Recommended image size: < 2MB
- Supported formats: JPG, PNG, WebP, etc.

## Model Information

This Space uses Apple's ML-Sharp model, which generates 3D Gaussian Splatting representations from single 2D images. The output PLY files contain point cloud data optimized for real-time rendering.

## Credits

- Model: [Apple ML-Sharp](https://github.com/apple/ml-sharp)
- Framework: FastAPI
- Deployment: Hugging Face Spaces
