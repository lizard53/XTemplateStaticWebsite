# dharambhushan.com - Portfolio Website

Professional portfolio for Dharam Bhushan - AWS Engineering Manager specializing in AI/ML services and data platforms.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES2021), HTML5, CSS3 (no frameworks)
- **Infrastructure**: AWS CDK (TypeScript) for CloudFront + WAF + S3
- **Hosting**: AWS S3 (private) + CloudFront + AWS WAF + CloudFlare CDN
- **Security**: Multi-layer (CloudFlare DDoS + AWS WAF IP filtering + CloudFront OAC)
- **Deployment**: Bash scripts for automated infrastructure and content deployment
- **Region**: us-east-1 (all AWS resources)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS Account: 257641256327
- CloudFlare account for CDN (optional but recommended)

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

The dev server serves the `src/` directory with live reload.

### 3. Build Website

```bash
# Build and optimize website
npm run build
```

This will:

- Validate HTML, CSS, and JavaScript
- Minify CSS and JavaScript
- Output optimized files to `dist/`

## Architecture

### High-Level Architecture

```
User Request (https://dharambhushan.com)
    ↓
CloudFlare CDN (SSL/TLS Full Strict, Edge Caching, DDoS Protection)
    ↓ HTTPS (validated ACM certificate)
AWS CloudFront (Custom Domain, ACM Certificate, WAF IP Filtering)
    ↓ HTTPS (OAC Signed Requests)
AWS S3 Bucket (Private, CloudFront OAC only)
    ↓
Static Website Files
```

### Architecture Benefits

- ✅ **End-to-End Encryption**: HTTPS from user → CloudFlare → CloudFront → S3
- ✅ **Multi-Layer Security**: CloudFlare DDoS + AWS WAF IP filtering + S3 OAC
- ✅ **Performance**: Dual CDN caching (CloudFlare edge + CloudFront regional)
- ✅ **Access Control**: WAF allows only CloudFlare IPv4/IPv6 ranges
- ✅ **Certificate Management**: ACM certificate in us-east-1 with automatic renewal

### Infrastructure Components

**AWS S3 Bucket**:

- Name: `dharam-personal-website-257641256327-us-east-1`
- Region: us-east-1
- Configuration: Private, fully blocked public access
- Access: CloudFront Origin Access Control (OAC) only
- Versioning: Enabled for rollback capability

**AWS CloudFront Distribution**:

- Distribution ID: `E14SW9FUYL655V`
- Domain: `d25p12sd2oijz4.cloudfront.net`
- Custom domains: `dharambhushan.com` and `www.dharambhushan.com`
- SSL/TLS: ACM certificate in us-east-1
- Cache policies: HTML (1 hour), Assets (1 year), Default (24 hours)
- HTTP versions: HTTP/2 and HTTP/3 enabled
- Compression: Gzip and Brotli enabled

**AWS WAF Web ACL**:

- Scope: CLOUDFRONT
- Default action: Block all traffic
- Allow rules: CloudFlare IPv4 and IPv6 ranges only
- CloudWatch metrics enabled

**CloudFlare CDN**:

- SSL/TLS mode: Full (strict) - validates CloudFront certificate
- DNS: CNAME `dharambhushan.com` → `d25p12sd2oijz4.cloudfront.net`
- Proxy status: Enabled (orange cloud)
- Additional caching layer and DDoS protection

## Project Structure

