# dharambhushan.com - Portfolio Website

Professional portfolio for Dharam Bhushan - AWS Engineering Manager specializing in AI/ML services and data platforms.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES2021), HTML5, CSS3
- **Infrastructure**: AWS CDK (TypeScript) for S3 bucket
- **CDN**: CloudFlare (global edge caching, SSL, DDoS protection)
- **Hosting**: AWS S3 static website hosting
- **Deployment**: Bash scripts for automated deployment

## Project Structure

```
dharambhushan.com/
├── src/                          # Website source files
│   ├── index.html               # Landing page
│   ├── html/                    # Additional pages
│   │   ├── ai_services.html
│   │   ├── data_platform.html
│   │   ├── leadership.html
│   │   └── contact.html
│   ├── css/                     # Modular CSS
│   │   ├── main.css            # Core styles
│   │   ├── components.css      # Reusable components
│   │   ├── themes.css          # Dark/light themes
│   │   └── animations.css      # Animations & effects
│   ├── js/                      # JavaScript modules
│   │   ├── main.js             # Core functionality
│   │   ├── theme-toggle.js     # Theme switching
│   │   ├── animations.js       # Scroll animations
│   │   ├── modal.js            # Image modals
│   │   ├── contact-form.js     # Form handling
│   │   ├── neural-network.js   # Canvas animations
│   │   └── analytics.js        # Analytics tracking
│   └── assets/                  # Images, icons, PDFs
├── infrastructure/              # AWS CDK for S3 bucket
│   ├── bin/
│   │   └── s3-stack.ts         # CDK app entry point
│   ├── lib/
│   │   └── website-bucket-stack.ts  # S3 bucket stack
│   ├── cdk.json                # CDK configuration
│   ├── package.json            # CDK dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── README.md               # Infrastructure docs
├── scripts/                     # Deployment scripts
│   ├── build.sh                # Build website
│   ├── deploy.sh               # Deploy to S3
│   └── invalidate-cache.sh     # CloudFlare cache purge
├── docs/
│   └── cloudflare-setup.md     # CloudFlare configuration guide
├── .gitignore
├── package.json                # Root package.json
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- (Optional) CloudFlare account for CDN

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install infrastructure dependencies
npm run infra:install
```

### 2. Local Development

```bash
# Start development server on http://localhost:3000
npm run dev
```

The dev server serves the `src/` directory.

### 3. Build Website

```bash
# Build and optimize website
npm run build
```

This will:

- Validate HTML, CSS, and JavaScript
- Minify CSS and JavaScript
- Output optimized files to `dist/`

## Infrastructure Setup

### Deploy S3 Bucket with AWS CDK

First-time setup:

```bash
# Bootstrap CDK (one-time per AWS account/region)
npm run infra:bootstrap

# Deploy S3 bucket infrastructure
npm run infra:deploy
```

The CDK stack creates:

- S3 bucket for static website hosting
- Bucket policy allowing CloudFlare IPs
- Versioning enabled for rollback
- S3-managed encryption at rest

**Stack Outputs** (use these for CloudFlare setup):

- `BucketName`: S3 bucket name
- `BucketDomainName`: S3 endpoint for CloudFlare origin
- `BucketWebsiteUrl`: S3 website URL (for testing)

For detailed infrastructure documentation, see [`infrastructure/README.md`](infrastructure/README.md).

### CloudFlare CDN Setup

Follow the comprehensive guide in [`docs/cloudflare-setup.md`](docs/cloudflare-setup.md).

Quick steps:

1. Add site to CloudFlare
2. Update nameservers at domain registrar
3. Configure DNS to point to S3 bucket
4. Enable SSL/TLS, caching, and optimizations
5. Create API token for cache invalidation

## Deployment

### Full Deployment (Recommended)

```bash
# Build + Deploy to S3 + Invalidate CloudFlare cache
npm run deploy
```

### Step-by-Step Deployment

```bash
# 1. Build website
npm run build

# 2. Deploy to S3
npm run deploy:s3

# 3. Invalidate CloudFlare cache
npm run deploy:cloudflare
```

### Environment Variables

Set these environment variables for deployment:

```bash
# S3 bucket name (default: dharam-personal-website-257641256327)
export S3_BUCKET_NAME='dharam-personal-website-257641256327'

# AWS region (default: us-west-2)
export AWS_REGION='us-west-2'

# CloudFlare credentials (for cache invalidation)
export CLOUDFLARE_ZONE_ID='your-zone-id'
export CLOUDFLARE_API_TOKEN='your-api-token'
```

Add to your `~/.bashrc` or `~/.zshrc` for persistence.

## Development Commands

### Local Development

```bash
npm run dev              # Start dev server on http://localhost:3000
```

