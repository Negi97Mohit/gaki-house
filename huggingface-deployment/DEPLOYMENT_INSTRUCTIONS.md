# 🚀 Deploy ML-Sharp to Hugging Face Spaces

This guide will help you deploy the ML-Sharp 2D to 3D conversion service to Hugging Face Spaces, replacing the manual Colab + Ngrok setup with a production-ready, always-on API.

## 📋 Prerequisites

1. **Hugging Face Account**: Create a free account at [huggingface.co](https://huggingface.co)
2. **Git**: Ensure Git is installed on your system

## 🎯 Deployment Steps

### Step 1: Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `mlsharp-2d-to-3d` (or your preferred name)
   - **License**: MIT
   - **Select SDK**: **Docker**
   - **Hardware**: Select **CPU Basic** (free tier) or **T4 GPU** (paid, faster processing)
4. Click **"Create Space"**

### Step 2: Upload Files to Your Space

You have **two options** for uploading files:

#### Option A: Using the Web Interface (Easiest)

1. In your new Space, click **"Files"** tab
2. Click **"Add file"** → **"Upload files"**
3. Upload these files from the `huggingface-deployment` folder:
   - `app.py`
   - `requirements.txt`
   - `README.md`
   - `Dockerfile`
4. Click **"Commit changes to main"**

#### Option B: Using Git (Recommended for updates)

```bash
# Clone your Space repository
git clone https://huggingface.co/spaces/YOUR-USERNAME/mlsharp-2d-to-3d
cd mlsharp-2d-to-3d

# Copy deployment files
# On Windows PowerShell:
Copy-Item ..\caption-cam\huggingface-deployment\* .

# Add and commit
git add .
git commit -m "Initial deployment of ML-Sharp backend"
git push
```

### Step 3: Wait for Build

1. After uploading/pushing, Hugging Face will automatically build your Docker container
2. This takes about **5-10 minutes** for the first build
3. You can monitor the build status in the **"Logs"** section of your Space
4. Once complete, you'll see **"Running"** status

### Step 4: Test Your Deployment

Once the Space is running, test it:

```bash
# Test health endpoint
curl https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space/

# Test conversion (replace with your actual image)
curl -X POST \
  -F "file=@test-image.jpg" \
  https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space/convert-to-3d \
  --output model.ply
```

### Step 5: Update Your Application

1. Copy your Space URL: `https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space`
2. Update your `.env.local` file:

```env
VITE_MLSHARP_API_URL=https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space
```

3. **That's it!** Your app will now use the permanent Hugging Face endpoint instead of the manual Colab setup.

## 🔧 Configuration Options

### Hardware Tiers

| Tier | Cost | Speed | Recommended For |
|------|------|-------|-----------------|
| **CPU Basic** | Free | ~30-60s per image | Development, low-traffic apps |
| **CPU Upgrade** | ~$0.03/hr | ~20-40s per image | Medium-traffic apps |
| **T4 Small GPU** | ~$0.60/hr | ~5-15s per image | Production, high-traffic apps |

You can change hardware in Space Settings → Hardware.

### Environment Variables (Optional)

If you need custom configuration, add environment variables in Space Settings → Variables:

- `LOG_LEVEL`: Set to `DEBUG` for detailed logs
- `MAX_FILE_SIZE`: Maximum upload size in MB (default: 10MB)

## 🐛 Troubleshooting

### Build Failed

**Error**: `Failed to build Docker image`
- Check the Logs tab for specific error messages
- Ensure all files are uploaded correctly
- Verify Dockerfile syntax

### Space Shows "Sleeping"

Free tier Spaces sleep after inactivity:
- First request after sleep takes ~30-60 seconds to wake up
- Upgrade to persistent hardware to avoid sleeping

### Conversion Fails

**Error**: `No PLY file was generated`
- Image might be too complex or corrupted
- Try a simpler image or different format
- Check Space logs for ML-Sharp error messages

### Timeout Issues

**Error**: `504 Gateway Timeout`
- Image processing exceeded 5-minute limit
- Try smaller images or simpler scenes
- Consider upgrading to GPU hardware for faster processing

## 🔄 Updating Your Deployment

To update your Space after changes:

```bash
# Make changes to app.py or other files
# Then commit and push
git add .
git commit -m "Update: description of changes"
git push
```

Hugging Face will automatically rebuild and redeploy.

## 💰 Cost Comparison

| Solution | Monthly Cost | Availability | Manual Work |
|----------|--------------|--------------|-------------|
| **Colab + Ngrok** | Free | Manual start | High - restart every session |
| **HF Spaces (CPU)** | Free | Always-on | None - fully automated |
| **HF Spaces (GPU)** | ~$430/month | Always-on | None - fully automated |
| **HF Spaces (GPU on-demand)** | ~$0.60/hr | Pay per use | None - auto-scaling |

💡 **Recommendation**: Start with free CPU tier, upgrade to GPU only if you need faster processing for production traffic.

## 🎉 Next Steps

After successful deployment:

1. ✅ Test the API with real images from your app
2. ✅ Remove the old Colab notebook code
3. ✅ Update documentation to remove Ngrok setup instructions
4. ✅ Monitor Space usage and upgrade hardware if needed

## 📚 Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [ML-Sharp GitHub](https://github.com/apple/ml-sharp)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Need Help?** Check the Space logs or visit the Hugging Face forum for support.
