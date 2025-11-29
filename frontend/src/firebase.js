// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA59rxohFthPiWmK60s2JyoP0lr2SeYILo",
  authDomain: "hackspark-a9140.firebaseapp.com",
  projectId: "hackspark-a9140",
  storageBucket: "hackspark-a9140.firebasestorage.app",
  messagingSenderId: "901619460592",
  appId: "1:901619460592:web:dc7d61611d202985da5535"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);