# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Professional portfolio website for Dharam Bhushan - AWS Engineering Manager specializing in AI/ML services and data platforms. Static site built with vanilla HTML/CSS/JavaScript, deployed using AWS CDK infrastructure as code, hosted on AWS S3 with CloudFlare CDN.

**Technology Stack**: Vanilla JavaScript (ES2021), HTML5, CSS3 (no frameworks)
**Infrastructure**: AWS CDK (TypeScript) for S3 bucket
**Hosting**: AWS S3 (bucket: dharam-personal-website-257641256327) + CloudFlare CDN
**AWS Account**: 257641256327 (region: us-west-2)
**Deployment**: Bash scripts for automated deployment
**Performance Target**: < 1.5s initial load, Lighthouse score > 95

## Development Commands

### Local Development

```bash
# Install dependencies (first time only)
npm install

# Start development server on http://localhost:3000 (serves src/ directory)
npm run dev
```

### Code Quality & Linting

```bash
# Run all linters (HTML, CSS, JavaScript)
npm run lint

# Run linters with auto-fix
npm run lint:fix

# Format all code with Prettier
npm run format

# Check formatting without changes
npm run format:check

# Validate everything (format check + all linters)
npm run validate:all

# Individual linters
npm run lint:html       # HTMLHint validation
npm run lint:css        # Stylelint validation
npm run lint:js         # ESLint validation
```

### Build & Optimization

```bash
# Build and validate website (runs build.sh script)
npm run build

# Run all optimizations (CSS minification, JS minification)
npm run optimize

# Individual optimizations
npm run optimize:css    # Minify CSS with clean-css-cli
npm run optimize:js     # Minify JavaScript with Terser
npm run optimize:images # Manual image optimization (placeholder)
```

### Performance Testing

```bash
# Run Lighthouse performance audit (opens in browser)
npm run lighthouse

# Legacy HTML + CSS validation only
npm run validate
```

### Infrastructure Deployment

```bash
# Install CDK dependencies (first time only)
npm run infra:install

# Bootstrap CDK in AWS account (first time only)
npm run infra:bootstrap

# Deploy S3 bucket infrastructure
npm run infra:deploy

# Preview infrastructure changes
npm run infra:diff

# Synthesize CloudFormation template
npm run infra:synth

# Destroy infrastructure (WARNING: deletes bucket)
npm run infra:destroy
```

### Website Deployment

```bash
# Full deployment: build + upload to S3 + invalidate CloudFlare cache
npm run deploy

# Individual deployment steps
npm run build                # Build and validate website (./scripts/build.sh)
npm run deploy:s3            # Upload to S3 bucket (./scripts/deploy.sh)
npm run deploy:cloudflare    # Clear CloudFlare CDN cache (./scripts/invalidate-cache.sh)
```

**Environment Variables Required**:

- `S3_BUCKET_NAME` (default: dharam-personal-website-257641256327)
- `AWS_REGION` (default: us-west-2)
- `CLOUDFLARE_ZONE_ID` (for cache invalidation)
- `CLOUDFLARE_API_TOKEN` (for cache invalidation)

**AWS Account**: 257641256327 (us-west-2)
**AWS Credentials**: Run `source ~/aws-credentials-export.zsh` to export credentials via IAM Roles Anywhere

## Architecture & Code Structure

### High-Level Architecture Pattern

**JAMstack (Static Site + CDN)**

- Client (browsers) → CloudFlare CDN (global edge caching) → AWS S3 (origin)
- No server-side processing, all static assets
- Performance through aggressive edge caching
- Security through HTTPS + DDoS protection

### File Organization

