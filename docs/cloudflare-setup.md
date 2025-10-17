# CloudFlare Setup Guide for dharambhushan.com

This guide walks through setting up CloudFlare as an additional CDN layer for the dharambhushan.com portfolio website hosted on AWS with CloudFront + WAF + S3.

## Overview

CloudFlare acts as an additional Content Delivery Network (CDN) layer on top of AWS CloudFront, providing:

- **Global Edge Caching**: Serve content from 300+ edge locations worldwide
- **DDoS Protection**: Enterprise-grade protection included in all plans
- **SSL/TLS**: Free SSL certificates with automatic renewal
- **Performance**: Brotli compression, HTTP/3, Auto Minification
- **Analytics**: Traffic analytics and performance insights
- **Additional Security Layer**: Works in conjunction with AWS WAF

## Architecture

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

**Architecture Benefits**:

- ✅ **End-to-End Encryption**: HTTPS from user → CloudFlare → CloudFront → S3
- ✅ **Multi-Layer Security**: CloudFlare DDoS + AWS WAF IP filtering + S3 OAC
- ✅ **Performance**: Dual CDN caching (CloudFlare edge + CloudFront regional)
- ✅ **Access Control**: WAF allows only CloudFlare IPv4/IPv6 ranges, S3 allows only CloudFront OAC
- ✅ **Certificate Management**: ACM certificate in us-east-1 with automatic renewal

**Security Layers**:

1. **CloudFlare**: Edge caching, DDoS protection, SSL/TLS termination
2. **AWS WAF**: IP-based filtering, allows only CloudFlare IP ranges (IPv4 + IPv6)
3. **CloudFront OAC**: Origin Access Control with signed requests to S3
4. **S3 Bucket Policy**: Allows only CloudFront service principal with distribution ARN validation
5. **Full (Strict) SSL**: CloudFlare validates CloudFront's ACM certificate

## Prerequisites

- ✅ AWS CloudFront distribution deployed with custom domain
- ✅ AWS WAF configured to allow only CloudFlare IP ranges
- ✅ ACM certificate in us-east-1 for CloudFront custom domain
- ✅ S3 bucket with CloudFront Origin Access Control (OAC)
- ✅ Domain `dharambhushan.com` already in CloudFlare
- ✅ CloudFlare account (free tier is sufficient)

**Current Infrastructure Configuration**:

- **S3 Bucket**: `dharam-personal-website-257641256327-us-east-1`
- **Region**: `us-east-1`
- **CloudFront Distribution ID**: `E14SW9FUYL655V`
- **CloudFront Domain**: `d25p12sd2oijz4.cloudfront.net`
- **ACM Certificate**: `arn:aws:acm:us-east-1:257641256327:certificate/b30ce704-7d37-4200-9815-037c834bdf41`
- **Custom Domain**: `dharambhushan.com`, `www.dharambhushan.com`

## Step 1: Configure DNS Records

**Important**: Since `dharambhushan.com` is already in CloudFlare, skip nameserver setup and go directly to DNS configuration.

1. **Log in to CloudFlare Dashboard**

   Go to: https://dash.cloudflare.com/

2. **Select Your Domain**

   Click on `dharambhushan.com`

3. **Navigate to DNS**

   Click **DNS** → **Records**

4. **Add/Update Root Domain Record**

   Click "Add record" or edit existing:
   - **Type**: `CNAME`
   - **Name**: `@` (represents root domain dharambhushan.com)
   - **Target**: `d25p12sd2oijz4.cloudfront.net`
   - **Proxy status**: ✅ **Proxied** (orange cloud icon - MUST be enabled)
   - **TTL**: Auto
   - Click **Save**

5. **Add/Update WWW Subdomain Record** (Optional)

   Click "Add record":
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `d25p12sd2oijz4.cloudfront.net`
   - **Proxy status**: ✅ **Proxied** (orange cloud - MUST be enabled)
   - **TTL**: Auto
   - Click **Save**

**Critical**: The orange cloud (Proxied status) MUST be enabled. This:

- Routes traffic through CloudFlare's IP addresses
- Enables CloudFlare to access CloudFront (which only allows CloudFlare IPs via WAF)
- Enables caching, SSL, and other CloudFlare features
- Ensures traffic comes from CloudFlare IP ranges that are whitelisted in AWS WAF

**Note**: DNS changes typically propagate within 5 minutes but can take up to 24 hours.

## Step 2: Configure SSL/TLS

1. **Navigate to SSL/TLS Settings**

   `dharambhushan.com` → **SSL/TLS** → **Overview**

2. **Select Encryption Mode**
   - Choose: **Full (strict)**
   - This encrypts traffic end-to-end with certificate validation
   - CloudFlare validates CloudFront's ACM certificate

   **Why Full (strict)?**:
   - CloudFront uses a valid ACM certificate for custom domain
   - Provides end-to-end encryption with certificate validation
   - More secure than "Flexible" or "Full" modes
   - CloudFlare validates the certificate before establishing connection

3. **Configure Edge Certificates**

   Go to **SSL/TLS** → **Edge Certificates**

   Enable these settings:
   - ✅ **Always Use HTTPS**: ON (force HTTPS redirects)
   - ✅ **Minimum TLS Version**: TLS 1.2 or higher
   - ✅ **Opportunistic Encryption**: ON
   - ✅ **TLS 1.3**: ON
   - ✅ **Automatic HTTPS Rewrites**: ON

4. **Enable HSTS (HTTP Strict Transport Security)** (Recommended)

   Still in **Edge Certificates** section:
   - Click **Enable HSTS**
   - **Max Age Header**: 6 months (15768000 seconds)
   - **Apply HSTS to subdomains**: ✅ ON (if using www)
   - **Preload**: ❌ OFF (enable later if desired)
   - Click **Save**

   **Warning**: HSTS is a security feature that forces browsers to always use HTTPS. Only enable after confirming HTTPS works correctly.

## Step 3: Configure Caching

1. **Navigate to Caching Settings**

   `dharambhushan.com` → **Caching** → **Configuration**

2. **Caching Level**
   - Select: **Standard** (caches static resources based on file extensions)

3. **Browser Cache TTL**
   - Set to: **4 hours** or **1 day** (balances freshness and performance)

4. **Create Cache Rules** (Optional - Recommended for Production)

   Go to **Rules** → **Page Rules** (Free plan allows 3 rules)

   **Page Rule 1 - Cache HTML with Short TTL**:
   - URL pattern: `dharambhushan.com/*.html`
   - Settings:
     - **Browser Cache TTL**: 1 hour
     - **Edge Cache TTL**: 1 hour
   - Click **Save and Deploy**

   **Page Rule 2 - Cache Assets Aggressively**:
   - URL pattern: `dharambhushan.com/assets/*`
   - Settings:
     - **Cache Level**: Cache Everything
     - **Edge Cache TTL**: 1 month
   - Click **Save and Deploy**

   **Page Rule 3 - WWW to Non-WWW Redirect** (Optional):
   - URL pattern: `www.dharambhushan.com/*`
   - Settings:
     - **Forwarding URL**: 301 - Permanent Redirect
     - **Destination URL**: `https://dharambhushan.com/$1`
   - Click **Save and Deploy**

## Step 4: Configure Speed Optimizations

1. **Navigate to Speed Settings**

   `dharambhushan.com` → **Speed** → **Optimization**

2. **Auto Minify**

   Enable auto minification for all file types:
   - ✅ **JavaScript**: ON
   - ✅ **CSS**: ON
   - ✅ **HTML**: ON

3. **Brotli Compression**
   - ✅ **Enable Brotli**: ON (superior to gzip, reduces file sizes by ~20%)

4. **Early Hints**
   - ✅ **Enable Early Hints**: ON (for faster resource loading)

5. **Rocket Loader** (Advanced JavaScript optimization)
   - ❌ **Disable initially** (can interfere with vanilla JavaScript)
   - Test later if you want to experiment with it

## Step 5: Configure Security (Optional)

1. **Navigate to Security Settings**

   `dharambhushan.com` → **Security** → **Settings**

2. **Security Level**
   - Select: **Medium** (balanced security and user experience)

