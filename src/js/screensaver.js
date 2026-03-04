// ============================================
//  VOID — Generative Cosmic Screensaver
//  Injects as background behind page content
// ============================================

var screensaverAnimationId = null;

function loadScreensaver() {
    var videoDiv = document.querySelector('.video');
    if (videoDiv) {
        videoDiv.style.transition = 'opacity 2.5s ease';
        videoDiv.style.opacity = '0';
        setTimeout(function () { videoDiv.style.display = 'none'; }, 2500);
    }

    var webgl = document.querySelector('.webgl');
    if (webgl) {
        webgl.style.position = 'relative';
        webgl.style.zIndex = '2';
    }

    var wrapper = document.createElement('div');
    wrapper.id = 'screensaver-wrapper';
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';

    var mainCanvas = document.createElement('canvas');
    mainCanvas.id = 'screensaver-main';
    mainCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

    wrapper.appendChild(mainCanvas);
    document.body.appendChild(wrapper);

    initScreensaver(mainCanvas);
}

function unloadScreensaver() {
    if (screensaverAnimationId) {
        cancelAnimationFrame(screensaverAnimationId);
        screensaverAnimationId = null;
    }
    var wrapper = document.getElementById('screensaver-wrapper');
    if (wrapper) {
        wrapper.style.transition = 'opacity 1.5s ease';
        wrapper.style.opacity = '0';
        setTimeout(function () { wrapper.remove(); }, 1500);
    }
    var videoDiv = document.querySelector('.video');
    if (videoDiv) {
        videoDiv.style.display = '';
        videoDiv.style.transition = 'opacity 1.5s ease';
        videoDiv.style.opacity = '1';
        var video = document.getElementById('bgvid');
        if (video) { video.load(); video.play(); }
    }
}