```
dharambhushan.com/
├── src/                          # Website source files
│   ├── index.html               # Landing page with hero section
│   ├── error.html               # Custom 404 error page
│   ├── html/                    # Additional pages
│   │   ├── ai_services.html     # AI/ML services portfolio
│   │   ├── data_platform.html   # Data platform projects
│   │   ├── leadership.html      # Management style
│   │   └── contact.html         # Contact form (Web3Forms)
│   ├── css/                     # Modular CSS architecture
│   │   ├── main.css            # Core styles, variables, layout
│   │   ├── components.css      # Reusable UI components
│   │   ├── themes.css          # Dark/light themes
│   │   └── animations.css      # Keyframes, scroll effects
│   ├── js/                      # JavaScript modules
│   │   ├── main.js             # Core functionality
│   │   ├── theme-toggle.js     # Dark/light mode
│   │   ├── animations.js       # Scroll animations
│   │   ├── modal.js            # Image modals
│   │   ├── contact-form.js     # Form handling
│   │   ├── neural-network.js   # Canvas animations
│   │   └── analytics.js        # Analytics tracking
│   └── assets/                  # Images, icons, PDFs
├── infrastructure/              # AWS CDK (CloudFront + WAF + S3)
│   ├── bin/
│   │   └── s3-stack.ts         # CDK app entry point
│   ├── lib/
│   │   └── website-bucket-stack.ts  # Stack definition
│   ├── cdk.json                # CDK configuration
│   ├── package.json            # CDK dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── README.md               # Infrastructure docs
├── scripts/                     # Deployment automation
│   ├── build.sh                # Build and validate
│   ├── deploy.sh               # Deploy to S3
│   └── invalidate-cache.sh     # CloudFlare cache purge
├── docs/
│   ├── DEPLOYMENT_GUIDE.md     # Complete deployment guide
│   ├── acm-certificate-setup.md # ACM certificate setup
│   └── cloudflare-setup.md     # CloudFlare configuration
├── dist/                        # Build output (git-ignored)
├── CLAUDE.md                    # Claude Code instructions
├── ARCHITECTURE.md              # Detailed architecture docs
├── package.json                # Root package.json
└── README.md                   # This file
```

## Infrastructure Setup

### Prerequisites

1. **AWS Account**: 257641256327
2. **AWS Region**: us-east-1
3. **ACM Certificate**: Already created for `dharambhushan.com` and `www.dharambhushan.com`
4. **AWS Credentials**: Export via IAM Roles Anywhere

### Deploy Infrastructure

**First-time setup**:

```bash
# Export AWS credentials
source ~/aws-credentials-export.zsh

# Set environment variables
export CDK_DEFAULT_ACCOUNT=257641256327
export CDK_DEFAULT_REGION=us-east-1
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:257641256327:certificate/b30ce704-7d37-4200-9815-037c834bdf41'

# Bootstrap CDK (one-time only)
npm run infra:bootstrap

# Deploy CloudFront + WAF + S3 stack
npm run infra:deploy
```

The CDK stack creates:

- Private S3 bucket with versioning and encryption
- CloudFront distribution with custom domain
- AWS WAF Web ACL (allows only CloudFlare IPs)
- CloudFront Origin Access Control (OAC)
- S3 bucket policy (CloudFront access only)

**Stack Outputs**:

- `BucketName`: dharam-personal-website-257641256327-us-east-1
- `DistributionId`: E14SW9FUYL655V
- `DistributionDomainName`: d25p12sd2oijz4.cloudfront.net
- `WebACLArn`: WAF Web ACL ARN

### Configure CloudFlare

After infrastructure deployment:

1. Log in to CloudFlare dashboard
2. Navigate to DNS → Records
3. Add/Update CNAME record:
   - Name: `@`
   - Target: `d25p12sd2oijz4.cloudfront.net`
   - Proxy status: **Proxied** (orange cloud - REQUIRED)
4. Go to SSL/TLS → Overview
5. Set encryption mode: **Full (strict)**

See [`docs/cloudflare-setup.md`](docs/cloudflare-setup.md) for detailed configuration.

## Deployment

### Environment Variables

Set these environment variables:

```bash
# S3 bucket name (default)
export S3_BUCKET_NAME='dharam-personal-website-257641256327-us-east-1'

# AWS region (default)
export AWS_REGION='us-east-1'

# CloudFront distribution ID (for cache invalidation)
export CLOUDFRONT_DISTRIBUTION_ID='E14SW9FUYL655V'

# CloudFlare credentials (for cache invalidation)
export CLOUDFLARE_ZONE_ID='your-zone-id'
export CLOUDFLARE_API_TOKEN='your-api-token'

# ACM certificate ARN
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:257641256327:certificate/b30ce704-7d37-4200-9815-037c834bdf41'
```

### Full Deployment (Recommended)

```bash
# Export AWS credentials
source ~/aws-credentials-export.zsh

# Build + Deploy to S3 + Invalidate caches
npm run deploy
```

