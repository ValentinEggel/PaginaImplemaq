const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
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

function precioANumero(precio) {
  if (!precio) return null;
  const limpio = String(precio)
    .replace("u$s", "")
    .replace("$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const numero = Number(limpio);
  return isNaN(numero) ? null : numero;
}

function detectarCategoria(p) {
  const texto = `${p.Nombre || ""} ${p.Descripcion || ""}`.toLowerCase();

  const repuestos = [
    "kit",
    "buje",
    "cuchilla",
    "correa",
    "polea",
    "diente",
    "púa",
    "cadena",
    "grampa",
    "bancada",
    "rodamiento",
    "tapa",
    "perno",
    "tuerca",
    "bulon",
    "bulón",
    "eje",
    "repuesto"
  ];

  const insumos = [
    "semilla",
    "fertilizante",
    "inoculante",
    "herbicida",
    "agroinsumo",
    "insumo"
  ];

  const implementos = [
    "rastra",
    "rolo",
    "desmalezadora",
    "niveladora",
    "pala",
    "balanzon",
    "balanzón",
    "rastrillo",
    "acoplado",
    "tolva",
    "cargador",
    "extractora"
  ];

  if (repuestos.some(x => texto.includes(x))) return "Repuestos";
  if (insumos.some(x => texto.includes(x))) return "Insumos";
  if (implementos.some(x => texto.includes(x))) return "Implementos";

  return "Maquinaria";
}

async function main() {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  const snap = await getDocs(collection(db, "Productos"));

  let actualizados = 0;

  for (const documento of snap.docs) {
    const p = documento.data();

    if (p.origen !== "Agroads") continue;

    const categoria = detectarCategoria(p);
    const precioNumero = precioANumero(p.Precio);

    await updateDoc(doc(db, "Productos", documento.id), {
      nombre: p.Nombre || "",
      marca: p.Marca || "Sin marca",
      categoria: categoria,
      descripcion: p.Descripcion || "",
      precio: precioNumero,
      precioTexto: p.Precio || "",
      estado: p.Estado || "",
      anio: p.Año || "",
      imagen: p.Imagen || "",
      imagenes: p.Imagenes || [],
      activo: p.Activo ?? true,
      destacado: p.Destacado ?? false,
      mostrarPrecio: p.MostrarPrecio || "si",
      linkExterno: p.LinkExterno || "",
      Categoria: categoria
    });

    actualizados++;
    console.log(`Actualizado: ${p.Nombre}`);
  }

  console.log(`Productos actualizados: ${actualizados}`);
}

main().catch(error => {
  console.error(error.message);
});