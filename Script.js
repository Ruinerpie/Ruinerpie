const topBar = document.querySelector('.top-bar');
const SCROLL_THRESHOLD = 150;
let ticking = false;

window.addEventListener('scroll', function () {
    if (!ticking) {
        window.requestAnimationFrame(function () {
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

const enchantCanvas = document.createElement('canvas');
enchantCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:900;';
document.body.appendChild(enchantCanvas);
const enchantCtx = enchantCanvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    enchantCanvas.width = window.innerWidth;
    enchantCanvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ambientParticles = [];

if (!prefersReducedMotion) {
    for (let i = 0; i < 90; i++) {
        ambientParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseVx: (Math.random() - 0.5) * 0.15,
            baseVy: 0.05 + Math.random() * 0.15,
            vx: (Math.random() - 0.5) * 0.15,
            vy: 0.05 + Math.random() * 0.15,
            r: 2 + Math.random() * 1.5,
            baseAlpha: 0.25 + Math.random() * 0.15,
            alpha: 0.25 + Math.random() * 0.15,
            cr: 235,
            cg: 65,
            cb: 115
        });
    }
}

let mouseX = -9999;
let mouseY = -9999;
let prevMouseX = -9999;
let prevMouseY = -9999;
let isMouseDown = false;
let isHoveringAnyCard = false;

window.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        if (!e.target.closest('a, button, input, textarea, select, .social-icon, .social-text, .social-empty, .btn, .faq-item, .project-card, [role="button"]')) {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
            asteroidTrailPath.length = 0;
            recordAsteroidPoint(mouseX, mouseY);
        }
    }
});

window.addEventListener('mouseup', function (e) {
    if (e.button === 0) {
        isMouseDown = false;
    }
});

window.addEventListener('mousemove', function (e) {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isMouseDown && !isHoveringAnyCard) {
        recordAsteroidPoint(mouseX, mouseY);
    }
});

window.addEventListener('mouseleave', function () {
    mouseX = -9999;
    mouseY = -9999;
    prevMouseX = -9999;
    prevMouseY = -9999;
    isMouseDown = false;
});

const fxItems = [];
const asteroidTrailPath = [];
const asteroidTailSparks = [];

function recordAsteroidPoint(x, y) {
    if (x < -1000 || y < -1000) return;
    const last = asteroidTrailPath[asteroidTrailPath.length - 1];
    if (last) {
        const d = Math.hypot(x - last.x, y - last.y);
        if (d < 4) return;
    }
    asteroidTrailPath.push({ x: x, y: y, time: performance.now() });
    if (asteroidTrailPath.length > 40) {
        asteroidTrailPath.shift();
    }
    if (Math.random() > 0.5) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkSpeed = 0.4 + Math.random() * 1.8;
        asteroidTailSparks.push({
            x: x,
            y: y,
            vx: Math.cos(sparkAngle) * sparkSpeed,
            vy: Math.sin(sparkAngle) * sparkSpeed,
            size: 1.5 + Math.random() * 2.5,
            alpha: 0.9,
            decay: 0.035 + Math.random() * 0.03,
            rgb: Math.random() > 0.4 ? { r: 230, g: 57, b: 70 } : { r: 255, g: 106, b: 122 }
        });
    }
}
let hoverSpawnInterval = null;
let currentChosenMode = 0;
let resetGravityTimeout = null;
let activeGravityCard = null;
const ENCHANT_GLYPHS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const enchantParticles = [];
let activeEnchantTarget = null;
let activeEnchantRgb = null;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function spawnVectorDashes(rect, rgb) {
    const count = 14;
    for (let i = 0; i < count; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        let vx = 0;
        let vy = 0;
        const speed = 4 + Math.random() * 7;
        if (edge === 0) {
            x = rect.left + Math.random() * rect.width;
            y = rect.top;
            vx = (Math.random() - 0.5) * 3;
            vy = -speed;
        } else if (edge === 1) {
            x = rect.right;
            y = rect.top + Math.random() * rect.height;
            vx = speed;
            vy = (Math.random() - 0.5) * 3;
        } else if (edge === 2) {
            x = rect.left + Math.random() * rect.width;
            y = rect.bottom;
            vx = (Math.random() - 0.5) * 3;
            vy = speed;
        } else {
            x = rect.left;
            y = rect.top + Math.random() * rect.height;
            vx = -speed;
            vy = (Math.random() - 0.5) * 3;
        }
        fxItems.push({
            type: 1,
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            len: 12 + Math.random() * 20,
            width: 1.5 + Math.random() * 1.5,
            rgb: rgb,
            alpha: 0.9,
            decay: 0.025 + Math.random() * 0.02
        });
    }
}

