# Instructions for AI Agents - Website Template Setup

**Target Audience**: AI agents (Claude, GPT, etc.) helping users build websites from this template

---

## Critical: Read This First

This repository is a **TEMPLATE**, not a production website. It contains placeholder content as examples. Your job is to help the user customize it for their own use.

**Infrastructure Naming**: All AWS resources use generic naming conventions:

- Stack: `Website-{environment}` (e.g., `Website-production`)
- S3 Bucket: `website-{accountId}-{region}` (auto-generated, e.g., `website-123456789012-us-east-1`)
- WAF: `WebsiteCloudFrontWAF`
- Cache Policies: `WebsiteDefaultCachePolicy`, `WebsiteHTMLCachePolicy`, `WebsiteAssetsCachePolicy`

**Certificate Configuration**: Users must provide their ACM certificate ARN either via:

- Environment variable: `export CERTIFICATE_ARN='arn:aws:acm:...'`
- Or update `infrastructure/cdk.json` line 18

## Setup Workflow for AI Agents

### Phase 1: Information Gathering

**Ask the user for this information** (required):

1. **AWS Configuration**:
   - AWS Account ID (12 digits)
   - Preferred AWS region (recommend us-east-1)
   - Do they already have an ACM certificate? (if yes, get ARN)
   - Do they have a CloudFlare account? (optional)

### Phase 2: Content Customization

**Guide the user to update these files**:

1. **Homepage** (`src/index.html`):
   - This is a single-page landing template
   - Update hero section with website content and messaging
   - Customize the three feature cards (currently: Multi-Layer Security, Lightning Fast, Ridiculously Affordable)
   - Update the three technology stack cards (currently: AI-Assisted Development, AWS CDK Infrastructure, Performance Optimized)
   - Customize the "Why This Matters" section with three key bullet points
   - All call-to-action buttons are card-based with icons, titles, and descriptions

2. **Design Notes**:
   - Navigation is minimal (Home link + theme toggle only)
   - Single-page design with smooth-scroll anchor links
   - Clean white/light theme by default (deposely.com-inspired)
   - All CTAs use card-style design with icons and descriptions
   - Professional bullet points with icons for key benefits
   - No separate Services, Projects, About, or Contact pages (removed in favor of single-page design)

3. **Contact Form** (if user wants to add it):
   - User needs to choose a form backend service (FormSpree, Netlify Forms, custom API, etc.)
   - Update the form action URL to point to their chosen service
   - Verify redirect URL or success handling matches their domain and backend service

4. **Assets** (`src/assets/`):

   **IMPORTANT**: All website assets must be organized in the `src/assets/` directory structure:

   ```
   src/assets/
   ├── images/              # All images
   │   ├── og-image.jpg    # Open Graph image (1200x630px) - REQUIRED
   │   └── ...             # Other images, logos, screenshots
   │
   └── icons/              # Favicons and app icons
       ├── favicon.ico     # Browser favicon - REQUIRED
       └── apple-touch-icon.png  # Apple touch icon (180x180px)
   ```

   **Guide user to replace**:
   - Open Graph image: `src/assets/images/og-image.jpg` (1200x630px, for social sharing)
   - Favicon: `src/assets/icons/favicon.ico`
   - Apple touch icon: `src/assets/icons/apple-touch-icon.png` (180x180px)
   - Add any other images needed for the website content

   **Remind user**:
   - Optimize all images (ImageOptim, TinyPNG, etc.) to keep file sizes small
   - Use descriptive filenames for SEO
   - Keep images under 200KB when possible for performance

### Phase 5: AWS Infrastructure Setup

**Guide the user through AWS setup**:

**IMPORTANT**: Direct users to follow the comprehensive ACM certificate setup guide:

- **Guide location**: `docs/ACM_CERTIFICATE_SETUP.md`
- **Covers**: Certificate request, DNS validation, troubleshooting, renewal

**Quick Summary** (full details in `docs/ACM_CERTIFICATE_SETUP.md`):

