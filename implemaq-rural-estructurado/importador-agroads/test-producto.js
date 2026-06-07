const puppeteer = require("puppeteer");
const fs = require("fs-extra");

const URL = "https://www.agroads.com.ar/detalle.asp?clasi=1078293";

function obtenerEntre(texto, inicio, fin) {
  const i = texto.indexOf(inicio);
  if (i === -1) return "";
  const desde = i + inicio.length;
  const j = texto.indexOf(fin, desde);
  if (j === -1) return texto.slice(desde).trim();
  return texto.slice(desde, j).trim();
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto(URL, {
    waitUntil: "networkidle2"
  });

  const producto = await page.evaluate(() => {
    const texto = document.body.innerText;

    const nombre = document.title.replace(" - Agroads", "").trim();

    const imagenes = Array.from(document.querySelectorAll("img"))
      .map(img => img.src)
      .filter(src => src && src.startsWith("http"))
      .filter(src => !src.toLowerCase().includes("logo"))
      .filter(src => !src.toLowerCase().includes("icon"));

    return {
      nombre,
      texto,
      imagenes: [...new Set(imagenes)]
    };
  });

  const descripcion = obtenerEntre(producto.texto, "Descripción", "Por cualquier consulta");const info = producto.texto.split("Información del producto")[1] || producto.texto;
    const estado = obtenerEntre(info, "Estado", "Marca");
    const marca = obtenerEntre(info, "Marca", "Año");
    const anio = obtenerEntre(info, "Año", "Descripción");  

  const resultado = {
    Nombre: producto.nombre,
    Marca: marca,
    Categoria: "Maquinaria",
    Descripcion: descripcion,
    Precio: "",
    Estado: estado,
    Año: anio,
    Imagen: producto.imagenes[0] || "",
    Imagenes: producto.imagenes,
    Activo: true,
    Destacado: false,
    MostrarPrecio: "no",
    LinkExterno: URL
  };

  await fs.writeJson("producto-limpio-prueba.json", resultado, {
    spaces: 2
  });

  console.log(resultado);

  await browser.close();
}

main();