// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";

import { collection, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3IEomB5ip0Uxedck3SbcBp4HgkaY2N08",
  authDomain: "chapapp-mobile.firebaseapp.com",
  projectId: "chapapp-mobile",
  storageBucket: "chapapp-mobile.appspot.com",
  messagingSenderId: "263726499216",
  appId: "1:263726499216:web:cf2eb8f8a6f85e19c5df15"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);


export const userRef = collection(database, 'users');
export const roomRef = collection(database, 'rooms');

