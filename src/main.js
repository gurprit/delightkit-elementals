import './style.css';

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
  const seedA = Math.floor(rand(1, 999));
  const seedB = Math.floor(rand(1000, 1999));
  const seedC = Math.floor(rand(2000, 2999));

  const wisps = Array.from({ length: 7 }, () => {
    const x = rand(33, 67);
    const size = rand(5, 12);
    const drift = rand(-24, 24);
    const rise = rand(70, 145);
    const duration = rand(900, 1800);
    const delay = -rand(0, 1800);
    return `<i class="fire-wisp" style="--wx:${x}%;--wsize:${size}px;--wdrift:${drift}px;--wrise:${rise}px;--wd:${duration}ms;--wdelay:${delay}ms"></i>`;
  }).join('');

  const embers = Array.from({ length: 9 }, () => {
    const x = rand(30, 70);
    const size = rand(1.5, 3.8);
    const drift = rand(-30, 30);
    const rise = rand(85, 165);
    const duration = rand(1450, 2900);
    const delay = -rand(0, 2900);
    return `<i class="fire-ember" style="--ex:${x}%;--esize:${size}px;--edrift:${drift}px;--erise:${rise}px;--ed:${duration}ms;--edelay:${delay}ms"></i>`;
  }).join('');

  return `
    <span class="fire-scene" aria-hidden="true">
      <span class="fire-aura"></span>

      <svg class="fire-svg" viewBox="0 0 240 250" role="presentation" focusable="false">
        <defs>
          <linearGradient id="fireOuter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#fff2a3"/>
            <stop offset="13%" stop-color="#ffd83d"/>
            <stop offset="38%" stop-color="#ff8a00"/>
            <stop offset="68%" stop-color="#ff3b00"/>
            <stop offset="100%" stop-color="#7d0900" stop-opacity=".05"/>
          </linearGradient>

          <linearGradient id="fireMid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#fffbd5"/>
            <stop offset="18%" stop-color="#ffe96b"/>
            <stop offset="48%" stop-color="#ffad14"/>
            <stop offset="78%" stop-color="#ff5a00"/>
            <stop offset="100%" stop-color="#c51d00" stop-opacity=".08"/>
          </linearGradient>

          <linearGradient id="fireCore" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#fffef0"/>
            <stop offset="28%" stop-color="#fff6a0"/>
            <stop offset="62%" stop-color="#ffd93f"/>
            <stop offset="100%" stop-color="#ff8a00" stop-opacity=".1"/>
          </linearGradient>

          <filter id="fireDistortOuter" x="-35%" y="-35%" width="170%" height="185%">
            <feTurbulence type="fractalNoise" baseFrequency=".011 .045" numOctaves="3" seed="${seedA}" result="noise">
              <animate attributeName="baseFrequency" dur="1.9s" values=".011 .045;.018 .072;.008 .052;.015 .061;.011 .045" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="23" xChannelSelector="R" yChannelSelector="G"/>
          </filter>

          <filter id="fireDistortMid" x="-40%" y="-40%" width="180%" height="195%">
            <feTurbulence type="turbulence" baseFrequency=".014 .061" numOctaves="2" seed="${seedB}" result="noise">
              <animate attributeName="baseFrequency" dur="1.35s" values=".014 .061;.023 .085;.010 .053;.019 .074;.014 .061" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="B"/>
          </filter>

          <filter id="fireDistortCore" x="-40%" y="-40%" width="180%" height="190%">
            <feTurbulence type="fractalNoise" baseFrequency=".018 .075" numOctaves="2" seed="${seedC}" result="noise">
              <animate attributeName="baseFrequency" dur=".95s" values=".018 .075;.028 .105;.013 .068;.023 .09;.018 .075" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="G" yChannelSelector="B"/>
          </filter>

          <filter id="fireGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <radialGradient id="fireHoverGradient">
            <stop offset="0%" stop-color="black"/>
            <stop offset="46%" stop-color="black"/>
            <stop offset="76%" stop-color="#777"/>
            <stop offset="100%" stop-color="white"/>
          </radialGradient>

          <mask id="fireHoverMask" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="250">
            <rect x="0" y="0" width="240" height="250" fill="white"/>
            <circle class="fire-hover-cutout" cx="120" cy="130" r="34" fill="url(#fireHoverGradient)"/>
          </mask>
        </defs>

        <g class="fire-body" mask="url(#fireHoverMask)">
          <path
            class="fire-layer fire-outer"
            filter="url(#fireDistortOuter)"
            fill="url(#fireOuter)"
            d="M31 211
               C20 193 23 174 35 159
               C28 145 31 128 47 115
               C37 91 52 72 68 61
               C68 86 76 101 88 110
               C91 83 98 59 116 24
               C130 58 124 84 136 108
               C145 91 156 70 174 55
               C176 83 190 99 194 119
               C210 137 213 160 202 176
               C211 191 205 207 191 217
               C162 229 77 229 31 211 Z"
          />

          <path
            class="fire-layer fire-mid"
            filter="url(#fireDistortMid)"
            fill="url(#fireMid)"
            d="M51 214
               C40 191 49 173 62 159
               C56 143 64 128 79 116
               C75 99 82 84 95 69
               C99 91 106 108 116 118
               C120 94 128 78 141 60
               C145 88 156 104 164 120
               C177 139 180 162 171 178
               C181 197 170 213 157 220
               C128 229 81 227 51 214 Z"
          />

          <path
            class="fire-layer fire-core"
            filter="url(#fireDistortCore)"
            fill="url(#fireCore)"
            d="M75 217
               C66 202 70 184 84 171
               C80 156 87 142 101 132
               C98 115 104 100 116 85
               C123 105 126 121 126 139
               C135 124 143 111 151 100
               C154 127 163 143 158 162
               C169 181 158 205 144 216
               C123 225 95 225 75 217 Z"
          />

          <ellipse class="fire-hotbed" cx="120" cy="218" rx="73" ry="13" filter="url(#fireGlow)" fill="#ff7b00"/>
          <ellipse class="fire-whitebed" cx="120" cy="215" rx="43" ry="7" filter="url(#fireGlow)" fill="#fff4a7"/>
        </g>
      </svg>

      <span class="fire-wisps">${wisps}</span>
      <span class="fire-embers">${embers}</span>
    </span>
  `;
}

function smokeBurst(target) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('span');
  layer.className = 'smoke-layer';
  const count = Math.max(18, Math.round(24 * state.intensity));

  for (let i = 0; i < count; i++) {
    const puff = document.createElement('i');
    puff.className = 'smoke-puff';
    const size = rand(28, 74);
    const x = rand(-68, 68);
    const y = rand(-18, 22);
    const drift = rand(-95, 95);
    const rise = rand(105, 235);
    const duration = rand(1500, 2800) * state.duration;
    const delay = rand(0, 260);
    const shade = Math.round(rand(74, 150));
    Object.entries({
      '--smoke-size': `${size}px`,
      '--smoke-x': `${x}px`,
      '--smoke-y': `${y}px`,
      '--smoke-drift': `${drift}px`,
      '--smoke-rise': `${rise}px`,
      '--smoke-duration': `${duration}ms`,
      '--smoke-delay': `${delay}ms`,
      '--smoke-shade': `${shade}`,
      '--smoke-scale': rand(1.8, 3.4),
    }).forEach(([key, value]) => puff.style.setProperty(key, String(value)));
    layer.appendChild(puff);
  }

  target.appendChild(layer);
  setTimeout(() => layer.remove(), 3400 * state.duration);
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


function spawnLocalSmoke(stage, event) {
  const rect = stage.getBoundingClientRect();
  const puff = document.createElement('i');
  puff.className = 'local-fire-smoke';

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  puff.style.left = `${x}px`;
  puff.style.top = `${y}px`;
  puff.style.setProperty('--local-smoke-drift', `${rand(-18, 18)}px`);
  puff.style.setProperty('--local-smoke-rise', `${rand(34, 62)}px`);
  puff.style.setProperty('--local-smoke-size', `${rand(15, 27)}px`);

  stage.appendChild(puff);
  window.setTimeout(() => puff.remove(), 1050);
}

function bindFireHover() {
  const stage = document.querySelector('.fire-stage');
  const svg = stage?.querySelector('.fire-svg');
  const cutout = stage?.querySelector('.fire-hover-cutout');
  if (!stage || !svg || !cutout) return;

  let lastSmoke = 0;

  const coolAtPointer = event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (stage.classList.contains('extinguishing')) return;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 240;
    const y = ((event.clientY - rect.top) / rect.height) * 250;

    const vertical = Math.max(0, Math.min(1, (y - 18) / 205));
    const halfWidth = 18 + 88 * vertical;
    const insideFlameZone =
      y >= 15 &&
      y <= 228 &&
      Math.abs(x - 120) <= halfWidth;

    if (!insideFlameZone) {
      stage.classList.remove('hover-cooling');
      return;
    }

    cutout.setAttribute('cx', x.toFixed(1));
    cutout.setAttribute('cy', y.toFixed(1));
    cutout.setAttribute('r', (24 + vertical * 18).toFixed(1));
    stage.classList.add('hover-cooling');

    const now = performance.now();
    if (now - lastSmoke > 115) {
      spawnLocalSmoke(stage, event);
      lastSmoke = now;
    }
  };

  stage.addEventListener('pointermove', coolAtPointer);
  stage.addEventListener('pointerleave', () => {
    stage.classList.remove('hover-cooling');
  });
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
