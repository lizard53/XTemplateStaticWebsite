/**
 * Neural Network Background - dharambhushan.com
 * Animated neural network visualization for AI/ML themed background
 */

'use strict';

class NeuralNetworkBackground {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.nodes = [];
    this.nodeCount = 50;
    this.connectionDistance = 150;
    this.mouseNode = { x: 0, y: 0, radius: 100 };
    this.animationId = null;

    this.init();
  }

  init() {
    this.resize();
    this.createNodes();
    this.setupEventListeners();
    this.animate();
  }

  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
  }

  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createNodes();
    });

    this.container.addEventListener('mousemove', e => {
      const rect = this.container.getBoundingClientRect();
      this.mouseNode.x = e.clientX - rect.left;
      this.mouseNode.y = e.clientY - rect.top;
    });
  }

  updateNodes() {
    this.nodes.forEach(node => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

      // Keep within bounds
      node.x = Math.max(0, Math.min(this.canvas.width, node.x));
      node.y = Math.max(0, Math.min(this.canvas.height, node.y));
    });
  }

  drawConnections() {
    // AWS color scheme
    const awsOrange = 'rgba(255, 153, 0, 0.15)';
    const awsBlue = 'rgba(82, 127, 255, 0.15)';

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          const opacity = 1 - distance / this.connectionDistance;
          const color = i % 2 === 0 ? awsOrange : awsBlue;

          this.ctx.beginPath();
          this.ctx.strokeStyle = color.replace('0.15', (opacity * 0.15).toString());
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.stroke();
        }
      }

      // Connect to mouse position
      const dx = this.nodes[i].x - this.mouseNode.x;
      const dy = this.nodes[i].y - this.mouseNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouseNode.radius) {
        const opacity = 1 - distance / this.mouseNode.radius;
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(255, 153, 0, ${opacity * 0.3})`;
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
        this.ctx.lineTo(this.mouseNode.x, this.mouseNode.y);
        this.ctx.stroke();
      }
    }
  }

  drawNodes() {
    this.nodes.forEach((node, index) => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = index % 2 === 0 ? 'rgba(255, 153, 0, 0.6)' : 'rgba(82, 127, 255, 0.6)';
      this.ctx.fill();
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateNodes();
    this.drawConnections();
    this.drawNodes();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize neural network background
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const neuralBg = new NeuralNetworkBackground('home');

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      neuralBg.destroy();
    });
  }
});

// Export for external use
window.NeuralNetworkBackground = NeuralNetworkBackground;