### Building & Optimization

```bash
npm run build            # Build and validate website
npm run optimize         # Optimize CSS, JS, images
npm run optimize:css     # Minify CSS only
npm run optimize:js      # Minify JavaScript only
npm run optimize:images  # Optimize images (manual)
```

### Code Quality

```bash
npm run lint             # Run all linters (HTML, CSS, JS)
npm run lint:html        # HTMLHint validation
npm run lint:css         # Stylelint validation
npm run lint:js          # ESLint validation
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all code with Prettier
npm run format:check     # Check formatting without changes
npm run validate:all     # Run format check + all linters
```

### Infrastructure

```bash
npm run infra:install    # Install CDK dependencies
npm run infra:bootstrap  # Bootstrap CDK (first-time only)
npm run infra:deploy     # Deploy infrastructure stack
npm run infra:synth      # Synthesize CloudFormation template
npm run infra:diff       # Show stack differences
npm run infra:destroy    # Destroy infrastructure (WARNING)
```

### Performance Testing

```bash
npm run lighthouse       # Run Lighthouse audit
```

**Performance Targets**:

- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- Initial load: < 1.5s

## Code Quality Infrastructure

### Pre-commit Hooks

**Husky + lint-staged** automatically runs on every commit:

- **HTML**: HTMLHint validation → Prettier formatting
- **CSS**: Stylelint fix → Prettier formatting
- **JavaScript**: ESLint fix → Prettier formatting
- **JSON/Markdown**: Prettier formatting

Commits are blocked if linting fails.

### Linting Tools

- **HTMLHint**: Validates semantic HTML5
- **Stylelint**: Enforces CSS standards
- **ESLint**: Modern JavaScript linting (ES2021)
- **Prettier**: Code formatting (100 char line width)

Configuration files:

- `.htmlhintrc` - HTMLHint rules
- `.stylelintrc.json` - Stylelint rules
- `eslint.config.js` - ESLint rules (flat config)
- `.prettierrc` - Prettier rules

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Browsers                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │   CloudFlare CDN          │
         │  - 300+ Edge Locations    │
         │  - SSL/TLS Termination    │
         │  - DDoS Protection        │
         │  - Brotli Compression     │
         │  - Auto Minification      │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │   AWS S3 Bucket           │
         │  (dharam-personal-website-257641256327)      │
         │                           │
         │  - Static Website Hosting │
         │  - Versioned              │
         │  - Encrypted (S3-managed) │
         │  - CloudFlare IP filter   │
         └───────────────────────────┘
```

### CSS Architecture

**Modular CSS** with separation of concerns:

- `main.css`: CSS variables, reset, typography, base layout
- `components.css`: Reusable UI components (cards, grids, badges)
- `themes.css`: Dark/light theme color schemes
- `animations.css`: Keyframes, transitions, scroll effects

**Theming**: CSS custom properties switched via `data-theme` attribute on `<html>`.

### JavaScript Architecture

**Modular, class-based** vanilla JavaScript (no frameworks):

- **main.js**: Core functionality (nav, scroll, lazy loading)
- **theme-toggle.js**: ThemeManager class for dark/light mode
- **animations.js**: ScrollReveal, ParallaxScroll, CountUp
- **modal.js**: ImageModal for diagrams and screenshots
- **contact-form.js**: ContactForm with Web3Forms integration
- **neural-network.js**: Canvas-based neural network animation
- **analytics.js**: Privacy-focused event tracking

**Performance patterns**:

- IntersectionObserver for scroll-based triggers
- requestAnimationFrame for smooth animations
- Event delegation for dynamic elements
- Debouncing for high-frequency events

## Features

### Theme System

- Dark/light mode toggle
- Persists to localStorage
- Auto-detects system preference via `prefers-color-scheme`
- Smooth transitions between themes

### Neural Network Background

AI-inspired animated background using HTML5 Canvas:

- 50 animated nodes with AWS-themed colors
- Interactive connections on mouse hover
- Respects `prefers-reduced-motion` for accessibility
- 60fps performance using requestAnimationFrame

### Contact Form

Web3Forms integration:

- Client-side validation
- Spam protection
- Success/error message handling
- Redirects with success parameter

### Architecture Diagrams

Interactive modals for service diagrams:

- Click to view full-size architecture diagrams
- Service output screenshots
- Smooth fade-in animations

## Deployment Workflow

### Initial Setup

1. **Deploy infrastructure**:

   ```bash
   npm run infra:deploy
   ```

2. **Configure CloudFlare**:

   Follow guide: [`docs/cloudflare-setup.md`](docs/cloudflare-setup.md)

3. **Set environment variables**:

   ```bash
   export S3_BUCKET_NAME='dharam-personal-website-257641256327'
   export AWS_REGION='us-west-2'
   export CLOUDFLARE_ZONE_ID='your-zone-id'
   export CLOUDFLARE_API_TOKEN='your-api-token'
   ```

### Regular Updates

```bash
# Make changes to src/ files
# ...

