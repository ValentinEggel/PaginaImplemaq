const puppeteer = require("puppeteer");
const fs = require("fs-extra");

function obtenerEntre(texto, inicio, fin) {
  const i = texto.indexOf(inicio);
  if (i === -1) return "";
  const desde = i + inicio.length;
  const j = texto.indexOf(fin, desde);
  if (j === -1) return texto.slice(desde).trim();
  return texto.slice(desde, j).trim();
}

function obtenerPrecioPrincipal(texto) {
  const bloqueVendedor = texto.split("productos en venta")[1] || "";
  const bloquePrecio = bloqueVendedor.split("Preguntar")[0] || "";
  const match = bloquePrecio.match(/(u\$s|\$)\s?[\d\.\,]+/i);

  if (match) return match[0];

  const bloqueConsulta = texto.split("Conocé al vendedor")[1] || "";
  const bloqueSecundario = bloqueConsulta.split("Preguntar")[0] || "";
  const matchSecundario = bloqueSecundario.match(/(u\$s|\$)\s?[\d\.\,]+/i);

  if (matchSecundario) return matchSecundario[0];

  return "";
}

async function extraerProducto(page, item) {
  await page.goto(item.linkExterno, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  const data = await page.evaluate(() => {
    const texto = document.body.innerText;
    const nombre = document.title.replace(" - Agroads", "").trim();

    const imagenes = Array.from(document.querySelectorAll("img"))
      .map(img => img.src)
      .filter(src => src && src.startsWith("http"))
      .filter(src => src.includes("static"))
      .filter(src => src.includes("/1200/") || src.includes("/500/"));

    return {
      texto,
      nombre,
      imagenes: [...new Set(imagenes)]
    };
  });

  const info = data.texto.split("Información del producto")[1] || data.texto;

  const descripcion = obtenerEntre(data.texto, "Descripción", "Por cualquier consulta");
  const estado = obtenerEntre(info, "Estado", "Marca");
  const marca = obtenerEntre(info, "Marca", "Año");
  const anio = obtenerEntre(info, "Año", "Descripción");
  const precio = obtenerPrecioPrincipal(data.texto);

  const imagenes = data.imagenes.slice(0, 8);

  return {
    Nombre: data.nombre || item.nombre,
    Marca: marca,
    Categoria: item.nombre.toLowerCase().includes("kit") || item.nombre.toLowerCase().includes("correa") || item.nombre.toLowerCase().includes("cuchilla") ? "Repuestos" : "Maquinaria",
    Descripcion: descripcion,
    Precio: precio,
    Estado: estado,
    Año: anio,
    Imagen: imagenes[0] || "",
    Imagenes: imagenes,
    Activo: true,
    Destacado: false,
    MostrarPrecio: precio ? "si" : "no",
    LinkExterno: item.linkExterno
  };
}

async function main() {
  const productosBase = await fs.readJson("productos-agroads.json");

  const links = productosBase.filter(p =>
    p.linkExterno &&
    p.linkExterno.includes("detalle.asp?clasi=")
  );

  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  const productos = [];

  for (let i = 0; i < links.length; i++) {
    const item = links[i];

    try {
      console.log(`Procesando ${i + 1}/${links.length}: ${item.nombre}`);
      const producto = await extraerProducto(page, item);
      productos.push(producto);

      await fs.writeJson("productos-agroads-limpios-parcial.json", productos, {
        spaces: 2
      });
    } catch (error) {
      console.log(`Error en ${item.linkExterno}`);
      console.log(error.message);
    }
  }

  await fs.writeJson("productos-agroads-limpios.json", productos, {
    spaces: 2
  });

  console.log(`Productos limpios generados: ${productos.length}`);

  await browser.close();
}

main();