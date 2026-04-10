import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
// Note: Ensure your environment variable GOOGLE_APPLICATION_CREDENTIALS is set
// pointing to your Firebase service account JSON file, or initialize with explicit credentials here.
if (!admin.apps.length) {
  admin.initializeApp();
}

// Extend Express Request to include the verified Firebase user
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT securely with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the verified user payload to the request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Auth verification failed:", error);
    res.status(401).json({ error: "Unauthorized access" });
  }
};
