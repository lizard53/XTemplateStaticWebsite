/**
 * Main JavaScript - dharambhushan.com
 * Core functionality and interactions
 */

'use strict';

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');

    // Update aria-expanded for accessibility
    const isExpanded = navMenu.classList.contains('active');
    mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
  });

  // Close menu when clicking on a nav link
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', e => {
    if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Skip if href is just '#'
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  });
});

// ==========================================
// HEADER SCROLL EFFECT
// ==========================================

const header = document.querySelector('.site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // Add shadow when scrolled
  if (currentScroll > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Optional: Hide header on scroll down, show on scroll up
  // Uncomment if desired:
  /*
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  */

  lastScroll = currentScroll;
});

// ==========================================
// ACTIVE NAV LINK HIGHLIGHTING
// ==========================================

const sections = document.querySelectorAll('section[id]');
const navLinksInMenu = document.querySelectorAll('.nav-menu a[href^="#"]');

function updateActiveNavLink() {
  const scrollPosition = window.pageYOffset + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinksInMenu.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);
window.addEventListener('load', updateActiveNavLink);

// ==========================================
// PERFORMANCE: DEBOUNCE UTILITY
// ==========================================

function debounce(func, wait = 10, immediate = false) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// ==========================================
// KEYBOARD NAVIGATION IMPROVEMENTS
// ==========================================

// Trap focus in mobile menu when open
const focusableElements = 'a[href], button, textarea, input, select';

if (mobileMenuToggle && navMenu) {
  mobileMenuToggle.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.focus();
    }
  });
}

// ==========================================
// PAGE VISIBILITY API (for analytics pause)
// ==========================================

let isPageVisible = true;

document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;

  // You can pause/resume animations or tracking here
  if (isPageVisible) {
    console.log('Page is visible');
  } else {
    console.log('Page is hidden');
  }
});

// ==========================================
// PERFORMANCE: INTERSECTION OBSERVER
// ==========================================

// Lazy load images when they come into viewport
const lazyImages = document.querySelectorAll('img[data-src]');

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
} else {
  // Fallback for browsers without IntersectionObserver
  lazyImages.forEach(img => {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });
}

// ==========================================
// ERROR HANDLING
// ==========================================

window.addEventListener('error', e => {
  console.error('Global error:', e.error);
  // You can send errors to analytics here
});

window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled promise rejection:', e.reason);
  // You can send errors to analytics here
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Get current year for copyright
const currentYear = new Date().getFullYear();
const copyrightElements = document.querySelectorAll('[data-year]');
copyrightElements.forEach(el => {
  el.textContent = currentYear;
});

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Site initialized');

  // Add any initialization code here
  updateActiveNavLink();

  // Log performance metrics
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      const loadTime =
        window.performance.timing.domContentLoadedEventEnd -
        window.performance.timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    });
  }
});
