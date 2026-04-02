// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnw_MeKlxx1d8SbYYf3yI_7dbjSNeYhz0",
  authDomain: "car-super-app.firebaseapp.com",
  projectId: "car-super-app",
  storageBucket: "car-super-app.firebasestorage.app",
  messagingSenderId: "107603653247",
  appId: "1:107603653247:web:a02214101b945d64c3454a",
  measurementId: "G-KMZYDR3DEZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);