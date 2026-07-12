// Progressive enhancement only. The page is fully readable with JS disabled:
// content is server-rendered and the language switch is a plain link.
(function () {
  var app = document.getElementById('app');
  if (!app) return;

  var themeBtn = document.getElementById('themeBtn');
  var themeIco = document.getElementById('themeIco');
  var printBtn = document.getElementById('printBtn');

  var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>';
  var MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>';

  function setTheme(dark) {
    app.classList.toggle('dark', dark);
    if (themeIco) themeIco.innerHTML = dark ? SUN : MOON;
    try { localStorage.setItem('cv-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  var initDark = false;
  try {
    var saved = localStorage.getItem('cv-theme');
    if (saved) initDark = (saved === 'dark');
    else if (window.matchMedia) initDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {}
  setTheme(initDark);

  if (themeBtn) themeBtn.addEventListener('click', function () {
    setTheme(!app.classList.contains('dark'));
  });
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
})();
