'use strict';
document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const mobileQuery = window.matchMedia('(max-width: 680px)');
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
document.querySelectorAll('.expand-report').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.closest('.report-frame').querySelector('img');
    reportTrigger = button;
    dialogImage.src = image.getAttribute('src');
    dialogImage.alt = image.alt;
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
  document.body.classList.remove('modal-open');
  reportTrigger?.focus();
});
