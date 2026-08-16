const slidePlans = {
  robomaster: [[0, 2], [2, 3], [3, 5], [5, 6], [6, 6]],
  team: [[0, 2], [2, 4]],
  roles: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 16]],
  tech: [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 21], [21, 24], [24, 26], [26, 28]],
  schedule: [[0, 2]],
  sharing: [[0, 3], [3, 5], [5, 7], [7, 10], [10, 12], [12, 14], [14, 16], [16, 17], [17, 18]]
};

function buildSlides() {
  Object.entries(slidePlans).forEach(([sectionId, ranges]) => {
    const section = document.getElementById(sectionId);
    if (!section || section.querySelector(':scope > .slide')) return;
    const children = [...section.children];
    const fragment = document.createDocumentFragment();
    ranges.forEach(([start, end]) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      children.slice(start, end).forEach((child) => slide.appendChild(child));
      fragment.appendChild(slide);
    });
    section.replaceChildren(fragment);
  });
}

buildSlides();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const sections = [...document.querySelectorAll('[data-section]')];
const slides = [document.querySelector('.hero'), ...document.querySelectorAll('.section>.slide')];
const navLinks = [...document.querySelectorAll('.nav a')];
const progress = document.querySelector('.progress span');
const heroIndex = document.querySelector('.hero-index');
const pagePrev = document.querySelector('[data-page-prev]');
const pageNext = document.querySelector('[data-page-next]');
const pageCurrent = document.querySelector('[data-page-current]');
const pageTotal = document.querySelector('[data-page-total]');

if (heroIndex) heroIndex.innerHTML = `01 <span>/</span> ${String(slides.length).padStart(2, '0')}`;

const currentSlide = () => slides.reduce((closest, slide) => {
  const distance = Math.abs(slide.getBoundingClientRect().top);
  return distance < closest.distance ? { slide, distance } : closest;
}, { slide: slides[0], distance: Infinity }).slide;

const updatePageNav = () => {
  if (!pageCurrent || !pageTotal) return;
  const index = slides.indexOf(currentSlide());
  pageCurrent.textContent = String(index + 1).padStart(2, '0');
  pageTotal.textContent = String(slides.length).padStart(2, '0');
  if (pagePrev) pagePrev.disabled = index <= 0;
  if (pageNext) pageNext.disabled = index >= slides.length - 1;
};

const updateActiveNav = () => {
  const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 260);
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.dataset.section}`));
};

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${Math.min(100, (window.scrollY / max) * 100)}%`;
  updateActiveNav();
  updatePageNav();
}, { passive: true });
updateActiveNav();
updatePageNav();

document.querySelector('[data-fullscreen]').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

let wheelLock = false;
const scrollToSlide = (index) => {
  const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
  if (!target || target === currentSlide() || wheelLock) return;
  wheelLock = true;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => { wheelLock = false; }, 850);
};

const goToSlide = (delta) => {
  const index = slides.indexOf(currentSlide());
  scrollToSlide(index + delta);
};

pagePrev?.addEventListener('click', () => goToSlide(-1));
pageNext?.addEventListener('click', () => goToSlide(1));

window.addEventListener('keydown', (event) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName) || event.target?.isContentEditable) return;
  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault();
    goToSlide(1);
  } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault();
    goToSlide(-1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    scrollToSlide(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    scrollToSlide(slides.length - 1);
  }
});

window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < 30 || wheelLock || window.innerWidth < 801) return;
  goToSlide(event.deltaY > 0 ? 1 : -1);
}, { passive: true });
