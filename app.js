const wheel = document.getElementById('wheel');
const modeToggle = document.getElementById('mode-toggle');
const resultOverlay = document.getElementById('result-overlay');
const resultText = document.getElementById('result-text');

let isSpinning = false;
let currentRotation = 0;
let isAllInRiverMode = false;

// Web Audio API Context
let audioCtx = null;

// Ensure audio context is created on first user interaction
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Sequence of notes: { freq, duration, type }
const soundSequences = {
  'Check': [
    { freq: 400, duration: 0.15, type: 'sine' },
    { freq: 400, duration: 0.3, type: 'sine' }
  ],
  'Call': [
    { freq: 440, duration: 0.15, type: 'triangle' },
    { freq: 440, duration: 0.3, type: 'triangle' }
  ],
  'Raise': [
    { freq: 440, duration: 0.1, type: 'square' },
    { freq: 554, duration: 0.1, type: 'square' },
    { freq: 659, duration: 0.4, type: 'square' }
  ], // Happy ascending arpeggio
  'All In!': [
    { freq: 523, duration: 0.1, type: 'sawtooth' },
    { freq: 659, duration: 0.1, type: 'sawtooth' },
    { freq: 784, duration: 0.1, type: 'sawtooth' },
    { freq: 1046, duration: 0.6, type: 'sawtooth' }
  ], // Very happy fanfare
  'Fold': [
    { freq: 300, duration: 0.2, type: 'triangle' },
    { freq: 280, duration: 0.2, type: 'triangle' },
    { freq: 250, duration: 0.6, type: 'triangle' }
  ] // Sad descending notes
};

function playSound(option) {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const sequence = soundSequences[option];
  if (!sequence) return;

  let startTime = audioCtx.currentTime;
  
  sequence.forEach(note => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.freq, startTime);
    
    // Envelope for punchier sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration); // Smooth decay

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + note.duration);
    
    startTime += note.duration - 0.05; // Slight overlap for smooth sequence
  });
}

function playSpinSound() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Ticking sound during spin
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.05);
}


// Wheel options mapping
const regularOptions = [
  { name: 'Check', startAngle: -36, endAngle: 36, color: '#10b981' },
  { name: 'Call', startAngle: 36, endAngle: 108, color: '#3b82f6' },
  { name: 'Raise', startAngle: 108, endAngle: 180, color: '#f59e0b' },
  { name: 'All In!', startAngle: 180, endAngle: 252, color: '#ef4444' },
  { name: 'Fold', startAngle: 252, endAngle: 324, color: '#64748b' }
];

const allInRiverOptions = [
  { name: 'Fold', startAngle: -90, endAngle: 90, color: '#64748b' },
  { name: 'Call', startAngle: 90, endAngle: 270, color: '#3b82f6' }
];

// SVG Helper Functions
function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

function describePieSlice(x, y, r, startAngle, endAngle) {
  const start = polarToCartesian(x, y, r, startAngle);
  const end = polarToCartesian(x, y, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
    "Z"
  ].join(" ");
}

