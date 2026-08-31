// ===== MOBILE NAV =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.textContent = navLinks.classList.contains('active') ? '×' : '≡';
    });
}

// ===== CANVAS SHAPES (sutil, orgânico) =====
const canvas = document.getElementById('shapes');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let shapes = [];
    const SHAPE_COUNT = 5;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Shape {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 300 + 150;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.opacity = Math.random() * 0.03 + 0.01;
            this.hue = Math.random() > 0.5 ? 220 : 160; // azul ou teal muito suave
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -this.size) this.x = width + this.size;
            if (this.x > width + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = height + this.size;
            if (this.y > height + this.size) this.y = -this.size;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 30%, 50%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        shapes = [];
        for (let i = 0; i < SHAPE_COUNT; i++) {
            shapes.push(new Shape());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        shapes.forEach(s => {
            s.update();
            s.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
    animate();
}

// ===== SMOOTH SCROLL FOR ANCHORS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile nav if open
            if (navLinks) navLinks.classList.remove('active');
            if (navToggle) navToggle.textContent = '≡';
        }
    });
});