// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2TddIRJHNqzpFFkUx77f9u2hJ4iRwAoY",
  authDomain: "pantry-database-955c6.firebaseapp.com",
  projectId: "pantry-database-955c6",
  storageBucket: "pantry-database-955c6.appspot.com",
  messagingSenderId: "1060769321750",
  appId: "1:1060769321750:web:38cdf4105cc0c6ef447637",
  measurementId: "G-SSZ1S6T75Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db }
