(() => {
  const rotator = document.querySelector('.team-rotator');
  if (!rotator) return;

  const grid = rotator.querySelector('[data-rotator-grid]');
  const cards = Array.from(grid.querySelectorAll('.team-member')).slice(0, 6);
  if (cards.length < 2) return;

  const btnPrev = rotator.querySelector('.rotator-prev');
  const btnNext = rotator.querySelector('.rotator-next');
  const btnPlay = rotator.querySelector('.rotator-play');
  const dotsWrap = rotator.querySelector('.rotator-dots');

// --- Settings ---
const animDur = 400;                 // ms (CSS transition duration)
const pauseMain = 11000;             // 11s per-step reading pause (post-intro if user presses Play)
const pauseInitial = 2000;           // 2s per-step in the desktop intro round
const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 768px)').matches;

// --- State ---
let autoplay = true;                 // master autoplay flag
let inInitialTour = true;            // intro round flag (desktop only)
let initialStepsDone = 0;            // count steps in intro (6 total)
let stepTimer = null;

// If NOT desktop: no intro, no autoplay
if (!isDesktop) {
  autoplay = false;
  inInitialTour = false;
}

  // Respect reduced motion: no autoplay / no intro
  if (prefersReduce) {
    autoplay = false;
    inInitialTour = false;
  }

  // Apply intro class on desktop only (hides details, enlarges photos via CSS)
  if (isDesktop && !prefersReduce) {
    rotator.classList.add('intro');
  }

  // --- Helpers ---
  function assignPositions() {
    cards.forEach((el, i) => el.setAttribute('data-position', String(i + 1)));
    updateDots();
  }

function stepForward() {
 
  cards.forEach(el => {
    const pos = Number(el.getAttribute('data-position'));
    el.setAttribute('data-position', String(pos === 1 ? 6 : pos - 1));
  });
  updateDots();
}

function stepBackward() {

  cards.forEach(el => {
    const pos = Number(el.getAttribute('data-position'));
    el.setAttribute('data-position', String(pos === 6 ? 1 : pos + 1));
  });
  updateDots();
}

  function jumpCardToFeatured(card) {
    const targetPos = Number(card.getAttribute('data-position'));
    if (targetPos === 1) return;

    rotator.classList.add('no-animate'); // instant jump (no transition)

    const shift = (6 - targetPos + 1) % 6; // how many forward steps to bring card to pos 1
    for (let n = 0; n < shift; n++) {
      cards.forEach(el => {
        const pos = Number(el.getAttribute('data-position'));
        el.setAttribute('data-position', String(pos === 6 ? 1 : pos + 1));
      });
    }

    // Re-enable transitions
    void rotator.offsetHeight;
    rotator.classList.remove('no-animate');
    updateDots();
  }

  // --- Dots ---
  function buildDots() {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rotator-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `Medlem ${i + 1}`);
      dot.addEventListener('click', () => {
        pause();
        jumpCardToFeatured(cards[i]);
      });
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    const featuredIndex = cards.findIndex(el => el.getAttribute('data-position') === '1');
    const dots = Array.from(dotsWrap.querySelectorAll('.rotator-dot'));
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === featuredIndex ? 'true' : 'false'));
  }

  // --- Autoplay loop ---
  function scheduleNext() {
    clearTimeout(stepTimer);
    if (!autoplay) return;

    const delay = inInitialTour ? pauseInitial : pauseMain;

    stepTimer = setTimeout(() => {
      stepForward();

      if (inInitialTour) {
        initialStepsDone++;
        if (initialStepsDone >= 6) {
          // Intro done: stop autoplay and reveal all details
          inInitialTour = false;
          rotator.classList.remove('intro'); // CSS reveals roles/skills/description/socials
          pause(); // stop autoplay after intro
          return;  // do not schedule another step
        }
      }

      // Continue only if still autoplaying (e.g., user pressed Play later)
      scheduleNext();
    }, delay);
  }

  // --- Controls ---
  function pause() {
    autoplay = false;
    rotator.dataset.autoplay = 'false';
    clearTimeout(stepTimer);
    
    // Failsafe: If pausing during intro, immediately show all details
    if (inInitialTour) {
      inInitialTour = false;
      rotator.classList.remove('intro');
    }
    
    if (btnPlay) {
      btnPlay.setAttribute('aria-pressed', 'false');
      btnPlay.textContent = 'Spill av';
      btnPlay.setAttribute('aria-label', 'Start rotasjon');
    }
  }

  function play() {
    autoplay = true;
    rotator.dataset.autoplay = 'true';
    if (btnPlay) {
      btnPlay.setAttribute('aria-pressed', 'true');
      btnPlay.textContent = 'Pause';
      btnPlay.setAttribute('aria-label', 'Pause rotasjon');
    }
    scheduleNext();
  }

  if (btnNext) btnNext.addEventListener('click', () => { pause(); stepForward(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { pause(); stepBackward(); });
  if (btnPlay) btnPlay.addEventListener('click', () => { if (autoplay) pause(); else play(); });

  // Clicking any card: pause + jump to featured (instant).
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.getAttribute('data-position') === '1') {
        if (autoplay) pause(); else play();
      } else {
        pause();
        jumpCardToFeatured(card);
      }
    });
  });

  // Keyboard a11y
  rotator.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); pause(); stepForward(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); pause(); stepBackward(); }
    if (e.key === ' ') {
      const activeEl = document.activeElement;
      if (rotator.contains(activeEl)) {
        e.preventDefault();
        if (autoplay) pause(); else play();
      }
    }
  });


// --- Init ---
buildDots();
assignPositions();

if (prefersReduce) {
  // Reduced motion: no autoplay, no intro
  autoplay = false;
  inInitialTour = false;
  pause();
  rotator.classList.remove('intro');
} else if (isDesktop) {
  // Desktop only: start autoplay with intro
  play();
} else {
  // Mobile: no autoplay, no intro
  autoplay = false;
  inInitialTour = false;
  pause();
  rotator.classList.remove('intro');
}
})();
