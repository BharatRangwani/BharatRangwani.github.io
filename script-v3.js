'use strict';
document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const mobileQuery = window.matchMedia('(max-width: 850px)');
function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('open', open);
  navLinks.inert = mobileQuery.matches && !open;
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
mobileQuery.addEventListener('change', () => setMenu(false));
setMenu(false);

const tabs = [...document.querySelectorAll('.report-tab')];
function selectReport(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  document.dispatchEvent(new CustomEvent('reportselected', {detail: tab.id.replace('tab-', '')}));
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectReport(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectReport(tabs[next], true);
    }
  });
});

const dialog = document.querySelector('.report-dialog');
const dialogImage = dialog.querySelector('.dialog-image');
const dialogTitle = document.querySelector('#dialog-title');
const reportTitles = {cfo: 'Executive finance overview', ageing: 'AR / AP ageing', mis: 'Multi-entity management report'};
let reportTrigger;
let expandedDashboard;
let reportPlaceholder;
document.querySelectorAll('.expand-report').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.closest('.report-frame').querySelector('img');
    reportTrigger = button;
    expandedDashboard = button.closest('.report-frame').querySelector('.live-dashboard');
    if (expandedDashboard) {
      reportPlaceholder = document.createElement('div');
      reportPlaceholder.style.height = `${expandedDashboard.getBoundingClientRect().height}px`;
      expandedDashboard.before(reportPlaceholder);
      dialog.querySelector('.dialog-scroll').append(expandedDashboard);
      dialogImage.hidden = true;
    } else {
      dialogImage.hidden = false;
      dialogImage.src = image.getAttribute('src');
      dialogImage.alt = image.alt;
    }
    dialogTitle.textContent = reportTitles[button.dataset.report];
    dialog.showModal();
    dialog.querySelector('.dialog-scroll').scrollLeft = 0;
    document.body.classList.add('modal-open');
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  if (expandedDashboard) {
    reportPlaceholder.replaceWith(expandedDashboard);
    expandedDashboard = null;
    reportPlaceholder = null;
  }
  document.body.classList.remove('modal-open');
  reportTrigger?.focus();
});


// A deck-like rhythm with native scrolling; long sections remain fully readable.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const deckQuery = matchMedia('(min-width: 1100px) and (prefers-reduced-motion: no-preference)');
function setDeckMode() {
  document.documentElement.classList.toggle('deck-enabled', deckQuery.matches);
}
deckQuery.addEventListener('change', setDeckMode);
setDeckMode();

const scenes = [...document.querySelectorAll('main > section')];
const deckLinks = [...document.querySelectorAll('.deck-links a')];
const deckButtons = [...document.querySelectorAll('[data-deck-step]')];
let activeScene = 0;
let scrollFrame;
function updateScene() {
  const reference = window.scrollY + Math.min(innerHeight * .35, 300);
  activeScene = Math.max(0, scenes.findLastIndex(scene => scene.offsetTop <= reference));
  if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 8) activeScene = scenes.length - 1;
  deckLinks.forEach((link, index) => {
    if (index === activeScene) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  document.querySelector('.deck-position').textContent = `${String(activeScene + 1).padStart(2, '0')} / 06`;
  deckButtons[0].disabled = activeScene === 0;
  deckButtons[1].disabled = activeScene === scenes.length - 1;
  scrollFrame = undefined;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScene);
}, {passive: true});
window.addEventListener('resize', updateScene);
updateScene();
deckButtons.forEach(button => button.addEventListener('click', () => {
  const next = Math.max(0, Math.min(scenes.length - 1, activeScene + Number(button.dataset.deckStep)));
  scenes[next].scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'});
}));

if (!reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scene-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: .08, rootMargin: '0px 0px -35px 0px'});
  document.querySelectorAll('.hero-copy,.hero-visual,.section-side,.service-row,.portfolio-heading,.report-workspace,.section-heading,.case-study,.portrait,.about-copy,.toolkit,.contact-layout').forEach((element, index) => {
    element.classList.add('scene-reveal');
    element.style.setProperty('--reveal-delay', `${index % 3 * 65}ms`);
    revealObserver.observe(element);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      revealObserver.disconnect();
      document.querySelectorAll('.scene-reveal').forEach(element => element.classList.add('scene-visible'));
    }
  });
}