function describeTextArc(x, y, r, startAngle, endAngle) {
  const start = polarToCartesian(x, y, r, startAngle);
  const end = polarToCartesian(x, y, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
}

function drawWheel() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const slicesGroup = document.getElementById('wheel-slices');
  const textsGroup = document.getElementById('wheel-texts');
  const defs = document.querySelector('defs');
  
  slicesGroup.innerHTML = '';
  textsGroup.innerHTML = '';
  Array.from(defs.querySelectorAll('.dynamic-path')).forEach(el => el.remove());
  
  const options = isAllInRiverMode ? allInRiverOptions : regularOptions;
  
  options.forEach((opt, index) => {
    // Pie Slice
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', describePieSlice(200, 200, 200, opt.startAngle, opt.endAngle));
    path.setAttribute('fill', opt.color);
    path.setAttribute('stroke', 'rgba(255,255,255,0.2)');
    path.setAttribute('stroke-width', '2');
    slicesGroup.appendChild(path);
    
    // Text Path
    const textPathId = `text-path-${index}`;
    const textArc = document.createElementNS(svgNS, 'path');
    textArc.setAttribute('id', textPathId);
    textArc.setAttribute('class', 'dynamic-path');
    textArc.setAttribute('d', describeTextArc(200, 200, 145, opt.startAngle, opt.endAngle));
    defs.appendChild(textArc);
    
    // Text Element
    const textEl = document.createElementNS(svgNS, 'text');
    textEl.setAttribute('font-family', 'Outfit');
    textEl.setAttribute('font-size', '22');
    textEl.setAttribute('font-weight', '800');
    textEl.setAttribute('fill', 'white');
    textEl.setAttribute('letter-spacing', '2');
    
    const textPathEl = document.createElementNS(svgNS, 'textPath');
    textPathEl.setAttribute('href', `#${textPathId}`);
    textPathEl.setAttribute('startOffset', '50%');
    textPathEl.setAttribute('text-anchor', 'middle');
    textPathEl.textContent = opt.name;
    
    textEl.appendChild(textPathEl);
    textsGroup.appendChild(textEl);
  });
}

function normalizeAngle(a) {
  let n = a % 360;
  if (n < 0) n += 360;
  return n;
}

function getWinningOption(degrees) {
  let winningAngle = normalizeAngle(360 - degrees);
  const options = isAllInRiverMode ? allInRiverOptions : regularOptions;
  
  for (let opt of options) {
    let start = normalizeAngle(opt.startAngle);
    let end = normalizeAngle(opt.endAngle);
    
    if (start < end) {
      if (winningAngle >= start && winningAngle < end) return opt.name;
    } else {
      if (winningAngle >= start || winningAngle < end) return opt.name;
    }
  }
  return options[0].name;
}

function spinWheel() {
  if (isSpinning) return;
  initAudio(); // Required by browser policies

  isSpinning = true;
  resultOverlay.classList.add('hidden');
  
  // Random extra spins (5 to 10)
  const spins = Math.floor(Math.random() * 5) + 5;
  // Random extra degrees
  const randomDegrees = Math.floor(Math.random() * 360);
  
  const totalDegrees = currentRotation + (spins * 360) + randomDegrees;
  
  // Make a ticking sound periodically while spinning
  // The transition takes 4 seconds.
  let ticks = 0;
  const tickInterval = setInterval(() => {
    playSpinSound();
    ticks++;
    if (ticks > 20) {
      clearInterval(tickInterval);
    }
  }, 150);

  wheel.style.transform = `rotate(${totalDegrees}deg)`;
  currentRotation = totalDegrees;

  // Wait for animation to finish
  setTimeout(() => {
    isSpinning = false;
    clearInterval(tickInterval);
    const winner = getWinningOption(currentRotation);
    
    // Play specific sound
    playSound(winner);
    
    // Show result
    resultText.innerText = winner;
    
    // Change accent color based on winner
    const cssVars = {
      'Check': 'var(--color-check)',
      'Call': 'var(--color-call)',
      'Raise': 'var(--color-raise)',
      'All In!': 'var(--color-allin)',
      'Fold': 'var(--color-fold)'
    };
    resultText.style.textShadow = `0 0 20px rgba(0,0,0,0.5), 0 0 20px ${cssVars[winner]}`;
    
    resultOverlay.classList.remove('hidden');
    
    setTimeout(() => {
      resultOverlay.classList.add('hidden');
    }, 3000);
    
  }, 4000);
}

// Event Listeners
modeToggle.addEventListener('change', (e) => {
  if (isSpinning) {
    e.preventDefault();
    modeToggle.checked = !modeToggle.checked;
    return;
  }
  
  isAllInRiverMode = e.target.checked;
  
  drawWheel();
});

// Click anywhere on body to spin
document.body.addEventListener('click', (e) => {
  // Prevent spinning if clicking the toggle or labels
  if (e.target.closest('.controls') || e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT') {
    return;
  }
  spinWheel();
});

// Initial draw
drawWheel();

// Set current year
document.getElementById('current-year').textContent = new Date().getFullYear();