This runs:

1. `npm run build` - Build and validate website
2. `npm run deploy:s3` - Upload to S3 with cache headers
3. CloudFront invalidation (manual if needed)
4. `npm run deploy:cloudflare` - Purge CloudFlare cache

### Step-by-Step Deployment

```bash
# 1. Build website
npm run build

# 2. Deploy to S3
npm run deploy:s3

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E14SW9FUYL655V \
  --paths "/*"

# 4. Invalidate CloudFlare cache
npm run deploy:cloudflare
```

### Cache Headers

Deployment script automatically sets:

- **HTML files**: 1 hour (`max-age=3600, must-revalidate`)
- **CSS/JS files**: 1 year (`max-age=31536000, immutable`)
- **Images**: 1 year (`max-age=31536000, immutable`)
- **Resume PDF**: 1 week (`max-age=604800`)

## Development Commands

### Local Development

```bash
npm run dev              # Start dev server (http://localhost:3000)
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

## Features

### Theme System

- Dark/light mode toggle
- Persists to localStorage
- Auto-detects system preference via `prefers-color-scheme`
- Smooth transitions between themes

### Neural Network Background

- AI-inspired animated background using HTML5 Canvas
- 50 animated nodes with AWS-themed colors
- Interactive connections on mouse hover
- Respects `prefers-reduced-motion` for accessibility
- 60fps performance using `requestAnimationFrame`

### Contact Form

- Web3Forms integration for email delivery
- Client-side validation
- Success/error message handling
- **IMPORTANT**: Redirect URL must include `.html` extension

### Architecture Diagrams

- Interactive modals for service diagrams
- Click to view full-size architecture diagrams
- Service output screenshots
- Smooth fade-in animations

### Custom 404 Error Page

- Custom error page (`src/error.html`)
- CloudFront configured to return 404 status (good for SEO)
- Same hero background styling as homepage
- Navigation options to popular pages

## Code Quality Infrastructure

### Pre-commit Hooks

**Husky + lint-staged** automatically runs on every commit:

- **HTML**: HTMLHint validation → Prettier formatting
- **CSS**: Stylelint fix → Prettier formatting
- **JavaScript**: ESLint fix → Prettier formatting
- **JSON/Markdown**: Prettier formatting

Commits are blocked if linting fails.

### Linting Tools

- **HTMLHint**: Validates semantic HTML5 (`.htmlhintrc`)
- **Stylelint**: Enforces CSS standards (`.stylelintrc.json`)
- **ESLint**: Modern JavaScript linting - ES2021 (`eslint.config.js`)
- **Prettier**: Code formatting - 100 char line width (`.prettierrc`)

## Security

### Multi-Layer Security

1. **CloudFlare**: Edge caching, DDoS protection, SSL/TLS termination
2. **AWS WAF**: IP-based filtering, allows only CloudFlare IP ranges (IPv4 + IPv6)
3. **CloudFront OAC**: Origin Access Control with signed requests to S3
4. **S3 Bucket Policy**: Allows only CloudFront service principal
5. **Full (Strict) SSL**: CloudFlare validates CloudFront's ACM certificate

### Best Practices

- ✅ All credentials in environment variables (never committed)
- ✅ S3 bucket blocks all public access
- ✅ HTTPS enforced end-to-end
- ✅ ACM certificate with automatic renewal
- ✅ WAF blocks all traffic except CloudFlare IPs
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

- ✅ CloudFlare global edge caching (300+ locations)
- ✅ CloudFront regional edge caching
- ✅ Brotli and Gzip compression
- ✅ Auto minification (HTML, CSS, JS)
- ✅ Lazy loading for images
- ✅ IntersectionObserver for scroll effects
- ✅ requestAnimationFrame for animations
- ✅ Long cache headers for static assets (1 year)
- ✅ Short cache headers for HTML (1 hour)
- ✅ HTTP/2 and HTTP/3 enabled
- ✅ S3 versioning for rollback

### Future Optimizations

- [ ] Critical CSS inlining
- [ ] WebP image format conversion
- [ ] Service Worker for offline support
- [ ] Preconnect to third-party domains
- [ ] Resource hints (preload, prefetch)

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
source ~/aws-credentials-export.zsh
aws sts get-caller-identity

# Check S3 bucket exists
aws s3 ls s3://dharam-personal-website-257641256327-us-east-1

# Test deployment script manually
./scripts/deploy.sh
```

