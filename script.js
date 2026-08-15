const slidePlans = {
  robomaster: [[0, 3], [3, 4], [4, 5]],
  team: [[0, 2], [2, 4]],
  roles: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 16]],
  tech: [[0, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 21], [21, 24], [24, 26], [26, 28]],
  schedule: [[0, 2]],
  sharing: [[0, 2], [2, 3], [3, 5], [5, 7], [7, 9], [9, 11], [11, 13], [13, 14], [14, 15], [15, 16]],
  references: [[0, 2], [2, 4]]
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
}, { passive: true });
updateActiveNav();

document.querySelector('[data-fullscreen]').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

let wheelLock = false;
window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < 30 || wheelLock || window.innerWidth < 801) return;
  const current = slides.reduce((closest, slide) => {
    const distance = Math.abs(slide.getBoundingClientRect().top);
    return distance < closest.distance ? { slide, distance } : closest;
  }, { slide: slides[0], distance: Infinity }).slide;
  const currentIndex = slides.indexOf(current);
  const nextIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + (event.deltaY > 0 ? 1 : -1)));
  if (slides[nextIndex] !== current) {
    wheelLock = true;
    slides[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => { wheelLock = false; }, 850);
  }
}, { passive: true });
