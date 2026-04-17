import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup as firebaseSignInWithPopup } from "firebase/auth";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyDEeuwyJ5CttpH-shFA9BpXEixAfRQkJp4",
  authDomain: "edubridge-3847b.firebaseapp.com",
  projectId: "edubridge-3847b",
  storageBucket: "edubridge-3847b.firebasestorage.app",
  messagingSenderId: "937188130080",
  appId: "1:937188130080:web:b4e7bd7227e5437d6eeb45",
  measurementId: "G-ZG09K4Q17Q"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = app ? new GoogleAuthProvider() : null;

async function signInWithPopup(authInstance, provider) {
  if (!authInstance || !provider) {
    throw new Error("Google sign-in is not configured for this deployment.");
  }
  return firebaseSignInWithPopup(authInstance, provider);
}

export { auth, googleProvider, hasFirebaseConfig, signInWithPopup };
