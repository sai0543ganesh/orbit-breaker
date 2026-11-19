'use strict';
const $ = (id) => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const TAU = Math.PI * 2, center = 360, orbit = 225;
const keys = new Set();
let state = 'ready', angle = -Math.PI / 2, score = 0, elapsed = 0;
let fragments = [], dust = [], spawn = 0, dustClock = 0, previous = 0;
let best = 0, sound = false, audio;
try { best = Number(localStorage.getItem('orbit-breaker-best')) || 0; } catch {}
$('best').textContent = best;
const stars = Array.from({ length: 75 }, (_, i) => ({ x: (i * 137.508) % 720, y: (i * 73.137) % 720, r: i % 3 === 0 ? 1.5 : .7 }));
function tone(frequency, duration = .08) {
  if (!sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.055, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + duration);
  } catch {}
}
function overlay(badge, title, hint, button) {
  $('badge').textContent = badge; $('message').textContent = title;
  $('hint').textContent = hint; $('start').textContent = button;
  $('overlay').classList.remove('hidden');
}
function start() {
  if (state === 'paused') { resume(); return; }
  angle = -Math.PI / 2; score = 0; elapsed = 0; spawn = 0; dustClock = 0;
  fragments = []; dust = []; keys.clear(); state = 'playing';
  $('score').textContent = '0'; $('overlay').classList.add('hidden');
  $('pause').disabled = false; $('pause').textContent = 'Pause';
  canvas.focus(); tone(440);
}
function resume() {
  state = 'playing'; keys.clear(); $('overlay').classList.add('hidden');
  $('pause').textContent = 'Pause'; canvas.focus();
}
function pause() {
  if (state === 'playing') {
    state = 'paused'; keys.clear(); $('pause').textContent = 'Resume';
    overlay('TAKE A BREATH', 'Orbit on hold.', 'Your stardust is safe. Continue when you are ready.', 'Resume game');
  } else if (state === 'paused') resume();
}
function end() {
  state = 'over'; keys.clear(); tone(130, .3); $('pause').disabled = true;
  if (score > best) {
    best = score; $('best').textContent = best;
    try { localStorage.setItem('orbit-breaker-best', String(best)); } catch {}
  }
  overlay('FLIGHT COMPLETE', `${score} stardust collected.`, `You kept your orbit for ${Math.floor(elapsed)} seconds. Ready for another flight?`, 'Launch again');
}
function update(dt) {
  elapsed += dt;
  const direction = Number(keys.has('right')) - Number(keys.has('left'));
  angle = (angle + direction * 2.9 * dt + TAU) % TAU;
  spawn -= dt; dustClock -= dt;
  if (spawn <= 0) {
    fragments.push({ angle: Math.random() * TAU, radius: 480, speed: 92 + Math.min(elapsed * 2, 125), spin: Math.random() * TAU });
    spawn = Math.max(.42, 1.35 - elapsed * .012);
  }
  if (dustClock <= 0) { dust.push({ angle: Math.random() * TAU, life: 7 }); dustClock = 1.55; }
  const ship = { x: center + Math.cos(angle) * orbit, y: center + Math.sin(angle) * orbit };
  for (const fragment of fragments) {
    fragment.radius -= fragment.speed * dt; fragment.spin += dt;
    const x = center + Math.cos(fragment.angle) * fragment.radius;
    const y = center + Math.sin(fragment.angle) * fragment.radius;
    if (Math.hypot(x - ship.x, y - ship.y) < 24) { end(); return; }
  }
  for (const item of dust) {
    item.life -= dt;
    if (Math.hypot(center + Math.cos(item.angle) * orbit - ship.x, center + Math.sin(item.angle) * orbit - ship.y) < 30) {
      item.life = 0; score += 1; $('score').textContent = score; tone(660 + (score % 5) * 80);
    }
  }
  fragments = fragments.filter((f) => f.radius > 15);
  dust = dust.filter((d) => d.life > 0);
}
function draw() {
  ctx.clearRect(0, 0, 720, 720);
  for (const star of stars) { ctx.fillStyle = '#566076'; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#303b4b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(center, center, orbit, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#202b3b'; ctx.lineWidth = 1;
  for (const r of [95, 150, 300]) { ctx.beginPath(); ctx.arc(center, center, r, 0, TAU); ctx.stroke(); }
  const glow = ctx.createRadialGradient(center, center, 5, center, center, 90);
  glow.addColorStop(0, '#367e7c'); glow.addColorStop(1, '#151a2700');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(center, center, 90, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8ccbc1'; ctx.beginPath(); ctx.arc(center, center, 14, 0, TAU); ctx.fill();
  for (const item of dust) {
    ctx.save(); ctx.translate(center + Math.cos(item.angle) * orbit, center + Math.sin(item.angle) * orbit);
    ctx.rotate(Math.PI / 4); ctx.globalAlpha = Math.min(1, item.life); ctx.fillStyle = '#b9f887'; ctx.shadowColor = '#b9f887'; ctx.shadowBlur = 18;
    ctx.fillRect(-6, -6, 12, 12); ctx.restore();
  }
  for (const f of fragments) {
    ctx.save(); ctx.translate(center + Math.cos(f.angle) * f.radius, center + Math.sin(f.angle) * f.radius); ctx.rotate(f.spin);
    ctx.fillStyle = '#f29c87'; ctx.beginPath(); ctx.moveTo(-13, -7); ctx.lineTo(1, -14); ctx.lineTo(13, -3); ctx.lineTo(8, 12); ctx.lineTo(-9, 10); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.save(); ctx.translate(center + Math.cos(angle) * orbit, center + Math.sin(angle) * orbit); ctx.rotate(angle + Math.PI / 2);
  ctx.fillStyle = '#edf2ef'; ctx.shadowColor = '#b9f887'; ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(10, 10); ctx.lineTo(0, 5); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill(); ctx.restore();
}
function frame(time) {
  const dt = Math.min((time - previous) / 1000 || 0, .035); previous = time;
  if (state === 'playing') update(dt);
  draw(); requestAnimationFrame(frame);
}
const mappings = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
window.addEventListener('keydown', (event) => {
  if (mappings[event.key] && state === 'playing') { event.preventDefault(); keys.add(mappings[event.key]); }
  if (event.code === 'Space' && event.target.tagName !== 'BUTTON' && (state === 'playing' || state === 'paused')) { event.preventDefault(); if (!event.repeat) pause(); }
});
window.addEventListener('keyup', (event) => { if (mappings[event.key]) keys.delete(mappings[event.key]); });
window.addEventListener('blur', () => { keys.clear(); if (state === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') pause(); });
for (const direction of ['left', 'right']) {
  const button = $(direction);
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); if (state === 'playing') keys.add(direction); button.setPointerCapture(event.pointerId); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => keys.delete(direction));
}
$('start').addEventListener('click', start); $('pause').addEventListener('click', pause);
$('sound').addEventListener('click', () => { sound = !sound; $('sound').textContent = sound ? 'Sound on' : 'Sound off'; $('sound').setAttribute('aria-pressed', String(sound)); if (sound) tone(440); });
requestAnimationFrame(frame);
