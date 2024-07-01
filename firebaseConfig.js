// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDLZN4M_MadoMAEkGuqHmz7DZu4Rgc2PY",
  authDomain: "count-fujiidera.firebaseapp.com",
  projectId: "count-fujiidera",
  storageBucket: "count-fujiidera.appspot.com",
  messagingSenderId: "62593758709",
  appId: "1:62593758709:web:137039c45b46fd125c1cbc",
  measurementId: "G-F5BME9Q8P9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };