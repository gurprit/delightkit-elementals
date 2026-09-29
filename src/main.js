import './style.css';
import { FIRE_FRAMES } from './fireFrames.js';

const EFFECTS = {
  embers: {
    label: 'Embers', glyph: '🔥', accent: '#ff5b22', wash: 'rgba(255,91,34,.18)',
    description: 'A living flame that flickers, sheds sparks and billows smoke when stamped out.',
    colors: ['#ff3d00','#ff6d00','#ff9100','#ffd166','#ffb000'],
  },
  frost: {
    label: 'Frost', glyph: '❄', accent: '#4dbfe9', wash: 'rgba(77,191,233,.20)',
    description: 'Crystalline shards snap outward, spin and drift down.',
    colors: ['#dff8ff','#bcecff','#8edfff','#ffffff','#b7d7ff'],
  },
  petals: {
    label: 'Petals', glyph: '🌸', accent: '#d95786', wash: 'rgba(217,87,134,.17)',
    description: 'Soft petals burst, tumble and flutter with depth.',
    colors: ['#ff9fbd','#ffc2d4','#f57ca7','#ffe0ea','#ffb3c9'],
  },
  bubbles: {
    label: 'Bubbles', glyph: '🫧', accent: '#6eb8d6', wash: 'rgba(110,184,214,.18)',
    description: 'Glossy bubbles wobble upward and gently disappear.',
    colors: ['#bdefff','#d9f7ff','#b9d5ff','#f0fbff','#d2c7ff'],
  },
  stardust: {
    label: 'Stardust', glyph: '✨', accent: '#d4a126', wash: 'rgba(229,187,68,.18)',
    description: 'Tiny stars explode outward, twinkle and vanish.',
    colors: ['#fff2a8','#ffd95a','#ffffff','#ffe98a','#fff7d6'],
  },
};

const savedTheme = localStorage.getItem('delightkit-elementals:theme');
const state = {
  effect: 'embers',
  amount: 24,
  intensity: 1,
  duration: 1,
  theme: savedTheme === 'light' ? 'light' : 'dark',
};

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}
const rand = (min,max) => min + Math.random() * (max-min);
const pick = values => values[Math.floor(Math.random() * values.length)];
let fireAnimationRaf = 0;
let currentFireFrame = 0;

const hoverState = {
  active: false,
  x: 120,
  y: 120,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, t) => from + (to - from) * t;

function fireTopAtX(frame, x) {
  const outerContours = frame?.[0] ?? [];
  let top = Infinity;

  for (const contour of outerContours) {
    if (!contour?.length) continue;

    for (let i = 0; i < contour.length; i++) {
      const a = contour[i];
      const b = contour[(i + 1) % contour.length];
      const minX = Math.min(a[0], b[0]);
      const maxX = Math.max(a[0], b[0]);

      if (x < minX || x > maxX || a[0] === b[0]) continue;

      const t = (x - a[0]) / (b[0] - a[0]);
      const y = a[1] + (b[1] - a[1]) * t;
      top = Math.min(top, y);
    }

    for (const point of contour) {
      if (Math.abs(point[0] - x) <= 7) top = Math.min(top, point[1]);
    }
  }

  return Number.isFinite(top) ? top : null;
}

function smoothContour(points) {
  if (!points?.length) return '';
  if (points.length < 3) return '';
  const first = points[0];
  const second = points[1];
  let d = `M ${((first[0] + second[0]) / 2).toFixed(1)} ${((first[1] + second[1]) / 2).toFixed(1)}`;
  for (let i = 1; i <= points.length; i++) {
    const point = points[i % points.length];
    const next = points[(i + 1) % points.length];
    const mx = (point[0] + next[0]) / 2;
    const my = (point[1] + next[1]) / 2;
    d += ` Q ${point[0]} ${point[1]} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + ' Z';
}

function layerPath(contours) {
  return (contours ?? []).map(smoothContour).filter(Boolean).join(' ');
}

function fireFrameDefinition(frame, index) {
  const [outer, orange, yellow, core] = frame;
  return `<g id="fireFrame${index}">
    <path class="roto-outer" d="${layerPath(outer)}"></path>
    <path class="roto-orange" d="${layerPath(orange)}"></path>
    <path class="roto-yellow" d="${layerPath(yellow)}"></path>
    <path class="roto-core" d="${layerPath(core)}"></path>
  </g>`;
}

function particle(effect) {
  const d = Math.random() > .5 ? 1 : -1;
  const shared = { color: pick(EFFECTS[effect].colors), delay: rand(0,140), opacity: rand(.72,1) };
  if (effect === 'embers') return {...shared,x:rand(-48,48),y:rand(-28,8),drift:d*rand(14,52),rise:rand(125,230),size:rand(4,9),scale:rand(.55,1.25),endScale:rand(.08,.42),rotate:rand(-80,80),base:rand(1050,1850)};
  if (effect === 'frost') return {...shared,x:rand(-108,108),y:rand(-92,-25),drift:rand(-35,35),rise:rand(90,165),size:rand(7,14),scale:rand(.7,1.25),endScale:rand(.55,.95),rotate:d*rand(240,720),base:rand(1900,3100)};
  if (effect === 'petals') return {...shared,x:rand(-105,105),y:rand(-96,-28),drift:d*rand(38,110),rise:rand(115,205),size:rand(9,16),scale:rand(.72,1.28),endScale:rand(.72,1.05),rotate:d*rand(360,960),base:rand(2800,4500)};
  if (effect === 'bubbles') return {...shared,opacity:rand(.38,.72),x:rand(-82,82),y:rand(-25,18),drift:d*rand(18,66),rise:rand(140,255),size:rand(11,26),scale:rand(.72,1.32),endScale:rand(1.12,1.7),rotate:0,base:rand(2100,3700)};
  return {...shared,x:rand(-125,125),y:rand(-108,82),drift:rand(-26,26),rise:rand(82,155),size:rand(5,12),scale:rand(.45,1.18),endScale:rand(.04,.34),rotate:d*rand(90,420),base:rand(900,1750)};
}

function burst(target, effect=state.effect, options={}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('span');
  layer.className = 'particle-layer';
  target.appendChild(layer);
  const count = options.count ?? Math.max(1, Math.round(state.amount * state.intensity));
  let longest = 0;

  for (let i=0;i<count;i++) {
    const p = particle(effect);
    const duration = p.base * state.duration;
    longest = Math.max(longest, duration + p.delay);
    const el = document.createElement('i');
    el.className = `particle particle-${effect}`;
    Object.entries({
      '--x': `${p.x * state.intensity}px`, '--y': `${p.y * state.intensity}px`, '--drift': `${p.drift}px`,
      '--rise': `${p.rise * state.intensity}px`, '--size': `${p.size}px`, '--scale': p.scale,
      '--end-scale': p.endScale, '--rotate': `${p.rotate}deg`, '--duration': `${duration}ms`,
      '--delay': `${p.delay}ms`, '--color': p.color, '--opacity': p.opacity,
    }).forEach(([key,value]) => el.style.setProperty(key, String(value)));
    el.innerHTML = '<b></b>';
    layer.appendChild(el);
  }
  setTimeout(() => layer.remove(), longest + 250);
}


function fireMarkup() {
  const embers = Array.from({ length: 7 }, () => {
    const x = rand(30, 70);
    const size = rand(1.4, 3.4);
    const drift = rand(-28, 28);
    const rise = rand(78, 150);
    const duration = rand(1500, 2900);
    const delay = -rand(0, 2900);
    return `<i class="fire-ember" style="--ex:${x}%;--esize:${size}px;--edrift:${drift}px;--erise:${rise}px;--ed:${duration}ms;--edelay:${delay}ms"></i>`;
  }).join('');

  const sliceCount = 19;
  const sliceWidth = 240 / sliceCount;

  const clips = Array.from({ length: sliceCount }, (_, index) => {
    const x = index * sliceWidth - .7;
    return `<clipPath id="rotoSlice${index}" clipPathUnits="userSpaceOnUse">
      <rect x="${x.toFixed(2)}" y="0" width="${(sliceWidth + 1.4).toFixed(2)}" height="250"></rect>
    </clipPath>`;
  }).join('');

  const slices = Array.from({ length: sliceCount }, (_, index) => {
    const center = (index + .5) * sliceWidth;
    return `<g clip-path="url(#rotoSlice${index})">
      <g class="fire-deform-slice" data-center="${center.toFixed(2)}" style="--origin-x:${center.toFixed(2)}px">
        <use class="fire-frame-use fire-frame-a" href="#fireFrame0"></use>
        <use class="fire-frame-use fire-frame-b" href="#fireFrame1"></use>
      </g>
    </g>`;
  }).join('');

  return `
    <span class="fire-scene" aria-hidden="true">
      <span class="fire-aura"></span>

      <svg class="fire-svg" viewBox="0 0 240 250" role="presentation" focusable="false">
        <defs>
          <filter id="fireRotoGlow" x="-50%" y="-50%" width="200%" height="220%">
            <feGaussianBlur stdDeviation="4.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          ${FIRE_FRAMES.map(fireFrameDefinition).join('')}
          ${clips}
        </defs>

        <g class="fire-rotoscope" filter="url(#fireRotoGlow)">
          ${slices}
        </g>
      </svg>

      <span class="fire-embers">${embers}</span>
    </span>
  `;
}

function smokeBurst(target) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const slices = [...target.querySelectorAll('.fire-deform-slice')];
  if (!slices.length) return;

  const layer = document.createElement('span');
  layer.className = 'smoke-layer';

  const frame = FIRE_FRAMES[currentFireFrame] ?? FIRE_FRAMES[0];
  let longest = 0;

  slices.forEach((slice, index) => {
    const center = Number(slice.dataset.center ?? 120);
    const tracedTop = fireTopAtX(frame, center);
    if (tracedTop == null || tracedTop > 216) return;

    const currentScale = Number(slice.dataset.currentScale || 1);
    const transformedTop = 220 - (220 - tracedTop) * currentScale;

    const edgeRatio = Math.abs(index / (slices.length - 1) - 0.5) * 2;
    const centerBias = 1 - edgeRatio;
    const flameHeight = clamp((220 - transformedTop) / 180, 0, 1);
    const strength = clamp(.28 + centerBias * .48 + flameHeight * .42, .2, 1);
    const puffCount = 1 + Math.round(strength * 2);

    for (let i = 0; i < puffCount; i++) {
      const puff = document.createElement('i');
      puff.className = 'smoke-wisp';

      const width = rand(17, 31) * (.75 + strength * .9);
      const height = rand(22, 44) * (.8 + strength * .9);
      const rise = rand(82, 160) * (.85 + strength * .42);
      const driftX = rand(-25, 25) + (center - 120) * .045;
      const duration = rand(1250, 2250);
      const delay = rand(0, 165);
      const scale = rand(1.8, 3.25);
      const warmth = clamp(.2 + strength * .62 - i * .12, .05, .85);

      longest = Math.max(longest, duration + delay);

      puff.style.left = `${center + rand(-3.5, 3.5)}px`;
      puff.style.top = `${transformedTop + rand(-5, 7)}px`;
      puff.style.setProperty('--w', `${width.toFixed(1)}px`);
      puff.style.setProperty('--h', `${height.toFixed(1)}px`);
      puff.style.setProperty('--rise', `${rise.toFixed(1)}px`);
      puff.style.setProperty('--drift-x', `${driftX.toFixed(1)}px`);
      puff.style.setProperty('--dur', `${duration.toFixed(0)}ms`);
      puff.style.setProperty('--delay', `${delay.toFixed(0)}ms`);
      puff.style.setProperty('--scale', scale.toFixed(2));
      puff.style.setProperty('--warmth', warmth.toFixed(2));

      layer.appendChild(puff);
    }
  });

  target.appendChild(layer);
  window.setTimeout(() => layer.remove(), longest + 320);
}

function stampFire() {
  const stage = document.querySelector('.orb-stage');
  if (!stage || stage.classList.contains('extinguishing')) return;

  stage.classList.add('extinguishing');
  smokeBurst(stage);
  burst(stage, 'embers', { count: Math.max(10, Math.round(14 * state.intensity)) });

  window.setTimeout(() => {
    stage.classList.remove('extinguishing');
  }, 3300);
}

function triggerCurrent(target) {
  if (state.effect === 'embers') {
    stampFire();
    return;
  }
  burst(target, state.effect);
}

function render() {
  if (fireAnimationRaf) cancelAnimationFrame(fireAnimationRaf);
  fireAnimationRaf = 0;
  applyTheme();
  const e = EFFECTS[state.effect];
  document.documentElement.style.setProperty('--accent', e.accent);
  document.documentElement.style.setProperty('--wash', e.wash);
  document.querySelector('#app').innerHTML = `
    <nav><div class="brand"><strong>DelightKit</strong><span>Elementals Lab</span></div><div class="nav-meta"><small>live physics playground</small><button class="theme-toggle" type="button" aria-label="Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode"><span>${state.theme === 'dark' ? '☀' : '☾'}</span>${state.theme === 'dark' ? 'Light' : 'Dark'}</button><a href="https://github.com/gurprit/delightkit-elementals" target="_blank">GitHub</a></div></nav>
    <section class="hero">
      <div class="copy"><p class="eyebrow">TACTILE PARTICLE EFFECTS FOR THE WEB</p><h1>Give interfaces a little <em>weather.</em></h1><p class="lede">Tune the physics live. Fire each effect repeatedly. Keep adjusting until it feels less like CSS and more like a tiny physical event.</p><button class="trigger primary">${state.effect === 'embers' ? 'Stamp out the fire 🔥' : `Trigger ${e.label} ${e.glyph}`}</button></div>
      <div class="lab">
        <button class="orb-stage ${state.effect === 'embers' ? 'fire-stage' : ''}">${state.effect === 'embers' ? fireMarkup() : `<span class="orb">${e.glyph}</span>`}<small>${state.effect === 'embers' ? 'press to stamp it out' : 'tap the elemental'}</small></button>
        <div class="controls"><header><div><small>LIVE TUNING</small><strong>${e.label}</strong></div><button class="reset">Reset</button></header>
          ${range('amount','Particles',6,60,1,state.amount,'')}
          ${range('intensity','Intensity',.5,2,.05,state.intensity,'×')}
          ${range('duration','Duration',.5,2.5,.05,state.duration,'×')}
        </div>
      </div>
    </section>
    <section class="effects"><p class="eyebrow">THE FIRST FIVE</p><h2>Same engine. Different physics.</h2><div class="grid">${Object.entries(EFFECTS).map(([id,x])=>`<article class="${id===state.effect?'selected':''}"><button class="effect" data-effect="${id}"><span>${x.glyph}</span><small>try it</small></button><h3>${x.label}</h3><p>${x.description}</p></article>`).join('')}</div></section>
    <section class="config"><div><p class="eyebrow">CURRENT RECIPE</p><h2>Tune first. Bottle the magic second.</h2></div><pre><code>burst(button, {\n  effect: '${state.effect}',\n  amount: ${state.amount},\n  intensity: ${state.intensity.toFixed(2)},\n  duration: ${state.duration.toFixed(2)}\n});</code></pre></section>
  `;
  bind();
}

function range(id,label,min,max,step,value,suffix) {
  const shown = Number(step) < 1 ? Number(value).toFixed(2) : value;
  return `<label><span>${label}<b>${shown}${suffix}</b></span><input data-control="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}


function bindFireHover() {
  const stage = document.querySelector('.fire-stage');
  const svg = stage?.querySelector('.fire-svg');
  if (!stage || !svg) return;

  const resetFlame = () => {
    hoverState.active = false;
    stage.classList.remove('hover-cooling');
  };

  const deformAtPointer = event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (stage.classList.contains('extinguishing')) return;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 240;
    const y = ((event.clientY - rect.top) / rect.height) * 250;

    const vertical = clamp((y - 20) / 205, 0, 1);
    const halfWidth = 20 + 90 * vertical;

    const insideFlameZone =
      y >= 18 &&
      y <= 225 &&
      Math.abs(x - 120) <= halfWidth;

    if (!insideFlameZone) {
      resetFlame();
      return;
    }

    hoverState.active = true;
    hoverState.x = x;
    hoverState.y = y;
    stage.classList.add('hover-cooling');
  };

  stage.addEventListener('pointermove', deformAtPointer);
  stage.addEventListener('pointerleave', resetFlame);
}

function bindFireAnimation() {
  if (fireAnimationRaf) cancelAnimationFrame(fireAnimationRaf);

  const usesA = [...document.querySelectorAll('.fire-frame-a')];
  const usesB = [...document.querySelectorAll('.fire-frame-b')];
  const slices = [...document.querySelectorAll('.fire-deform-slice')];

  if (!usesA.length || !usesB.length || !slices.length) return;

  const keyframeRate = 24;
  const keyframeDuration = 1000 / keyframeRate;
  const started = performance.now();
  let loadedA = -1;
  let loadedB = -1;

  const setHref = (uses, index) => {
    uses.forEach(use => use.setAttribute('href', `#fireFrame${index}`));
  };

  const tick = now => {
    const elapsed = now - started;
    const position = elapsed / keyframeDuration;
    const indexA = Math.floor(position) % FIRE_FRAMES.length;
    const indexB = (indexA + 1) % FIRE_FRAMES.length;
    const mix = position - Math.floor(position);

    currentFireFrame = indexA;

    if (indexA !== loadedA) {
      setHref(usesA, indexA);
      loadedA = indexA;
    }
    if (indexB !== loadedB) {
      setHref(usesB, indexB);
      loadedB = indexB;
    }

    usesA.forEach(use => { use.style.opacity = String(1 - mix); });
    usesB.forEach(use => { use.style.opacity = String(mix); });

    slices.forEach(slice => {
      const center = Number(slice.dataset.center ?? 120);

      let targetScale = 1;
      let targetSkew = 0;
      let targetScaleX = 1;
      let influence = 0;

      if (hoverState.active) {
        const dx = center - hoverState.x;
        const distance = Math.abs(dx);
        const vertical = clamp((hoverState.y - 20) / 205, 0, 1);
        const desiredTop = clamp(hoverState.y + 7, 38, 211);
        const desiredScale = clamp((220 - desiredTop) / 196, .07, .94);
        const radius = 58 + vertical * 12;
        const normalized = Math.min(1, distance / radius);

        influence = Math.pow(Math.cos(normalized * Math.PI * .5), 2);
        targetScale = 1 - (1 - desiredScale) * influence;

        const direction = dx === 0 ? 0 : Math.sign(dx);
        targetSkew = direction * influence * (1 - targetScale) * 11.5;
        targetScaleX = 1 + influence * (1 - targetScale) * .12;
      }

      const currentScale = Number(slice.dataset.currentScale || 1);
      const currentSkew = Number(slice.dataset.currentSkew || 0);
      const currentScaleX = Number(slice.dataset.currentScaleX || 1);

      const response = hoverState.active ? .28 : .14;
      const nextScale = lerp(currentScale, targetScale, response);
      const nextSkew = lerp(currentSkew, targetSkew, hoverState.active ? .24 : .14);
      const nextScaleX = lerp(currentScaleX, targetScaleX, hoverState.active ? .24 : .14);

      slice.dataset.currentScale = nextScale.toFixed(4);
      slice.dataset.currentSkew = nextSkew.toFixed(4);
      slice.dataset.currentScaleX = nextScaleX.toFixed(4);

      const wobbleStrength = influence * (1 - nextScale);
      const wobble =
        Math.sin(now * .017 + center * .11) * wobbleStrength * 2.7 +
        Math.sin(now * .031 + center * .047) * wobbleStrength * .9;
      const shiftX = Math.sin(now * .007 + center * .08) * wobbleStrength * 3.4;
      const shiftY = Math.cos(now * .009 + center * .05) * wobbleStrength * 2.2;

      slice.style.setProperty('--cool-scale', nextScale.toFixed(4));
      slice.style.setProperty('--cool-skew', `${(nextSkew + wobble).toFixed(2)}deg`);
      slice.style.setProperty('--cool-scale-x', nextScaleX.toFixed(4));
      slice.style.setProperty('--cool-shift-x', `${shiftX.toFixed(2)}px`);
      slice.style.setProperty('--cool-shift-y', `${shiftY.toFixed(2)}px`);
    });

    fireAnimationRaf = requestAnimationFrame(tick);
  };

  fireAnimationRaf = requestAnimationFrame(tick);
}

function bind() {
  document.querySelector('.theme-toggle').onclick = () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('delightkit-elementals:theme', state.theme);
    render();
  };
  document.querySelector('.primary').onclick = event => triggerCurrent(event.currentTarget);
  document.querySelector('.orb-stage').onclick = event => triggerCurrent(event.currentTarget);
  bindFireHover();
  bindFireAnimation();
  document.querySelectorAll('.effect').forEach(button => button.onclick = event => {
    state.effect = event.currentTarget.dataset.effect;
    const target = event.currentTarget;
    burst(target, state.effect);
    setTimeout(render, 180);
  });
  document.querySelectorAll('[data-control]').forEach(input => input.oninput = event => {
    state[event.currentTarget.dataset.control] = Number(event.currentTarget.value);
    const label = event.currentTarget.closest('label').querySelector('b');
    const value = Number(event.currentTarget.value);
    label.textContent = `${event.currentTarget.step.includes('.') ? value.toFixed(2) : value}${event.currentTarget.dataset.control === 'amount' ? '' : '×'}`;
    const code = document.querySelector('pre code');
    if (code) code.textContent = `burst(button, {\n  effect: '${state.effect}',\n  amount: ${state.amount},\n  intensity: ${state.intensity.toFixed(2)},\n  duration: ${state.duration.toFixed(2)}\n});`;
  });
  document.querySelector('.reset').onclick = () => { state.amount=24; state.intensity=1; state.duration=1; render(); };
}

render();
