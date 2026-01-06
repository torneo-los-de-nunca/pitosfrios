// src/Firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("FIREBASE CONFIG:", {
  prod: import.meta.env.PROD,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

if (!firebaseConfig.projectId) {
  throw new Error(
    "Firebase config incompleta: falta VITE_FIREBASE_PROJECT_ID (revisá .env.local o Variables de Vercel)."
  );
}

export const app = initializeApp(firebaseConfig);

// ✅ FIX “client is offline”: fuerza long-polling (evita bloqueos de WebChannel en algunas redes/extensiones)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
