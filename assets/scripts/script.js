// ---- DOM ----
const TICK_COUNT       = 36;
const YEAR_START       = 2026;
const YEAR_END         = 1926;

const containerOptions = document.getElementById('containerOptions');
const containerVideo   = document.getElementById('containerVideo');
const videoEl          = document.getElementById('videoEl');
const timeline         = document.getElementById('timeline');
const tlHead           = document.getElementById('tlHead');
const tlYear           = document.getElementById('tlYear');
const retourBtn        = document.getElementById('retourBtn');
const footer           = document.getElementById('footer');
const siteHeader       = document.getElementById('siteHeader');
const grainCanvas      = document.getElementById('grainCanvas');
const ctx              = grainCanvas.getContext('2d');

const PALETTE = ['#327FEF','#33B793','#F0C177','#D3823E','#D69EE6'];

function randomColor(excludeColor) {
    const choices = PALETTE.filter(c => c !== excludeColor);
    return choices[Math.floor(Math.random() * choices.length)];
}

function colorAtProgress(p) {
    const idx = Math.min(Math.floor(p * PALETTE.length), PALETTE.length - 1);
    return PALETTE[idx];
}

function buildTicks() {
    const el = document.getElementById('ticksTop');
    for (let i = 0; i < TICK_COUNT; i++) {
        const d = document.createElement('div');
        d.className = 'tl-tick ' + (i % 4 === 0 ? 'tall' : 'short');
        d.style.background = 'rgba(208,205,202,0.6)';
        el.appendChild(d);
    }
}
buildTicks();

const btns = document.querySelectorAll('.button-video');
let lastColor = null;
btns.forEach(btn => {
    const color = randomColor(lastColor);
    lastColor = color;
    btn.style.color = color;

    const underline = document.createElement('span');
    underline.className = 'btn-underline';
    underline.style.background = color;
    btn.appendChild(underline);

    btn.addEventListener('mouseenter', () => underline.classList.add('active'));
    btn.addEventListener('mouseleave', () => underline.classList.remove('active'));
    btn.addEventListener('click', () => startTransition(btn.dataset.choice));
});

let grainIntensity = 0.6;

function resizeCanvas() {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    grainCanvas.width  = isPortrait ? window.innerHeight : window.innerWidth;
    grainCanvas.height = isPortrait ? window.innerWidth  : window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

function drawGrain(t) {
    const w = grainCanvas.width;
    const h = grainCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const gi = grainIntensity;
    const count = Math.floor(w * h * 0.0004 * gi);

    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const brightness = 150 + Math.random() * 80;
        const alpha = (0.1 + Math.random() * 0.2) * gi;

        ctx.fillStyle = `rgba(${brightness},${brightness},${brightness},${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

let grainFrame = 0;
function animateGrain() {
    grainFrame++;
    if (grainFrame % 8 === 0) drawGrain(performance.now());
    requestAnimationFrame(animateGrain);
}
animateGrain();

function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

function updateYear(progress) {
    const eased = easeInOut(progress);
    const year  = Math.round(YEAR_START - eased * (YEAR_START - YEAR_END));
    tlYear.textContent = year;

    const color = colorAtProgress(progress);
    tlHead.style.background = color;
    tlYear.style.color = color;

    const speed = Math.abs(eased - 0.5);
    tlYear.style.opacity = (progress > 0.1 && progress < 0.9 && Math.random() < speed * 0.25)
        ? (0.4 + Math.random() * 0.6).toFixed(2)
        : '0.8';
}

function startTransition(choice) {
    containerOptions.classList.add('hidden');
    footer.classList.add('hidden');
    siteHeader.classList.add('hidden');

    videoEl.src = choice === 'a'
        ? './assets/medias/test_video.mp4'
        : './assets/medias/test_video2.mp4';
    videoEl.load();

    setTimeout(() => {
        timeline.classList.add('visible');
        tlYear.textContent = YEAR_START;
        tlHead.style.left  = '100%';
        grainIntensity = 0.4;
        const inc        = 1 / (3000 / 30);
        let progress     = 0;
        let videoStarted = false;

        const ticker = setInterval(() => {
            progress = Math.min(progress + inc, 1);
            tlHead.style.left = ((1 - progress) * 100) + '%';
            updateYear(progress);

            if (progress >= 0.25 && !videoStarted) {
                videoStarted = true;
                containerVideo.classList.add('reveal');
                retourBtn.classList.add('visible');
                videoEl.play().catch(e => console.warn('play blocked:', e));
            }

            if (progress >= 1) {
                clearInterval(ticker);
                setTimeout(() => {
                    timeline.classList.remove('visible');
                }, 400);
            }
        }, 30);

    }, 500);
}

function resetScene() {
    containerVideo.style.transition = 'opacity 1.2s ease, filter 1.2s ease';
    containerVideo.style.opacity    = '0';
    containerVideo.style.filter     = 'blur(30px)';
    retourBtn.classList.remove('visible');

    setTimeout(() => {
        videoEl.pause();
        videoEl.src = '';
        containerVideo.classList.remove('reveal');
        containerVideo.style.transition = '';
        containerVideo.style.opacity    = '';
        containerVideo.style.filter     = '';
        tlHead.style.left  = '100%';
        tlHead.style.background = 'var(--beige-pale)';
        tlYear.textContent = YEAR_START;
        tlYear.style.color = 'rgba(208,205,202,0.65)';
        grainIntensity = 0.4;

        let last = null;
        document.querySelectorAll('.button-video').forEach(btn => {
            const color = randomColor(last);
            last = color;
            btn.style.color = color;
            const ul = btn.querySelector('.btn-underline');
            if (ul) ul.style.background = color;
        });

        containerOptions.style.opacity = '0';
        containerOptions.classList.remove('hidden');
        footer.style.opacity = '0';
        footer.classList.remove('hidden');
        siteHeader.style.opacity = '0';
        siteHeader.classList.remove('hidden');

        requestAnimationFrame(() => {
            containerOptions.style.transition = 'opacity 0.8s ease';
            containerOptions.style.opacity    = '1';
            footer.style.transition           = 'opacity 0.8s ease';
            footer.style.opacity              = '1';
            siteHeader.style.transition       = 'opacity 0.8s ease';
            siteHeader.style.opacity          = '1';

            setTimeout(() => {
                containerOptions.style.transition = '';
                containerOptions.style.opacity    = '';
                footer.style.transition           = '';
                footer.style.opacity              = '';
                siteHeader.style.transition       = '';
                siteHeader.style.opacity          = '';
            }, 900);
        });
    }, 1200);
}

retourBtn.addEventListener('click', resetScene);