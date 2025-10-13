/**
 * Analytics - dharambhushan.com
 * Privacy-focused tracking and performance monitoring
 */

'use strict';

// ==========================================
// CONFIGURATION
// ==========================================

const ANALYTICS_CONFIG = {
  enabled: true,
  trackPageViews: true,
  trackClicks: true,
  trackPerformance: true,
  debug: false, // Set to true for development
};

// ==========================================
// ANALYTICS MANAGER
// ==========================================

class AnalyticsManager {
  constructor(config) {
    this.config = config;
    this.sessionStart = Date.now();
    this.events = [];

    if (this.config.enabled) {
      this.init();
    }
  }

  init() {
    if (this.config.trackPageViews) {
      this.trackPageView();
    }

    if (this.config.trackClicks) {
      this.setupClickTracking();
    }

    if (this.config.trackPerformance) {
      this.trackPerformanceMetrics();
    }

    // Track time on page
    this.trackTimeOnPage();

    // Track scroll depth
    this.trackScrollDepth();
  }

  /**
   * Track page view
   */
  trackPageView() {
    const pageData = {
      event: 'page_view',
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
    };

    this.sendEvent(pageData);
  }

  /**
   * Setup click tracking for important elements
   */
  setupClickTracking() {
    // Track button clicks
    document.addEventListener('click', e => {
      const button = e.target.closest('button, .btn, a[href]');

      if (button) {
        const eventData = {
          event: 'click',
          element_type: button.tagName.toLowerCase(),
          element_text: button.textContent.trim().substring(0, 50),
          element_id: button.id || null,
          element_class: button.className || null,
          timestamp: new Date().toISOString(),
        };

        // Track external links
        if (button.tagName === 'A' && button.href) {
          const url = new URL(button.href, window.location.origin);
          eventData.link_url = button.href;
          eventData.is_external = url.origin !== window.location.origin;
          eventData.is_download = button.hasAttribute('download');
        }

        this.sendEvent(eventData);
      }
    });

    // Track form submissions
    document.addEventListener('submit', e => {
      const form = e.target;
      this.sendEvent({
        event: 'form_submit',
        form_id: form.id || null,
        form_action: form.action || null,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!window.performance || !window.performance.timing) {
          return;
        }

        const { timing } = window.performance;
        const { navigation } = window.performance;

        const metrics = {
          event: 'performance',
          dns_time: timing.domainLookupEnd - timing.domainLookupStart,
          tcp_time: timing.connectEnd - timing.connectStart,
          request_time: timing.responseStart - timing.requestStart,
          response_time: timing.responseEnd - timing.responseStart,
          dom_processing: timing.domComplete - timing.domLoading,
          load_time: timing.loadEventEnd - timing.navigationStart,
          navigation_type: navigation.type,
          timestamp: new Date().toISOString(),
        };

        // Core Web Vitals (if available)
        if ('PerformanceObserver' in window) {
          this.trackWebVitals();
        }

        this.sendEvent(metrics);
      }, 0);
    });
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.sendEvent({
          event: 'web_vitals',
          metric: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          timestamp: new Date().toISOString(),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP tracking not supported');
    }

    // First Input Delay (FID)
    try {
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.sendEvent({
            event: 'web_vitals',
            metric: 'FID',
            value: entry.processingStart - entry.startTime,
            timestamp: new Date().toISOString(),
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID tracking not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        this.sendEvent({
          event: 'web_vitals',
          metric: 'CLS',
          value: clsValue,
          timestamp: new Date().toISOString(),
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS tracking not supported');
    }
  }

  /**
   * Track time on page
   */
  trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
      const timeOnPage = (Date.now() - this.sessionStart) / 1000; // Convert to seconds

      this.sendEvent(
        {
          event: 'time_on_page',
          duration_seconds: Math.round(timeOnPage),
          timestamp: new Date().toISOString(),
        },
        true
      ); // Use sendBeacon for unload events
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth() {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const reached = new Set();

    window.addEventListener(
      'scroll',
      this.debounce(() => {
        const scrollPercentage = Math.round(
          ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
        );

        maxScroll = Math.max(maxScroll, scrollPercentage);

        thresholds.forEach(threshold => {
          if (maxScroll >= threshold && !reached.has(threshold)) {
            reached.add(threshold);
            this.sendEvent({
              event: 'scroll_depth',
              depth_percentage: threshold,
              timestamp: new Date().toISOString(),
            });
          }
        });
      }, 200)
    );
  }

  /**
   * Send event to analytics endpoint
   */
  sendEvent(eventData, useBeacon = false) {
    if (!this.config.enabled) return;

    // Add session ID
    eventData.session_id = this.getSessionId();

    // Debug mode
    if (this.config.debug) {
      console.log('Analytics Event:', eventData);
    }

    // Store locally (for development/testing)
    this.events.push(eventData);

    // TODO: Replace with your analytics endpoint
    // Example integrations:

    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, eventData);
    }

    // Plausible Analytics
    if (typeof plausible !== 'undefined') {
      plausible(eventData.event, { props: eventData });
    }

    // Custom endpoint
    /*
    const endpoint = '/api/analytics';

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(eventData));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    }
    */
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    return sessionId;
  }

  /**
   * Debounce utility
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get all tracked events
   */
  getEvents() {
    return this.events;
  }
}

// ==========================================
// INITIALIZE ANALYTICS
// ==========================================

const analytics = new AnalyticsManager(ANALYTICS_CONFIG);

// ==========================================
// EXPORT FOR EXTERNAL USE
// ==========================================

window.analytics = analytics;

// Custom event tracking helper
window.trackEvent = (eventName, eventData = {}) => {
  analytics.sendEvent({
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString(),
  });
};