### CloudFront Cache Not Updating

```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E14SW9FUYL655V \
  --paths "/*"

# Wait 5-10 minutes for invalidation to complete

# Also purge CloudFlare cache
npm run deploy:cloudflare
```

### Contact Form Redirecting to Error Page

**Issue**: Form submits successfully but shows error page instead of success message.

**Solution**: Ensure redirect URL in `src/html/contact.html` (line 148) includes `.html` extension:

- **Incorrect**: `https://dharambhushan.com/html/contact?success=true`
- **Correct**: `https://dharambhushan.com/html/contact.html?success=true`

### WAF Blocking Legitimate Traffic

```bash
# Verify CloudFlare proxy is enabled (orange cloud)
# Check CloudFlare IP ranges are up to date in infrastructure/lib/website-bucket-stack.ts

# Update IP ranges from:
# - https://www.cloudflare.com/ips-v4
# - https://www.cloudflare.com/ips-v6

# Redeploy infrastructure
npm run infra:deploy
```

### Development Server Issues

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart dev server
npm run dev
```

## Rollback

S3 versioning is enabled for rollback capability:

```bash
# List object versions
aws s3api list-object-versions \
  --bucket dharam-personal-website-257641256327-us-east-1 \
  --prefix index.html

# Restore previous version
aws s3api copy-object \
  --bucket dharam-personal-website-257641256327-us-east-1 \
  --copy-source dharam-personal-website-257641256327-us-east-1/index.html?versionId=VERSION_ID \
  --key index.html
```

## Monitoring

### CloudFlare Analytics

- Navigate to CloudFlare dashboard → Analytics
- Monitor traffic patterns, cache hit ratio, bandwidth usage
- Target cache hit ratio: 90%+

### Lighthouse Audits

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

## Documentation

- **[CLAUDE.md](CLAUDE.md)**: Claude Code instructions (973 lines)
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Comprehensive architectural documentation
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)**: Complete deployment guide
- **[docs/acm-certificate-setup.md](docs/acm-certificate-setup.md)**: ACM certificate setup
- **[docs/cloudflare-setup.md](docs/cloudflare-setup.md)**: CloudFlare configuration
- **[infrastructure/README.md](infrastructure/README.md)**: CDK infrastructure docs

## License

MIT License - See LICENSE file for details.

## Author

**Dharam Bhushan**

- AWS Engineering Manager
- AI/ML Solutions Architect
- Website: [dharambhushan.com](https://dharambhushan.com)
- 15+ years of engineering experience
- 8 years at AWS building AI/ML services and data platforms

## Resources

- **AWS CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **CloudFlare Docs**: https://developers.cloudflare.com/
- **Web3Forms**: https://web3forms.com/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

## Changelog

### 2025-10-17 - GitHub Link Update & Script Fix

- ✅ Updated GitHub link in contact page footer from /dharambhushan to /lizard53
- ✅ Fixed CloudFlare cache invalidation script to correctly report success status
- ✅ Script now properly detects `"success": true` response from CloudFlare API

### 2025-10-17 - Infrastructure Migration to us-east-1

- ✅ Migrated all infrastructure from us-west-2 to us-east-1
- ✅ Updated S3 bucket name with region suffix
- ✅ Deployed CloudFront + WAF + S3 stack to us-east-1
- ✅ Created custom 404 error page
- ✅ Fixed contact form redirect URL to include .html extension
- ✅ Updated CloudFlare setup documentation for CloudFront architecture

### 2025-10-16 - Infrastructure Refactor

- ✅ Reorganized project structure (src/, infrastructure/, scripts/, docs/)
- ✅ Added AWS CDK for CloudFront + WAF + S3 infrastructure
- ✅ Created bash deployment scripts
- ✅ Added CloudFlare setup documentation
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

**Last Updated**: October 17, 2025
