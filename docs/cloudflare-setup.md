# CloudFlare Setup Guide for dharambhushan.com

This guide walks through setting up CloudFlare as the CDN for the dharambhushan.com portfolio website hosted on AWS S3.

## Overview

CloudFlare acts as a Content Delivery Network (CDN) and provides:

- **Global Edge Caching**: Serve content from 300+ edge locations worldwide
- **SSL/TLS**: Free SSL certificates with automatic renewal
- **DDoS Protection**: Enterprise-grade protection included
- **Performance**: Brotli compression, HTTP/3, Auto Minification
- **Analytics**: Traffic analytics and performance insights
- **Security**: IP-based access control restricts S3 access to CloudFlare IPs only

## Architecture

```
User Request (https://dharambhushan.com)
    ↓
CloudFlare Edge (CDN) - CloudFlare IPs
    ↓ (HTTP - IP restricted)
AWS S3 Bucket (Website Hosting)
dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com
    ↓
Static Website Files
```

**Security**: The S3 bucket policy only allows access from CloudFlare IP ranges. Direct access to the S3 URL is blocked (403 Forbidden).

## Prerequisites

- ✅ AWS S3 bucket deployed with website hosting enabled
- ✅ Bucket policy configured for CloudFlare IP ranges
- ✅ Domain `dharambhushan.com` already in CloudFlare
- ✅ CloudFlare account (free tier is sufficient)

**S3 Configuration**:

- Bucket: `dharam-personal-website-257641256327`
- Region: `us-west-2`
- Website Endpoint: `dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com`

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
   - **Target**: `dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com`
   - **Proxy status**: ✅ **Proxied** (orange cloud icon - MUST be enabled)
   - **TTL**: Auto
   - Click **Save**

5. **Add/Update WWW Subdomain Record** (Optional)

   Click "Add record":
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com`
   - **Proxy status**: ✅ **Proxied** (orange cloud - MUST be enabled)
   - **TTL**: Auto
   - Click **Save**

**Critical**: The orange cloud (Proxied status) MUST be enabled. This:

- Routes traffic through CloudFlare's IP addresses
- Enables CloudFlare to access S3 (which only allows CloudFlare IPs)
- Enables caching, SSL, and other CloudFlare features

**Note**: DNS changes typically propagate within 5 minutes but can take up to 24 hours.

## Step 2: Configure SSL/TLS

1. **Navigate to SSL/TLS Settings**

   `dharambhushan.com` → **SSL/TLS** → **Overview**

2. **Select Encryption Mode**
   - Choose: **Flexible**
   - This encrypts traffic between users and CloudFlare
   - CloudFlare to S3 uses HTTP (S3 website endpoint doesn't support HTTPS)

   **Why Flexible?**:
   - S3 website endpoints only support HTTP
   - CloudFlare terminates SSL and proxies to S3 over HTTP
   - End users still get full HTTPS encryption

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

Ensure it resolves to CloudFlare IPs (not S3 IPs).

### Test HTTPS

```bash
curl -I https://dharambhushan.com
```

Check for:

- `HTTP/2 200` or `HTTP/3 200` (successful response)
- `cf-cache-status: MISS` or `HIT` (indicates CloudFlare is working)
- `strict-transport-security` header (if HSTS enabled)

Example output:

```
HTTP/2 200
date: Fri, 17 Oct 2025 06:00:00 GMT
content-type: text/html
cf-ray: 123456789abcd-SJC
cf-cache-status: HIT
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

### Test Cache Invalidation

```bash
npm run deploy:cloudflare
```

You should see:

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

1. Go to CloudFlare dashboard → `dharambhushan.com`
2. Navigate to **Analytics** → **Caching**
3. Check **Cache Hit Ratio**
   - Target: 90%+ (indicates effective caching)
   - If low, review caching rules

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
# 1. npm run build          - Build and validate website
# 2. npm run deploy:s3      - Upload to S3 with cache headers
# 3. npm run deploy:cloudflare - Purge CloudFlare cache
```

### Individual Deployment Steps

```bash
# 1. Build website
npm run build

# 2. Deploy to S3
npm run deploy:s3

# 3. Purge CloudFlare cache
npm run deploy:cloudflare
```

## Maintenance

### Update CloudFlare IP Whitelist in S3 Bucket Policy

CloudFlare's IP ranges change occasionally. Update the S3 bucket policy:

1. Get latest CloudFlare IPs: https://www.cloudflare.com/ips/
2. Update `infrastructure/lib/website-bucket-stack.ts`:

   ```typescript
   conditions: {
     IpAddress: {
       'aws:SourceIp': [
         // Update with latest ranges from cloudflare.com/ips
         '173.245.48.0/20',
         '103.21.244.0/22',
         // ... add new ranges
       ],
     },
   }
   ```

3. Redeploy infrastructure:

   ```bash
   npm run infra:deploy
   ```

### Monitor Cache Hit Ratio

- Navigate to CloudFlare dashboard → `dharambhushan.com` → **Analytics** → **Caching**
- **Target**: 90%+ cache hit ratio
- If low, review caching rules and adjust

### Purge Cache When Needed

```bash
# Purge all cache (recommended after deployment)
npm run deploy:cloudflare

