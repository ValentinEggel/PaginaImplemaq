const puppeteer = require("puppeteer");
const fs = require("fs-extra");

const URL = "https://www.agroads.com.ar/e/implemaq/";

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });

  await page.waitForSelector("a");

  const productos = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));

    return links
      .map(a => {
        const texto = a.innerText.trim();
        const href = a.href;

        if (!texto || !href) return null;
        if (!href.includes("agroads.com.ar")) return null;
        if (texto.length < 8) return null;

        return {
          nombre: texto,
          linkExterno: href,
          categoria: "",
          marca: "",
          descripcion: "",
          precio: "",
          moneda: "",
          estado: "Nuevo",
          destacado: false,
          activo: true,
          mostrarPrecio: "no",
          imagen: "",
          imagenes: []
        };
      })
      .filter(Boolean);
  });

  const unicos = [];
  const vistos = new Set();

  for (const p of productos) {
    if (!vistos.has(p.linkExterno)) {
      vistos.add(p.linkExterno);
      unicos.push(p);
    }
  }

  await fs.writeJson("productos-agroads.json", unicos, { spaces: 2 });

  console.log(`Productos encontrados: ${unicos.length}`);

  await browser.close();
}

main();