function spawnShockwave(rect, rgb) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const baseW = rect.width / 2;
    const baseH = rect.height / 2;
    for (let i = 0; i < 2; i++) {
        fxItems.push({
            type: 2,
            cx: cx,
            cy: cy,
            baseW: baseW,
            baseH: baseH,
            progress: -i * 0.22,
            rgb: rgb,
            maxDist: 90 + Math.random() * 30
        });
    }
}

function spawnCircuitTraces(rect, rgb) {
    const count = 6;
    for (let i = 0; i < count; i++) {
        const side = Math.floor(Math.random() * 4);
        let sx = 0;
        let sy = 0;
        let dx1 = 0;
        let dy1 = 0;
        let dx2 = 0;
        let dy2 = 0;
        const len1 = 20 + Math.random() * 35;
        const len2 = 25 + Math.random() * 40;
        if (side === 0) {
            sx = rect.left + 10 + Math.random() * (rect.width - 20);
            sy = rect.top;
            dx1 = 0;
            dy1 = -len1;
            dx2 = Math.random() > 0.5 ? len2 : -len2;
            dy2 = 0;
        } else if (side === 1) {
            sx = rect.right;
            sy = rect.top + 10 + Math.random() * (rect.height - 20);
            dx1 = len1;
            dy1 = 0;
            dx2 = 0;
            dy2 = Math.random() > 0.5 ? len2 : -len2;
        } else if (side === 2) {
            sx = rect.left + 10 + Math.random() * (rect.width - 20);
            sy = rect.bottom;
            dx1 = 0;
            dy1 = len1;
            dx2 = Math.random() > 0.5 ? len2 : -len2;
            dy2 = 0;
        } else {
            sx = rect.left;
            sy = rect.top + 10 + Math.random() * (rect.height - 20);
            dx1 = -len1;
            dy1 = 0;
            dx2 = 0;
            dy2 = Math.random() > 0.5 ? len2 : -len2;
        }
        fxItems.push({
            type: 3,
            sx: sx,
            sy: sy,
            mx: sx + dx1,
            my: sy + dy1,
            ex: sx + dx1 + dx2,
            ey: sy + dy1 + dy2,
            progress: 0,
            speed: 0.045 + Math.random() * 0.02,
            alpha: 1,
            rgb: rgb
        });
    }
}

function spawnElectricSparks(rect, rgb) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 16;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 6;
        fxItems.push({
            type: 4,
            x: cx + (Math.random() - 0.5) * rect.width * 0.8,
            y: cy + (Math.random() - 0.5) * rect.height * 0.8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1.5 + Math.random() * 1.5,
            rgb: rgb,
            alpha: 1,
            decay: 0.03 + Math.random() * 0.025
        });
    }
}

