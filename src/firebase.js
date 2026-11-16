import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaL_DYtVzbJViJ1kkFWPDbgjZOGt2-rr4",
  authDomain: "gym-management-saas-9c6c7.firebaseapp.com",
  projectId: "gym-management-saas-9c6c7",
  storageBucket: "gym-management-saas-9c6c7.firebasestorage.app",
  messagingSenderId: "602954748877",
  appId: "1:602954748877:web:9637f00ae39334f7dfea84"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
