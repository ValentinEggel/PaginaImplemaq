const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

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

  const texto =
`Hola! 
Soy ${nombre}.

${tel ? `Teléfono: ${tel}` : ''}
${email ? `Email: ${email}` : ''}
${asunto ? `Consulta: ${asunto}` : ''}

Mensaje:
${mensaje}`;

  window.open(
    'https://wa.me/543492508683?text=' + encodeURIComponent(texto),
    '_blank'
  );
}
async function cargarDolar() {
  try {
    const [oficialRes, blueRes] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares/oficial"),
      fetch("https://dolarapi.com/v1/dolares/blue")
    ]);

    const oficial = await oficialRes.json();
    const blue = await blueRes.json();

    document.getElementById("dolar-oficial").textContent = `$${oficial.venta}`;
    document.getElementById("dolar-blue").textContent = `$${blue.venta}`;
  } catch (error) {
    document.getElementById("dolar-oficial").textContent = "No disponible";
    document.getElementById("dolar-blue").textContent = "No disponible";
  }
}

async function cargarClima(lat, lon, ubicacionTexto) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("clima-temp").textContent =
      `${Math.round(data.current.temperature_2m)}°C`;

    document.getElementById("clima-ubicacion").textContent = ubicacionTexto;
  } catch (error) {
    document.getElementById("clima-temp").textContent = "No disponible";
    document.getElementById("clima-ubicacion").textContent = "Clima";
  }
}

function iniciarClima() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cargarClima(
          pos.coords.latitude,
          pos.coords.longitude,
          "Tu ubicación"
        );
      },
      () => {
        cargarClima(-31.3553, -61.5058, "Rafaela / Susana");
      }
    );
  } else {
    cargarClima(-31.3553, -61.5058, "Rafaela / Susana");
  }
}

cargarDolar();
iniciarClima();