function spawnAmbientAttraction(rect, cardRgb) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    ambientParticles.forEach(p => {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(0.42, 35 / (dist + 60));
        const tangentPull = 0.04;
        p.vx += (dx / dist) * pull - (dy / dist) * tangentPull;
        p.vy += (dy / dist) * pull + (dx / dist) * tangentPull;

        let targetR = 235;
        let targetG = 65;
        let targetB = 115;

        if (dist <= 120) {
            targetR = cardRgb.r;
            targetG = cardRgb.g;
            targetB = cardRgb.b;
            p.alpha = Math.min(1, p.baseAlpha + 0.7);
        } else if (dist <= 300) {
            const cardShift = (300 - dist) / (300 - 120);
            targetR = Math.round(255 + (cardRgb.r - 255) * cardShift);
            targetG = Math.round(0 + (cardRgb.g - 0) * cardShift);
            targetB = Math.round(0 + (cardRgb.b - 0) * cardShift);
            p.alpha = Math.min(1, p.baseAlpha + 0.35 + cardShift * 0.35);
        } else if (dist <= 620) {
            targetR = 255;
            targetG = 0;
            targetB = 0;
            p.alpha = Math.min(1, p.baseAlpha + 0.35);
        } else if (dist <= 860) {
            const redShift = (860 - dist) / (860 - 620);
            targetR = Math.round(235 + (255 - 235) * redShift);
            targetG = Math.round(65 * (1 - redShift));
            targetB = Math.round(115 * (1 - redShift));
            p.alpha = Math.min(1, p.baseAlpha + redShift * 0.35);
        } else {
            targetR = 235;
            targetG = 65;
            targetB = 115;
            p.alpha = p.baseAlpha;
        }

        p.cr += (targetR - p.cr) * 0.25;
        p.cg += (targetG - p.cg) * 0.25;
        p.cb += (targetB - p.cb) * 0.25;
    });
}

function releaseBlackHoleExplosion(card) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    ambientParticles.forEach(p => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.35;
        const maxDist = Math.hypot(window.innerWidth, window.innerHeight) * 0.65;
        const closeness = Math.max(0, 1 - (dist / maxDist));
        const blastSpeed = 0.1 + Math.pow(closeness, 1.4) * 0.7;
        p.vx = Math.cos(angle) * blastSpeed;
        p.vy = Math.sin(angle) * blastSpeed;
    });
}

function triggerHoverEffect(card) {
    isHoveringAnyCard = true;
    if (resetGravityTimeout) {
        clearTimeout(resetGravityTimeout);
        resetGravityTimeout = null;
    }

    if (card.classList.contains('modrinth') || card.classList.contains('curseforge')) {
        activeEnchantTarget = card;
        activeEnchantRgb = card.classList.contains('modrinth') ? { r: 27, g: 217, b: 106 } : { r: 241, g: 100, b: 54 };
        return;
    }

    if (currentChosenMode !== 5) {
        currentChosenMode = Math.floor(Math.random() * 5) + 1;
    }

    const rect = card.getBoundingClientRect();
    const color = getComputedStyle(card).getPropertyValue('--social-color').trim() || '#e63946';
    const rgb = hexToRgb(color) || { r: 230, g: 57, b: 70 };

    if (currentChosenMode === 1) {
        spawnVectorDashes(rect, rgb);
    } else if (currentChosenMode === 2) {
        spawnShockwave(rect, rgb);
    } else if (currentChosenMode === 3) {
        spawnCircuitTraces(rect, rgb);
    } else if (currentChosenMode === 4) {
        spawnElectricSparks(rect, rgb);
    } else if (currentChosenMode === 5) {
        activeGravityCard = card;
        spawnAmbientAttraction(rect, rgb);
    }

    if (hoverSpawnInterval) clearInterval(hoverSpawnInterval);
    hoverSpawnInterval = setInterval(function () {
        const currentRect = card.getBoundingClientRect();
        if (currentChosenMode === 1) {
            spawnVectorDashes(currentRect, rgb);
        } else if (currentChosenMode === 3) {
            spawnCircuitTraces(currentRect, rgb);
        } else if (currentChosenMode === 4) {
            spawnElectricSparks(currentRect, rgb);
        } else if (currentChosenMode === 5) {
            spawnAmbientAttraction(currentRect, rgb);
        }
    }, 50);
}

