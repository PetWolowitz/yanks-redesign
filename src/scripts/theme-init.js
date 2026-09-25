// Imposta il tema prima del rendering: gira inline nell'<head>, il suo hash è nella CSP.
// Se lo modifichi, aggiorna l'hash in public/_headers: il test tests/csp-hash.test.ts lo controlla.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    var hour = Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' }).format(new Date())
    );
    theme = hour >= 20 || hour < 8 ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
