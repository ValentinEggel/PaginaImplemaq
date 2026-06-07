const fs = require("fs-extra");

function limpiarCampo(valor) {
  if (!valor) return "";
  return String(valor)
    .split("\n")[0]
    .replace("Descripción", "")
    .trim();
}

function limpiarNombre(nombre) {
  return String(nombre || "")
    .replace(/\s-\s\$.*$/i, "")
    .replace(/\s-\su\$s.*$/i, "")
    .replace(/\s-\sAño:\s?\d+/i, "")
    .trim();
}

function limpiarPrecio(nombre, precio) {
  const texto = `${nombre || ""} ${precio || ""}`;
  const match = texto.match(/(u\$s|\$)\s?[\d\.\,]+/i);
  return match ? match[0] : "";
}

async function main() {
  const productos = await fs.readJson("productos-agroads-limpios.json");

  const limpios = productos.map(p => {
    const nombre = limpiarNombre(p.Nombre);
    const precio = limpiarPrecio(p.Nombre, p.Precio);
    const estado = limpiarCampo(p.Estado);
    let marca = limpiarCampo(p.Marca);

    if (
      marca === "s" ||
      marca === "s." ||
      marca === "."
    ) {
      marca = "";
    }

    if (!marca.trim()) {
      marca = "Sin marca";
    }

    return {
      Nombre: nombre,
      Marca: marca,
      Categoria: p.Categoria || "Maquinaria",
      Descripcion: p.Descripcion || "",
      Precio: precio,
      Estado: estado,
      Año: p.Año || "",
      Imagen: p.Imagen || "",
      Imagenes: p.Imagenes || [],
      Activo: true,
      Destacado: false,
      MostrarPrecio: precio ? "si" : "no",
      LinkExterno: p.LinkExterno
    };
  });

  await fs.writeJson("productos-agroads-final.json", limpios, {
    spaces: 2
  });

  console.log(`Productos finales generados: ${limpios.length}`);
}

main();