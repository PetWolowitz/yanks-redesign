// Prima del rendering: imposta il tema, dice se mostrare l'avviso d'età e segna che il JS c'è.
// Gira inline nell'<head>, il suo hash è nella CSP.
// Se lo modifichi, aggiorna l'hash in public/_headers: il test tests/csp-hash.test.ts lo controlla.
(function () {
  var root = document.documentElement;
  var theme = null;
  var ageOk = false;
  try {
    theme = localStorage.getItem('theme');
    ageOk = localStorage.getItem('age-ok') === '1';
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    var hour = Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' }).format(new Date())
    );
    theme = hour >= 20 || hour < 8 ? 'dark' : 'light';
  }
  root.dataset.theme = theme;
  // "ask": l'avviso d'età copre la pagina fin dal primo frame (components/site/AgeGate.astro).
  // Senza JS questo attributo non esiste e l'avviso resta nascosto
  root.dataset.age = ageOk ? 'ok' : 'ask';
  // Il JS c'è: i titoli possono aspettare l'animazione d'ingresso (global.css).
  // Senza JS l'attributo manca e tutto è visibile da subito
  root.dataset.js = '';
})();