```
/
├── src/                        # Website source files
│   ├── index.html             # Main landing page with hero section
│   ├── html/                  # Additional pages
│   │   ├── ai_services.html   # AI/ML services portfolio (8 services)
│   │   ├── data_platform.html # Data platform projects (4 platforms)
│   │   ├── leadership.html    # Management style & leadership
│   │   ├── contact.html       # Contact form
│   │   └── diagrams/          # Architecture diagram HTML files
│   │       └── .htmlhintrc    # Directory-specific HTMLHint config
│   ├── css/                   # Modular CSS architecture
│   │   ├── main.css           # Core styles, variables, reset, typography, layout
│   │   ├── components.css     # Reusable UI components (cards, grids, badges, timeline)
│   │   ├── themes.css         # Dark/light theme definitions with CSS variables
│   │   └── animations.css     # Keyframes, transitions, scroll effects
│   ├── js/                    # JavaScript modules
│   │   ├── main.js            # Core functionality (nav, scroll, lazy loading)
│   │   ├── theme-toggle.js    # ThemeManager class for dark/light mode
│   │   ├── animations.js      # ScrollReveal, ParallaxScroll, CountUp animations
│   │   ├── modal.js           # ImageModal class for diagram/image viewing
│   │   ├── contact-form.js    # Web3Forms integration for contact form
│   │   ├── neural-network.js  # Canvas-based neural network animation
│   │   ├── analytics.js       # Privacy-focused analytics tracking
│   │   └── config.js          # Configuration (git-ignored, use config.example.js)
│   └── assets/
│       ├── images/            # Service diagrams, screenshots, profile photo
│       ├── icons/             # Favicons, technology logos
│       └── resume/            # PDF resume downloads
├── infrastructure/            # AWS CDK infrastructure
│   ├── bin/
│   │   └── s3-stack.ts       # CDK app entry point
│   ├── lib/
│   │   └── website-bucket-stack.ts  # S3 bucket stack definition
│   ├── cdk.json              # CDK configuration
│   ├── package.json          # CDK dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── README.md             # Infrastructure documentation
├── scripts/                   # Deployment automation
│   ├── build.sh              # Build and validate website
│   ├── deploy.sh             # Deploy to S3 with cache headers
│   └── invalidate-cache.sh   # Purge CloudFlare cache
├── docs/
│   └── cloudflare-setup.md   # CloudFlare CDN configuration guide
├── dist/                      # Build output (git-ignored)
│   ├── css/                  # Minified CSS
│   └── js/                   # Minified JavaScript
```

### CSS Architecture

**Module Responsibilities**:

- `main.css`: CSS variables (`:root`), reset, typography, base layout, header/footer
- `components.css`: Reusable components (cards, project grids, badges, stats, timeline)
- `themes.css`: Color schemes for dark/light modes via `data-theme` attribute
- `animations.css`: Keyframe animations, reveal effects, hover transitions

**Naming Convention**: BEM-inspired, flexible

- Component: `.hero-section`
- Element: `.hero-title`
- Modifier: `.hero-section--dark`

**Theming System**: CSS custom properties switched via `data-theme="dark|light"` on `<html>` element

### JavaScript Architecture

**Design Pattern**: Modular, class-based where appropriate, vanilla JavaScript (no frameworks)

**Key Modules**:

1. **main.js** - Core functionality
   - Mobile menu toggle with accessibility
   - Smooth scroll for anchor links
   - Header scroll effects (shadow on scroll)
   - Active nav link highlighting based on scroll position
   - Lazy image loading via IntersectionObserver
   - Debounce utility for performance
   - Keyboard navigation support

2. **theme-toggle.js** - ThemeManager class (singleton)
   - Dark/light mode switching
   - Persists to `localStorage` as `dharambhushan-theme`
   - Auto-detects system preference via `prefers-color-scheme`
   - Prevents flash of unstyled content
   - Emits `themechange` custom event

3. **animations.js** - Animation classes
   - `ScrollReveal`: IntersectionObserver-based scroll animations for `.reveal` elements
   - `ParallaxScroll`: Subtle parallax effects using `requestAnimationFrame`
   - `CountUpAnimation`: Animated number counters for stats
   - Respects `prefers-reduced-motion` for accessibility

4. **modal.js** - ImageModal class
   - Manages architecture diagram and service output image modals
   - Maps service cards via `data-modal` attribute to images
   - Supports multiple image types per modal (`architecture`, `output`)
   - Image mapping stored in `imageMap` object
   - Example: `data-modal="recommendation-engine"` → loads images from `imageMap['recommendation-engine']`

