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
<title>Weekday-Only Countdown</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; height: 100vh; display: grid; place-items: center;
    background: #0b1020; color: #f3f6ff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  }
  .wrap { text-align: center; max-width: 1200px; padding: 2rem; }
  #countdown {
    font-weight: 900; letter-spacing: .04em; font-variant-numeric: tabular-nums;
    line-height: 1.05; text-align: center;
    font-size: clamp(40px, 16vw, 22rem); /* huge */
  }
  #sub {
    margin-top: 1rem; opacity: .8; line-height: 1.3;
    font-size: clamp(12px, 2.6vw, 1.5rem);
  }
  code { background: rgba(255,255,255,.08); padding: .15em .35em; border-radius: .35em; }
</style>
</head>
<body>
  <div class="wrap">
    <div id="countdown">--:--:--</div>
    <div id="sub"></div>
  </div>

  <script>
    const TARGET_STR = "${String(TARGET).replace(/"/g, '\\"')}";
    const el = document.getElementById('countdown');
    const sub = document.getElementById('sub');
    const target = new Date(TARGET_STR);

    function isWeekend(d) { const day = d.getDay(); return day === 0 || day === 6; } // Sun=0, Sat=6
    function startOfNextDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0); }
    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); }

    // Advance date to Monday 00:00 if it's Sat/Sun
    function nextMondayStart(d) {
      const day = d.getDay();
      if (day === 6) { // Saturday
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2, 0, 0, 0, 0);
      }
      if (day === 0) { // Sunday
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
      }
      return d;
    }

    // Milliseconds of weekday-only time between a and b (a < b). Skips Sat/Sun entirely.
    function weekdayDiffMs(a, b) {
      if (!(a instanceof Date)) a = new Date(a);
      if (!(b instanceof Date)) b = new Date(b);
      if (isNaN(a) || isNaN(b) || b <= a) return 0;

      let s = new Date(a);
      const e = new Date(b);
      let total = 0;

      while (s < e) {
        // If weekend, jump to Monday 00:00
        if (isWeekend(s)) {
          s = nextMondayStart(s);
          continue;
        }
        // Work within current weekday until midnight or end
        const endOfThisDay = startOfNextDay(s);
        const t = e < endOfThisDay ? e : endOfThisDay;
        total += (t - s);
        s = t; // move forward
      }
      return total;
    }

    function fmt(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins  = Math.floor((totalSeconds % 3600) / 60);
      const secs  = totalSeconds % 60;
      const pad = n => String(n).padStart(2, '0');
      return { days, h: pad(hours), m: pad(mins), s: pad(secs) };
    }

    function tick() {
      const now = new Date();
      if (!TARGET_STR || isNaN(target)) {
        el.textContent = 'Invalid DATE_TIME_COUNT';
        sub.innerHTML = 'Set DATE_TIME_COUNT to an ISO date-time, e.g. <code>2026-01-30T17:00:00Z</code>';
        return;
      }

      let ms = weekdayDiffMs(now, target);
      if (ms < 0) ms = 0;

      const { days, h, m, s } = fmt(ms);
      el.textContent = days + 'd ' + h + ':' + m + ':' + s;

      // Also show the target and clarify weekends are skipped
      const fmtTarget = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(target);
      sub.innerHTML = 'Weekends skipped • Target: ' + fmtTarget;
    }

    tick();
    setInterval(tick, 1000);
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Countdown server listening on http://localhost:${PORT}`);
  if (!TARGET) {
    console.warn('DATE_TIME_COUNT not set. Example: DATE_TIME_COUNT="2026-01-30T17:00:00Z" node server.js');
  }
});
