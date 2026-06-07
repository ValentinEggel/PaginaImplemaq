const fs = require("fs-extra");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword
} = require("firebase/auth");
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDtJa1nIppA8j8i7HUP6KFvKLgbRtzLwzQ",
  authDomain: "implemaq-4bce2.firebaseapp.com",
  projectId: "implemaq-4bce2",
  storageBucket: "implemaq-4bce2.firebasestorage.app",
  messagingSenderId: "433504757908",
  appId: "1:433504757908:web:21cb6d1c0b333bec84ac81",
  measurementId: "G-43YC2W9YHZ"
};

const ADMIN_EMAIL = "adminimplemaq@gmail.com";
const ADMIN_PASSWORD = "admin1#";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function existeProducto(linkExterno) {
  const q = query(
    collection(db, "Productos"),
    where("LinkExterno", "==", linkExterno)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

async function main() {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log("Login admin correcto");

  const productos = await fs.readJson("productos-agroads-final.json");

  let cargados = 0;
  let omitidos = 0;

  for (const producto of productos) {
    const existe = await existeProducto(producto.LinkExterno);

    if (existe) {
      omitidos++;
      console.log(`Omitido: ${producto.Nombre}`);
      continue;
    }

    await addDoc(collection(db, "Productos"), {
      ...producto,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      origen: "Agroads"
    });

    cargados++;
    console.log(`Cargado: ${producto.Nombre}`);
  }

  console.log("Carga finalizada");
  console.log(`Productos cargados: ${cargados}`);
  console.log(`Productos omitidos: ${omitidos}`);
}

main().catch(error => {
  console.error("Error:", error.message);
});