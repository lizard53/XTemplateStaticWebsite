# Architecture Documentation

# dharambhushan.com Portfolio Website

**Version:** 1.1.0
**Last Updated:** 2025-10-13
**Status:** Production

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Deployment Architecture](#deployment-architecture)
6. [Performance Strategy](#performance-strategy)
7. [Security Architecture](#security-architecture)
8. [Code Quality & Style Guidelines](#code-quality--style-guidelines)
9. [Design Decisions](#design-decisions)
10. [Future Considerations](#future-considerations)

---

## Overview

### Purpose

This documentation provides a comprehensive overview of the architectural design for the dharambhushan.com portfolio website - a high-performance, AWS-hosted static website showcasing the professional profile of an AWS Engineering Manager specializing in AI/ML solutions.

### Target Audience

- **Primary**: Technical recruiters, AWS leadership, enterprise clients
- **Secondary**: Engineering teams, development partners, consultants

### Key Architectural Goals

1. **Performance**: Sub-1.5s initial load time
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Maintainability**: Simple, vanilla technology stack
4. **Scalability**: CDN-first distribution strategy
5. **Cost Efficiency**: Serverless, pay-per-use model

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │          │
│  │   Browsers   │  │   Browsers   │  │   Browsers   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    HTTPS (SSL/TLS)
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                   CDN LAYER (CloudFlare)                          │
│  ┌─────────────────────────────────────────────────────┐         │
│  │  - Global Edge Caching                              │         │
│  │  - SSL/TLS Termination                             │         │
│  │  - DDoS Protection                                 │         │
│  │  - Automatic Minification                          │         │
│  │  - HTTP/2 & HTTP/3 Support                        │         │
│  └─────────────────────────────────────────────────────┘         │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    CloudFlare Fetch
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│              ORIGIN LAYER (AWS S3)                                │
│  ┌─────────────────────────────────────────────────────┐         │
│  │  S3 Bucket: dharambhushan.com                      │         │
│  │  - Static Website Hosting Enabled                  │         │
│  │  - Bucket Policies for CloudFlare                  │         │
│  │  - Versioning Enabled                              │         │
│  │  - Server-Side Encryption                          │         │
│  │                                                     │         │
│  │  Content Structure:                                │         │
│  │  ├── index.html (entry point)                      │         │
│  │  ├── css/ (stylesheets)                            │         │
│  │  ├── js/ (JavaScript modules)                      │         │
│  │  ├── assets/ (images, fonts, icons)                │         │
│  │  └── docs/ (downloadable content)                  │         │
│  └─────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LAYER                              │
│  ┌─────────────────────────────────────────────────────┐         │
│  │  Local Development Environment                      │         │
│  │  - npm scripts for build/deploy                     │         │
│  │  - HTML/CSS/JS validation tools                     │         │
│  │  - Lighthouse performance testing                   │         │
│  │  - AWS CLI for deployment                           │         │
│  └─────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────┘
```

### Architecture Pattern

**Pattern**: Static Site + CDN (JAMstack Architecture)

**Rationale**:

- Maximum performance through edge caching
- Minimal attack surface (no server-side processing)
- Infinite scalability via CDN
- Cost-effective for portfolio use case
- Aligns with AWS best practices

---

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              index.html (Entry Point)              │    │
│  │  - Semantic HTML5 structure                        │    │
│  │  - SEO metadata (Open Graph, Twitter Cards)        │    │
│  │  - Structured data (Schema.org)                    │    │
│  │  - Accessibility attributes (ARIA)                 │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│    ┌──────────────┼──────────────┬──────────────────┐      │
│    │              │              │                  │      │
│    ▼              ▼              ▼                  ▼      │
│  ┌──────┐    ┌──────┐      ┌──────┐          ┌──────┐    │
│  │ CSS  │    │  JS  │      │Assets│          │ Data │    │
│  │Layer │    │Layer │      │Layer │          │Layer │    │
│  └──┬───┘    └──┬───┘      └──────┘          └──────┘    │
│     │           │                                          │
└─────┼───────────┼──────────────────────────────────────────┘
      │           │
      ▼           ▼

┌─────────────────────────────────────────────────────────────┐
│                      CSS MODULE ARCHITECTURE                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  main.css    │  │components.css│  │ themes.css   │     │
│  │              │  │              │  │              │     │
│  │ - Variables  │  │ - Cards      │  │ - Dark theme │     │
│  │ - Reset      │  │ - Grids      │  │ - Light theme│     │
│  │ - Typography │  │ - Badges     │  │ - Transitions│     │
│  │ - Layout     │  │ - Timeline   │  └──────────────┘     │
│  │ - Header     │  │ - Stats      │                        │
│  │ - Buttons    │  │ - Theme UI   │  ┌──────────────┐     │
│  └──────────────┘  └──────────────┘  │animations.css│     │
│                                       │              │     │
│                                       │ - Keyframes  │     │
│                                       │ - Reveals    │     │
│                                       │ - Hovers     │     │
│                                       │ - Loading    │     │
│                                       └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   JAVASCRIPT MODULE ARCHITECTURE             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  main.js (Core)                      │  │
│  │  - Mobile menu toggle                                │  │
│  │  - Smooth scroll navigation                          │  │
│  │  - Header scroll effects                             │  │
│  │  - Active nav highlighting                           │  │
│  │  - Lazy image loading (IntersectionObserver)         │  │
│  │  - Keyboard navigation                               │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          theme-toggle.js (ThemeManager)              │  │
│  │  - Dark/Light mode switching                         │  │
│  │  - LocalStorage persistence                          │  │
│  │  - System preference detection                       │  │
│  │  - Theme change events                               │  │
│  │  - Flash prevention                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         animations.js (Animation Engine)             │  │
│  │  - ScrollReveal (IntersectionObserver)               │  │
│  │  - ParallaxScroll (requestAnimationFrame)            │  │
│  │  - CountUpAnimation (stats)                          │  │
│  │  - TypedText (dynamic text)                          │  │
│  │  - ProgressBar (skill bars)                          │  │
│  │  - Reduced motion support                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         analytics.js (AnalyticsManager)              │  │
│  │  - Privacy-focused event tracking                    │  │
│  │  - Page view tracking                                │  │
│  │  - Click/interaction tracking                        │  │
│  │  - Performance metrics (Core Web Vitals)             │  │
│  │  - Scroll depth tracking                             │  │
│  │  - Time on page tracking                             │  │
│  │  - Custom event API                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

#### 1. Core Layer (main.js)

**Purpose**: Foundation interactions and navigation

- DOM manipulation for UI elements
- Event delegation for performance
- Intersection Observer for lazy loading
- Debouncing for scroll events

#### 2. Theme Layer (theme-toggle.js)

**Purpose**: User experience customization

- Singleton ThemeManager class
- localStorage for preference persistence
- System preference detection via media queries
- Custom event emission for theme changes

#### 3. Animation Layer (animations.js)

**Purpose**: Visual polish and engagement

- Class-based architecture for reusability
- Performance-optimized (requestAnimationFrame)
- Intersection Observer for scroll triggers
- Respects prefers-reduced-motion

#### 4. Analytics Layer (analytics.js)

**Purpose**: Behavior insights and optimization

- Privacy-first approach (no PII)
- Performance monitoring (Web Vitals)
- Event aggregation in memory
- Beacon API for reliability

---

## Data Flow

### Page Load Flow

```
1. DNS Resolution
   └─> CloudFlare DNS (optimized routing)

2. Initial Request
   └─> CloudFlare Edge Server (nearest location)
       ├─> Cache HIT → Return cached HTML
       └─> Cache MISS → Fetch from S3

3. HTML Parse & Render
   ├─> Parse HTML (DOM construction)
   ├─> Discover critical CSS (preloaded)
   ├─> Apply inline styles
   └─> First Contentful Paint (FCP)

4. Resource Discovery
   ├─> CSS files (main, components, themes, animations)
   ├─> JavaScript files (deferred: main, theme, animations, analytics)
   └─> Images (lazy loaded via IntersectionObserver)

5. JavaScript Initialization
   ├─> Theme Manager (immediate, prevent flash)
   ├─> Main.js (DOMContentLoaded)
   ├─> Animations (DOMContentLoaded)
   └─> Analytics (DOMContentLoaded)

6. Interactive Ready
   └─> Time to Interactive (TTI)
```

### Theme Switching Flow

```
User Action: Click theme toggle button
     │
     ▼
ThemeManager.toggleTheme()
     │
     ├─> Determine new theme (dark ↔ light)
     │
     ├─> Update document.documentElement.setAttribute('data-theme', newTheme)
     │   └─> CSS variables automatically update
     │       └─> Visual transition (300ms)
     │
     ├─> Save to localStorage.setItem('dharambhushan-theme', newTheme)
     │
     ├─> Update button aria-label (accessibility)
     │
     └─> Dispatch custom 'themechange' event
         └─> Other modules can listen and react
```

### Animation Trigger Flow

```
Page Load
     │
     ▼
ScrollReveal.init()
     │
     ├─> Create IntersectionObserver
     │
     ├─> Query all .reveal elements
     │
     └─> Observe each element
         │
         ▼
User Scrolls
         │
         ▼
Element enters viewport (threshold: 15%)
         │
         ▼
IntersectionObserver callback fires
         │
         ├─> Check entry.isIntersecting
         │
         ├─> Add 'active' class to element
         │   └─> CSS transition triggers (opacity, transform)
         │
         └─> Unobserve element (if animateOnce: true)
```

### Analytics Event Flow

```
User Interaction (click, scroll, form submit)
     │
     ▼
Event Listener Captures Event
     │
     ▼
AnalyticsManager.sendEvent()
     │
     ├─> Add session_id
     ├─> Add timestamp
     ├─> Store in local events array
     │
     ├─> [Optional] Log to console (debug mode)
     │
     └─> Send to analytics provider
         ├─> Google Analytics 4 (gtag)
         ├─> Plausible Analytics
         └─> Custom endpoint (fetch/sendBeacon)
```

---

## Deployment Architecture

### AWS S3 Configuration

```
S3 Bucket: dharambhushan.com
├── Static Website Hosting: Enabled
│   ├── Index document: index.html
│   └── Error document: index.html (SPA fallback)
│
├── Bucket Policy:
│   └── Public read access for CloudFlare IPs
│
├── Server-Side Encryption: AES-256
│
├── Versioning: Enabled
│   └── Allows rollback on deployment issues
│
└── Lifecycle Policy:
    └── Old versions retention: 30 days
```

### CloudFlare CDN Configuration

```
CloudFlare Configuration
├── DNS Management
│   ├── A Record: @ → S3 endpoint
│   └── CNAME Record: www → dharambhushan.com
│
├── SSL/TLS
│   ├── Mode: Full (Strict)
│   ├── Certificate: CloudFlare Universal SSL
│   └── Edge Certificates: Auto-renewed
│
├── Caching
│   ├── Cache Level: Standard
│   ├── Browser Cache TTL: 4 hours
│   ├── Edge Cache TTL: 1 month (static assets)
│   └── Cache Rules:
│       ├── HTML: Cache, revalidate hourly
│       ├── CSS/JS: Cache, 1 year (versioned)
│       └── Images: Cache, 1 year
│
├── Performance
│   ├── Auto Minify: HTML, CSS, JS
│   ├── Brotli Compression: Enabled
│   ├── HTTP/2: Enabled
│   ├── HTTP/3 (QUIC): Enabled
│   └── Early Hints: Enabled
│
├── Security
│   ├── DDoS Protection: Enabled (automatic)
│   ├── WAF: Basic rules enabled
│   ├── Security Level: Medium
│   └── Bot Fight Mode: Enabled
│
└── Speed
    ├── Rocket Loader: Disabled (manual optimization)
    └── Mirage: Enabled (image optimization)
```

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

Developer Machine
     │
     ├─> 1. Code Changes
     │      └─> Edit HTML/CSS/JS
     │
     ├─> 2. Local Validation
     │      ├─> npm run validate (HTML + CSS linting)
     │      ├─> Manual testing (npm run dev)
     │      └─> Lighthouse audit (npm run lighthouse)
     │
     ├─> 3. Build Process
     │      ├─> npm run optimize:css (minification)
     │      ├─> npm run optimize:js (terser)
     │      └─> npm run optimize:images (manual)
     │
     ├─> 4. Deploy to S3
     │      ├─> aws s3 sync . s3://dharambhushan.com
     │      ├─> Set cache-control headers
     │      └─> Exclude dev files (node_modules, .git)
     │
     └─> 5. Invalidate CloudFlare Cache
            └─> aws cloudfront create-invalidation

Verification Steps:
     ├─> Smoke test production URL
     ├─> Lighthouse performance check
     └─> Manual cross-browser testing
```

### Deployment Commands

```bash
# Full deployment pipeline
npm run deploy

# Individual steps
npm run build          # Prepare optimized assets
npm run deploy:s3      # Upload to S3
npm run invalidate:cloudflare  # Clear CDN cache

# Validation before deploy
npm run validate       # Lint HTML & CSS
npm run lighthouse     # Performance audit
```

---

## Performance Strategy

### Core Web Vitals Targets

| Metric                             | Target  | Current | Strategy                                        |
| ---------------------------------- | ------- | ------- | ----------------------------------------------- |
| **LCP** (Largest Contentful Paint) | < 1.5s  | ~1.2s   | Preload critical CSS, optimize hero images      |
| **FID** (First Input Delay)        | < 100ms | ~50ms   | Defer non-critical JS, efficient event handlers |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | ~0.05   | Size attributes on images, no dynamic injection |
| **TTFB** (Time to First Byte)      | < 600ms | ~200ms  | CloudFlare edge caching                         |
| **TTI** (Time to Interactive)      | < 3s    | ~2.5s   | Minimal JavaScript, deferred loading            |

### Performance Optimizations

#### 1. Critical Rendering Path

```html
<!-- Preload critical CSS -->
<link rel="preload" href="/css/main.css" as="style" />
<link rel="preload" href="/css/themes.css" as="style" />

<!-- Defer non-critical JS -->
<script src="/js/main.js" defer></script>
<script src="/js/animations.js" defer></script>
```

#### 2. Resource Optimization

- **CSS**: Minified, combined where logical, critical CSS inlined (future)
- **JavaScript**: Minified with Terser, tree-shaking, code splitting (future)
- **Images**: WebP with fallbacks, lazy loading, responsive srcset
- **Fonts**: System fonts only (no external font loading)

#### 3. Caching Strategy

```
Layer 1: Browser Cache (Cache-Control headers)
├── HTML: max-age=3600, must-revalidate
├── CSS/JS: max-age=31536000 (1 year, versioned)
└── Images: max-age=31536000 (1 year)

Layer 2: CloudFlare Edge Cache
├── Global distribution (200+ data centers)
├── Automatic cache optimization
└── Smart tiered caching

Layer 3: Browser Memory Cache
└── Automatic by browser
```

#### 4. JavaScript Performance

- **IntersectionObserver**: Efficient scroll-based interactions
- **requestAnimationFrame**: Smooth animations, no jank
- **Debouncing**: Reduce scroll event frequency
- **Event Delegation**: Single listener for multiple elements
- **Lazy Loading**: Images loaded on-demand

#### 5. Network Optimization

- **HTTP/2**: Multiplexing, header compression
- **HTTP/3**: QUIC protocol for faster handshakes
- **Brotli Compression**: Better than gzip (15-20% improvement)
- **Early Hints**: Preload resources before full response

---

## Security Architecture

### Threat Model

```
┌─────────────────────────────────────────────────────────────┐
│                       THREAT ANALYSIS                        │
└─────────────────────────────────────────────────────────────┘

Low Risk (Static Site):
✓ SQL Injection         → No database
✓ XSS (Server)          → No server-side processing
✓ CSRF                  → No state-changing operations
✓ Session Hijacking     → No authentication system

Medium Risk:
⚠ XSS (Client)          → Mitigated by CSP, input sanitization
⚠ DDoS                  → Mitigated by CloudFlare protection
⚠ Content Tampering     → Mitigated by HTTPS, S3 permissions

Monitoring Required:
◆ Analytics Privacy     → No PII collection
◆ Third-party Scripts   → Minimal, audited dependencies
```

### Security Controls

#### 1. Transport Security

```
HTTPS Enforcement:
├── CloudFlare SSL/TLS (Full Strict mode)
├── HSTS Header: max-age=31536000; includeSubDomains
├── Certificate: CloudFlare Universal SSL (auto-renewed)
└── Protocol: TLS 1.2+ only
```

#### 2. Content Security Policy (Future Enhancement)

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' *.amazonaws.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
"
/>
```

#### 3. S3 Bucket Security

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dharambhushan.com/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["CloudFlare IP ranges"]
        }
      }
    }
  ]
}
```

#### 4. CloudFlare Security Features

- **DDoS Protection**: Automatic, always-on
- **WAF Rules**: Block common attack patterns
- **Bot Management**: Challenge suspicious traffic
- **Rate Limiting**: Prevent abuse (future)
- **Firewall Rules**: Geographic restrictions (if needed)

#### 5. Privacy & Data Protection

- **No PII Collection**: Analytics track actions, not users
- **No Cookies**: Theme preference in localStorage only
- **No Third-party Tracking**: No Google Analytics pixel (yet)
- **GDPR Compliant**: Minimal data processing

---

## Code Quality & Style Guidelines

### Overview

The project implements a comprehensive code quality infrastructure to ensure consistency, maintainability, and adherence to best practices across all code. This section documents the linting tools, code style standards, and enforcement mechanisms.

### Linting Infrastructure

#### Tools & Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                  CODE QUALITY TOOLCHAIN                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PRE-COMMIT LAYER (Automated Enforcement)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Husky + lint-staged                                  │  │
│  │  - Runs on git commit                                 │  │
│  │  - Stages only modified files                         │  │
│  │  - Blocks commit on failure                           │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ HTML Layer   │    │  CSS Layer   │    │   JS Layer   │
│              │    │              │    │              │
│ HTMLHint     │    │ Stylelint    │    │  ESLint      │
│ + Prettier   │    │ + Prettier   │    │  + Prettier  │
└──────────────┘    └──────────────┘    └──────────────┘

┌──────────────────────────────────────────────────────────────┐
│  FORMATTING LAYER (Cross-file Consistency)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Prettier                                             │  │
│  │  - 100 character line width                           │  │
│  │  - Single quotes                                      │  │
│  │  - 2-space indentation (CSS/JS)                       │  │
│  │  - Trailing commas (ES5)                              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  EDITOR LAYER (Developer Experience)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  EditorConfig                                         │  │
│  │  - Charset: UTF-8                                     │  │
│  │  - Line endings: LF                                   │  │
│  │  - Trailing whitespace: Trim                          │  │
│  │  - Final newline: Insert                              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Configuration Files

**1. HTMLHint** (`.htmlhintrc`)

```json
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true,
  "space-tab-mixed-disabled": "space",
  "indent-style": "space"
}
```

**Purpose**: Enforce HTML5 best practices, semantic structure, and accessibility standards.

**2. Stylelint** (`.stylelintrc.json`)

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "selector-pseudo-class-no-unknown": [true, { "ignorePseudoClasses": ["global"] }],
    "property-no-unknown": true,
    "declaration-block-no-duplicate-properties": true,
    "block-no-empty": true,
    "selector-class-pattern": "^[a-z][a-zA-Z0-9-]*$",
    "keyframes-name-pattern": null,
    "property-no-vendor-prefix": null
  }
}
```

**Purpose**: Enforce CSS consistency, prevent errors, maintain naming conventions.

**Key Rules**:

- Class names: kebab-case or camelCase
- Colors: Lowercase hex, short notation
- No duplicate properties (except vendor prefixes)
- Allow necessary `-webkit-` prefixes
- Allow camelCase animation names

**3. ESLint** (`eslint.config.js`)

```javascript
export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        // ... (browser globals)
        // Analytics
        gtag: 'readonly',
        plausible: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
    },
  },
];
```

**Purpose**: Enforce modern JavaScript practices, ES2021 standards, code consistency.

**Key Rules**:

- Modern syntax: `const`/`let`, arrow functions, template literals
- Code style: 2-space indentation, single quotes, semicolons
- Code quality: No unused vars, prefer destructuring
- Warnings: Console statements (useful for debugging)

**4. Prettier** (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "htmlWhitespaceSensitivity": "css",
  "endOfLine": "lf"
}
```

**Purpose**: Automatic code formatting for consistency across all file types.

**5. EditorConfig** (`.editorconfig`)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space

[*.{css,js}]
indent_size = 2

[*.html]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
```

**Purpose**: Editor-agnostic settings for consistent development experience.

---

### Code Style Standards

#### HTML Standards

**Structure**:

- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- Proper nesting and hierarchy
- 4-space indentation

**Accessibility**:

- ARIA labels on interactive elements
- Alt text on all images
- Semantic roles where appropriate
- Keyboard navigation support

**SEO**:

- Meta tags: title, description, Open Graph, Twitter Cards
- Structured data (JSON-LD, Schema.org)
- Canonical URLs

**Example**:

```html
<section class="hero-section" id="about">
  <div class="container">
    <h2 class="section-title">About Me</h2>
    <p class="section-description">Professional summary...</p>
  </div>
</section>
```

---

#### CSS Standards

**Naming Convention**: BEM-inspired, flexible

```css
/* Component */
.hero-section {
}

/* Element within component */
.hero-title {
}

/* Modifier */
.hero-section--dark {
}
```

**Organization**:

1. CSS Variables (`:root`)
2. Reset/Base styles
3. Typography
4. Layout (grid, flex)
5. Components
6. Utilities
7. Media queries

**Best Practices**:

- Use CSS custom properties for theming
- Mobile-first media queries
- Avoid `!important` (except for utilities)
- Logical property order: positioning → box model → typography → visual → misc

**Example**:

```css
.card {
  /* Positioning */
  position: relative;
  z-index: 1;

  /* Box Model */
  display: flex;
  width: 100%;
  padding: var(--space-lg);
  margin-bottom: var(--space-md);

  /* Typography */
  font-size: var(--text-base);
  line-height: 1.6;

  /* Visual */
  background: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);

  /* Misc */
  transition: transform var(--transition-base);
}
```

---

#### JavaScript Standards

**Modern ES2021 Features**:

```javascript
// Use const/let, not var
const apiKey = 'abc123';
let counter = 0;

