/**
 * Animated Background
 *
 * Creates a smooth, professional animated gradient background
 * Suitable for any type of business website (portfolio, agency, consulting, etc.)
 *
 * Features:
 * - Smooth color transitions
 * - Subtle particle effects (optional)
 * - Fully customizable colors
 * - Respects prefers-reduced-motion
 * - Lightweight and performant
 */

class AnimatedBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`AnimatedBackground: Container #${containerId} not found`);
      return;
    }

    // Default configuration
    this.config = {
      // Gradient colors (customize these for your brand)
      gradientColors: options.gradientColors || [
        '#667eea', // Purple
        '#764ba2', // Deep purple
        '#f093fb', // Pink
        '#4facfe', // Blue
      ],
      // Animation speed (higher = slower)
      animationSpeed: options.animationSpeed || 20,
      // Enable particle effects
      showParticles: options.showParticles !== false,
      // Number of particles
      particleCount: options.particleCount || 30,
      // Particle color
      particleColor: options.particleColor || 'rgba(255, 255, 255, 0.5)',
      // Particle size range
      particleSizeMin: options.particleSizeMin || 2,
      particleSizeMax: options.particleSizeMax || 4,
    };

    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    // Initialize particles
    this.particles = [];
    if (this.config.showParticles && !this.prefersReducedMotion) {
      this.initParticles();
    }

    // Setup resize handler
    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Initial resize
    this.resize();

    // Start animation
    this.gradientOffset = 0;
    if (!this.prefersReducedMotion) {
      this.animate();
    } else {
      // Static gradient for reduced motion
      this.drawStaticGradient();
    }
  }

  initParticles() {
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size:
          Math.random() * (this.config.particleSizeMax - this.config.particleSizeMin) +
          this.config.particleSizeMin,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Reinitialize particles on resize
    if (this.config.showParticles && !this.prefersReducedMotion) {
      this.particles = [];
      this.initParticles();
    }
  }

  drawGradient() {
    const { width, height } = this.canvas;

    // Create animated gradient
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      width,
      height + this.gradientOffset % height
    );

    // Add color stops with smooth transitions
    this.config.gradientColors.forEach((color, index) => {
      const position = (index / (this.config.gradientColors.length - 1)) % 1;
      gradient.addColorStop(position, color);
    });

    // Fill canvas with gradient
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  drawStaticGradient() {
    const { width, height } = this.canvas;

    // Create static gradient (no animation for reduced motion)
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);

    this.config.gradientColors.forEach((color, index) => {
      const position = index / (this.config.gradientColors.length - 1);
      gradient.addColorStop(position, color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  drawParticles() {
    if (!this.config.showParticles) return;

    this.particles.forEach((particle) => {
      // Update particle position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });
  }

  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw animated gradient
    this.drawGradient();

    // Draw particles
    this.drawParticles();

    // Update gradient offset for animation
    this.gradientOffset += 0.5;

    // Continue animation
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    // Cancel animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-initialize backgrounds on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize for pages with animated-background class
  const backgrounds = document.querySelectorAll('.animated-background');
  const instances = [];

  backgrounds.forEach((element) => {
    if (element.id) {
      // Customize colors per page if needed via data attributes
      const options = {};

      if (element.dataset.gradientColors) {
        options.gradientColors = element.dataset.gradientColors.split(',');
      }

      if (element.dataset.showParticles === 'false') {
        options.showParticles = false;
      }

      const instance = new AnimatedBackground(element.id, options);
      instances.push(instance);
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    instances.forEach((instance) => instance.destroy());
  });
});

// Export for module usage (Node.js environment)
/* global module */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AnimatedBackground;
}
