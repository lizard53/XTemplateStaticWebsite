# dharambhushan.com

Professional portfolio website for Dharam Bhushan - AWS Engineering Manager & AI/ML Solutions Architect

## 🎯 Overview

Static website showcasing 15+ years of engineering experience, including 8 years at AWS building AI/ML services and data platforms. Optimized for S3 hosting with CloudFlare CDN delivery.

**Portfolio Highlights:**

- 8 major AI/ML services delivered
- 4 data platform solutions built
- Engineering leadership & team scaling expertise
- AWS-inspired professional design

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build & Optimize

```bash
# Run all optimizations
npm run optimize

# Or run individual optimizations:
npm run optimize:css    # Minify CSS
npm run optimize:js     # Minify JavaScript
npm run optimize:images # Optimize images
```

### Code Quality & Linting

```bash
# Run all linters (HTML, CSS, JavaScript)
npm run lint

# Run linters with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Validate and lint everything
npm run validate:all

# Individual linters
npm run lint:html       # HTMLHint validation
npm run lint:css        # Stylelint validation
npm run lint:js         # ESLint validation
```

### Performance Testing

```bash
# Run Lighthouse performance audit
npm run lighthouse

# Legacy validation (HTML & CSS only)
npm run validate
```

## 📁 Project Structure

```
/
├── index.html              # Main entry point
├── css/
│   ├── main.css           # Core styles & layout
│   ├── components.css     # Reusable UI components
│   ├── themes.css         # Light/dark mode themes
│   └── animations.css     # Scroll effects & micro-interactions
├── js/
│   ├── main.js            # Core functionality
│   ├── theme-toggle.js    # Dark mode switcher
│   ├── animations.js      # Scroll-triggered animations
│   └── analytics.js       # Privacy-focused tracking
├── assets/
│   ├── images/            # Photos & service diagrams
│   ├── icons/             # Technology logos & favicons
│   └── resume/            # PDF downloads
├── .editorconfig          # Editor configuration
├── .eslintrc.json         # ESLint rules (JavaScript)
├── .htmlhintrc            # HTMLHint rules
├── .prettierrc            # Prettier formatting
├── .stylelintrc.json      # Stylelint rules (CSS)
├── eslint.config.js       # ESLint 9 flat config
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
└── package.json           # Build tools & scripts
```

## 🎨 Design System

### Color Palette

