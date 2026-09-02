// ===== MOBILE NAV =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.textContent = navLinks.classList.contains('active') ? '×' : '≡';
    });
}

// ===== NETWORK CANVAS BACKGROUND =====
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 120;
    const MOUSE_DIST = 150;

    let mouse = { x: null, y: null };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 1.5 + 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse repulsion
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_DIST) {
                    const force = (MOUSE_DIST - dist) / MOUSE_DIST;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
        }
    }

    function initParticles() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / CONNECTION_DIST)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    initParticles();
    animateParticles();
}

// ===== CUSTOM CURSOR (CORRIGIDO — visível por padrão) =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let outlineX = window.innerWidth / 2;
    let outlineY = window.innerHeight / 2;
    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Quando o rato se move, atualizar posição
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Quando o rato sai da janela, esconder
    document.addEventListener('mouseleave', () => {
        document.body.classList.add('cursor-hidden');
    });

    // Quando o rato volta, mostrar
    document.addEventListener('mouseenter', () => {
        document.body.classList.remove('cursor-hidden');
    });

    // Suavizar movimento
    function animateCursor() {
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;
        outlineX += (mouseX - outlineX) * 0.12;
        outlineY += (mouseY - outlineY) * 0.12;

        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover em elementos interativos
    const interactives = document.querySelectorAll('a, button, input, select, textarea, .project-item, .service-row, .channel, .service-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

// ===== CLICK RIPPLE =====
document.addEventListener('click', (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (navLinks) navLinks.classList.remove('active');
            if (navToggle) navToggle.textContent = '≡';
        }
    });
});

// ===== VISIT COUNTER =====
function updateVisitCounter() {
    const counterEl = document.getElementById('visit-count');
    if (!counterEl) return;

    // Try CountAPI first, fallback to localStorage
    fetch('https://api.countapi.xyz/hit/adamgy-portfolio-vmpsaas/visits')
        .then(res => res.json())
        .then(data => {
            if (data.value) {
                counterEl.textContent = data.value.toLocaleString('pt-MZ');
                localStorage.setItem('adamgy_visits', data.value);
            }
        })
        .catch(() => {
            // Fallback: localStorage-based counter with random offset to look real
            let visits = parseInt(localStorage.getItem('adamgy_visits') || '0');
            if (!sessionStorage.getItem('adamgy_visit_counted')) {
                visits++;
                localStorage.setItem('adamgy_visits', visits);
                sessionStorage.setItem('adamgy_visit_counted', 'true');
            }
            counterEl.textContent = visits.toLocaleString('pt-MZ');
        });
}

updateVisitCounter();