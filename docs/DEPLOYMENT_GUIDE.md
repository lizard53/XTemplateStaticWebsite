# Complete Deployment Guide

This guide covers the complete deployment of your portfolio website with the secure CloudFront + WAF + CloudFlare architecture.

**Replace all example values with your actual values**:

- `example.com` → your actual domain
- `123456789012` → your AWS account ID
- `d123example456.cloudfront.net` → your CloudFront distribution domain (from CDK output)
- `E123EXAMPLE456` → your CloudFront distribution ID (from CDK output)

## Architecture Overview

```
User Request (https://example.com)
    ↓
CloudFlare CDN (SSL/TLS Full Strict, Caching, DDoS Protection)
    ↓ HTTPS
AWS CloudFront (Custom Domain + ACM Cert, WAF with CloudFlare IP filtering)
    ↓ HTTPS (OAC Signed Requests)
AWS S3 Bucket (Private, CloudFront OAC only)
    ↓
Static Website Files
```

### Security Layers

1. **CloudFlare**: Edge caching, DDoS protection, SSL termination
2. **AWS WAF**: Allows only CloudFlare IPv4/IPv6 ranges, blocks all other traffic
3. **CloudFront OAC**: Signed requests to S3, prevents direct S3 access
4. **S3 Bucket Policy**: Allows only CloudFront service principal
5. **End-to-End Encryption**: HTTPS from user → CloudFlare → CloudFront → S3

## Prerequisites

- ✅ AWS Account (replace `123456789012` with your actual AWS account ID)
- ✅ Domain registered and managed in CloudFlare (or your DNS provider)
- ✅ AWS CLI configured with credentials
- ✅ Node.js 18+ installed
- ✅ CDK dependencies installed (`npm install` in infrastructure directory)

## Step 1: Create ACM Certificate

**IMPORTANT**: ACM certificate MUST be in **us-east-1** region for CloudFront.

### Create Certificate

```bash
# Request certificate in us-east-1
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names www.example.com \
  --validation-method DNS \
  --region us-east-1 \
  --tags Key=Project,Value=Portfolio
```

### Add DNS Validation Records in CloudFlare

1. Get validation records from ACM Console or CLI
2. In CloudFlare DNS, add CNAME records for validation
3. **IMPORTANT**: Set **Proxy status to DNS only** (gray cloud) for validation records
4. Wait 10-20 minutes for validation

See detailed guide: `docs/ACM_CERTIFICATE_SETUP.md`

### Save Certificate ARN

```bash
# Add to ~/.zshrc or ~/.bashrc (replace with your actual certificate ARN)
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/xxxxx-xxxx-xxxx'

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

**Alternative**: Update `infrastructure/cdk.json` line 18 with your certificate ARN.

## Step 2: Deploy Infrastructure

### Set Environment Variables

**IMPORTANT**: Replace all example values with your actual values.

```bash
# Replace with your actual AWS account ID
export CDK_DEFAULT_ACCOUNT=123456789012

# Region for CDK stack (can be any region, but us-east-1 recommended for global distribution)
export CDK_DEFAULT_REGION=us-east-1

# Your ACM certificate ARN (MUST be in us-east-1)
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/xxxxx-xxxx-xxxx'

# Your domain name
export DOMAIN_NAME='example.com'
```

### Deploy CDK Stack

```bash
# From project root
# Export AWS credentials (adjust command based on your credential setup)
source ~/aws-credentials-export.zsh

# Install CDK dependencies (first time only)
cd infrastructure
npm install
cd ..

# Bootstrap CDK (first time only)
npm run infra:bootstrap

# Deploy infrastructure
npm run infra:deploy
```

This creates:

- ✅ S3 bucket (private, OAC access only)
- ✅ CloudFront distribution with custom domain
- ✅ AWS WAF with CloudFlare IP restrictions (IPv4 + IPv6)
- ✅ Origin Access Control (OAC) for S3
- ✅ Cache policies optimized for website

### Save Stack Outputs

After deployment completes, CDK will output important values. Save them as environment variables:

```bash
# CloudFront Distribution Domain (use this as your CloudFlare CNAME target)
# Example from CDK output: d123example456.cloudfront.net
export CLOUDFRONT_DOMAIN='d123example456.cloudfront.net'

# CloudFront Distribution ID (needed for cache invalidation)
# Example from CDK output: E123EXAMPLE456
export CLOUDFRONT_DISTRIBUTION_ID='E123EXAMPLE456'

# S3 Bucket Name (needed for deployment)
# Example from CDK output: website-123456789012-us-east-1
export S3_BUCKET_NAME='website-123456789012-us-east-1'