- **Primary:** AWS Orange (#FF9900)
- **Dark Theme:** Background #0f1419, Surface #1a1f26
- **Light Theme:** Background #ffffff, Surface #f5f5f5

### Typography

- **Primary Font:** System font stack (SF Pro, Segoe UI, Roboto)
- **Monospace:** SF Mono, Monaco, Cascadia Code

### Responsive Breakpoints

- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## 🌐 Deployment to AWS S3 + CloudFlare

### Prerequisites

1. **AWS Account** with S3 bucket configured
2. **AWS CLI** installed and configured
3. **CloudFlare Account** with DNS configured

### Step 1: Configure AWS S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://dharambhushan.com

# Enable static website hosting
aws s3 website s3://dharambhushan.com \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dharambhushan.com/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket dharambhushan.com \
  --policy file://bucket-policy.json
```

### Step 2: Deploy to S3

```bash
# Set environment variable for CloudFront distribution (if using)
export CF_DISTRIBUTION_ID=your-distribution-id

# Deploy using npm script
npm run deploy

# Or manually sync files
aws s3 sync . s3://dharambhushan.com \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "scripts/*" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE
```

### Step 3: Configure CloudFlare

1. **Add Site to CloudFlare**
   - Add `dharambhushan.com` to your CloudFlare account
   - Update nameservers at your domain registrar

2. **DNS Settings**

   ```
   Type: CNAME
   Name: @ (or www)
   Target: dharambhushan.com.s3-website-us-east-1.amazonaws.com
   Proxy: Enabled (orange cloud)
   ```

3. **SSL/TLS Settings**
   - SSL/TLS encryption mode: **Full**
   - Always Use HTTPS: **Enabled**
   - Automatic HTTPS Rewrites: **Enabled**

4. **Page Rules** (Recommended)

   ```
   URL: dharambhushan.com/*
   Settings:
   - Browser Cache TTL: 1 year
   - Cache Level: Standard
   - Edge Cache TTL: 1 month
   ```

5. **Performance Optimizations**
   - Enable **Auto Minify** (HTML, CSS, JS)
   - Enable **Brotli** compression
   - Enable **HTTP/3** (with QUIC)
   - Set **Browser Cache TTL** to 1 year

### Step 4: CloudFront Integration (Optional)

If using CloudFront instead of direct S3:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name dharambhushan.com.s3.amazonaws.com \
  --default-root-object index.html

# Invalidate cache after deployment
aws cloudfront create-invalidation \
  --distribution-id $CF_DISTRIBUTION_ID \
  --paths "/*"
```

## 🔧 Configuration

### Environment Variables

Create `.env` file (not committed to git):

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=dharambhushan.com

# CloudFlare Configuration
CF_DISTRIBUTION_ID=your-distribution-id
CF_ZONE_ID=your-zone-id

# Analytics (optional)
GA_TRACKING_ID=G-XXXXXXXXXX
```

### MIME Types

Ensure correct MIME types for S3:

```bash
# Set MIME types during upload
aws s3 cp index.html s3://dharambhushan.com/ \
  --content-type "text/html; charset=utf-8"

aws s3 cp css/ s3://dharambhushan.com/css/ \
  --recursive \
  --content-type "text/css; charset=utf-8"

aws s3 cp js/ s3://dharambhushan.com/js/ \
  --recursive \
  --content-type "application/javascript; charset=utf-8"
```

## 📊 Performance Targets

- **Initial Load:** < 1.5s (AWS best practices)
- **First Contentful Paint (FCP):** < 1.0s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 2.0s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Lighthouse Score:** > 95

### Performance Checklist

- ✅ CSS/JS minification
- ✅ Image optimization
- ✅ Lazy loading for images
- ✅ Critical CSS inlining (optional)
- ✅ Font preloading
- ✅ CloudFlare CDN caching
- ✅ Brotli/Gzip compression
- ✅ HTTP/2 or HTTP/3

## 🔒 Security Headers

Configure CloudFlare security headers:

```javascript
// Workers script for custom headers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  const newHeaders = new Headers(response.headers);

  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
```

## 📈 Analytics & Monitoring

### Built-in Analytics

The site includes privacy-focused analytics in `js/analytics.js`:

- Page views
- Click tracking
- Performance metrics (Core Web Vitals)
- Scroll depth
- Time on page

### Integration Options

**Google Analytics 4:**

```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible Analytics (Privacy-friendly):**

```html
<script defer data-domain="dharambhushan.com" src="https://plausible.io/js/script.js"></script>
```

## 🎯 SEO Optimization

- ✅ Semantic HTML5 structure
- ✅ Meta tags (title, description, Open Graph, Twitter)
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Image alt attributes
- ✅ WCAG 2.1 AA accessibility

### Submit to Search Engines

```bash
# Google Search Console
https://search.google.com/search-console

# Bing Webmaster Tools
https://www.bing.com/webmasters
```

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Reduced motion support
- Sufficient color contrast
- Focus indicators
- Skip links

## 🧪 Testing & Code Quality

### Code Style & Linting

The project uses a comprehensive code quality infrastructure with pre-commit hooks:

**Linting Tools:**

- **HTMLHint**: HTML structure and best practices validation
- **Stylelint**: CSS linting with standard config
- **ESLint**: JavaScript linting (ES2021, browser environment)
- **Prettier**: Code formatting across all file types
- **EditorConfig**: Editor consistency settings

**Pre-commit Hooks:**

- Automatically runs via **Husky** and **lint-staged**
- Formats code with Prettier
- Fixes linting issues where possible
- Prevents commits with style violations

**Code Style Standards:**

- Indentation: 2 spaces (CSS/JS), 4 spaces (HTML)
- Quotes: Single quotes for JS/CSS
- Semicolons: Required in JavaScript
- Line width: 100 characters (Prettier)
- Modern JavaScript: ES2021 with const/let, arrow functions, template literals

### Running Tests

```bash
# Code quality checks
npm run lint              # Run all linters
npm run lint:fix          # Auto-fix issues
npm run format            # Format all files
npm run validate:all      # Format check + lint

# Performance testing
npm run lighthouse        # Lighthouse audit

# Legacy validation
npm run validate          # HTML & CSS only

# Cross-browser testing (manual)
# - Chrome/Edge (Chromium)
# - Firefox
# - Safari
# - Mobile browsers (iOS/Android)
```

### Pre-commit Hook

Git commits automatically trigger:

1. **HTML files**: HTMLHint validation → Prettier formatting
2. **CSS files**: Stylelint fix → Prettier formatting
3. **JavaScript files**: ESLint fix → Prettier formatting
4. **JSON/Markdown**: Prettier formatting

Configuration files:

- `.husky/pre-commit` - Git hook script
- `package.json` → `lint-staged` - Pre-commit file patterns

## 🐛 Troubleshooting

### S3 Access Denied

- Verify bucket policy allows public read
- Check CloudFlare SSL/TLS mode is "Full"

### CSS/JS Not Loading

- Verify MIME types are set correctly
- Check CloudFlare cache settings
- Clear browser cache

### Slow Performance

- Enable CloudFlare minification
- Verify Brotli compression is enabled
- Check image optimization

## 📝 License

MIT License - See LICENSE file

## 👤 Author

**Dharam Bhushan**

- Engineering Manager @ AWS
- 15+ years experience
- Specialized in AI/ML & Data Platforms

---

Built with ❤️ using HTML5, CSS3, and vanilla JavaScript
