// Firebase initialization for mobile app
// Uses the same project as the web app (gaki-fb708)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYdOJlvYVlc5KMqnqFYC67_bUVWfU8XfA",
  authDomain: "gaki-fb708.firebaseapp.com",
  projectId: "gaki-fb708",
  storageBucket: "gaki-fb708.firebasestorage.app",
  messagingSenderId: "696196670090",
  appId: "1:696196670090:web:91b7558f5dc050a1410373",
  measurementId: "G-T9G91VS18Q",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
