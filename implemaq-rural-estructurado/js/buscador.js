// ============================================================
// MOTOR DE BÚSQUEDA — IMPLEMAQ RURAL
// JS puro, sin dependencias externas.
//
// Resuelve 4 problemas del buscador anterior:
//   1) Mayúsculas/minúsculas
//   2) Tildes (púa = pua)
//   3) Singular/plural (púa = púas)
//   4) Orden de palabras (busca por tokens, no por frase literal)
//
// Pensado para catálogos de cientos/miles de productos:
// el índice de cada producto se calcula UNA sola vez y se
// cachea en el propio objeto (producto._tokens), no en cada
// tecla que el usuario tipea.
// ============================================================

/**
 * Normaliza un texto: minúsculas, sin tildes, sin espacios extra.
 * Protege la "ñ" para que no se confunda con una vocal acentuada
 * (año !== ano).
 */
function normalizarTexto(texto) {
  return (texto ?? '')
    .toString()
    .toLowerCase()
    .replace(/ñ/g, '\u0001')          // protegemos la ñ
    .normalize('NFD')                  // separa letra + tilde
    .replace(/[\u0300-\u036f]/g, '')   // quita las tildes sueltas
    .replace(/\u0001/g, 'ñ')           // restauramos la ñ
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Heurística ligera de singularización para español.
 * No es un stemmer lingüístico completo (eso es innecesario acá),
 * cubre los casos reales de un catálogo de productos:
 *   púas → púa · motores → motor · luces → luz
 *
 * Se protegen palabras de 3 letras o menos para no romper
 * palabras cortas que terminan en "s" de forma natural
 * (gas, mes, más).
 */
function singularizar(palabra) {
  if (palabra.length <= 3) return palabra;
  if (palabra.endsWith('ces')) return palabra.slice(0, -3) + 'z'; // luces → luz
  if (palabra.endsWith('es'))  return palabra.slice(0, -2);        // motores → motor
  if (palabra.endsWith('s'))   return palabra.slice(0, -1);        // púas → púa
  return palabra;
}

/** Parte un texto en palabras normalizadas (sin normalizar plural todavía). */
function tokenizar(texto) {
  return normalizarTexto(texto).split(' ').filter(Boolean);
}

/**
 * Construye el índice de búsqueda de un producto: junta los campos
 * relevantes, normaliza y tokeniza. Se llama UNA vez por producto
 * (se cachea afuera, ver `obtenerTokens`).
 */
function construirIndice(producto) {
  const campos = [
    producto.nombre,
    producto.marca,
    producto.descripcion,
    producto.categoria
  ];
  return tokenizar(campos.join(' '));
}

/**
 * Devuelve los tokens de un producto, calculándolos y cacheándolos
 * en `producto._tokens` la primera vez. Las búsquedas siguientes
 * para ese mismo producto no vuelven a normalizar nada.
 */
function obtenerTokens(producto) {
  if (!producto._tokens) {
    producto._tokens = construirIndice(producto);
  }
  return producto._tokens;
}

/**
 * ¿Un token de búsqueda matchea contra un token del producto?
 * Combina dos criterios:
 *   - substring (permite escribir "trac" y encontrar "tractor")
 *   - singular/plural (permite "púas" y encontrar "púa" y viceversa)
 */
function tokenCoincide(tokenProducto, tokenConsulta) {
  if (tokenProducto.includes(tokenConsulta)) return true;
  return singularizar(tokenProducto).includes(singularizar(tokenConsulta));
}

/**
 * ¿Un producto matchea contra TODOS los tokens de la consulta?
 * (Se exige que cada palabra buscada aparezca en algún campo,
 * sin importar el orden — eso es lo que permite buscar por
 * palabras en cualquier orden.)
 */
function productoCoincide(producto, tokensConsulta) {
  const tokensProducto = obtenerTokens(producto);
  return tokensConsulta.every(tConsulta =>
    tokensProducto.some(tProd => tokenCoincide(tProd, tConsulta))
  );
}

/**
 * Función principal: filtra una lista de productos según una
 * búsqueda cruda (tal cual la tipeó el usuario).
 *
 * @param {Array} productos - lista completa de productos
 * @param {string} consultaCruda - texto tal cual lo escribió el usuario
 * @returns {Array} productos que matchean
 */
function filtrarProductos(productos, consultaCruda) {
  const tokensConsulta = tokenizar(consultaCruda).map(singularizar);

  if (!tokensConsulta.length) return productos;

  return productos.filter(p => productoCoincide(p, tokensConsulta));
}

export { filtrarProductos, normalizarTexto, singularizar };
