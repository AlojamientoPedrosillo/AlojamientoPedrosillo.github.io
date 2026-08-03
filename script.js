document.getElementById('year').textContent = new Date().getFullYear();

const nav = document.getElementById('main-nav');
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}
updateNav();
window.addEventListener('scroll', updateNav);

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.getElementById('booking-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

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

const galleryImages = [
  ['images/salon-1.jpg', 'Salón'],
  ['images/comedor.jpg', 'Comedor'],
  ['images/dormitorio-1.jpg', 'Primer dormitorio'],
  ['images/cocina-1.jpg', 'Cocina'],
  ['images/vistas-1.jpg', 'Entorno'],
  ['images/salon-2.jpg', 'Salón'],
  ['images/salon-3.jpg', 'Salón y comedor'],
  ['images/salon-comedor.jpg', 'Zona de día'],
  ['images/dormitorio-2.jpg', 'Segundo dormitorio'],
  ['images/cocina-2.jpg', 'Cocina'],
  ['images/bano.jpg', 'Baño'],
  ['images/entrada.jpg', 'Entrada'],
  ['images/vistas-2.jpg', 'Entorno de Selaya']
];

const modal = document.querySelector('.gallery-modal');
const modalImg = document.querySelector('.gallery-full');
const counter = document.querySelector('.gallery-counter');
let currentIndex = 0;

function showImage(index) {
  currentIndex = (index + galleryImages.length) % galleryImages.length;
  modalImg.src = galleryImages[currentIndex][0];
  modalImg.alt = galleryImages[currentIndex][1];
  counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
}

function openGallery(index = 0) {
  showImage(index);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeGallery() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.gallery-preview button').forEach(button => {
  button.addEventListener('click', () => openGallery(Number(button.dataset.index)));
});

document.getElementById('open-gallery').addEventListener('click', () => openGallery(0));
document.querySelector('.gallery-close').addEventListener('click', closeGallery);
document.querySelector('.gallery-prev').addEventListener('click', () => showImage(currentIndex - 1));
document.querySelector('.gallery-next').addEventListener('click', () => showImage(currentIndex + 1));

modal.addEventListener('click', event => {
  if (event.target === modal) closeGallery();
});

document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentIndex + 1);
});


const hero = document.querySelector('.hero');
let parallaxTicking = false;

function updateHeroParallax() {
  if (!hero) return;
  const movement = Math.min(window.scrollY * 0.12, 55);
  hero.style.setProperty('--parallax', `${movement}px`);
  parallaxTicking = false;
}

window.addEventListener('scroll', () => {
  if (!parallaxTicking) {
    window.requestAnimationFrame(updateHeroParallax);
    parallaxTicking = true;
  }
}, { passive: true });
