/**
 * Modal Handler - dharambhushan.com
 * Handles image modal functionality for project cards
 */

'use strict';

// ==========================================
// IMAGE MODAL HANDLER
// ==========================================

class ImageModal {
  constructor() {
    this.modal = document.getElementById('image-modal');
    this.modalImage = document.getElementById('modal-image');
    this.modalClose = this.modal?.querySelector('.modal-close');
    this.modalOverlay = this.modal?.querySelector('.modal-overlay');
    this.clickableCards = document.querySelectorAll('.clickable-card');
    this.outputButtons = document.querySelectorAll('.output-button');
    this.architectureButtons = document.querySelectorAll('.architecture-button');

    // Image mapping for different modals
    this.imageMap = {
      'recommendation-engine': {
        output: '/assets/images/recommendation_engine.png',
        architecture: '/assets/images/recommendation_engine__architecture.png',
      },
      'vector-search': {
        architecture: '/assets/images/vector__index_search.png',
      },
    };

    if (this.modal) {
      this.init();
    }
  }

  init() {
    // Add click handlers to clickable cards
    this.clickableCards.forEach(card => {
      card.addEventListener('click', e => {
        // Don't open modal if clicking on a button or link
        if (!e.target.closest('button') && !e.target.closest('a')) {
          this.openModal(card, 'output');
        }
      });
    });

    // Add click handlers to output buttons
    this.outputButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('[data-modal]');
        if (card) {
          this.openModal(card, 'output');
        }
      });
    });

    // Add click handlers to architecture buttons
    this.architectureButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('[data-modal]');
        if (card) {
          this.openModal(card, 'architecture');
        }
      });
    });

    // Close modal handlers
    this.modalClose?.addEventListener('click', () => this.closeModal());
    this.modalOverlay?.addEventListener('click', () => this.closeModal());

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal(card, imageType = 'output') {
    const modalId = card.dataset.modal;
    const imageData = this.imageMap[modalId];

    if (imageData) {
      const imageSrc = typeof imageData === 'string' ? imageData : imageData[imageType];
      if (imageSrc) {
        this.modalImage.src = imageSrc;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    }
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const imageModal = new ImageModal();
});

// Export for external use
window.ImageModal = ImageModal;