# Run full deployment
npm run deploy
```

This will:

1. Validate and build website
2. Sync to S3 with optimized cache headers
3. Purge CloudFlare cache

### Rollback

S3 versioning is enabled for rollback:

```bash
# List object versions
aws s3api list-object-versions \
  --bucket dharam-personal-website-257641256327 \
  --prefix index.html

# Restore previous version
aws s3api copy-object \
  --bucket dharam-personal-website-257641256327 \
  --copy-source dharam-personal-website-257641256327/index.html?versionId=VERSION_ID \
  --key index.html
```

## Monitoring & Analytics

### CloudFlare Analytics

- Navigate to CloudFlare dashboard → Analytics
- Monitor:
  - Traffic patterns
  - Cache hit ratio (target: 90%+)
  - Bandwidth usage
  - Security threats blocked

### Lighthouse Audits

Run regular performance audits:

```bash
npm run lighthouse
```

Review:

- Performance score
- Core Web Vitals (LCP, FID, CLS)
- Accessibility issues
- SEO optimizations

### Custom Analytics

Privacy-focused analytics via `analytics.js`:

- Page views
- Click tracking
- Scroll depth
- Time on page
- Core Web Vitals

## Troubleshooting

### Build Failures

```bash
# Check linting errors
npm run lint

# Auto-fix issues
npm run lint:fix

# Validate manually
npm run validate:all
```

### Deployment Failures

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check S3 bucket exists
aws s3 ls s3://dharam-personal-website-257641256327

# Test deployment script manually
./scripts/deploy.sh
```

### CloudFlare Cache Issues

```bash
# Purge all cache
npm run deploy:cloudflare

# Verify cache status
curl -I https://dharambhushan.com | grep cf-cache-status
```

### Development Server Issues

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart dev server
npm run dev
```

## Security

### Best Practices

- ✅ All credentials in environment variables (never committed)
- ✅ S3 bucket blocks public access (CloudFlare IPs only)
- ✅ HTTPS enforced via CloudFlare SSL/TLS
- ✅ HSTS enabled (HTTP Strict Transport Security)
- ✅ Content Security Policy headers configured
- ✅ No sensitive data in client-side code

### Secrets Management

Never commit:

- AWS credentials
- CloudFlare API tokens
- Web3Forms access keys
- Any API keys or secrets

Use environment variables or AWS Secrets Manager.

## Performance Optimizations

### Implemented

- ✅ CloudFlare global edge caching
- ✅ Brotli compression
- ✅ Auto minification (HTML, CSS, JS)
- ✅ Lazy loading for images
- ✅ IntersectionObserver for scroll effects
- ✅ requestAnimationFrame for animations
- ✅ Long cache headers for static assets (1 year)
- ✅ Short cache headers for HTML (1 hour)

### Future Optimizations

- [ ] Critical CSS inlining
- [ ] WebP image format conversion
- [ ] Service Worker for offline support
- [ ] Preconnect to third-party domains
- [ ] Resource hints (preload, prefetch)

## Contributing

This is a personal portfolio project. If you notice issues or have suggestions:

1. Open an issue describing the problem or enhancement
2. Include screenshots or error messages if applicable
3. Suggest a solution or improvement

## License

MIT License - See LICENSE file for details.

## Author

**Dharam Bhushan**

- AWS Engineering Manager
- AI/ML Solutions Architect
- Website: [dharambhushan.com](https://dharambhushan.com)

## Resources

- **AWS CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **CloudFlare Docs**: https://developers.cloudflare.com/
- **Web3Forms**: https://web3forms.com/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

## Changelog

### 2025-10-16 - Infrastructure Refactor

- ✅ Reorganized project structure (src/, infrastructure/, scripts/, docs/)
- ✅ Added AWS CDK for S3 bucket infrastructure
- ✅ Created bash deployment scripts
- ✅ Added CloudFlare setup documentation
- ✅ Updated package.json with infrastructure commands
- ✅ Enhanced .gitignore for new structure

### 2025-10-14 - Leadership Principles

- ✅ Updated leadership page with 9 comprehensive principles
- ✅ Renamed service to "Knowledge Base"
- ✅ Added config.example.js for Web3Forms setup

### 2025-10-13 - Data Platform & AI Services

- ✅ Added 8 AI/ML service cards with diagrams
- ✅ Added 4 data platform cards
- ✅ Integrated neural network backgrounds
- ✅ Added architecture diagram modals

---

**Last Updated**: October 16, 2025
