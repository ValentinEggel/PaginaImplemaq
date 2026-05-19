import { db, collection, getDocs } from "./firebase-config.js";

async function cargarProductos() {
  const contenedor = document.getElementById("productos-dinamicos");

  if (!contenedor) {
    console.error("No existe el contenedor productos-dinamicos");
    return;
  }

  contenedor.innerHTML = "<p>Cargando productos...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "Productos"));

    console.log("Cantidad de productos:", querySnapshot.size);

    if (querySnapshot.empty) {
      contenedor.innerHTML = "<p>No hay productos cargados en Firestore.</p>";
      return;
    }

    contenedor.innerHTML = "";

    querySnapshot.docs.slice(0, 4).forEach((doc) => {
      const producto = doc.data();
      console.log(producto);

      contenedor.innerHTML += `
        <div class="dest-card">
          <div class="dest-img">
            <img src="${producto.Imagen}" alt="${producto.Nombre}">
          </div>
          <div class="dest-body">
            <span class="dest-tag">${producto.Marca}</span>
            <h4>${producto.Nombre}</h4>
            <p>${producto.Descripción}</p>
          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error al cargar productos:", error);
    contenedor.innerHTML = "<p>Error al cargar productos. Revisá la consola.</p>";
  }
}

cargarProductos();
