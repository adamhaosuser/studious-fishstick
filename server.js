// server.js
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET = process.env.DATE_TIME_COUNT || '';

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Countdown</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    background: #0b1020; color: #f3f6ff;
  }
  #countdown {
    font-weight: 900; letter-spacing: .04em; font-variant-numeric: tabular-nums;
    line-height: 1; text-align: center;
    font-size: clamp(40px, 16vw, 22rem); /* huge */
  }
  #label { text-align: center; margin-top: 1rem; opacity: .75; font-size: clamp(12px, 2.4vw, 2rem); }
  .wrap { text-align: center; }
</style>
</head>
<body>
  <div class="wrap">
    <div id="countdown">--:--:--</div>
    <div id="label"></div>
  </div>
  <script>
    const TARGET = "${String(TARGET).replace(/"/g, '\\"')}";
    const el = document.getElementById('countdown');
    const label = document.getElementById('label');
    const targetDate = new Date(TARGET);

    if (!TARGET || isNaN(targetDate.getTime())) {
      el.textContent = 'Invalid DATE_TIME_COUNT';
      label.textContent = 'Set DATE_TIME_COUNT to an ISO date-time (e.g., 2025-12-31T23:59:59Z)';
    } else {
      label.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(targetDate);
      const pad = n => String(n).padStart(2,'0');
      function tick() {
        let ms = targetDate - new Date();
        if (ms < 0) ms = 0;
        const s = Math.floor(ms / 1000);
        const days = Math.floor(s / 86400);
        const hours = Math.floor((s % 86400) / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        el.textContent = (days > 0 ? days + 'd ' : '') + pad(hours) + ':' + pad(mins) + ':' + pad(secs);
      }
      tick();
      setInterval(tick, 1000);
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Countdown server listening on http://localhost:${PORT}`);
  if (!TARGET) {
    console.warn('DATE_TIME_COUNT not set. Example: DATE_TIME_COUNT="2025-12-31T23:59:59Z" node server.js');
  }
});