# Or purge specific files (manual API call)
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

**CloudFlare Configuration**:

1. Verify proxy status (orange cloud) is enabled
2. Check SSL/TLS mode is set to **Flexible**
3. Review CloudFlare error codes in browser

### SSL Errors

**"Too Many Redirects" or "Redirect Loop"**:

1. Change SSL/TLS mode to **Flexible** (not Full or Full Strict)
2. Disable "Always Use HTTPS" temporarily to test
3. Check for conflicting redirect rules

**Certificate Errors**:

1. Wait 24 hours for CloudFlare certificate to provision
2. Clear browser cache and cookies
3. Try incognito/private browsing mode

### 403 Forbidden Errors

**From CloudFlare**:

- Check CloudFlare firewall rules
- Verify IP is not blocked
- Check bot protection settings

**From S3**:

1. Verify bucket policy includes CloudFlare IP ranges
2. Check that proxy (orange cloud) is enabled
3. Confirm S3 website hosting is enabled

### Cache Not Updating

1. Purge CloudFlare cache: `npm run deploy:cloudflare`
2. Check browser cache (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
3. Verify cache rules in CloudFlare dashboard
4. Check `Cache-Control` headers from S3

### Slow Load Times

1. Check CloudFlare Analytics for cache hit ratio (target: 90%+)
2. Verify Auto Minify and Brotli compression are enabled
3. Run Lighthouse audit to identify bottlenecks
4. Review page rules and caching settings
5. Consider enabling Argo Smart Routing (paid feature)

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
```

## Advanced Features (Optional)

### Argo Smart Routing

- **Cost**: $5/month + $0.10/GB
- **Benefit**: Routes traffic through faster CloudFlare paths
- **Performance**: Can reduce latency by 30%+

### CloudFlare Workers (Serverless)

- Run JavaScript at the edge
- Use cases: Personalization, A/B testing, custom redirects
- **Free tier**: 100,000 requests/day

### Image Optimization

- CloudFlare Images (paid)
- Automatic WebP conversion
- Responsive image resizing

## Configuration Checklist

Use this checklist to verify your CloudFlare setup:

- [ ] DNS CNAME record created: `@` → `dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com`
- [ ] DNS CNAME record for www (optional): `www` → S3 endpoint
- [ ] Proxy status (orange cloud) enabled for both records
- [ ] SSL/TLS encryption mode set to **Flexible**
- [ ] Always Use HTTPS enabled
- [ ] Edge certificates configured (TLS 1.2+, TLS 1.3 enabled)
- [ ] HSTS enabled (optional but recommended)
- [ ] Caching level set to **Standard**
- [ ] Browser cache TTL configured
- [ ] Page rules created (optional)
- [ ] Auto Minify enabled (JS, CSS, HTML)
- [ ] Brotli compression enabled
- [ ] Early Hints enabled
- [ ] API token created with Cache Purge permission
- [ ] Zone ID copied
- [ ] Environment variables set in shell config (`~/.zshrc` or `~/.bashrc`)
- [ ] Website accessible at https://dharambhushan.com
- [ ] SSL certificate valid
- [ ] Cache purge script tested: `npm run deploy:cloudflare`

## Resources

- **CloudFlare Documentation**: https://developers.cloudflare.com/
- **CloudFlare Community**: https://community.cloudflare.com/
- **CloudFlare Status**: https://www.cloudflarestatus.com/
- **CloudFlare Speed Test**: https://speed.cloudflare.com/
- **CloudFlare IP Ranges**: https://www.cloudflare.com/ips/

## Support

**For CloudFlare Issues**:

1. Check CloudFlare documentation: https://developers.cloudflare.com/
2. Search CloudFlare community forums: https://community.cloudflare.com/
3. Contact CloudFlare support (available on all plans including free)

**For S3 Integration Issues**:

1. Review `infrastructure/README.md`
2. Check S3 bucket policy allows CloudFlare IPs
3. Verify S3 website endpoint is correct in DNS records
4. Confirm S3 website hosting is enabled

**For Deployment Issues**:

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify S3 bucket exists: `aws s3 ls s3://dharam-personal-website-257641256327`
3. Test deployment script manually: `./scripts/deploy.sh`
4. Review CloudFlare API token permissions

---

**Last Updated**: October 17, 2025
