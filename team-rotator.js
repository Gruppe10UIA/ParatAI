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

  const STEP_INTERVAL = 7000;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const N = cards.length;

  let featuredIndex = 0;
  let autoplay = false;
  let timer = null;

  function applyPositions() {
    cards.forEach((card, i) => {
      const offset = (i - featuredIndex + N) % N;
      card.setAttribute('data-position', String(offset + 1));
    });
    updateDots();
  }

  function step(delta) {
    featuredIndex = (featuredIndex + delta + N) % N;
    applyPositions();
  }

  function jumpTo(i) {
    featuredIndex = i;
    applyPositions();
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rotator-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Medlem ${i + 1}`);
      dot.addEventListener('click', () => { pause(); jumpTo(i); });
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.rotator-dot').forEach((d, i) => {
      d.setAttribute('aria-selected', i === featuredIndex ? 'true' : 'false');
    });
  }

  function tick() {
    step(1);
    if (autoplay) timer = setTimeout(tick, STEP_INTERVAL);
  }

  function play() {
    if (autoplay) return;
    autoplay = true;
    rotator.dataset.autoplay = 'true';
    if (btnPlay) {
      btnPlay.setAttribute('aria-pressed', 'true');
      btnPlay.textContent = 'Stopp';
      btnPlay.setAttribute('aria-label', 'Pause rotasjon');
    }
    timer = setTimeout(tick, STEP_INTERVAL);
  }

  function pause() {
    autoplay = false;
    rotator.dataset.autoplay = 'false';
    clearTimeout(timer);
    if (btnPlay) {
      btnPlay.setAttribute('aria-pressed', 'false');
      btnPlay.textContent = 'Start';
      btnPlay.setAttribute('aria-label', 'Start rotasjon');
    }
  }

  if (btnNext) btnNext.addEventListener('click', () => { pause(); step(1); });
  if (btnPrev) btnPrev.addEventListener('click', () => { pause(); step(-1); });
  if (btnPlay) btnPlay.addEventListener('click', () => { autoplay ? pause() : play(); });

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i === featuredIndex) {
        autoplay ? pause() : play();
      } else {
        pause();
        jumpTo(i);
      }
    });
  });

  rotator.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); pause(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pause(); step(-1); }
    else if (e.key === ' ' && rotator.contains(document.activeElement)) {
      e.preventDefault();
      autoplay ? pause() : play();
    }
  });

  buildDots();
  applyPositions();
  if (isDesktop && !prefersReduce) play();
})();
