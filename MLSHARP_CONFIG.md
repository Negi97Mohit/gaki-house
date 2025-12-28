# ML-Sharp Backend Configuration

Add the following line to your `.env.local` file:

```
VITE_MLSHARP_API_URL=https://your-ngrok-url-here.ngrok-free.dev
```

Replace `https://your-ngrok-url-here.ngrok-free.dev` with the actual Ngrok URL shown when you run your Google Colab notebook.

## Example

When your Colab notebook shows:
```
========================================================
🚀 BACKEND READY!
👉 API URL: https://lakia-multichanneled-noncannibalistically.ngrok-free.dev
========================================================
```

Your `.env.local` should contain:
```
VITE_MLSHARP_API_URL=https://lakia-multichanneled-noncannibalistically.ngrok-free.dev
```

**Important**: Remember to update this URL each time you restart your Colab notebook, as Ngrok generates a new URL for each session.
