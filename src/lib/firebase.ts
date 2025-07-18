import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBfIUiQhCJPaeG4tqUZ0JYy3TZ1KIP23Q",
  authDomain: "projetorotasplus.firebaseapp.com",
  projectId: "projetorotasplus",
  storageBucket: "projetorotasplus.firebasestorage.app",
  messagingSenderId: "478286482826",
  appId: "1:478286482826:web:76a506f9103e2f48274c73",
  measurementId: "G-RWGFHC2XLM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Enable network for real-time updates
enableNetwork(db);

export default app;