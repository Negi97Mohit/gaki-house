# 🚀 Quick Start: Deploy ML-Sharp in 5 Minutes

## Step 1: Create Your Space (2 minutes)

1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Name**: `mlsharp-2d-to-3d`
   - **SDK**: Select **Docker**
   - **Hardware**: **CPU Basic (Free)**
3. Click **Create Space**

## Step 2: Upload Files (1 minute)

In your Space:
1. Click **Files** → **Add file** → **Upload files**
2. Upload ALL files from `huggingface-deployment` folder:
   - ✅ `app.py`
   - ✅ `requirements.txt`
   - ✅ `README.md`
   - ✅ `Dockerfile`
3. Click **Commit changes**

## Step 3: Wait for Build (5-10 minutes)

- Watch the **Logs** tab
- Wait for "Running" status

## Step 4: Update Your App (30 seconds)

Copy your Space URL:
```
https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space
```

Update `.env.local`:
```env
VITE_MLSHARP_API_URL=https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space
```

## ✅ Done!

Your app now has a **permanent, always-on API** for 2D to 3D conversion!

### Test It

```bash
curl https://YOUR-USERNAME-mlsharp-2d-to-3d.hf.space/
```

Should return:
```json
{
  "status": "ML-Sharp Backend is Running",
  "version": "1.0.0"
}
```

---

**Full instructions**: See [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)
