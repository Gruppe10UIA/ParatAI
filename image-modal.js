// image-modal.js

// Åpne bilde i modal
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.zoomable');
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close-modal');

  images.forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  // Lukk med knapp
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  });

  // Lukk med Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  });
});
