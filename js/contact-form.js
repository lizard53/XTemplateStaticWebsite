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
    this.form.addEventListener('submit', e => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    // Validate form
    if (!this.validateForm(data)) {
      return;
    }

    // Disable submit button
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      // For now, show success message (no backend integration)
      // In production, replace this with actual API call
      await this.simulateFormSubmission(data);

      this.showStatus('success', "Message sent successfully! I'll get back to you soon.");
      this.form.reset();
    } catch (error) {
      this.showStatus(
        'error',
        'Failed to send message. Please try emailing directly at work@dharambhushan.com'
      );
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
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

  // Simulate form submission (replace with actual API call)
  simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Log form data for debugging
        console.log('Form submitted:', data);

        // Simulate success (95% success rate for demo)
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Simulated network error'));
        }
      }, 1000);
    });
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