function initScreensaver(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, cx, cy;
    var mouse = { x: -9999, y: -9999, active: false };

    // === CONFIG ===
    var CFG = {
        particles: 600,
        connDist: 120,
        maxSpeed: 0.8,
        attractors: 4,
        attractorStrength: 0.00015,
        trailFade: 0.06,
        glowLayers: 3,
        ribbonCount: 5,
        ribbonSegments: 80,
        starCount: 200,
        nebulaBlobs: 5,
        pulseSpeed: 0.0005,
    };

    // === SIMPLEX NOISE ===
    function SimplexNoise(seed) {
        seed = seed || Math.random() * 65536;
        this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
        this.p = new Uint8Array(256);
        for (var i = 0; i < 256; i++) this.p[i] = i;
        for (var i = 255; i > 0; i--) {
            seed = (seed * 16807) % 2147483647;
            var j = seed % (i + 1);
            var tmp = this.p[i]; this.p[i] = this.p[j]; this.p[j] = tmp;
        }
        this.perm = new Uint8Array(512);
        for (var i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }
    SimplexNoise.prototype.noise2D = function(x, y) {
        var F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
        var s = (x + y) * F2;
        var i = Math.floor(x + s), j = Math.floor(y + s);
        var t = (i + j) * G2;
        var x0 = x - (i - t), y0 = y - (j - t);
        var i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
        var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        var ii = i & 255, jj = j & 255;
        var self = this;
        function calc(gi, xn, yn) {
            var tt = 0.5 - xn * xn - yn * yn;
            if (tt < 0) return 0;
            var g = self.grad3[gi % 12];
            return tt * tt * tt * tt * (g[0] * xn + g[1] * yn);
        }
        return 70 * (
            calc(this.perm[ii + this.perm[jj]], x0, y0) +
            calc(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1) +
            calc(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2)
        );
    };
    SimplexNoise.prototype.noise3D = function(x, y, z) {
        return (this.noise2D(x + z * 31.7, y + z * 47.3) + this.noise2D(x - z * 23.1, y - z * 19.9)) * 0.5;
    };

    var noise = new SimplexNoise();
    var noise2 = new SimplexNoise(1337);

    // === COLOR ENGINE ===
    var THEMES = [
        { name: 'void',    colors: ['#0a001a','#1a0033','#4400aa','#7733ff','#aa88ff','#eeddff'] },
        { name: 'ember',   colors: ['#0a0000','#1a0500','#661100','#cc3300','#ff6622','#ffcc66'] },
        { name: 'abyss',   colors: ['#000a0f','#001520','#003355','#0066aa','#22aadd','#88eeff'] },
        { name: 'aurora',  colors: ['#000a05','#001a0a','#00553a','#00cc77','#33ffaa','#aaffdd'] },
        { name: 'orchid',  colors: ['#0a000a','#200020','#550044','#aa0077','#ff33aa','#ffaadd'] },
        { name: 'solar',   colors: ['#0a0500','#1a0f00','#553300','#aa6600','#ffaa00','#ffdd77'] },
    ];

    var currentTheme = 0;
    var nextTheme = 1;
    var themeBlend = 0;
    var themeDuration = 15000;
    var themeTimer = 0;

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function lerpRgb(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        ];
    }

    function getThemeColor(pos, alpha) {
        var tA = THEMES[currentTheme].colors.map(hexToRgb);
        var tB = THEMES[nextTheme].colors.map(hexToRgb);
        var p = Math.max(0, Math.min(1, pos));
        var idx = p * (tA.length - 1);
        var i = Math.floor(idx), f = idx - i;
        var j = Math.min(i + 1, tA.length - 1);
        var cA = lerpRgb(tA[i], tA[j], f);
        var cB = lerpRgb(tB[i], tB[j], f);
        var smooth = themeBlend * themeBlend * (3 - 2 * themeBlend);
        var c = lerpRgb(cA, cB, smooth);
        return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + alpha + ')';
    }

    // === STARS (static background twinklers) ===
    var stars = [];
    function initStars() {
        stars = [];
        for (var i = 0; i < CFG.starCount; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.002 + 0.001,
                brightness: Math.random() * 0.5 + 0.3
            });
        }
    }

    function drawStars(time) {
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var twinkle = (Math.sin(time * s.speed + s.phase) * 0.5 + 0.5) * s.brightness;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + twinkle + ')';
            ctx.fill();
        }
    }

    // === NEBULA (soft glowing clouds) ===
    var nebulae = [];
    function initNebulae() {
        nebulae = [];
        for (var i = 0; i < CFG.nebulaBlobs; i++) {
            nebulae.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 300 + 150,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                colorPos: Math.random(),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawNebulae(time) {
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < nebulae.length; i++) {
            var n = nebulae[i];
            n.x += n.vx + Math.sin(time * 0.0003 + n.phase) * 0.2;
            n.y += n.vy + Math.cos(time * 0.0002 + n.phase) * 0.2;
            var breathe = Math.sin(time * 0.0004 + n.phase) * 0.3 + 1;
            var r = n.r * breathe;

            // Wrap
            if (n.x < -r) n.x = W + r;
            if (n.x > W + r) n.x = -r;
            if (n.y < -r) n.y = H + r;
            if (n.y > H + r) n.y = -r;

            var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            var cPos = n.colorPos + Math.sin(time * 0.0002) * 0.15;
            grad.addColorStop(0, getThemeColor(cPos, 0.06));
            grad.addColorStop(0.4, getThemeColor(cPos + 0.1, 0.03));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    // === GRAVITATIONAL ATTRACTORS ===
    var attractors = [];
    function initAttractors() {
        attractors = [];
        for (var i = 0; i < CFG.attractors; i++) {
            attractors.push({
                x: W * (0.2 + Math.random() * 0.6),
                y: H * (0.2 + Math.random() * 0.6),
                phase: Math.random() * Math.PI * 2,
                orbitR: Math.random() * 200 + 100,
                speed: (Math.random() - 0.5) * 0.0004,
                cx: W * (0.2 + Math.random() * 0.6),
                cy: H * (0.2 + Math.random() * 0.6)
            });
        }
    }

    function updateAttractors(time) {
        for (var i = 0; i < attractors.length; i++) {
            var a = attractors[i];
            a.x = a.cx + Math.cos(time * a.speed + a.phase) * a.orbitR;
            a.y = a.cy + Math.sin(time * a.speed * 0.7 + a.phase) * a.orbitR * 0.6;
        }
    }

    // === PARTICLES ===
    var particles = [];
    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * CFG.maxSpeed;
        this.vy = (Math.random() - 0.5) * CFG.maxSpeed;
        this.life = Math.random() * 800 + 400;
        this.maxLife = this.life;
        this.size = Math.random() * 2 + 0.5;
        this.colorPos = Math.random();
        this.trail = [];
        this.maxTrail = Math.floor(Math.random() * 8) + 4;
    };
    Particle.prototype.update = function (time) {
        // Noise field
        var angle = noise.noise3D(this.x * 0.002, this.y * 0.002, time * 0.0003) * Math.PI * 2;
        this.vx += Math.cos(angle) * 0.03;
        this.vy += Math.sin(angle) * 0.03;

        // Attractor gravity
        for (var i = 0; i < attractors.length; i++) {
            var a = attractors[i];
            var dx = a.x - this.x, dy = a.y - this.y;
            var dist = Math.sqrt(dx * dx + dy * dy) + 50;
            var force = CFG.attractorStrength * (W * 0.5) / dist;
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
        }

        // Damping
        var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > CFG.maxSpeed) {
            this.vx = (this.vx / speed) * CFG.maxSpeed;
            this.vy = (this.vy / speed) * CFG.maxSpeed;
        }
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.life <= 0 || this.x < -80 || this.x > W + 80 || this.y < -80 || this.y > H + 80) {
            this.reset();
        }
    };

    function initParticles() {
        particles = [];
        for (var i = 0; i < CFG.particles; i++) particles.push(new Particle());
    }

    function drawParticles(time) {
        ctx.globalCompositeOperation = 'lighter';

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.update(time);

            var lifeRatio = p.life / p.maxLife;
            var alpha = Math.sin(lifeRatio * Math.PI) * 0.8;
            var fieldNoise = noise.noise3D(p.x * 0.001, p.y * 0.001, time * 0.0001);
            var cPos = (fieldNoise + 1) * 0.3 + p.colorPos * 0.4;

            // Draw trail
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (var t = 1; t < p.trail.length; t++) {
                    ctx.lineTo(p.trail[t].x, p.trail[t].y);
                }
                ctx.strokeStyle = getThemeColor(cPos, alpha * 0.15);
                ctx.lineWidth = p.size * 0.5;
                ctx.stroke();
            }

            // Outer glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = getThemeColor(cPos, alpha * 0.08);
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = getThemeColor(cPos + 0.3, alpha);
            ctx.fill();
        }
    }

    // === CONNECTIONS (web between nearby particles) ===
    function drawConnections() {
        ctx.globalCompositeOperation = 'lighter';
        var maxDist2 = CFG.connDist * CFG.connDist;

        for (var i = 0; i < particles.length; i++) {
            var a = particles[i];
            for (var j = i + 1; j < particles.length; j++) {
                var b = particles[j];
                var dx = a.x - b.x, dy = a.y - b.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < maxDist2) {
                    var d = Math.sqrt(d2);
                    var alpha = (1 - d / CFG.connDist) * 0.12;
                    var midColor = (a.colorPos + b.colorPos) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = getThemeColor(midColor, alpha);
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // === AURORA RIBBONS ===
    var ribbons = [];
    function initRibbons() {
        ribbons = [];
        for (var i = 0; i < CFG.ribbonCount; i++) {
            ribbons.push({
                yBase: H * (0.15 + (i / CFG.ribbonCount) * 0.7),
                amplitude: Math.random() * 60 + 40,
                freq: Math.random() * 0.003 + 0.001,
                speed: Math.random() * 0.0006 + 0.0003,
                width: Math.random() * 40 + 20,
                colorPos: i / CFG.ribbonCount,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawRibbons(time) {
        ctx.globalCompositeOperation = 'lighter';

        for (var r = 0; r < ribbons.length; r++) {
            var rb = ribbons[r];
            var t = time * rb.speed + rb.phase;

            ctx.beginPath();
            var points = [];
            for (var x = 0; x <= W; x += 4) {
                var n1 = noise.noise3D(x * rb.freq, r * 7, t);
                var n2 = noise2.noise3D(x * rb.freq * 2.5, r * 13, t * 1.4);
                var y = rb.yBase + n1 * rb.amplitude + n2 * (rb.amplitude * 0.4);
                points.push({ x: x, y: y });
            }

            // Draw filled ribbon with gradient
            for (var i = 0; i < points.length - 1; i++) {
                var p1 = points[i], p2 = points[i + 1];
                var localNoise = Math.abs(noise.noise2D(p1.x * 0.005, time * 0.0002 + r));
                var ribbonAlpha = 0.015 * localNoise + 0.005;
                var halfW = rb.width * (0.5 + localNoise * 0.5);

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y - halfW);
                ctx.lineTo(p2.x, p2.y - halfW);
                ctx.lineTo(p2.x, p2.y + halfW);
                ctx.lineTo(p1.x, p1.y + halfW);
                ctx.closePath();
                ctx.fillStyle = getThemeColor(rb.colorPos + localNoise * 0.2, ribbonAlpha);
                ctx.fill();
            }

            // Bright center line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = getThemeColor(rb.colorPos + 0.2, 0.04);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // === CENTRAL GRAVITY WELL (pulsing core) ===
    function drawGravityWell(time) {
        ctx.globalCompositeOperation = 'lighter';
        var pulse = Math.sin(time * CFG.pulseSpeed) * 0.5 + 0.5;
        var breathe = Math.sin(time * 0.0003) * 0.3 + 0.7;

        for (var i = CFG.glowLayers; i >= 0; i--) {
            var r = (30 + i * 50) * breathe + pulse * 20;
            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            var innerAlpha = (0.04 - i * 0.008) * (0.7 + pulse * 0.3);
            var cPos = 0.6 + i * 0.1 + Math.sin(time * 0.0002) * 0.1;
            grad.addColorStop(0, getThemeColor(cPos + 0.2, innerAlpha * 2));
            grad.addColorStop(0.5, getThemeColor(cPos, innerAlpha));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tiny bright core
        var coreR = 3 + pulse * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = getThemeColor(0.9, 0.3 + pulse * 0.2);
        ctx.fill();
    }

    // === ORBITAL RINGS ===
    function drawOrbitals(time) {
        ctx.globalCompositeOperation = 'lighter';
        var ringCount = 3;

        for (var i = 0; i < ringCount; i++) {
            var r = 120 + i * 90;
            var rot = time * (0.00005 + i * 0.00002) * (i % 2 === 0 ? 1 : -1);
            var wobble = Math.sin(time * 0.0004 + i * 2) * 0.15;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.scale(1, 0.35 + wobble);

            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = getThemeColor(0.5 + i * 0.15, 0.03 + Math.sin(time * 0.0006 + i) * 0.01);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Orbiting dot
            var dotAngle = time * (0.0003 + i * 0.0001);
            var dotX = Math.cos(dotAngle) * r;
            var dotY = Math.sin(dotAngle) * r;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
            ctx.fillStyle = getThemeColor(0.7 + i * 0.1, 0.5);
            ctx.fill();

            ctx.restore();
        }
    }

    // === RESIZE ===
    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        cx = W / 2;
        cy = H / 2;
        canvas.width = W;
        canvas.height = H;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        initStars();
        initNebulae();
        initAttractors();
        initRibbons();
    }
    window.addEventListener('resize', resize);
    resize();
    initParticles();

    // === MOUSE INTERACTION ===
    document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    document.addEventListener('mouseleave', function () {
        mouse.active = false;
    });

    // === MAIN LOOP ===
    var lastTime = 0;

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var dt = timestamp - lastTime;
        lastTime = timestamp;

        // Theme cycling
        themeTimer += dt;
        themeBlend = Math.min(1, themeTimer / themeDuration);
        if (themeTimer >= themeDuration) {
            themeTimer = 0;
            currentTheme = nextTheme;
            nextTheme = (nextTheme + 1) % THEMES.length;
        }

        // Clear with trail fade
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0,' + CFG.trailFade + ')';
        ctx.fillRect(0, 0, W, H);

        // Update attractors
        updateAttractors(timestamp);

        // If mouse is active, use it as an extra attractor
        if (mouse.active) {
            attractors[0].x = mouse.x;
            attractors[0].y = mouse.y;
        }

        // Draw layers (back to front)
        drawStars(timestamp);
        drawNebulae(timestamp);
        drawRibbons(timestamp);
        drawGravityWell(timestamp);
        drawOrbitals(timestamp);
        drawParticles(timestamp);
        drawConnections();

        screensaverAnimationId = requestAnimationFrame(animate);
    }

    screensaverAnimationId = requestAnimationFrame(animate);
}