5. **contact-form.js** - ContactForm class
   - Web3Forms API integration for contact form submissions (https://web3forms.com)
   - Access key stored directly in HTML hidden input field
   - Client-side form validation (email, required fields)
   - Handles form submission states (loading, success, error)
   - Uses fetch API to submit form data to Web3Forms endpoint

6. **neural-network.js** - NeuralNetworkBackground class
   - Canvas-based animated neural network visualization for AI-themed backgrounds
   - Automatically initializes on pages with specific container IDs
   - Supports both section-specific (like `#home`) and full-page backgrounds (`.neural-network-background`)
   - 50 animated nodes with AWS-themed colors (orange/blue)
   - Interactive: connections highlight on mouse hover
   - Respects `prefers-reduced-motion` for accessibility
   - Uses `requestAnimationFrame` for 60fps performance

7. **analytics.js** - AnalyticsManager class
   - Privacy-focused event tracking (no PII)
   - Tracks page views, clicks, scroll depth, time on page
   - Core Web Vitals monitoring (LCP, FID, CLS)
   - Beacon API for reliable event sending

**Performance Patterns**:

- IntersectionObserver for scroll-based triggers (no scroll event listeners)
- requestAnimationFrame for smooth animations
- Debouncing for high-frequency events
- Event delegation for dynamic elements
- Lazy loading for images and non-critical resources

### Modal System Architecture (Important)

The modal system in `modal.js` handles displaying architecture diagrams and service output images for AI/ML service cards:

**How It Works**:

1. Service cards in `html/ai_services.html` have `data-modal="<service-id>"` attribute
2. Buttons within cards have classes: `.architecture-button` or `.output-button`
3. Clicking a button finds the parent card via `button.closest('[data-modal]')`
4. Modal looks up `card.dataset.modal` in `ImageModal.imageMap` object
5. Displays corresponding image based on button type (architecture or output)

**Image Map Structure**:

```javascript
this.imageMap = {
  'recommendation-engine': {
    output: '/assets/images/recommendation_engine.png',
    architecture: '/assets/images/recommendation_engine__architecture.png',
  },
  'vector-search': {
    architecture: '/assets/images/vector__index_search.png',
  },
};
```

**Adding New Service Diagrams**:

1. Add `data-modal="service-name"` to the service card
2. Add buttons with `.architecture-button` or `.output-button` classes
3. Update `imageMap` in `modal.js` with image paths
4. Store images in `/assets/images/` directory

## Code Quality Infrastructure

### Pre-commit Hooks

**Husky + lint-staged** automatically runs on `git commit`:

- **HTML files**: HTMLHint validation → Prettier formatting
- **CSS files**: Stylelint fix → Prettier formatting
- **JavaScript files**: ESLint fix → Prettier formatting
- **JSON/Markdown**: Prettier formatting

Commits are **blocked** if linting fails. Fix errors or run `npm run lint:fix` before committing.

### Linting Configuration

**HTMLHint** (`.htmlhintrc`):

- Enforces semantic HTML5, lowercase tags/attributes, unique IDs
- Requires `<title>`, `<!DOCTYPE>`, proper tag pairing
- 4-space indentation for HTML
- **Note**: The `html/diagrams/` directory has its own `.htmlhintrc` file with custom rules for diagram-specific HTML files

**Stylelint** (`.stylelintrc.json`):

- Based on `stylelint-config-standard`
- Class naming: `^[a-z][a-zA-Z0-9-]*$` (kebab-case or camelCase)
- Short hex colors, no duplicate properties
- Allows vendor prefixes (`-webkit-`) where needed

**ESLint** (`eslint.config.js` - Flat Config):

- ES2021 features, browser globals defined
- Modern JavaScript: `const`/`let`, arrow functions, template literals, destructuring
- 2-space indentation, single quotes, semicolons required
- Warns on `console.log`, `no-unused-vars`

**Prettier** (`.prettierrc`):

- 100 character line width
- 2-space indentation (CSS/JS), single quotes, semicolons
- LF line endings

### Code Style Standards

**JavaScript**:

- Modern ES2021: `const`/`let`, arrow functions, template literals, destructuring, optional chaining
- Class-based for reusable components (ThemeManager, ImageModal, ScrollReveal)
- Use IntersectionObserver for scroll effects (not scroll event listeners)
- Use `requestAnimationFrame` for animations
- Error handling with try/catch for async operations

**CSS**:

- CSS custom properties for all theme values
- Mobile-first media queries
- Avoid `!important` except for utilities
- Property order: positioning → box model → typography → visual → misc

**HTML**:

- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`)
- ARIA labels on interactive elements
- Alt text on all images
- 4-space indentation

## Important Patterns & Conventions

### Theme System

**Implementation**: `data-theme` attribute on `<html>` element controls CSS variables

```javascript
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

**Storage**: `localStorage.getItem('dharambhushan-theme')` - persists user preference
**System Detection**: `window.matchMedia('(prefers-color-scheme: dark)')`

### Service Cards with Diagrams

When adding new AI/ML services with architecture diagrams:

1. Create service card in `src/html/ai_services.html` with `data-modal="unique-service-id"`
2. Add diagram buttons with classes `.architecture-button` and/or `.output-button`
3. Export Mermaid diagrams as PNG via https://mermaid.live/ (static images preferred over dynamic)
4. Store images in `/src/assets/images/` with naming: `<service-id>__architecture.png`
5. Update `src/js/modal.js` imageMap to include new service and image paths

### Animation Triggers

Elements with class `.reveal` automatically animate on scroll via IntersectionObserver:

- Add stagger delays: `.reveal.stagger-1`, `.reveal.stagger-2`, `.reveal.stagger-3`
- Animation threshold: 15% of element visible (configurable in `animations.js`)
- CSS transition in `animations.css` handles visual effect

### Neural Network Background System

**Full-Page Background Implementation** (used on all main pages):

The neural network animation provides an AI-inspired animated background across the entire page:

**HTML Structure**:

```html
<body>
  <!-- Add container at top of body -->
  <div id="page-name-background" class="neural-network-background"></div>

  <!-- Rest of page content -->
</body>
```

**Active Background IDs**:

- `#home` - Homepage hero section (contained)
- `#ai-services-background` - Full-page background for AI Services page
- `#data-platform-background` - Full-page background for Data Platform page
- `#leadership-background` - Full-page background for Leadership page
- `#contact-background` - Full-page background for Contact page

**How It Works**:

1. Container with specific ID is detected by `neural-network.js` on page load
2. Canvas element is created and appended to the container
3. For `.neural-network-background` class: Uses `position: fixed` to cover entire viewport during scroll
4. For section-specific backgrounds (like `#home`): Uses `position: absolute` within container
5. Animation runs at 60fps using `requestAnimationFrame`
6. Mouse movements create interactive connection highlights
7. Automatically respects `prefers-reduced-motion` accessibility setting

**Adding Background to New Page**:

1. Add `<div id="new-page-background" class="neural-network-background"></div>` at top of `<body>`
2. Add initialization in `neural-network.js` DOMContentLoaded handler:
   ```javascript
   const newPageBackground = document.getElementById('new-page-background');
   if (newPageBackground) {
     const neuralBg = new NeuralNetworkBackground('new-page-background');
     window.addEventListener('beforeunload', () => {
       neuralBg.destroy();
     });
   }
   ```
3. Background will automatically cover full viewport and remain visible during scroll

### Contact Form Integration

**Web3Forms Setup** (`src/html/contact.html`):

- Form submits to `https://api.web3forms.com/submit` via POST (natural form submission, no JavaScript fetch)
- Access key stored in hidden input: `<input type="hidden" name="access_key" value="...">`
- Redirect URL configured to return to contact page with `?success=true` parameter
- Form handler in `contact-form.js` detects the `?success=true` parameter and displays success message
- Success message: "Message sent successfully! I'll get back to you soon." (green banner, auto-hides after 5 seconds)
- Success/error messages displayed via `#form-status` element with CSS classes `.success` or `.error`

**How It Works**:

1. User fills out and submits form
2. Form submits naturally to Web3Forms (bypasses CORS)
3. Web3Forms sends email and redirects to: `http://localhost:3000/html/contact?success=true` (or production URL)
4. JavaScript in `contact-form.js` checks for `?success=true` parameter on page load
5. If found, displays green success message and clears the URL parameter
6. Message auto-hides after 5 seconds

**To Update Web3Forms Access Key**:

1. Get new access key from https://web3forms.com
2. Update the `value` attribute in the hidden `access_key` input in `src/html/contact.html:143`

**To Update Redirect URL for Production**:

1. In `src/html/contact.html:148`, change redirect URL from `http://localhost:3000/html/contact?success=true` to `https://dharambhushan.com/html/contact?success=true`
2. This ensures the success message appears correctly in production

**Environment-Specific Configuration**:

**IMPORTANT**: The contact form redirect URL in `src/html/contact.html` (line 148) must match your environment:

- **Development**: `http://localhost:3000/html/contact?success=true`
- **Production**: `https://dharambhushan.com/html/contact?success=true`

This URL is hardcoded in the HTML form's hidden `redirect` input field and must be manually updated before production deployment. This is a common source of issues if forgotten.

### Performance Considerations

- **Critical CSS**: Inline critical styles in `<head>` for faster FCP (planned)
- **Image Loading**: Use `loading="lazy"` for below-fold images, `loading="eager"` for hero images
- **JavaScript**: All scripts use `defer` attribute (execute after DOM parse, maintain order)
- **Caching**: CloudFlare edge caching enabled, S3 cache-control headers set to 1 year for static assets

## Deployment Architecture

**Origin**: AWS S3 bucket (`s3://dharam-personal-website-257641256327`) with static website hosting enabled
**Region**: us-west-2
**Account**: 257641256327
**CDN**: CloudFlare (global edge caching, SSL/TLS, DDoS protection, auto minification)
**DNS**: CloudFlare managed DNS

**Deployment Flow**:

1. Export AWS credentials: `source ~/aws-credentials-export.zsh`
2. `npm run build` - Build and validate website (via ./scripts/build.sh)
3. `npm run deploy:s3` - Upload to S3 with cache headers (via ./scripts/deploy.sh)
4. `npm run deploy:cloudflare` - Clear CloudFlare cache (via ./scripts/invalidate-cache.sh)
5. Verify: Check production URL, run Lighthouse audit

**Cache Headers**: 1-year cache for static assets (CSS/JS/images), 1-hour revalidation for HTML

### Pre-Production Deployment Checklist

Before deploying to production, verify the following to avoid common issues:

- [ ] **Contact form redirect URL** updated from `localhost:3000` to `https://dharambhushan.com` in `src/html/contact.html:148`
- [ ] **All image paths** are relative (start with `/`) not absolute
- [ ] **Web3Forms access key** is valid and configured correctly in `src/html/contact.html:143`
- [ ] **All linters pass**: Run `npm run lint` with no errors
- [ ] **Code formatting verified**: Run `npm run format:check` passes
- [ ] **Performance audit**: Run `npm run lighthouse` and verify scores > 95
- [ ] **Test contact form**: Submit test message end-to-end and verify email delivery
- [ ] **Theme toggle**: Works correctly on all pages (index, ai_services, data_platform, leadership, contact)
- [ ] **Neural network backgrounds**: Render correctly on all pages without console errors
- [ ] **Image modals**: Open correctly for all service cards with diagrams
- [ ] **Cross-browser testing**: Test on Chrome, Firefox, Safari, and mobile browsers
- [ ] **Accessibility**: Run browser accessibility audit (Lighthouse or axe DevTools)

**Quick Validation Command**:

```bash
# Run all validations before deployment
npm run validate:all && npm run lighthouse
```

## Common Development Tasks

### Adding a New Page

1. Create HTML file in `/html/` directory (copy existing page structure from `ai_services.html`)
2. Update `<head>` section with appropriate SEO meta tags:
   - Update `<title>` and meta description
   - Add Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`)
   - Add Twitter Card tags (`twitter:title`, `twitter:description`, etc.)
   - Add canonical URL: `<link rel="canonical" href="https://dharambhushan.com/html/page-name.html" />`
   - Add Schema.org structured data with appropriate `@type` (WebPage, ContactPage, etc.)
   - Add resource preloading: `<link rel="preload" href="/css/main.css" as="style" />`
3. Add neural network background container at top of `<body>`:
   ```html
   <div id="page-name-background" class="neural-network-background"></div>
   ```
4. Update navigation links in all pages (header nav menu)
5. Include standard scripts in order: `main.js`, `theme-toggle.js`, `animations.js`, `neural-network.js`, `analytics.js`
6. Add neural network initialization in `js/neural-network.js` for the new page background ID
7. Update sitemap.xml (if exists)

### Adding a New AI/ML Service Card

1. Copy existing service card structure from `html/ai_services.html`
2. Update: icon, title, description, impact metrics, tags
3. Add `data-modal="service-name"` if including diagrams
4. Create diagram PNG and add to `/assets/images/`
5. Update `modal.js` imageMap with new service entry

### Adding a New Data Platform Card

1. Copy existing platform card structure from `html/data_platform.html`
2. Update: icon (emoji), title, description (focus on architecture and technical achievements)
3. Update impact metrics with quantifiable results
4. Add relevant tags (e.g., CDK, Data Lake, Medallion Architecture, etc.)
5. If including architecture diagram:
   - Add `data-modal="platform-name"` attribute to card
   - Create Mermaid diagram in `/docs/platform-name-diagram.md`
   - Export diagram as PNG from https://mermaid.live/
   - Save as `/assets/images/platform_name__architecture.png` (note: double underscore)
   - Add "View Architecture" button in `.card-actions` div
   - Update `modal.js` imageMap with entry: `'platform-name': { architecture: '/assets/images/platform_name__architecture.png' }`
6. Ensure `.card-actions` div is present for consistent button positioning (uses `margin-top: auto` for alignment)

### Updating Theme Colors

1. Edit CSS custom properties in `css/themes.css` under `[data-theme="dark"]` or `[data-theme="light"]`
2. Test theme switching with toggle button
3. Verify color contrast meets WCAG AA (4.5:1 minimum)

### Debugging JavaScript

- Check browser console for errors (global error handler logs all errors)
- Enable ESLint warnings: Check for `no-console`, `no-unused-vars` warnings
- Use browser DevTools Network tab to verify resource loading
- Check localStorage for theme preference: `localStorage.getItem('dharambhushan-theme')`

## Key Technical Decisions

### Why Vanilla JavaScript?

- Zero framework overhead (saves ~40-150KB)
- Faster initial load time (critical for first impressions)
- Standard APIs, no framework lock-in
- Any developer can contribute without framework knowledge
- Portfolio site doesn't require complex state management

### Why No Build Step Required?

- Development: Direct file editing with instant browser refresh
- Debugging: Unminified code easier to debug in DevTools
- Simplicity: No webpack/vite configuration to learn
- Build step optional, only for production optimization

### Why IntersectionObserver for Animations?

- Performance: No scroll event listeners (passive, async)
- Battery efficient: Browser-optimized, no constant polling
- Accuracy: Precise viewport detection with configurable thresholds
- Modern API with graceful fallback for old browsers

### Why CloudFlare over AWS CloudFront?

- Free tier sufficient for portfolio traffic
- More edge locations globally
- Better free SSL, automatic optimizations (Brotli, HTTP/3)
- Simpler developer experience

## Troubleshooting

### Pre-commit Hook Failures

- Run `npm run lint:fix` to auto-fix most issues
- Check error output for specific linting violations
- For HTMLHint: Ensure proper tag closing, lowercase attributes, unique IDs
- For Stylelint: Check class naming convention, no duplicate properties
- For ESLint: Remove `console.log`, fix unused variables

### Modal Not Opening

- Verify card has `data-modal` attribute matching imageMap key
- Check button has `.architecture-button` or `.output-button` class
- Verify image path in imageMap is correct and file exists
- Check browser console for JavaScript errors

### Theme Not Persisting

- Check localStorage: `localStorage.getItem('dharambhushan-theme')`
- Verify `theme-toggle.js` is loaded (check Network tab)
- Clear browser cache and localStorage, test theme toggle

### Contact Form Not Working

- Verify the hidden `access_key` input field in `src/html/contact.html` has a valid Web3Forms access key
- Check browser console for JavaScript errors during form submission
- Test form submission and check Network tab for Web3Forms API response (should POST to `https://api.web3forms.com/submit`)
- Verify form action is set to `https://api.web3forms.com/submit`
- Check that all required form fields (name, email, subject, message) are present

### Development Server Not Starting

- Ensure port 3000 is available: `lsof -ti:3000 | xargs kill -9`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility (modern Node.js recommended)

## Project Structure Notes

**Source Files**: All website files are in `src/` directory (moved from root in Oct 2025 refactor)
**Development Server**: `npm run dev` now serves from `src/` directory on http://localhost:3000
**Infrastructure as Code**: AWS S3 bucket deployed via AWS CDK in TypeScript (`infrastructure/` directory)
**S3 Bucket**: dharam-personal-website-257641256327 (AWS account 257641256327, region us-west-2)
**AWS Credentials**: Use `source ~/aws-credentials-export.zsh` to export via IAM Roles Anywhere
**Deployment Scripts**: Bash scripts in `scripts/` for automated build, deploy, and cache invalidation
**Build Output**: Minified assets go to `dist/` directory (git-ignored)

## Additional Documentation

- **infrastructure/README.md**: AWS CDK infrastructure documentation, deployment guide, CloudFormation stack details
- **docs/cloudflare-setup.md**: Comprehensive CloudFlare CDN setup guide with step-by-step instructions
- **ARCHITECTURE.md**: Comprehensive architectural documentation (1500+ lines) covering component architecture, deployment, performance strategy, code quality infrastructure
- **README.md**: Setup instructions, deployment workflow, environment variables, troubleshooting
- **package.json**: All npm scripts and dependencies listed with descriptions
