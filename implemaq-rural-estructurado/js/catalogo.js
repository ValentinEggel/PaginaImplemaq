import { db, collection, getDocs } from "./firebase-config.js";

const normalizar = (valor) => {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const obtenerImagen = (producto) => {
  if (producto.Imagen) return producto.Imagen;
  if (producto.imagen) return producto.imagen;

  if (Array.isArray(producto.Imagenes) && producto.Imagenes.length > 0) {
    return producto.Imagenes[0];
  }

  if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    return producto.imagenes[0];
  }

  return "https://via.placeholder.com/600x450/f5f3ee/aaa?text=Sin+imagen";
};

const obtenerPrecio = (producto) => {

  const precio = producto.Precio || producto.precio || "";
  
  const monedaRaw =
    producto.Moneda ||
    producto.moneda ||
    "ARS";

  const moneda = String(monedaRaw)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!precio || precio === "Consultar") {
    return "Consultar precio";
  }

  const precioNumerico = Number(precio);

  if (Number.isNaN(precioNumerico)) {
    return precio;
  }

  const esUSD =
    moneda.includes("USD") ||
    moneda.includes("DOLAR");

  return esUSD
    ? `U$S ${precioNumerico.toLocaleString("es-AR")}`
    : `$${precioNumerico.toLocaleString("es-AR")}`;
};

const crearCardProducto = (producto, id) => {
  const nombre = producto.Nombre || producto.nombre || "Producto sin nombre";
  const marca = producto.Marca || producto.marca || "";
  const descripcionCompleta =
  producto.Descripción ||
  producto.Descripcion ||
  producto.descripcion ||
  "";

const descripcion =
  descripcionCompleta.length > 90
    ? descripcionCompleta.substring(0, 90) + "..."
    : descripcionCompleta;
  const imagen = obtenerImagen(producto);

  return `
    <a href="producto.html?id=${id}" class="dest-card-link">
      <div class="dest-card">
        <div class="dest-img">
          <img src="${imagen}" alt="${nombre}" loading="lazy">
        </div>

        <div class="dest-body">
          <span class="dest-tag">${marca || "IMPLEMAQ"}</span>
          <h4>${nombre}</h4>
          <p>${descripcion}</p>
          <span class="cat-link">
            Ver más
          </span>   
        </div>
      </div>
    </a>
  `;
};

async function obtenerProductos() {
  const querySnapshot = await getDocs(collection(db, "Productos"));

  return querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter((producto) => producto.Activo !== false);
}

async function cargarProductosDestacados(productos) {
  const contenedor = document.getElementById("productos-dinamicos");

  if (!contenedor) return;

  const destacados = productos
    .filter((producto) => producto.Destacado === true || producto.destacado === true)
    .slice(0, 4);

  const productosAMostrar = destacados.length > 0
    ? destacados
    : productos.slice(0, 4);

  if (productosAMostrar.length === 0) {
    contenedor.innerHTML = "<p>No hay productos destacados cargados.</p>";
    return;
  }

  contenedor.innerHTML = productosAMostrar
    .map((producto) => crearCardProducto(producto, producto.id))
    .join("");
}

async function cargarCarruselRepuestos(productos) {
  const contenedor = document.getElementById("repuestos-carousel");

  if (!contenedor) return;

const repuestos = productos
  .filter((producto) => {
    const categoria = normalizar(
      producto.Categoría ||
      producto.Categoria ||
      producto.categoria
    );

    return categoria.includes("repuesto");
  })
  .sort(() => Math.random() - 0.5)
  .slice(0, 15);

  if (repuestos.length === 0) {
    contenedor.innerHTML = `
      <div class="carousel-empty">
        No hay repuestos cargados todavía.
      </div>
    `;
    return;
  }

  contenedor.innerHTML = repuestos
    .map((producto) => crearCardProducto(producto, producto.id))
    .join("");
}

window.moverCarruselRepuestos = (direccion) => {
  const carrusel = document.getElementById("repuestos-carousel");

  if (!carrusel) return;

  carrusel.scrollBy({
    left: direccion * 320,
    behavior: "smooth"
  });
};

async function iniciarHomeDinamico() {
  const contenedorDestacados = document.getElementById("productos-dinamicos");
  const contenedorRepuestos = document.getElementById("repuestos-carousel");

  if (contenedorDestacados) {
    contenedorDestacados.innerHTML = "<p>Cargando productos destacados...</p>";
  }

  if (contenedorRepuestos) {
    contenedorRepuestos.innerHTML = "<p class='carousel-loading'>Cargando repuestos...</p>";
  }

  try {
    const productos = await obtenerProductos();

    await cargarProductosDestacados(productos);
    await cargarCarruselRepuestos(productos);

  } catch (error) {
    console.error("Error al cargar productos dinámicos:", error);

    if (contenedorDestacados) {
      contenedorDestacados.innerHTML = "<p>Error al cargar productos destacados.</p>";
    }

    if (contenedorRepuestos) {
      contenedorRepuestos.innerHTML = "<p class='carousel-loading'>Error al cargar repuestos.</p>";
    }
  }
}

iniciarHomeDinamico();
