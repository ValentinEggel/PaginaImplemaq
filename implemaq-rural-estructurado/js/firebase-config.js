import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtJa1nIppA8j8i7HUP6KFvKLgbRtzLwzQ",
  authDomain: "implemaq-4bce2.firebaseapp.com",
  projectId: "implemaq-4bce2",
  storageBucket: "implemaq-4bce2.firebasestorage.app",
  messagingSenderId: "433504757908",
  appId: "1:433504757908:web:21cb6d1c0b333bec84ac81",
  measurementId: "G-43YC2W9YHZ"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db, collection, getDocs };