// Arrow functions
const add = (a, b) => a + b;

// Template literals
const message = `Hello, ${name}!`;

// Destructuring
const { title, description } = page;

// Object shorthand
const user = { name, email };

// Default parameters
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}

// Optional chaining
const username = user?.profile?.name;

// Nullish coalescing
const port = config.port ?? 3000;
```

**Module Structure**:

```javascript
// 1. Imports (if using modules)
// 2. Constants
const CONFIG = {
  timeout: 5000,
  retries: 3,
};

// 3. Utility functions
const formatDate = date => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

// 4. Main functionality
class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme();
  }

  getStoredTheme() {
    return localStorage.getItem('theme') || 'dark';
  }

  toggleTheme() {
    // Implementation
  }
}

// 5. Initialization
document.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  themeManager.init();
});
```

**Error Handling**:

```javascript
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  showErrorMessage('Unable to load content');
}
```

**Performance Best Practices**:

- Use `IntersectionObserver` for scroll events
- Debounce/throttle high-frequency events
- Use `requestAnimationFrame` for animations
- Event delegation for dynamic elements
- Lazy load non-critical resources

---

### Pre-commit Hooks

#### Configuration

**File**: `.husky/pre-commit`

```bash
npx lint-staged
```

**File**: `package.json` → `lint-staged`

```json
{
  "lint-staged": {
    "*.html": ["htmlhint", "prettier --write"],
    "*.css": ["stylelint --fix", "prettier --write"],
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

#### Workflow

```
Developer runs: git commit -m "message"
     │
     ▼
Husky pre-commit hook triggers
     │
     ▼
lint-staged identifies staged files
     │
     ├─> HTML files
     │   ├─> Run HTMLHint validation
     │   └─> Format with Prettier
     │
     ├─> CSS files
     │   ├─> Run Stylelint (with --fix)
     │   └─> Format with Prettier
     │
     ├─> JavaScript files
     │   ├─> Run ESLint (with --fix)
     │   └─> Format with Prettier
     │
     └─> JSON/Markdown files
         └─> Format with Prettier
     │
     ▼
All checks pass?
     │
     ├─> YES: Commit proceeds
     └─> NO: Commit blocked, errors displayed
```

#### Benefits

1. **Consistency**: All code follows same style
2. **Quality**: Catch errors before commit
3. **Automation**: No manual linting needed
4. **Documentation**: Code style is enforced, not just suggested
5. **Collaboration**: New contributors automatically follow standards

---

### npm Scripts

```json
{
  "scripts": {
    "lint": "npm run lint:html && npm run lint:css && npm run lint:js",
    "lint:html": "npx htmlhint '*.html'",
    "lint:css": "npx stylelint 'css/**/*.css'",
    "lint:js": "npx eslint 'js/**/*.js'",
    "lint:fix": "npm run lint:css -- --fix && npm run lint:js -- --fix",
    "format": "npx prettier --write '**/*.{html,css,js,json,md}'",
    "format:check": "npx prettier --check '**/*.{html,css,js,json,md}'",
    "validate:all": "npm run format:check && npm run lint"
  }
}
```

**Usage**:

```bash
# Check all code
npm run lint

# Auto-fix issues
npm run lint:fix

# Format everything
npm run format

# Pre-deploy validation
npm run validate:all
```

---

### Code Review Checklist

Before merging code, ensure:

#### HTML

- [ ] Semantic HTML5 elements used
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text on images
- [ ] ARIA labels on interactive elements
- [ ] No inline styles (use classes)
- [ ] 4-space indentation

#### CSS

- [ ] BEM-inspired naming convention
- [ ] CSS variables for theme values
- [ ] Mobile-first media queries
- [ ] No `!important` (except utilities)
- [ ] Logical property ordering
- [ ] 2-space indentation

#### JavaScript

- [ ] ES2021 features used (const/let, arrow functions)
- [ ] No `var` declarations
- [ ] Error handling for async operations
- [ ] Performance considerations (debounce, IntersectionObserver)
- [ ] No console.log in production code (or documented exceptions)
- [ ] 2-space indentation

#### General

- [ ] All linters pass (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No unused variables or functions
- [ ] Comments for complex logic
- [ ] Accessibility tested
- [ ] Performance impact considered

---

### Exceptions & Overrides

#### When to Disable Rules

Use ESLint/Stylelint disable comments sparingly:

```javascript
// Valid exception: Third-party library requires console
// eslint-disable-next-line no-console
console.log('Required by analytics library');

// Valid exception: Generated code
/* eslint-disable */
const generated = require('./generated-code');
/* eslint-enable */
```

```css
/* Valid exception: Browser-specific fix */
/* stylelint-disable property-no-vendor-prefix */
.gradient-text {
  -webkit-background-clip: text;
  background-clip: text;
}
/* stylelint-enable property-no-vendor-prefix */
```

#### Invalid Exceptions

```javascript
// INVALID: Disabling because you don't want to fix
// eslint-disable-next-line no-unused-vars
const unused = true;

// INVALID: Disabling entire file
/* eslint-disable */
```

---

### Maintenance

#### Updating Rules

1. Discuss rule changes with team
2. Update configuration file
3. Run `npm run lint:fix` to auto-fix existing code
4. Manually fix remaining issues
5. Update this documentation
6. Commit changes

#### Adding New Rules

```bash
# Install new plugin
npm install --save-dev eslint-plugin-security

# Update eslint.config.js
# Test on codebase
npm run lint

# Document in this section
```

---

### Metrics & Compliance

**Current Status** (as of 2025-10-13):

- **HTML**: 5 files, 0 errors, 0 warnings ✅
- **CSS**: 4 files, 0 errors, 4 specificity notices (non-breaking) ✅
- **JavaScript**: 5 files, 0 errors, 30 warnings (19 console, 11 unused vars) ⚠️

**Compliance Target**: 100% error-free, < 10 warnings

**Action Items**:

1. Remove unnecessary console statements (reduce 19 → 5)
2. Clean up unused variables (reduce 11 → 0)
3. Address CSS specificity notices (optional)

---

## Design Decisions

### 1. Why Vanilla JavaScript?

**Decision**: Use vanilla JavaScript instead of React/Vue/Angular

**Rationale**:

- **Performance**: Zero framework overhead (~40-150KB saved)
- **Simplicity**: Portfolio site doesn't require complex state management
- **Load Time**: Faster initial load, critical for first impressions
- **Maintainability**: Standard APIs, no framework lock-in
- **Learning Curve**: Any developer can contribute

**Trade-offs**:

- More manual DOM manipulation
- No built-in component system
- Less developer tooling

**Validation**: Lighthouse scores 95+ on all metrics

---

### 2. Why S3 + CloudFlare over AWS CloudFront?

**Decision**: Use CloudFlare CDN instead of AWS CloudFront

**Rationale**:

- **Cost**: CloudFlare free tier sufficient for portfolio traffic
- **Performance**: CloudFlare has more edge locations
- **Features**: Better free SSL, automatic optimizations
- **Developer Experience**: Simpler configuration
- **Flexibility**: Easy to switch origins

**Trade-offs**:

- Less AWS ecosystem integration
- Potential vendor lock-in (mitigated by standard S3 origin)

---

### 3. Why Dark Mode Default?

**Decision**: Default to dark theme with light mode option

**Rationale**:

- **AWS Brand Alignment**: AWS developer tools use dark themes
- **Professional**: Conveys technical sophistication
- **User Preference**: Most developers prefer dark mode
- **Accessibility**: Reduced eye strain in low light
- **System Respect**: Auto-detect prefers-color-scheme

**Implementation**:

- Theme preference persisted in localStorage
- Flash prevention via inline script
- Smooth 300ms transition between themes

---

### 4. Why No Build Step for Development?

**Decision**: Optional build step, not required for development

**Rationale**:

- **Simplicity**: Direct file editing, instant refresh
- **Debugging**: Unminified code easier to debug
- **Onboarding**: No complex build tools to learn
- **Flexibility**: Can deploy unminified for testing

**Build Process**: Only used for production optimization

- CSS minification (clean-css-cli)
- JS minification (Terser)
- Image optimization (manual, ImageOptim)

---

### 5. Why IntersectionObserver for Animations?

**Decision**: Use IntersectionObserver API for scroll animations

**Rationale**:

- **Performance**: No scroll event listeners (passive, async)
- **Battery Life**: Browser-optimized, efficient
- **Accuracy**: Precise viewport detection
- **Flexibility**: Easy threshold configuration
- **Fallback**: Graceful degradation for old browsers

**Alternative Considered**: Scroll event with throttling

- Higher CPU usage
- More complex code
- Worse mobile performance

---

## Future Considerations

### Scalability

#### Traffic Growth

- **Current**: ~1,000 visits/month expected
- **CloudFlare**: Can handle 10M+ requests on free tier
- **S3**: Unlimited scalability
- **Cost**: < $5/month at 100K visits

**Action Item**: Monitor CloudFlare analytics monthly

#### Content Growth

- **Current**: Single-page application
- **Future**: Blog, case studies, project pages
- **Strategy**: Add dynamic routing via S3 subpaths
- **SEO**: Implement proper meta tags per page

---

### Technical Debt

1. **Critical CSS Inlining**
   - Current: 4 CSS files, render-blocking
   - Goal: Inline critical CSS, defer rest
   - Impact: 200-300ms faster FCP

2. **Image Format Modernization**
   - Current: PNG/JPG with manual optimization
   - Goal: Automatic WebP/AVIF with fallbacks
   - Tool: CloudFlare Polish or AWS Lambda

3. **Service Worker (PWA)**
   - Current: No offline support
   - Goal: Cache assets for offline viewing
   - Impact: Faster repeat visits, offline resume viewing

4. **Build Pipeline Automation**
   - Current: Manual npm commands
   - Goal: GitHub Actions CI/CD
   - Benefit: Automatic deploy on git push

---

### Performance Enhancements

#### Short-term (Next 3 months)

- [ ] Implement critical CSS inlining
- [ ] Add WebP images with fallbacks
- [ ] Enable CloudFlare APO (Automatic Platform Optimization)
- [ ] Add resource hints (dns-prefetch, preconnect)

#### Medium-term (3-6 months)

- [ ] Implement Service Worker for caching
- [ ] Add page transitions for SPA feel
- [ ] Lazy load below-fold CSS
- [ ] Implement font subsetting (if custom fonts added)

#### Long-term (6-12 months)

- [ ] Migrate to HTTP/3 Push (when widely supported)
- [ ] Implement AI-powered performance monitoring
- [ ] A/B test layout variations
- [ ] Add GraphQL layer for dynamic content (if needed)

---

### Monitoring & Observability

#### Current Monitoring

- CloudFlare Analytics (traffic, bandwidth, threats)
- Browser console (errors via window.onerror)
- Lighthouse audits (manual, weekly)

#### Planned Monitoring

- **Real User Monitoring (RUM)**
  - Tool: CloudFlare Web Analytics or Sentry
  - Metrics: Core Web Vitals from real users
  - Alerts: Performance degradation

- **Error Tracking**
  - Tool: Sentry (free tier)
  - Capture: JavaScript errors, promise rejections
  - Context: User agent, page URL, stack traces

- **Uptime Monitoring**
  - Tool: AWS Route 53 Health Checks or UptimeRobot
  - Check: Every 5 minutes
  - Alert: Email on 3 consecutive failures

---

### Accessibility Enhancements

#### Current: WCAG 2.1 AA Compliant

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Skip links for screen readers
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators on all interactive elements
- Reduced motion support

#### Future: WCAG 2.1 AAA Goal

- [ ] Higher contrast ratio (7:1)
- [ ] Add audio descriptions for video content (if added)
- [ ] Implement high contrast theme option
- [ ] Add sign language interpretations (if video added)
- [ ] Conduct automated accessibility testing (axe-core)
- [ ] User testing with assistive technologies

---

## Conclusion

This architecture document provides a comprehensive overview of the technical design for dharambhushan.com. The architecture prioritizes performance, simplicity, and maintainability while leveraging AWS and CloudFlare for scalability and reliability.

### Key Takeaways

1. **Simple by Design**: Vanilla stack eliminates complexity
2. **Performance First**: Sub-1.5s load time achieved
3. **Scalable**: CDN-first approach handles traffic growth
4. **Secure**: HTTPS + CloudFlare protection
5. **Cost-Effective**: < $5/month operating cost

### Document Maintenance

This document should be updated:

- When architectural changes are made
- After major feature additions
- Quarterly during architecture reviews
- When performance targets are adjusted

**Document Owner**: Dharam Bhushan
**Review Cycle**: Quarterly
**Last Review**: 2025-10-13
**Next Review**: 2026-01-13

---

_For technical questions or clarifications, contact the development team._
