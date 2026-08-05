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
  ['images/salon-1.jpg', 'Salón y zona de juegos'],
  ['images/comedor.jpg', 'Comedor'],
  ['images/dormitorio1-1.jpg', 'Primer dormitorio'],
  ['images/dormitorio1-2.jpg', 'Primer dormitorio'],
  ['images/cocina-1.jpg', 'Cocina'],
  ['images/vistas-1.jpg', 'Entorno'],
  ['images/salon-2.jpg', 'Salón'],
  ['images/salon-3.jpg', 'Salón y comedor'],
  ['images/dormitorio2.jpg', 'Segundo dormitorio'],
  ['images/cocina-2.jpg', 'Cocina'],
  ['images/bano.jpg', 'Baño'],
  ['images/entrada.jpg', 'Entrada'],
  ['images/garaje.jpg', 'Garaje privado'],
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


/* Calendario sincronizado mediante availability.json */
const calendarElement = document.getElementById('availability-calendar');
const calendarTitle = document.getElementById('calendar-title');
const calendarStatus = document.getElementById('calendar-status');
const calendarPrev = document.getElementById('calendar-prev');
const calendarNext = document.getElementById('calendar-next');

let occupiedDates = new Set();
let calendarMonth = new Date();
calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderAvailabilityCalendar() {
  if (!calendarElement) return;

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  calendarTitle.textContent = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  }).format(firstDay);

  calendarElement.innerHTML = '';

  for (let i = 0; i < mondayOffset; i += 1) {
    const empty = document.createElement('span');
    empty.className = 'calendar-day empty';
    calendarElement.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const key = localDateKey(date);
    const cell = document.createElement('span');
    cell.className = 'calendar-day';
    cell.textContent = String(day);
    cell.setAttribute('aria-label', `${day} de ${calendarTitle.textContent}`);

    if (date < today) cell.classList.add('past');
    if (date.getTime() === today.getTime()) cell.classList.add('today');

    if (occupiedDates.has(key)) {
      cell.classList.add('occupied');
      cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, ocupado`);
      cell.title = 'Ocupado';
    } else {
      cell.title = 'Disponible';
    }

    calendarElement.appendChild(cell);
  }
}

async function loadAvailability() {
  if (!calendarElement) return;

  try {
    const response = await fetch(`availability.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar la disponibilidad');

    const data = await response.json();
    occupiedDates = new Set(Array.isArray(data.occupied_dates) ? data.occupied_dates : []);
    renderAvailabilityCalendar();

    if (data.updated_at) {
      const updated = new Date(data.updated_at);
      calendarStatus.textContent = `Actualizado: ${new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(updated)}`;
    } else {
      calendarStatus.textContent = 'Disponibilidad pendiente de la primera sincronización.';
    }
  } catch (error) {
    renderAvailabilityCalendar();
    calendarStatus.textContent = 'No se ha podido actualizar el calendario. Consulta las fechas mediante el formulario.';
    calendarStatus.classList.add('error');
  }
}

if (calendarPrev && calendarNext) {
  calendarPrev.addEventListener('click', () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderAvailabilityCalendar();
  });

  calendarNext.addEventListener('click', () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderAvailabilityCalendar();
  });
}

loadAvailability();