1. **Create ACM Certificate** (MUST be in us-east-1):

   ```bash
   aws acm request-certificate \
     --domain-name example.com \
     --subject-alternative-names www.example.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Add DNS validation records** in their DNS provider (CloudFlare, Route53, etc.):
   - Get CNAME records from ACM console
   - Add to DNS provider
   - **CloudFlare**: Ensure proxy status is OFF (gray cloud) for validation records
   - **Route53**: Create CNAME records directly

3. **Wait for certificate validation** (10-20 minutes typically)

4. **Note the Certificate ARN** from ACM console:

   ```
   arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...
   ```

5. **Refer user to**: `docs/ACM_CERTIFICATE_SETUP.md` for:
   - Detailed step-by-step instructions
   - Multiple DNS provider options (CloudFlare, Route53, others)
   - Troubleshooting validation issues
   - Certificate renewal information

6. **Set environment variables**:

   ```bash
   export CDK_DEFAULT_ACCOUNT=123456789012
   export CDK_DEFAULT_REGION=us-east-1
   export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/abc123...'
   export DOMAIN_NAME='example.com'
   ```

   **Alternative**: Update `infrastructure/cdk.json` line 18:

   ```json
   "certificateArn": "arn:aws:acm:us-east-1:123456789012:certificate/abc123..."
   ```

7. **Deploy infrastructure**:

   ```bash
   npm run infra:bootstrap  # First time only
   npm run infra:deploy
   ```

   **Expected stack outputs**:
   - `BucketName`: `website-123456789012-us-east-1` (auto-generated from account ID)
   - `DistributionId`: `E123456789ABCD` (CloudFront distribution ID)
   - `DistributionDomainName`: `d123abc456def.cloudfront.net` (use as CNAME target)
   - `WebACLArn`: WAF Web ACL ARN
   - `WebsiteURL`: `https://example.com` (if certificate provided)

   **Important**: Save these outputs - you'll need the DistributionDomainName for DNS setup.

### Phase 6: DNS Configuration

**Help user configure DNS** (recommend CloudFlare):

**IMPORTANT**: Direct users to follow the comprehensive CloudFlare setup guide:

- **Guide location**: `docs/CLOUDFLARE_SETUP.md`
- **Covers**: DNS configuration, SSL/TLS setup, caching, speed optimizations, API token setup

**Quick Summary** (full details in `docs/CLOUDFLARE_SETUP.md`):

1. **CloudFlare DNS Setup**:
   - Add domain to CloudFlare (if not already added)
   - Create CNAME records:
     - Root domain (`@`) → CloudFront distribution domain (from CDK output)
     - WWW subdomain (`www`) → CloudFront distribution domain
   - Enable **Proxied** status (orange cloud) - CRITICAL for WAF to work
   - Set SSL/TLS mode to **Full (strict)**

2. **Get CloudFlare credentials** (for cache invalidation):
   - Create API token with "Zone - Cache Purge" permission
   - Get Zone ID from CloudFlare dashboard
   - Set environment variables:
     - `CLOUDFLARE_ZONE_ID`
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFRONT_DISTRIBUTION_ID` (from CDK output)
     - `S3_BUCKET_NAME` (from CDK output)

3. **Refer user to**: `docs/CLOUDFLARE_SETUP.md` for:
   - Complete step-by-step instructions
   - SSL/TLS configuration details
   - Caching optimization strategies
   - Performance testing procedures
   - Troubleshooting common issues

### Phase 7: Deployment

**IMPORTANT**: For complete deployment instructions, refer to `docs/DEPLOYMENT_GUIDE.md` which covers:

- ACM certificate creation and validation
- Infrastructure deployment with CDK
- CloudFlare configuration
- Cache invalidation
- Testing and troubleshooting

**Quick deployment workflow** (see full guide for details):

```bash
# 1. Create ACM certificate (see docs/ACM_CERTIFICATE_SETUP.md)
# 2. Set environment variables
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:...'
export DOMAIN_NAME='example.com'

# 3. Deploy infrastructure (first time)
npm run infra:bootstrap
npm run infra:deploy

