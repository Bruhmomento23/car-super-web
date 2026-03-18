// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVeze4snCcqWkz1XuidJ2Z1cSNH6I0tio",
  authDomain: "car-super-web.firebaseapp.com",
  projectId: "car-super-web",
  storageBucket: "car-super-web.firebasestorage.app",
  messagingSenderId: "10694274127",
  appId: "1:10694274127:web:572efb5a7c554aed000e3a",
  measurementId: "G-HHPQZ5Q9JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);