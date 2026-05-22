const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 80);

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach((element) => observer.observe(element));

function enviarFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const tel = document.getElementById('tel').value.trim();
  const email = document.getElementById('email').value.trim();
  const asunto = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value.trim();

  if (!nombre || !mensaje) {
    alert('Por favor completá al menos nombre y mensaje.');
    return;
  }

  const texto = `Hola!
Soy ${nombre}.

${tel ? `Teléfono: ${tel}
` : ''}${email ? `Email: ${email}
` : ''}${asunto ? `Consulta: ${asunto}
` : ''}
Mensaje:
${mensaje}`;

  window.open(
    'https://wa.me/543492508683?text=' + encodeURIComponent(texto),
    '_blank'
  );
}

async function cargarDolar() {
  const contenedor = document.getElementById('dolar-oficial');

  if (!contenedor) return;

  try {
    const oficialRes = await fetch('https://dolarapi.com/v1/dolares/oficial');
    const oficial = await oficialRes.json();

    contenedor.innerHTML = `
      <div class="dolar-item">
        <strong>$${oficial.compra}</strong>
        <small>Compra</small>
      </div>

      <div class="dolar-item">
        <strong>$${oficial.venta}</strong>
        <small>Venta</small>
      </div>
    `;
  } catch (error) {
    contenedor.textContent = 'No disponible';
  }
}

async function cargarClima(lat, lon, ubicacionTexto) {
  const temp = document.getElementById('clima-temp');
  const ubicacion = document.getElementById('clima-ubicacion');

  if (!temp || !ubicacion) return;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    temp.textContent = `${Math.round(data.current.temperature_2m)}°C`;
    ubicacion.textContent = ubicacionTexto;
  } catch (error) {
    temp.textContent = 'No disponible';
    ubicacion.textContent = 'Clima';
  }
}

function iniciarClima() {
  const ubicacionDefault = {
    lat: -31.3553,
    lon: -61.5058,
    texto: 'Rafaela / Susana'
  };

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cargarClima(
          pos.coords.latitude,
          pos.coords.longitude,
          'Tu ubicación'
        );
      },
      () => {
        cargarClima(
          ubicacionDefault.lat,
          ubicacionDefault.lon,
          ubicacionDefault.texto
        );
      }
    );
  } else {
    cargarClima(
      ubicacionDefault.lat,
      ubicacionDefault.lon,
      ubicacionDefault.texto
    );
  }
}

cargarDolar();
iniciarClima();