# 4. Test locally
npm run dev
# Visit http://localhost:3000

# 5. Build and deploy website content
npm run deploy
```

**Verify deployment**:

- Check website loads: https://example.com
- Test all pages work correctly
- Verify contact form submits successfully
- Check theme toggle works
- Run performance audit: `npm run lighthouse`

**Deployment Checklist**:

- [ ] ACM certificate created in us-east-1 and validated (DNS validation via CloudFlare or Route53)
- [ ] Environment variables set (account ID, region, certificate ARN, domain name)
- [ ] CDK infrastructure deployed successfully
- [ ] CloudFront distribution domain saved from CDK output
- [ ] CloudFlare DNS configured (CNAME to CloudFront domain, proxy enabled)
- [ ] CloudFlare SSL/TLS mode set to "Full (strict)"
- [ ] Website content uploaded to S3
- [ ] CloudFront and CloudFlare caches invalidated
- [ ] Website accessible via HTTPS at custom domain
- [ ] Homepage loads correctly with all sections (hero, features, tech stack, benefits, CTA)
- [ ] Theme toggle works in production
- [ ] All card-based CTAs function correctly
- [ ] Smooth scroll animations work as expected

See `docs/DEPLOYMENT_GUIDE.md` for comprehensive step-by-step instructions.

---

## Common Issues AI Agents Should Handle

### Issue 1: User Doesn't Have AWS Account

**Solution**: Guide them to create one at https://aws.amazon.com/

- Recommend us-east-1 region for CloudFront compatibility
- Remind them they need admin permissions for CDK deployment

### Issue 2: Contact Form Not Working (if implemented)

**Note**: The default template is now a single-page landing without a contact form.

**If user adds contact form**:

1. Form backend service not configured correctly
2. Form action URL not pointing to backend service
3. Redirect URL or success handling not configured properly

**Fix**: Update form configuration to match chosen backend service

### Issue 3: CloudFront Shows 403 Errors

**Common causes**:

1. WAF blocking traffic (CloudFlare proxy not enabled)
2. S3 bucket policy incorrect
3. CloudFlare SSL/TLS mode not set to "Full (strict)"

**Fix**: Check CloudFlare DNS settings and SSL/TLS mode

### Issue 4: Infrastructure Deployment Fails

**Common causes**:

1. Certificate ARN not set (check environment variable or `infrastructure/cdk.json`)
2. AWS credentials not configured
3. Insufficient IAM permissions
4. Certificate not in us-east-1 region

**Fix**:

- Verify certificate ARN: `aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region us-east-1`
- Verify AWS credentials: `aws sts get-caller-identity`
- Ensure certificate is in us-east-1 (required for CloudFront)
- Check environment variables are set:
  ```bash
  echo $CDK_DEFAULT_ACCOUNT
  echo $CDK_DEFAULT_REGION
  echo $CERTIFICATE_ARN
  echo $DOMAIN_NAME
  ```

### Issue 5: Stack Names Don't Match Expectations

**Expected naming conventions** (after generalization):

- Stack name: `Website-production` (or `Website-{environment}`)
- Bucket name: `website-{accountId}-us-east-1`
- WAF name: `WebsiteCloudFrontWAF`
- Cache policies: `WebsiteDefaultCachePolicy`, `WebsiteHTMLCachePolicy`, `WebsiteAssetsCachePolicy`

If user sees old names like `DharamBhushanWebsite-*`, they need to destroy old stack first:

```bash
npm run infra:destroy  # Destroy old stack
npm run infra:deploy   # Deploy new generic stack
```

### Issue 6: Theme Not Persisting

**Common cause**: Storage key not unique after setup

**Fix**: Verify `src/js/theme-toggle.js` line 8 has unique storage key:

```javascript
this.storageKey = 'user-website-theme'; // Must be unique
```

---

## AI Agent Best Practices

### DO:

✅ **Ask for all required information upfront** before starting setup
✅ **Validate user inputs** (domain format, AWS account ID is 12 digits)
✅ **Test locally** (`npm run dev`) before deploying to AWS
✅ **Guide step-by-step** through AWS infrastructure setup
✅ **Verify each phase** completes successfully before moving to next

### DON'T:

❌ **Don't skip ACM certificate creation** - required for CloudFront
❌ **Don't forget to configure form backend service** if adding contact form
❌ **Don't deploy to AWS without testing locally first**
❌ **Don't assume user has AWS/CloudFlare knowledge** - explain each step
❌ **Don't skip validation** - check that domain format is correct

---

## Checklist for AI Agents

Use this checklist when helping users set up from this template:

### Pre-Setup

- [ ] User has Node.js 18+ and npm installed
- [ ] User has AWS CLI installed and configured
- [ ] User has a domain name (or will use CloudFront domain temporarily)
- [ ] User has AWS account with admin permissions

### Information Gathering

- [ ] Collected AWS information (account ID, region)
- [ ] Collected domain name (if using custom domain)
- [ ] Validated inputs (domain format, AWS account ID is 12 digits)

### Content Customization

- [ ] Updated hero section in index.html with website content
- [ ] Customized the three feature cards
- [ ] Customized the three technology stack cards
- [ ] Updated the "Why This Matters" bullet points
- [ ] Updated all card-based CTA buttons with appropriate icons and descriptions
- [ ] Replaced placeholder images in `src/assets/images/` with website images
- [ ] Replaced favicon in `src/assets/icons/favicon.ico`
- [ ] Replaced Apple touch icon in `src/assets/icons/apple-touch-icon.png`
- [ ] Added Open Graph image at `src/assets/images/og-image.jpg` (1200x630px)

### AWS Setup

- [ ] **Followed `docs/ACM_CERTIFICATE_SETUP.md` guide** for ACM certificate creation
- [ ] Created ACM certificate in us-east-1 (REQUIRED for CloudFront)
- [ ] Added DNS validation CNAME records to DNS provider
- [ ] **CloudFlare users**: Ensured proxy status is OFF (gray cloud) for validation records
- [ ] **Route53 users**: Created CNAME records directly in hosted zone
- [ ] Waited for certificate validation (confirmed status: Issued, typically 10-20 minutes)
- [ ] Noted certificate ARN from ACM console
- [ ] Set all required environment variables (CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION, CERTIFICATE_ARN, DOMAIN_NAME)
- [ ] Alternatively, updated `infrastructure/cdk.json` line 18 with certificate ARN
- [ ] Ran `npm run infra:bootstrap` (first time only per AWS account/region)
- [ ] Ran `npm run infra:deploy` successfully
- [ ] Saved stack outputs (BucketName, DistributionId, DistributionDomainName)
- [ ] Verified bucket name follows pattern: `website-{accountId}-us-east-1`
- [ ] Verified stack name: `Website-production`

### DNS Configuration

- [ ] **Followed `docs/CLOUDFLARE_SETUP.md` guide** for complete CloudFlare configuration
- [ ] Added domain to CloudFlare (or configured Route53)
- [ ] Added CNAME records (@ and www) pointing to CloudFront distribution domain
- [ ] Set CloudFlare proxy status to "Proxied" (orange cloud) - CRITICAL
- [ ] Set SSL/TLS mode to "Full (strict)"
- [ ] Configured caching rules for optimal performance
- [ ] Got CloudFlare Zone ID and API token (if using CloudFlare)
- [ ] Set all required environment variables (CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN, etc.)

### Testing

- [ ] Tested locally with `npm run dev`
- [ ] Homepage loads correctly at http://localhost:3000
- [ ] Theme toggle works (switches between light/dark mode with icon change)
- [ ] All anchor links scroll smoothly to sections
- [ ] All card-based CTAs are clickable and styled correctly
- [ ] Professional bullet points render with proper icons and formatting
- [ ] Animations trigger on scroll (deposely.com-style fade-ins)

### Deployment

- [ ] Ran `npm run build` successfully
- [ ] Ran `npm run deploy` successfully
- [ ] Verified website loads at custom domain
- [ ] Ran `npm run lighthouse` (scores 95+)
- [ ] Tested contact form end-to-end in production

### Post-Deployment

- [ ] Set up analytics (if user wants it)
- [ ] Set up uptime monitoring (if user wants it)
- [ ] User understands how to make updates and redeploy

---

## Quick Reference Commands

**Setup**:

```bash
npm install                    # Install dependencies
npm run infra:install          # Install CDK dependencies
```

**Development**:

```bash
npm run dev                    # Start dev server
npm run lint                   # Check code quality
npm run lint:fix               # Auto-fix issues
npm run validate:all           # Full validation
```

**AWS Infrastructure**:

```bash
npm run infra:bootstrap        # Bootstrap CDK (once)
npm run infra:deploy           # Deploy infrastructure
npm run infra:diff             # Preview changes
```

**Deployment**:

```bash
npm run build                  # Build website
npm run deploy                 # Full deployment
npm run deploy:s3              # Deploy to S3 only
npm run deploy:cloudflare      # Purge CloudFlare cache
```

**Testing**:

```bash
npm run lighthouse             # Performance audit
```

---

## Support Resources

**For AI Agents to Reference**:

- **CLAUDE.md**: Detailed technical documentation and code patterns
- **README.md**: Quick start guide and project overview
- **docs/DEPLOYMENT_GUIDE.md**: Deployment instructions
- **docs/ACM_CERTIFICATE_SETUP.md**: ACM certificate guide
- **docs/CLOUDFLARE_SETUP.md**: CloudFlare configuration

**External Resources**:

- AWS CDK: https://docs.aws.amazon.com/cdk/
- CloudFlare: https://developers.cloudflare.com/
- ACM: https://docs.aws.amazon.com/acm/
- Form Services: FormSpree, Netlify Forms, or custom backend

---

## Example Interaction Flow

**User**: "I want to build a website using this template"

**AI Agent**:

```
Great! I'll help you set up this website template. Let me gather some information first.