function stopHoverEffects(card) {
    isHoveringAnyCard = false;
    if (hoverSpawnInterval) {
        clearInterval(hoverSpawnInterval);
        hoverSpawnInterval = null;
    }

    if (activeEnchantTarget === card) {
        activeEnchantTarget = null;
        activeEnchantRgb = null;
    }

    if (currentChosenMode === 5) {
        if (card) releaseBlackHoleExplosion(card);
        activeGravityCard = null;
        if (resetGravityTimeout) clearTimeout(resetGravityTimeout);
        resetGravityTimeout = setTimeout(function () {
            currentChosenMode = 0;
        }, 4000);
    } else {
        currentChosenMode = 0;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enchantCtx.clearRect(0, 0, enchantCanvas.width, enchantCanvas.height);

    if (!prefersReducedMotion) {
        for (const p of ambientParticles) {
            if (!activeGravityCard && !isHoveringAnyCard && mouseX > -1000 && mouseY > -1000) {
                const cdx = p.x - mouseX;
                const cdy = p.y - mouseY;
                const cdist = Math.hypot(cdx, cdy) || 1;
                if (cdist < 70) {
                    const repSpeed = (1 - cdist / 70) * 0.28;
                    const nx = cdx / cdist;
                    const ny = cdy / cdist;
                    p.vx = p.vx * 0.85 + nx * repSpeed;
                    p.vy = p.vy * 0.85 + ny * repSpeed;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            if (activeGravityCard) {
                p.vx *= 0.965;
                p.vy *= 0.965;
            } else {
                p.vx = p.vx * 0.98 + p.baseVx * 0.02;
                p.vy = p.vy * 0.98 + p.baseVy * 0.02;
                if (p.alpha > p.baseAlpha) p.alpha -= 0.005;
                p.cr += (235 - p.cr) * 0.02;
                p.cg += (65 - p.cg) * 0.02;
                p.cb += (115 - p.cb) * 0.02;
            }

            if (p.y > canvas.height + 15) { p.y = -10; p.x = Math.random() * canvas.width; }
            if (p.y < -15) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
            if (p.x < -15) { p.x = canvas.width + 10; p.y = Math.random() * canvas.height; }
            if (p.x > canvas.width + 15) { p.x = -10; p.y = Math.random() * canvas.height; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + Math.round(p.cr) + ',' + Math.round(p.cg) + ',' + Math.round(p.cb) + ',' + p.alpha + ')';
            ctx.fill();
        }
    }

    for (let i = fxItems.length - 1; i >= 0; i--) {
        const fx = fxItems[i];
        if (fx.type === 1) {
            fx.x += fx.vx;
            fx.y += fx.vy;
            fx.alpha -= fx.decay;
            if (fx.alpha <= 0) {
                fxItems.splice(i, 1);
                continue;
            }
            const speed = Math.hypot(fx.vx, fx.vy) || 1;
            const nx = fx.vx / speed;
            const ny = fx.vy / speed;
            ctx.beginPath();
            ctx.moveTo(fx.x, fx.y);
            ctx.lineTo(fx.x - nx * fx.len, fx.y - ny * fx.len);
            ctx.strokeStyle = 'rgba(' + fx.rgb.r + ',' + fx.rgb.g + ',' + fx.rgb.b + ',' + fx.alpha + ')';
            ctx.lineWidth = fx.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (fx.type === 2) {
            fx.progress += 0.035;
            if (fx.progress >= 1) {
                fxItems.splice(i, 1);
                continue;
            }
            if (fx.progress > 0) {
                const curAlpha = (1 - fx.progress) * 0.75;
                const expand = fx.progress * fx.maxDist;
                const rx = fx.baseW + expand;
                const ry = fx.baseH + expand;
                ctx.beginPath();
                ctx.ellipse(fx.cx, fx.cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(' + fx.rgb.r + ',' + fx.rgb.g + ',' + fx.rgb.b + ',' + curAlpha + ')';
                ctx.lineWidth = 1.8 * (1 - fx.progress) + 0.5;
                ctx.stroke();
            }
        } else if (fx.type === 3) {
            fx.progress += fx.speed;
            if (fx.progress >= 1.6) {
                fxItems.splice(i, 1);
                continue;
            }
            let drawX = fx.sx;
            let drawY = fx.sy;
            ctx.beginPath();
            ctx.moveTo(fx.sx, fx.sy);
            if (fx.progress <= 0.5) {
                const sub = fx.progress / 0.5;
                drawX = fx.sx + (fx.mx - fx.sx) * sub;
                drawY = fx.sy + (fx.my - fx.sy) * sub;
                ctx.lineTo(drawX, drawY);
            } else {
                ctx.lineTo(fx.mx, fx.my);
                const sub = Math.min(1, (fx.progress - 0.5) / 0.5);
                drawX = fx.mx + (fx.ex - fx.mx) * sub;
                drawY = fx.my + (fx.ey - fx.my) * sub;
                ctx.lineTo(drawX, drawY);
            }
            const alpha = fx.progress > 1 ? Math.max(0, 1 - (fx.progress - 1) / 0.6) : 1;
            ctx.strokeStyle = 'rgba(' + fx.rgb.r + ',' + fx.rgb.g + ',' + fx.rgb.b + ',' + (alpha * 0.85) + ')';
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(drawX, drawY, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + fx.rgb.r + ',' + fx.rgb.g + ',' + fx.rgb.b + ',' + alpha + ')';
            ctx.fill();
        } else if (fx.type === 4) {
            fx.x += fx.vx;
            fx.y += fx.vy;
            fx.vx *= 0.94;
            fx.vy *= 0.94;
            fx.alpha -= fx.decay;
            if (fx.alpha <= 0) {
                fxItems.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(fx.x, fx.y);
            ctx.lineTo(fx.x - fx.vx * 2, fx.y - fx.vy * 2);
            ctx.strokeStyle = 'rgba(' + fx.rgb.r + ',' + fx.rgb.g + ',' + fx.rgb.b + ',' + fx.alpha + ')';
            ctx.lineWidth = fx.size;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    const now = performance.now();
    while (asteroidTrailPath.length > 0 && (now - asteroidTrailPath[0].time > 600 || (!isMouseDown && asteroidTrailPath.length > 0 && now - asteroidTrailPath[asteroidTrailPath.length - 1].time > 500))) {
        asteroidTrailPath.shift();
    }
    if (!isMouseDown && asteroidTrailPath.length > 0) {
        asteroidTrailPath.shift();
    }

    const trailLen = asteroidTrailPath.length;
    if (trailLen > 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const midpoints = [];
        for (let j = 0; j < trailLen - 1; j++) {
            midpoints.push({
                x: (asteroidTrailPath[j].x + asteroidTrailPath[j + 1].x) / 2,
                y: (asteroidTrailPath[j].y + asteroidTrailPath[j + 1].y) / 2
            });
        }

        for (let pass = 0; pass < 3; pass++) {
            for (let j = 0; j < midpoints.length - 1; j++) {
                const m0 = midpoints[j];
                const m1 = midpoints[j + 1];
                const ctrl = asteroidTrailPath[j + 1];
                const progress = (j + 1) / midpoints.length;
                const w = 1.0 + Math.pow(progress, 1.3) * 15;
                const a = Math.pow(progress, 0.9) * 0.92;

                ctx.beginPath();
                ctx.moveTo(m0.x, m0.y);
                ctx.quadraticCurveTo(ctrl.x, ctrl.y, m1.x, m1.y);

                if (pass === 0) {
                    ctx.lineWidth = w * 2.8;
                    ctx.strokeStyle = 'rgba(230, 57, 70, ' + (a * 0.2) + ')';
                } else if (pass === 1) {
                    ctx.lineWidth = w;
                    ctx.strokeStyle = 'rgba(255, 90, 110, ' + (a * 0.78) + ')';
                } else {
                    ctx.lineWidth = Math.max(1, w * 0.3);
                    ctx.strokeStyle = 'rgba(255, 245, 245, ' + a + ')';
                }
                ctx.stroke();
            }
        }
    }

    if (isMouseDown && mouseX > -1000 && mouseY > -1000 && !isHoveringAnyCard) {
        const headGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 32);
        headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        headGlow.addColorStop(0.2, 'rgba(255, 140, 155, 0.9)');
        headGlow.addColorStop(0.5, 'rgba(230, 57, 70, 0.6)');
        headGlow.addColorStop(0.8, 'rgba(230, 57, 70, 0.2)');
        headGlow.addColorStop(1, 'rgba(230, 57, 70, 0)');
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 32, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    for (let k = asteroidTailSparks.length - 1; k >= 0; k--) {
        const sp = asteroidTailSparks[k];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.alpha -= sp.decay;
        sp.size *= 0.97;
        if (sp.alpha <= 0 || sp.size <= 0.4) {
            asteroidTailSparks.splice(k, 1);
            continue;
        }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + sp.rgb.r + ',' + sp.rgb.g + ',' + sp.rgb.b + ',' + sp.alpha + ')';
        ctx.fill();
    }

    if (activeEnchantTarget && !prefersReducedMotion && enchantParticles.length < 6) {
        if (Math.random() < 0.08) {
            const enchantSources = Array.from(document.querySelectorAll('.social-icon, .social-text, .social-empty')).filter(el => {
                return !el.classList.contains('modrinth') && !el.classList.contains('curseforge');
            });
            if (enchantSources.length > 0) {
                const randomSource = enchantSources[Math.floor(Math.random() * enchantSources.length)];
                const sRect = randomSource.getBoundingClientRect();
                enchantParticles.push({
                    x: sRect.left + sRect.width / 2 + (Math.random() * 20 - 10),
                    y: sRect.top + sRect.height / 2 + (Math.random() * 20 - 10),
                    targetCard: activeEnchantTarget,
                    char: ENCHANT_GLYPHS[Math.floor(Math.random() * ENCHANT_GLYPHS.length)],
                    speed: 0.5 + Math.random() * 0.25,
                    age: 0,
                    opacity: 1,
                    seed: Math.random() * 10,
                    fontSize: 22 + Math.random() * 6,
                    rgb: activeEnchantRgb
                });
            }
        }
    }

    for (let i = enchantParticles.length - 1; i >= 0; i--) {
        const ep = enchantParticles[i];
        ep.age++;
        const tRect = ep.targetCard.getBoundingClientRect();
        const tx = tRect.left + tRect.width / 2;
        const ty = tRect.top + tRect.height / 2;
        const dx = tx - ep.x;
        const dy = ty - ep.y;
        const dist = Math.hypot(dx, dy) || 1;
        ep.x += (dx / dist) * ep.speed + Math.sin(ep.age * 0.02 + ep.seed) * 0.25;
        ep.y += (dy / dist) * ep.speed + Math.cos(ep.age * 0.02 + ep.seed) * 0.25;
        if (dist < 45) {
            ep.opacity -= 0.03;
        }
        if (dist < 8 || ep.opacity <= 0 || ep.age > 450) {
            enchantParticles.splice(i, 1);
            continue;
        }
        enchantCtx.save();
        enchantCtx.textAlign = 'center';
        enchantCtx.textBaseline = 'middle';
        enchantCtx.fillStyle = 'rgba(' + ep.rgb.r + ',' + ep.rgb.g + ',' + ep.rgb.b + ',' + Math.max(0, ep.opacity) + ')';
        enchantCtx.font = Math.round(ep.fontSize) + 'px "StandardGalacticAlphabet", "Gadugi", "Segoe UI Symbol", sans-serif';
        enchantCtx.fillText(ep.char, ep.x, ep.y);
        enchantCtx.restore();
    }

    requestAnimationFrame(render);
}
render();

document.querySelectorAll('.social-icon, .social-text, .social-empty').forEach(el => {
    el.addEventListener('mouseenter', function () {
        stopHoverEffects(this);
        triggerHoverEffect(this);
        const tooltip = this.querySelector('.tooltip-content');
        if (tooltip) {
            this.style.removeProperty('--tooltip-x');
            this.style.removeProperty('--tooltip-translate-x');
            this.style.removeProperty('--tooltip-arrow-x');
            const cardRect = this.getBoundingClientRect();
            const tipRect = tooltip.getBoundingClientRect();
            const padding = 12;
            const cardCenter = cardRect.left + cardRect.width / 2;
            const halfTip = tipRect.width / 2;

            if (cardCenter - halfTip < padding) {
                const shift = padding - (cardCenter - halfTip);
                this.style.setProperty('--tooltip-x', '0px');
                this.style.setProperty('--tooltip-translate-x', Math.max(0, shift - (cardRect.width / 2 - halfTip)) + 'px');
                const arrowOffset = Math.max(16, Math.min(tipRect.width - 16, cardRect.width / 2 - (shift - (cardRect.width / 2 - halfTip))));
                this.style.setProperty('--tooltip-arrow-x', arrowOffset + 'px');
            } else if (cardCenter + halfTip > window.innerWidth - padding) {
                const overflow = (cardCenter + halfTip) - (window.innerWidth - padding);
                this.style.setProperty('--tooltip-x', '100%');
                this.style.setProperty('--tooltip-translate-x', (-tipRect.width + Math.min(0, cardRect.width / 2 - halfTip + overflow)) + 'px');
                const arrowOffset = Math.max(16, Math.min(tipRect.width - 16, tipRect.width - cardRect.width / 2 + (cardRect.width / 2 - halfTip + overflow)));
                this.style.setProperty('--tooltip-arrow-x', arrowOffset + 'px');
            } else {
                this.style.setProperty('--tooltip-x', '50%');
                this.style.setProperty('--tooltip-translate-x', '-50%');
                this.style.setProperty('--tooltip-arrow-x', '50%');
            }
        }
    });
    el.addEventListener('mouseleave', function () {
        stopHoverEffects(this);
    });
});

const previewModal = document.createElement('div');
previewModal.className = 'project-preview-modal';
const previewImg = document.createElement('img');
previewModal.appendChild(previewImg);
document.body.appendChild(previewModal);

document.querySelectorAll('.project-icon-wrapper').forEach(wrapper => {
    wrapper.addEventListener('mouseenter', function () {
        const img = this.querySelector('img');
        if (img) {
            previewImg.src = img.src;
            previewImg.alt = img.alt || '';
            previewModal.classList.add('is-active');
        }
    });
    wrapper.addEventListener('mouseleave', function () {
        previewModal.classList.remove('is-active');
    });
});

const basePath = window.location.pathname.includes('/Projects/') ? '../../' : '';
const mcClickAudio = new Audio(basePath + 'sounds/Click.ogg');
mcClickAudio.volume = 0.55;

const mcBackAudio = new Audio(basePath + 'sounds/Back.ogg');
mcBackAudio.volume = 0.55;

const mcReleaseAudio = new Audio(basePath + 'sounds/Open.ogg');
mcReleaseAudio.volume = 0.65;
const mcVaultAudio = new Audio(basePath + 'sounds/Modrinth.ogg');
mcVaultAudio.volume = 0.6;
const mcTeleportAudio = new Audio(basePath + 'sounds/CurseForge.ogg');
mcTeleportAudio.volume = 0.6;
const discordAudio = new Audio(basePath + 'sounds/Discord.mps');
discordAudio.volume = 0.7;



function playSound(audio) {
    const s = audio.cloneNode();
    s.volume = audio.volume;
    s.play().catch(() => { });
}

document.addEventListener('click', function (e) {
    const discordBtn = e.target.closest('.btn-discord, .btn-discord-lg, .social-icon.discord');
    if (discordBtn) {
        playSound(discordAudio);
        return;
    }

    const modrinthBtn = e.target.closest('.btn-modrinth, .social-icon.modrinth');
    if (modrinthBtn) {
        playSound(mcVaultAudio);
        return;
    }

    const curseforgeBtn = e.target.closest('.btn-curseforge, .social-icon.curseforge');
    if (curseforgeBtn) {
        playSound(mcTeleportAudio);
        return;
    }

    const projectOpenBtn = e.target.closest('.btn-project-open');
    if (projectOpenBtn) {
        playSound(mcReleaseAudio);
        const href = projectOpenBtn.getAttribute('href');
        const target = projectOpenBtn.getAttribute('target');
        if (href && !target && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            setTimeout(function () {
                window.location.href = href;
            }, 120);
        }
        return;
    }

    const clickable = e.target.closest('button, .btn, a, .social-icon, .social-text, .social-empty, .nav-link');
    if (clickable) {
        const isBackButton = e.target.closest('.btn-back') ||
                             (clickable.textContent && clickable.textContent.toLowerCase().includes('back')) ||
                             (clickable.getAttribute('href') && clickable.getAttribute('href').endsWith('index.html'));

        if (isBackButton) {
            const href = clickable.getAttribute('href');
            if (href && !clickable.getAttribute('target')) {
                e.preventDefault();
                playSound(mcBackAudio);
                setTimeout(function () {
                    window.location.href = href;
                }, 200);
            } else {
                playSound(mcBackAudio);
            }
        } else {
            playSound(mcClickAudio);
        }
    }
});