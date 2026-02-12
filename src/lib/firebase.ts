// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYdOJlvYVlc5KMqnqFYC67_bUVWfU8XfA",
  authDomain: "gaki-fb708.firebaseapp.com",
  projectId: "gaki-fb708",
  storageBucket: "gaki-fb708.firebasestorage.app",
  messagingSenderId: "696196670090",
  appId: "1:696196670090:web:91b7558f5dc050a1410373",
  measurementId: "G-T9G91VS18Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
