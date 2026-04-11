// src/services/mlsharp-api.ts
/**
 * Service for communicating with the ML-Sharp backend API
 * running on Google Colab via Ngrok
 */

export interface MLSharpError {
  message: string;
  details?: string;
}

/**
 * Convert an image to a 3D PLY model using the ML-Sharp backend
 * @param file - The image file to convert
 * @param apiUrl - The Ngrok API URL from the Colab notebook
 * @returns Promise resolving to the PLY file as a Blob
 * @throws Error if the conversion fails
 */
export async function convertImageTo3D(
  file: File,
  apiUrl: string
): Promise<Blob> {
  // Validate inputs
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (!apiUrl || !apiUrl.trim()) {
    throw new Error(
      "ML-Sharp API URL not configured. Please set VITE_MLSHARP_API_URL in your .env.local file"
    );
  }

  // Prepare form data
  const formData = new FormData();
  formData.append("file", file);

  // Construct the full endpoint URL
  const endpoint = `${apiUrl.replace(/\/$/, "")}/convert-to-3d`;

  try {
    // Make the request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if the request was successful
    if (!response.ok) {
      // Try to parse error details from response
      let errorDetails = "";
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.error || errorJson.details || "";
      } catch {
        errorDetails = await response.text();
      }

      throw new Error(
        `ML-Sharp backend error (${response.status}): ${errorDetails || response.statusText}`
      );
    }

    // Get the PLY file as a blob
    const blob = await response.blob();

    // Verify we got a valid response
    if (blob.size === 0) {
      throw new Error("Received empty PLY file from backend");
    }

    return blob;
  } catch (error: any) {
    // Handle different error types
    if (error.name === "AbortError") {
      throw new Error(
        "ML-Sharp conversion timed out. The image may be too large or the backend is slow."
      );
    }

    if (error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to ML-Sharp backend. Please verify the Ngrok URL is correct and the Colab notebook is running."
      );
    }

    // Re-throw the error as-is if it's already formatted
    throw error;
  }
}

/**
 * Check if the ML-Sharp backend is available and responding
 * @param apiUrl - The Ngrok API URL
 * @returns Promise resolving to true if backend is available
 */
export async function checkMLSharpBackend(apiUrl: string): Promise<boolean> {
  if (!apiUrl || !apiUrl.trim()) {
    return false;
  }

  try {
    const endpoint = `${apiUrl.replace(/\/$/, "")}/`;
    const response = await fetch(endpoint, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return data.status === "ML-Sharp Backend is Running";
    }
    return false;
  } catch {
    return false;
  }
}
