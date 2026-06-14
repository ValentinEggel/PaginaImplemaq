

const btnLogin = document.getElementById('btnLogin');
const btnSalir = document.getElementById('btnSalir');

if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    alert('Login pendiente de conectar con Firebase Auth.');
  });
}

if (btnSalir) {
  btnSalir.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
}