1. What domain will you use? (e.g., example.com)
2. What's your AWS Account ID? (12 digits)
3. Do you already have an ACM certificate? (if yes, provide the ARN)
4. Do you have a CloudFlare account?

[After collecting information]

Perfect! Here's what we'll do:
- Domain: example.com
- AWS Account: 123456789012

Next steps:
1. Customize the website content in src/index.html
2. Create an ACM certificate in AWS (if you don't have one)
3. Deploy the infrastructure
4. Configure DNS

Would you like me to guide you through each step?
```

---

---

## Template Design Changes (v2.1.0)

**Important Updates**:

1. **Single-Page Design**: Template converted from multi-page to single-page landing
   - Removed separate pages: Services, Projects, About, Contact
   - All content consolidated into `src/index.html`
   - Navigation simplified to Home + theme toggle only

2. **Card-Based CTAs**: All call-to-action buttons converted to card structure
   - Each CTA has: icon emoji, title (h3), description text
   - Consistent with feature/tech stack cards
   - Better visual hierarchy and engagement

3. **Professional Bullet Points**: "Why This Matters" section redesigned
   - Three professional benefits with icons
   - Bold headings with emoji icons
   - Key metrics highlighted in primary color
   - Clean separator lines between items

4. **Design Aesthetic**: Clean, modern deposely.com-inspired design
   - Default light theme (white background)
   - Blue color scheme (#2563eb primary)
   - Smooth scroll animations (fade-in with translateY)
   - Refined animation timing (0.8s cubic-bezier)

5. **Removed Components**:
   - "Skip to main content" accessibility link
   - Logo/branding in header ("YN" removed)
   - Multi-page navigation links
   - Animated gradient background

6. **Script Updates**:
   - `deploy.sh`: Removed hardcoded bucket name, now requires user input
   - `invalidate-cache.sh`: Generic domain placeholders

**Migration Note**: If updating from older template version, users should review `src/index.html` structure changes.

---

**Version**: 2.1.0
**Last Updated**: 2025-10-19
**For**: AI Agents assisting users with website template setup