3. **Bot Fight Mode**
   - ✅ **Enable** (blocks malicious bots, free on all plans)

4. **Browser Integrity Check**
   - ✅ **Enable** (blocks suspicious browsers)

## Step 6: Set Up API Token for Cache Purging

To use the `npm run deploy:cloudflare` script, you need a CloudFlare API token.

1. **Navigate to API Tokens**

   Go to: https://dash.cloudflare.com/profile/api-tokens

2. **Create Token**
   - Click **Create Token**
   - You can use a template or create custom token

3. **Configure Permissions** (Custom Token)
   - **Permissions**:
     - Zone → Cache Purge → Purge
     - Zone → Zone → Read
   - **Zone Resources**:
     - Include → Specific zone → Select `dharambhushan.com`
   - **Client IP Address Filtering**: Leave blank (optional)
   - **TTL**: Leave as default

4. **Create and Save Token**
   - Click **Continue to summary**
   - Review the permissions
   - Click **Create Token**
   - **COPY THE TOKEN** (you won't see it again!)

5. **Get Your Zone ID**
   - Go back to CloudFlare dashboard: https://dash.cloudflare.com/
   - Select `dharambhushan.com`
   - On the **Overview** page, scroll down
   - Find **Zone ID** in the right sidebar (under API section)
   - Copy the Zone ID

6. **Set Environment Variables**

   Add these to your `~/.zshrc` or `~/.bashrc`:

   ```bash
   # CloudFlare Configuration for dharambhushan.com
   export CLOUDFLARE_ZONE_ID='your-zone-id-here'
   export CLOUDFLARE_API_TOKEN='your-api-token-here'

   # CloudFront Configuration
   export CLOUDFRONT_DISTRIBUTION_ID='E14SW9FUYL655V'
   export S3_BUCKET_NAME='dharam-personal-website-257641256327-us-east-1'
   export AWS_REGION='us-east-1'
   ```

   Replace `your-zone-id-here` and `your-api-token-here` with your actual values.

   Then reload your shell:

   ```bash
   source ~/.zshrc  # or source ~/.bashrc
   ```

## Step 7: Verify Setup

### Test DNS Resolution

```bash
dig dharambhushan.com
```

Ensure it resolves to CloudFlare IPs (not CloudFront or S3 IPs directly).

### Test HTTPS

```bash
curl -I https://dharambhushan.com
```

Check for:

- `HTTP/2 200` or `HTTP/3 200` (successful response)
- `cf-cache-status: MISS` or `HIT` (indicates CloudFlare is working)
- `x-amz-cf-id` header (indicates CloudFront is in the chain)
- `strict-transport-security` header (if HSTS enabled)

Example output:

```
HTTP/2 200
date: Fri, 17 Oct 2025 06:00:00 GMT
content-type: text/html
cf-ray: 123456789abcd-SJC
cf-cache-status: HIT
x-amz-cf-id: abcdefghijk
age: 3600
server: cloudflare
```

### Test Website in Browser

1. Open browser and navigate to: https://dharambhushan.com
2. Verify:
   - Site loads correctly
   - SSL certificate shows (padlock icon)
   - No security warnings
   - All resources load (images, CSS, JS)

3. Check SSL certificate:
   - Click padlock icon in address bar
   - Certificate should be issued by CloudFlare
   - Connection should show as secure with TLS 1.3

### Test Cache Invalidation

Test both CloudFlare and CloudFront cache invalidation:

```bash
# Clear CloudFlare cache
npm run deploy:cloudflare

# Clear CloudFront cache
aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"
```

CloudFlare cache purge should show:

```
Purging CloudFlare cache for Zone ID: ...
✓ Cache purged successfully
```

## Step 8: Performance Testing

### Run Lighthouse Audit

From your local project:

```bash
npm run lighthouse
```

Target scores:

- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Check Cache Hit Ratio

**CloudFlare Analytics**:

1. Go to CloudFlare dashboard → `dharambhushan.com`
2. Navigate to **Analytics** → **Caching**
3. Check **Cache Hit Ratio**
   - Target: 90%+ (indicates effective caching)
   - If low, review caching rules

**CloudFront Monitoring**:

1. Go to AWS Console → CloudFront → Distributions
2. Select distribution `E14SW9FUYL655V`
3. Navigate to **Monitoring** tab
4. Check cache hit rate and requests metrics

### Test Load Time from Multiple Locations

- WebPageTest: https://www.webpagetest.org/
- GTmetrix: https://gtmetrix.com/
- Pingdom: https://tools.pingdom.com/

## Deployment Workflow

After CloudFlare setup is complete, your deployment workflow is:

```bash
# Full deployment (recommended)
npm run deploy

# This runs:
# 1. npm run build              - Build and validate website
# 2. npm run deploy:s3          - Upload to S3 with cache headers
# 3. npm run deploy:cloudflare  - Purge CloudFlare cache
```

**Note**: You should also invalidate CloudFront cache after deployment:

```bash
# Complete deployment with both CDN cache invalidation
npm run deploy && aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"
```

### Individual Deployment Steps

```bash
# 1. Build website
npm run build

# 2. Deploy to S3
npm run deploy:s3

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"

# 4. Purge CloudFlare cache
npm run deploy:cloudflare
```

## Maintenance

### Update CloudFlare IP Ranges in AWS WAF

CloudFlare's IP ranges change occasionally. Update the AWS WAF IP sets:

1. Get latest CloudFlare IPs:
   - IPv4: https://www.cloudflare.com/ips-v4
   - IPv6: https://www.cloudflare.com/ips-v6

2. Update `infrastructure/lib/website-bucket-stack.ts`:

   ```typescript
   const cloudflareIPv4Ranges = [
     // Update with latest ranges from cloudflare.com/ips-v4
     '173.245.48.0/20',
     '103.21.244.0/22',
     '103.22.200.0/22',
     // ... add new ranges
   ];

   const cloudflareIPv6Ranges = [
     // Update with latest ranges from cloudflare.com/ips-v6
     '2400:cb00::/32',
     '2606:4700::/32',
     // ... add new ranges
   ];
   ```

3. Redeploy infrastructure:

   ```bash
   cd infrastructure
   npm run deploy
   ```

### Monitor Cache Performance

**CloudFlare Analytics**:

- Navigate to CloudFlare dashboard → `dharambhushan.com` → **Analytics** → **Caching**
- **Target**: 90%+ cache hit ratio
- If low, review caching rules and adjust

**CloudFront Monitoring**:

- Navigate to AWS Console → CloudFront → Distributions → `E14SW9FUYL655V`
- Check **Monitoring** tab for cache hit rate
- Review **Reports & analytics** for detailed metrics

### Purge Cache When Needed

```bash
# Purge CloudFlare cache (recommended after deployment)
npm run deploy:cloudflare

# Purge CloudFront cache
aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"

# Or purge specific files from CloudFlare (manual API call)
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://dharambhushan.com/index.html"]}'
```

## Troubleshooting

### Website Not Loading

**DNS Issues**:

1. Check DNS propagation: https://dnschecker.org/
2. Verify CloudFlare nameservers are set correctly at registrar
3. Check CloudFlare status: https://www.cloudflarestatus.com/
4. Verify CNAME target is `d25p12sd2oijz4.cloudfront.net`

**CloudFlare Configuration**:

1. Verify proxy status (orange cloud) is enabled
2. Check SSL/TLS mode is set to **Full (strict)**
3. Review CloudFlare error codes in browser

**CloudFront Configuration**:

1. Verify distribution status is "Deployed" in AWS Console
2. Check CloudFront domain resolves: `dig d25p12sd2oijz4.cloudfront.net`
3. Test CloudFront direct access (should work if WAF allows your IP or temporarily disable WAF)

### SSL Errors

**"Too Many Redirects" or "Redirect Loop"**:

1. Verify SSL/TLS mode is set to **Full (strict)** (not Flexible)
2. Check CloudFront viewer protocol policy is "Redirect HTTP to HTTPS"
3. Disable "Always Use HTTPS" in CloudFlare temporarily to test
4. Check for conflicting redirect rules

**Certificate Errors**:

1. Wait 24 hours for CloudFlare certificate to provision
2. Verify ACM certificate is valid in AWS Console
3. Check CloudFront alternate domain names (CNAMEs) include your domain
4. Clear browser cache and cookies
5. Try incognito/private browsing mode

### 403 Forbidden Errors

**From CloudFlare**:

- Check CloudFlare firewall rules
- Verify IP is not blocked
- Check bot protection settings
- Review CloudFlare security events in dashboard

**From AWS WAF**:

1. Verify request is coming from CloudFlare IP range
2. Check AWS WAF logs in CloudWatch
3. Temporarily test with WAF disabled (for debugging only)
4. Confirm CloudFlare proxy (orange cloud) is enabled

**From CloudFront**:

1. Check CloudFront distribution status is "Deployed"
2. Verify alternate domain names (CNAMEs) are configured
3. Check origin access control is configured correctly

**From S3**:

1. Verify S3 bucket policy allows CloudFront service principal
2. Check CloudFront Origin Access Control is attached
3. Confirm distribution ARN in bucket policy matches deployed distribution

### Cache Not Updating

1. Purge both caches:
   - CloudFlare: `npm run deploy:cloudflare`
   - CloudFront: `aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"`
2. Check browser cache (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
3. Verify cache rules in both CloudFlare and CloudFront
4. Check `Cache-Control` headers from S3
5. Wait 5-10 minutes for cache invalidation to complete

### Slow Load Times

1. Check CloudFlare Analytics for cache hit ratio (target: 90%+)
2. Check CloudFront cache hit rate in AWS Console
3. Verify Auto Minify and Brotli compression are enabled in CloudFlare
4. Run Lighthouse audit to identify bottlenecks
5. Review page rules and caching settings in both CDNs
6. Consider enabling Argo Smart Routing in CloudFlare (paid feature)
7. Check CloudFront edge locations serving your traffic

### API Token Issues

**Cache Purge Failing**:

1. Verify `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` are set
2. Check token permissions include "Cache Purge"
3. Ensure token hasn't expired
4. Regenerate token if needed

**Check Environment Variables**:

```bash
echo $CLOUDFLARE_ZONE_ID
echo $CLOUDFLARE_API_TOKEN
echo $CLOUDFRONT_DISTRIBUTION_ID
echo $S3_BUCKET_NAME
```

### WAF Blocking Legitimate Traffic

**Symptoms**: 403 Forbidden errors from AWS WAF

**Solutions**:

1. Verify CloudFlare proxy (orange cloud) is enabled
2. Check CloudFlare IP ranges are up to date in WAF rules
3. Review AWS WAF logs in CloudWatch Logs
4. Test with WAF temporarily disabled (debugging only):
   ```bash
   # Disassociate WAF from CloudFront (temporary)
   aws wafv2 disassociate-web-acl --resource-arn <cloudfront-arn> --region us-east-1
   ```
5. Update WAF IP ranges if CloudFlare has added new ranges

## Advanced Features (Optional)

### Argo Smart Routing (CloudFlare)

- **Cost**: $5/month + $0.10/GB
- **Benefit**: Routes traffic through faster CloudFlare paths
- **Performance**: Can reduce latency by 30%+

### CloudFlare Workers (Serverless)

- Run JavaScript at the edge
- Use cases: Personalization, A/B testing, custom redirects
- **Free tier**: 100,000 requests/day

### Image Optimization

**CloudFlare Images** (paid):

- Automatic WebP conversion
- Responsive image resizing
- On-the-fly transformations

**CloudFront Functions** (serverless):

- Lightweight JavaScript execution at CloudFront edge
- Use cases: URL rewrites, request/response manipulation
- Very low latency (<1ms)

### Lambda@Edge

- Run Node.js/Python code at CloudFront edge locations
- More powerful than CloudFront Functions
- Use cases: Authentication, dynamic content generation, A/B testing

## Configuration Checklist

Use this checklist to verify your CloudFlare + CloudFront setup:

**DNS Configuration**:

- [ ] DNS CNAME record created: `@` → `d25p12sd2oijz4.cloudfront.net`
- [ ] DNS CNAME record for www (optional): `www` → `d25p12sd2oijz4.cloudfront.net`
- [ ] Proxy status (orange cloud) enabled for both records

**CloudFlare SSL/TLS**:

- [ ] SSL/TLS encryption mode set to **Full (strict)**
- [ ] Always Use HTTPS enabled
- [ ] Edge certificates configured (TLS 1.2+, TLS 1.3 enabled)
- [ ] HSTS enabled (optional but recommended)

**CloudFlare Caching**:

- [ ] Caching level set to **Standard**
- [ ] Browser cache TTL configured
- [ ] Page rules created (optional)

**CloudFlare Speed**:

- [ ] Auto Minify enabled (JS, CSS, HTML)
- [ ] Brotli compression enabled
- [ ] Early Hints enabled

**CloudFlare API**:

- [ ] API token created with Cache Purge permission
- [ ] Zone ID copied
- [ ] Environment variables set in shell config (`~/.zshrc` or `~/.bashrc`)

**CloudFront Configuration**:

- [ ] Distribution status is "Deployed"
- [ ] Custom domain configured: `dharambhushan.com`, `www.dharambhushan.com`
- [ ] ACM certificate attached
- [ ] Origin Access Control (OAC) configured for S3

**AWS WAF**:

- [ ] WAF Web ACL attached to CloudFront distribution
- [ ] CloudFlare IPv4 ranges whitelisted
- [ ] CloudFlare IPv6 ranges whitelisted
- [ ] Default action set to "Block"

**S3 Configuration**:

- [ ] Bucket is private (all public access blocked)
- [ ] Bucket policy allows only CloudFront service principal
- [ ] Website files deployed

**Testing**:

- [ ] Website accessible at https://dharambhushan.com
- [ ] SSL certificate valid (CloudFlare)
- [ ] CloudFront headers present (x-amz-cf-id)
- [ ] Cache purge scripts tested:
  - [ ] CloudFlare: `npm run deploy:cloudflare`
  - [ ] CloudFront: `aws cloudfront create-invalidation --distribution-id E14SW9FUYL655V --paths "/*"`

## Resources

**CloudFlare**:

- **CloudFlare Documentation**: https://developers.cloudflare.com/
- **CloudFlare Community**: https://community.cloudflare.com/
- **CloudFlare Status**: https://www.cloudflarestatus.com/
- **CloudFlare Speed Test**: https://speed.cloudflare.com/
- **CloudFlare IP Ranges**: https://www.cloudflare.com/ips/

**AWS**:

- **CloudFront Documentation**: https://docs.aws.amazon.com/cloudfront/
- **AWS WAF Documentation**: https://docs.aws.amazon.com/waf/
- **ACM Documentation**: https://docs.aws.amazon.com/acm/
- **S3 Documentation**: https://docs.aws.amazon.com/s3/

## Support

**For CloudFlare Issues**:

1. Check CloudFlare documentation: https://developers.cloudflare.com/
2. Search CloudFlare community forums: https://community.cloudflare.com/
3. Contact CloudFlare support (available on all plans including free)

**For AWS CloudFront Issues**:

1. Review AWS CloudFront documentation: https://docs.aws.amazon.com/cloudfront/
2. Check AWS service health: https://status.aws.amazon.com/
3. Review CloudWatch logs and metrics
4. Contact AWS Support (requires support plan)

**For AWS WAF Issues**:

1. Review WAF logs in CloudWatch Logs Insights
2. Check WAF documentation: https://docs.aws.amazon.com/waf/
3. Verify CloudFlare IP ranges are current
4. Test with WAF temporarily disabled (debugging only)

**For S3 Integration Issues**:

1. Review `infrastructure/README.md`
2. Check S3 bucket policy allows CloudFront service principal
3. Verify CloudFront Origin Access Control is configured
4. Confirm S3 bucket is in correct region (us-east-1)

**For Deployment Issues**:

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify S3 bucket exists: `aws s3 ls s3://dharam-personal-website-257641256327-us-east-1`
3. Test deployment script manually: `./scripts/deploy.sh`
4. Review CloudFlare API token permissions
5. Check CloudFront distribution status

---

**Last Updated**: October 17, 2025
**Architecture**: CloudFlare + CloudFront + WAF + S3 (us-east-1)
