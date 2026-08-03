
document.getElementById('year').textContent = new Date().getFullYear();

const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const form = document.getElementById('booking-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests = document.getElementById('guests').value;
  const phone = document.getElementById('guestphone').value.trim();
  const message = document.getElementById('message').value.trim();

  const subject = encodeURIComponent('Solicitud de reserva directa - Apartamento Rural Pedrosillo');
  const body = encodeURIComponent(
`Hola,

Quisiera consultar disponibilidad para el Apartamento Rural Pedrosillo.

Nombre: ${name}
Entrada: ${checkin}
Salida: ${checkout}
Huéspedes: ${guests}
Teléfono: ${phone || 'No indicado'}

Mensaje:
${message || 'Sin observaciones'}

Entiendo que esta solicitud no confirma la reserva y que recibiré respuesta por correo.`
  );
  window.location.href = `mailto:linares10santander@gmail.com?subject=${subject}&body=${body}`;
});

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.parentElement.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
}
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
