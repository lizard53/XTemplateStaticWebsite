/**
 * Animations - dharambhushan.com
 * Scroll-triggered animations and micro-interactions
 */

'use strict';

// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================

class ScrollReveal {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.15,
      rootMargin: options.rootMargin || '0px 0px -50px 0px',
      animateOnce: options.animateOnce !== undefined ? options.animateOnce : true,
      ...options,
    };

    this.observer = null;
    this.init();
  }

  init() {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, revealing all elements');
      this.revealAllElements();
      return;
    }

    // Create observer
    this.observer = new IntersectionObserver(entries => this.handleIntersection(entries), {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    });

    // Observe all reveal elements
    this.observeElements();
  }

  observeElements() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    revealElements.forEach(el => {
      this.observer.observe(el);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // Unobserve if animateOnce is true
        if (this.options.animateOnce) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.animateOnce) {
        entry.target.classList.remove('active');
      }
    });
  }

  revealAllElements() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    revealElements.forEach(el => {
      el.classList.add('active');
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ==========================================
// PARALLAX SCROLL EFFECT
// ==========================================

class ParallaxScroll {
  constructor() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
    this.ticking = false;

    if (this.parallaxElements.length > 0) {
      this.init();
    }
  }

  init() {
    window.addEventListener('scroll', () => this.requestTick());
  }

  requestTick() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => this.update());
      this.ticking = true;
    }
  }

  update() {
    this.parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const rect = el.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const yPos = -(scrolled * speed);

      el.style.transform = `translateY(${yPos}px)`;
    });

    this.ticking = false;
  }
}

// ==========================================
// COUNT-UP ANIMATION (for stats)
// ==========================================

class CountUpAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseFloat(element.dataset.target) || 0;
    this.duration = parseInt(element.dataset.duration) || 2000;
    this.suffix = element.dataset.suffix || '';
    this.prefix = element.dataset.prefix || '';
    this.decimals = parseInt(element.dataset.decimals) || 0;

    this.observer = null;
    this.hasAnimated = false;

    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      this.element.textContent = this.formatNumber(this.target);
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
            this.hasAnimated = true;
            this.observer.unobserve(this.element);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this.element);
  }

  animate() {
    const startTime = performance.now();
    const startValue = 0;

    const step = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (this.target - startValue) * easeOut;

      this.element.textContent = this.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.element.textContent = this.formatNumber(this.target);
      }
    };

    requestAnimationFrame(step);
  }

  formatNumber(num) {
    const formatted = num.toFixed(this.decimals);
    return `${this.prefix}${formatted}${this.suffix}`;
  }
}

// ==========================================
// TYPED TEXT EFFECT
// ==========================================

class TypedText {
  constructor(element, options = {}) {
    this.element = element;
    this.words = element.dataset.words ? element.dataset.words.split(',') : [];
    this.typeSpeed = parseInt(element.dataset.typeSpeed) || 100;
    this.deleteSpeed = parseInt(element.dataset.deleteSpeed) || 50;
    this.delay = parseInt(element.dataset.delay) || 2000;

    this.currentWordIndex = 0;
    this.currentText = '';
    this.isDeleting = false;

    if (this.words.length > 0) {
      this.type();
    }
  }

  type() {
    const currentWord = this.words[this.currentWordIndex];

    if (this.isDeleting) {
      this.currentText = currentWord.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = currentWord.substring(0, this.currentText.length + 1);
    }

    this.element.textContent = this.currentText;

    let speed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.currentText === currentWord) {
      speed = this.delay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
      speed = 500;
    }

    setTimeout(() => this.type(), speed);
  }
}

// ==========================================
// PROGRESS BAR ANIMATION
// ==========================================

class ProgressBar {
  constructor(element) {
    this.element = element;
    this.fill = element.querySelector('.progress-fill');
    this.target = parseFloat(element.dataset.progress) || 0;
    this.hasAnimated = false;

    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      this.fill.style.transform = `scaleX(${this.target / 100})`;
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
            this.hasAnimated = true;
            observer.unobserve(this.element);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(this.element);
  }

  animate() {
    this.fill.style.transform = `scaleX(${this.target / 100})`;
    this.fill.style.transformOrigin = 'left';
  }
}

// ==========================================
// INITIALIZE ALL ANIMATIONS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('Reduced motion preference detected, animations disabled');
    return;
  }

  // Initialize scroll reveal
  const scrollReveal = new ScrollReveal({
    threshold: 0.15,
    animateOnce: true,
  });

  // Initialize parallax (if elements exist)
  const parallax = new ParallaxScroll();

  // Initialize count-up animations
  const countUpElements = document.querySelectorAll('[data-target]');
  countUpElements.forEach(el => new CountUpAnimation(el));

  // Initialize typed text effects
  const typedElements = document.querySelectorAll('[data-words]');
  typedElements.forEach(el => new TypedText(el));

  // Initialize progress bars
  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach(el => new ProgressBar(el));
});

// ==========================================
// EXPORT FOR EXTERNAL USE
// ==========================================

window.ScrollReveal = ScrollReveal;
window.CountUpAnimation = CountUpAnimation;
window.TypedText = TypedText;
window.ProgressBar = ProgressBar;