# Add to ~/.zshrc or ~/.bashrc to persist
echo "export CLOUDFRONT_DOMAIN='d123example456.cloudfront.net'" >> ~/.zshrc
echo "export CLOUDFRONT_DISTRIBUTION_ID='E123EXAMPLE456'" >> ~/.zshrc
echo "export S3_BUCKET_NAME='website-123456789012-us-east-1'" >> ~/.zshrc
```

**Replace the example values above with the actual values from your CDK deployment output.**

## Step 3: Deploy Website Content to S3

```bash
# From project root
npm run deploy:s3
```

This uploads all website files to S3 with optimized cache headers.

## Step 4: Configure CloudFlare

### DNS Configuration

1. Log in to CloudFlare: https://dash.cloudflare.com/
2. Select `example.com`
3. Go to **DNS** → **Records**

#### Add/Update Root Domain Record

- **Type**: `CNAME`
- **Name**: `@`
- **Target**: `d123example456.cloudfront.net` (your CloudFront domain)
- **Proxy status**: ✅ **Proxied** (orange cloud - MUST be enabled)
- **TTL**: Auto

#### Add WWW Subdomain Record (Optional)

- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `d123example456.cloudfront.net`
- **Proxy status**: ✅ **Proxied** (orange cloud)
- **TTL**: Auto

**CRITICAL**: Orange cloud (Proxied) MUST be enabled for the site to work. This routes traffic through CloudFlare IPs, which are allowed by WAF.

### SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. **Encryption Mode**: Select **Full (strict)**
   - This is different from the old architecture!
   - CloudFront has a valid SSL cert from ACM
   - Full (strict) validates the certificate

3. Go to **SSL/TLS** → **Edge Certificates**
4. Enable:
   - ✅ **Always Use HTTPS**: ON
   - ✅ **Minimum TLS Version**: TLS 1.2
   - ✅ **TLS 1.3**: ON
   - ✅ **Automatic HTTPS Rewrites**: ON

5. **Enable HSTS** (Recommended):
   - **Max Age Header**: 6 months
   - **Apply to subdomains**: ON
   - **Preload**: OFF initially

### Caching Configuration

1. Go to **Caching** → **Configuration**
2. **Caching Level**: Standard
3. **Browser Cache TTL**: 4 hours

**Note**: CloudFront handles most caching, but CloudFlare adds an additional edge layer.

### Speed Optimizations

1. Go to **Speed** → **Optimization**
2. Enable:
   - ✅ **Auto Minify**: JavaScript, CSS, HTML
   - ✅ **Brotli**: ON
   - ✅ **Early Hints**: ON
3. Disable:
   - ❌ **Rocket Loader**: OFF (can interfere with vanilla JS)

## Step 5: Create CloudFlare API Token

For cache invalidation when deploying:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Permissions:
   - Zone → Cache Purge → Purge
   - Zone → Zone → Read
4. Zone Resources: `example.com`
5. Create and **copy the token**

### Get Zone ID

1. Go to CloudFlare dashboard
2. Select `example.com`
3. Scroll down on Overview page
4. Copy **Zone ID** from right sidebar

### Set Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc (replace with your actual values)
export CLOUDFLARE_ZONE_ID='your-zone-id-here'
export CLOUDFLARE_API_TOKEN='your-api-token-here'
export CLOUDFRONT_DISTRIBUTION_ID='E123EXAMPLE456'
export S3_BUCKET_NAME='website-123456789012-us-east-1'
export AWS_REGION='us-east-1'

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

**How to get these values**:

- `CLOUDFLARE_ZONE_ID`: From CloudFlare dashboard → select your domain → Overview page → right sidebar
- `CLOUDFLARE_API_TOKEN`: Created in previous step (Step 5)
- `CLOUDFRONT_DISTRIBUTION_ID`: From CDK deployment output (Step 2)
- `S3_BUCKET_NAME`: From CDK deployment output (Step 2)
- `AWS_REGION`: Region where your infrastructure is deployed (typically `us-east-1`)

## Step 6: Test the Deployment

### Test DNS Resolution

```bash
dig example.com
```

Should resolve to CloudFlare IPs.

### Test HTTPS Access

```bash
curl -I https://example.com
```

Check for:

- `HTTP/2 200` or `HTTP/3 200`
- `cf-cache-status: HIT` or `MISS` (CloudFlare working)
- `x-cache: Hit from cloudfront` or `Miss from cloudfront`
- `strict-transport-security` (if HSTS enabled)

### Open in Browser

Visit: https://example.com

Verify:

- Site loads correctly
- SSL certificate valid (padlock icon)
- No mixed content warnings
- All resources load (images, CSS, JS)

## Step 7: Deployment Workflow

### Full Deployment

```bash
# Deploy everything
npm run deploy
```

This runs:

1. `npm run build` - Build and validate website
2. `npm run deploy:s3` - Upload to S3
3. `npm run deploy:cloudflare` - Purge CloudFlare cache

### CloudFront Cache Invalidation

You'll need to add CloudFront invalidation to your deployment script.

Update `scripts/deploy.sh` to include:

```bash
# Invalidate CloudFront cache
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
fi
```

Or run manually:

```bash
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"
```

## Architecture Comparison

### Old Architecture (Direct S3 + CloudFlare)

```
CloudFlare → S3 Website Endpoint (HTTP only)
```

**Issues**:

- CloudFlare to S3 was HTTP only (not encrypted)
- S3 website endpoint doesn't support HTTPS
- Required "Flexible" SSL mode (less secure)

### New Architecture (CloudFront + WAF + CloudFlare)

```
CloudFlare → CloudFront (HTTPS) → S3 (OAC)
```

**Benefits**:

- ✅ End-to-end encryption (HTTPS throughout)
- ✅ CloudFront has ACM certificate (proper SSL)
- ✅ AWS WAF restricts access to CloudFlare IPs only
- ✅ Origin Access Control (OAC) prevents direct S3 access
- ✅ Full (strict) SSL mode in CloudFlare
- ✅ Better caching control
- ✅ HTTP/2 and HTTP/3 support

## Cost Estimate

### AWS Costs

- **S3 Storage**: ~$0.023/GB/month (for 4.2 MB ≈ $0.00)
- **CloudFront**:
  - First 10 TB: $0.085/GB
  - Estimated: $5-10/month for moderate traffic
- **WAF**: $5/month + $1/million requests
- **ACM Certificate**: FREE

**Total AWS**: ~$10-15/month

### CloudFlare

- **Free Plan**: $0/month (sufficient for this use case)

## Monitoring

### CloudWatch Metrics

- CloudFront requests, bytes downloaded, error rates
- WAF blocked requests
- S3 storage and requests

### CloudFlare Analytics

- Traffic, cache hit ratio, bandwidth
- Security threats blocked
- Performance metrics

## Troubleshooting

### Website Not Loading

1. **Check DNS**: `dig example.com`
2. **Check CloudFlare proxy**: Must be orange cloud (proxied)
3. **Check SSL/TLS mode**: Must be Full (strict)
4. **Check WAF**: Verify CloudFlare IPs are in allow list
5. **Check CloudFront**: Verify distribution is deployed

### 403 Forbidden from WAF

- WAF is blocking the request
- Verify CloudFlare proxy is enabled (orange cloud)
- Check WAF IP sets include latest CloudFlare ranges
- View WAF logs in CloudWatch

### 403 Forbidden from S3

- CloudFront OAC not configured correctly
- Check S3 bucket policy allows CloudFront service principal
- Verify distribution ID in bucket policy condition

### Certificate Errors

- Verify ACM certificate is in us-east-1
- Check certificate includes both example.com and www.example.com
- Verify certificate is "Issued" status

### Slow Performance

- Check CloudFlare cache hit ratio (target: 90%+)
- Check CloudFront cache statistics
- Verify cache policies are configured correctly
- Review cache-control headers from S3

## Updating CloudFlare IP Ranges

CloudFlare IP ranges change occasionally. Update WAF:

1. Get latest ranges:
   - IPv4: https://www.cloudflare.com/ips-v4
   - IPv6: https://www.cloudflare.com/ips-v6

2. Update `infrastructure/lib/website-bucket-stack.ts`:

   ```typescript
   const cloudflareIPv4Ranges = [
     // Add new ranges
   ];
   ```

3. Redeploy:
   ```bash
   npm run infra:deploy
   ```

## Security Best Practices

1. ✅ **End-to-end encryption**: HTTPS everywhere
2. ✅ **WAF protection**: Only CloudFlare IPs allowed
3. ✅ **OAC**: Prevents direct S3 access
4. ✅ **SSL Full (strict)**: Validates certificates
5. ✅ **HSTS**: Forces HTTPS in browsers
6. ✅ **Private S3 bucket**: No public access
7. ✅ **Versioning**: S3 versioning enabled for rollback

## Resources

- **ACM Setup**: `docs/ACM_CERTIFICATE_SETUP.md` - Detailed guide for creating and validating ACM certificates
- **CloudFlare Setup**: `docs/CLOUDFLARE_SETUP.md` - Comprehensive CloudFlare configuration guide
- **Infrastructure README**: `infrastructure/README.md` - AWS CDK infrastructure documentation
- **AWS CloudFront Docs**: https://docs.aws.amazon.com/cloudfront/
- **AWS WAF Docs**: https://docs.aws.amazon.com/waf/
- **CloudFlare Docs**: https://developers.cloudflare.com/

---

**Last Updated**: October 17, 2025
