const topBar = document.querySelector('.top-bar');
const SCROLL_THRESHOLD = 150;
let ticking = false;

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                topBar.classList.add('is-collapsed');
            } else {
                topBar.classList.remove('is-collapsed');
            }
            ticking = false;
        });
        ticking = true;
    }
});

const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const particles = [];
const colors = ['rgba(230,57,70,', 'rgba(255,106,122,', 'rgba(255,107,107,'];

if (!prefersReducedMotion) {
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.15,
            vy: 0.05 + Math.random() * 0.15,
            r: 1.5 + Math.random() * 2.5,
            alpha: 0.05 + Math.random() * 0.15,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (prefersReducedMotion) return;
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
    }
    requestAnimationFrame(drawParticles);
}
drawParticles();

const burstParticles = [];
const streamParticles = [];
const lineParticles = [];
let streamInterval = null;
let lineInterval = null;
let hoverTimeout = null;
let activeIcon = null;
let otherIcons = [];

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function getIconPositions() {
    const icons = document.querySelectorAll('.social-icon');
    const positions = [];
    icons.forEach(el => {
        const rect = el.getBoundingClientRect();
        positions.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            el: el
        });
    });
    return positions;
}

function createBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.5;
        burstParticles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 2 + Math.random() * 3.5,
            alpha: 0.9,
            color: color,
            life: 1,
            decay: 0.006 + Math.random() * 0.01
        });
    }
}

function drawBursts() {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.life -= p.decay;
        p.alpha = p.life * 0.9;
        if (p.life <= 0) { burstParticles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', ',' + p.alpha + ')').replace('rgba', 'rgba');
        ctx.fill();
    }
    if (burstParticles.length > 0) requestAnimationFrame(drawBursts);
}

function createStream(x, y, color) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    const speed = 0.6 + Math.random() * 1.5;
    streamParticles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
        vy: Math.sin(angle) * speed - 0.5,
        r: 1.5 + Math.random() * 2,
        alpha: 0.7 + Math.random() * 0.3,
        color: color,
        life: 1,
        decay: 0.008 + Math.random() * 0.015
    });
}

function drawStream() {
    for (let i = streamParticles.length - 1; i >= 0; i--) {
        const p = streamParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.life -= p.decay;
        p.alpha = p.life * 0.8;
        if (p.life <= 0) { streamParticles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', ',' + p.alpha + ')').replace('rgba', 'rgba');
        ctx.fill();
    }
    if (streamParticles.length > 0) requestAnimationFrame(drawStream);
}

function createLineParticle(x, y, targetX, targetY, color) {
    const steps = 40 + Math.floor(Math.random() * 30);
    lineParticles.push({
        x: x,
        y: y,
        targetX: targetX,
        targetY: targetY,
        steps: steps,
        progress: 0,
        r: 1 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.4,
        color: color,
        life: 1,
        decay: 0.01 + Math.random() * 0.015
    });
}

function drawLines() {
    for (let i = lineParticles.length - 1; i >= 0; i--) {
        const p = lineParticles[i];
        p.progress += 1 / p.steps;
        p.life -= p.decay;
        p.alpha = p.life * 0.8;
        if (p.progress >= 1 || p.life <= 0) { lineParticles.splice(i, 1); continue; }
        const cx = p.x + (p.targetX - p.x) * p.progress;
        const cy = p.y + (p.targetY - p.y) * p.progress;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', ',' + p.alpha + ')').replace('rgba', 'rgba');
        ctx.fill();
        if (p.progress < 0.5) {
            ctx.beginPath();
            ctx.arc(p.x + (p.targetX - p.x) * (p.progress + 0.01), p.y + (p.targetY - p.y) * (p.progress + 0.01), p.r * p.life * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', ',' + p.alpha * 0.3 + ')').replace('rgba', 'rgba');
            ctx.fill();
        }
    }
    if (lineParticles.length > 0) requestAnimationFrame(drawLines);
}

function startHoverEffects(icon) {
    const rect = icon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const color = getComputedStyle(icon).getPropertyValue('--social-color').trim() || '#e63946';
    const rgb = hexToRgb(color);
    if (!rgb) return;
    const colorWithAlpha = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b;

    createBurst(cx, cy, colorWithAlpha, 12);
    if (burstParticles.length > 0) drawBursts();

    otherIcons = getIconPositions().filter(pos => pos.el !== icon);

    hoverTimeout = setTimeout(function() {
        streamInterval = setInterval(function() {
            const rect2 = icon.getBoundingClientRect();
            const cx2 = rect2.left + rect2.width / 2;
            const cy2 = rect2.top + rect2.height / 2;
            if (cx2 > 0 && cy2 > 0 && cx2 < window.innerWidth && cy2 < window.innerHeight) {
                for (let i = 0; i < 2; i++) {
                    createStream(cx2 + (Math.random() - 0.5) * 15, cy2 + (Math.random() - 0.5) * 15, colorWithAlpha);
                }
                if (streamParticles.length > 0) drawStream();
            }
        }, 60);

        lineInterval = setInterval(function() {
            const rect2 = icon.getBoundingClientRect();
            const cx2 = rect2.left + rect2.width / 2;
            const cy2 = rect2.top + rect2.height / 2;
            if (otherIcons.length > 0) {
                const target = otherIcons[Math.floor(Math.random() * otherIcons.length)];
                createLineParticle(cx2 + (Math.random() - 0.5) * 10, cy2 + (Math.random() - 0.5) * 10, target.x + (Math.random() - 0.5) * 10, target.y + (Math.random() - 0.5) * 10, colorWithAlpha);
                if (lineParticles.length > 0) drawLines();
            }
        }, 150);
    }, 700);

    activeIcon = icon;
}

function stopHoverEffects() {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
    if (streamInterval) {
        clearInterval(streamInterval);
        streamInterval = null;
    }
    if (lineInterval) {
        clearInterval(lineInterval);
        lineInterval = null;
    }
    activeIcon = null;
    otherIcons = [];
}

document.querySelectorAll('.social-icon').forEach(el => {
    el.addEventListener('mouseenter', function() {
        stopHoverEffects();
        startHoverEffects(this);
    });
    el.addEventListener('mouseleave', function() {
        stopHoverEffects();
    });
});

const openPancreasBtn = document.getElementById('open-pancreas-btn');
if (openPancreasBtn) {
    openPancreasBtn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        createBurst(cx, cy, 'rgba(230,57,70,', 25);
        drawBursts();
    });
}