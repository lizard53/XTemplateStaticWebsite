/**
 * Contact Form Handler - dharambhushan.com
 * Handles form submission and validation
 */

'use strict';

/* global FormData */

// ==========================================
// CONTACT FORM HANDLER
// ==========================================

class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.statusElement = document.getElementById('form-status');

    if (this.form) {
      this.init();
    }
  }

  init() {
    // Check if page was redirected with success parameter
    this.checkSuccessRedirect();
  }

  checkSuccessRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      this.showStatus('success', "Message sent successfully! I'll get back to you soon.");
      // Remove the success parameter from URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  validateForm(data) {
    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      this.showStatus('error', 'Please fill in all required fields.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.showStatus('error', 'Please enter a valid email address.');
      return false;
    }

    return true;
  }

  showStatus(type, message) {
    this.statusElement.className = `form-status ${type}`;
    this.statusElement.textContent = message;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.statusElement.className = 'form-status';
      this.statusElement.textContent = '';
    }, 5000);
  }

}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = new ContactForm('contact-form');
});

// Export for external use
window.ContactForm = ContactForm;
