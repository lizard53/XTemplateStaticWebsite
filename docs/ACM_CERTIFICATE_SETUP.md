# ACM Certificate Setup for CloudFront

This guide walks through creating an ACM (AWS Certificate Manager) certificate for your custom domain to use with CloudFront.

## Prerequisites

- Domain name (e.g., `example.com`) registered and managed in your DNS provider
- AWS CLI configured with appropriate credentials
- Access to your DNS provider settings (CloudFlare, Route53, etc.)

## Important: us-east-1 Region Requirement

**CloudFront requires ACM certificates to be in us-east-1 (N. Virginia) region**, regardless of where your other resources are deployed.

## Step 1: Request ACM Certificate

### Option A: Using AWS Console

1. **Switch to us-east-1 Region**:
   - Go to AWS Console: https://console.aws.amazon.com/acm/
   - In the top-right corner, select **US East (N. Virginia) us-east-1**
   - This is crucial - CloudFront only works with certificates in us-east-1

2. **Request Certificate**:
   - Click **Request a certificate**
   - Select **Request a public certificate**
   - Click **Next**

3. **Domain Names**:
   - **Fully qualified domain name**: `example.com`
   - Click **Add another name to this certificate**
   - Add: `www.example.com`
   - Click **Next**

4. **Validation Method**:
   - Select **DNS validation**
   - Click **Next**

5. **Tags** (Optional):
   - Key: `Project`, Value: `Portfolio`
   - Key: `Environment`, Value: `production`
   - Click **Next**

6. **Review and Request**:
   - Review all settings
   - Click **Request**

### Option B: Using AWS CLI

```bash
# IMPORTANT: Must use us-east-1 region
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names www.example.com \
  --validation-method DNS \
  --region us-east-1 \
  --tags Key=Project,Value=Portfolio Key=Environment,Value=production

# Save the Certificate ARN from the output
# It will look like: arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...
```

## Step 2: Get DNS Validation Records

### Using AWS Console

1. Go to **ACM Console** (us-east-1): https://console.aws.amazon.com/acm/home?region=us-east-1
2. Click on your certificate (status will be "Pending validation")
3. Expand the **Domains** section
4. You'll see CNAME records for each domain:
   - Name: `_xxxxxxxxxxxxx.example.com`
   - Value: `_xxxxxxxxxxxxx.acm-validations.aws.`

### Using AWS CLI

```bash
# Get certificate ARN (replace with your actual ARN from previous step)
CERT_ARN="arn:aws:acm:us-east-1:123456789012:certificate/abc123def456..."

# Get validation records
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

## Step 3: Add DNS Records in Your DNS Provider

### Option A: Using CloudFlare

1. **Log in to CloudFlare**:
   - Go to: https://dash.cloudflare.com/
   - Select your domain (e.g., `example.com`)

2. **Navigate to DNS**:
   - Click **DNS** → **Records**

3. **Add CNAME Records for Validation**:

   For each domain (example.com and www.example.com):
   - Click **Add record**
   - **Type**: `CNAME`
   - **Name**: Copy the `_xxxxx.example.com` from ACM (remove the domain part, just use `_xxxxx`)
   - **Target**: Copy the `_xxxxx.acm-validations.aws.` value from ACM
   - **Proxy status**: 🔴 **DNS only** (gray cloud - MUST be disabled for validation)
   - **TTL**: Auto
   - Click **Save**

   **Important**: The proxy (orange cloud) MUST be **disabled** for ACM validation records. Use gray cloud (DNS only).

### Option B: Using Route53

1. **Navigate to Route53 Console**:
   - Go to: https://console.aws.amazon.com/route53/
   - Select your hosted zone

2. **Create Record**:
   - Click **Create record**
   - **Record name**: Paste the full `_xxxxx.example.com` from ACM
   - **Record type**: CNAME
   - **Value**: Paste the `_xxxxx.acm-validations.aws.` value from ACM
   - **TTL**: 300 seconds
   - Click **Create records**

### Option C: Using Other DNS Providers

Add a CNAME record with:

- **Name/Host**: `_xxxxx` (validation subdomain from ACM)
- **Type**: CNAME
- **Value/Target**: `_xxxxx.acm-validations.aws.` (from ACM)
- **TTL**: 300-3600 seconds

## Step 4: Wait for Validation

### Time Required

- DNS propagation: 5-15 minutes typically
- ACM validation: 1-5 minutes after DNS propagates
- Total time: Usually 10-20 minutes

### Check Validation Status

#### Using AWS Console

1. Go to ACM Console (us-east-1)
2. Refresh the page
3. Certificate status should change from "Pending validation" to "Issued"

#### Using AWS CLI

```bash
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.Status' \
  --output text
```

Should return: `ISSUED`

#### Check DNS Propagation

```bash
# Check if DNS records are propagated
dig _xxxxxxxxxxxxx.example.com CNAME
```

## Step 5: Save Certificate ARN

Once the certificate status is **Issued**, save the Certificate ARN:

### Get Certificate ARN

#### Using AWS Console

1. Go to ACM Console (us-east-1)
2. Click on your certificate
3. Copy the **ARN** (e.g., `arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...`)

#### Using AWS CLI

```bash
# List all certificates in us-east-1
aws acm list-certificates --region us-east-1

# Get specific certificate details
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1
```

### Set Environment Variable

Add the Certificate ARN to your shell configuration:

```bash
# Add to ~/.zshrc or ~/.bashrc (replace with your actual certificate ARN)
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...'

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

**Alternative**: Update `infrastructure/cdk.json` line 18 with your certificate ARN.

## Step 6: Deploy Infrastructure with Certificate

Now deploy the CloudFront distribution with the ACM certificate:

```bash
# Set environment variables (replace with your actual values)
export CDK_DEFAULT_ACCOUNT=123456789012        # Your AWS account ID
export CDK_DEFAULT_REGION=us-east-1            # Must be us-east-1 for CloudFront
export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...'
export DOMAIN_NAME='example.com'               # Your domain name

# Deploy infrastructure
cd infrastructure
npm run deploy
```

The CloudFront distribution will be created with:

- Custom domain: `example.com` and `www.example.com`
- SSL/TLS certificate from ACM (in us-east-1)
- Automatic HTTPS redirection
- WAF with CloudFlare IP filtering

## Troubleshooting

### Certificate Stuck in "Pending Validation"

**Check DNS Records**:

```bash
dig _xxxxxxxxxxxxx.example.com CNAME
```

**Common Issues**:

1. **Proxy enabled in CloudFlare**: Validation records MUST have proxy disabled (gray cloud)
2. **Wrong record type**: Must be CNAME, not A record
3. **Typo in record name or value**: Copy-paste exactly from ACM
4. **DNS not propagated**: Wait 10-15 minutes and try again

**Fix**:

1. Go to CloudFlare DNS settings
2. Find the `_xxxxx` validation records
3. Ensure **Proxy status** is **DNS only** (gray cloud)
4. Verify the CNAME value matches ACM exactly
5. Wait 10-15 minutes for propagation

### Wrong Region

**Error**: `Certificate not found` or `Certificate in wrong region`

**Fix**:

- ACM certificate MUST be in **us-east-1**
- Check region in AWS Console (top-right corner)
- Recreate certificate in us-east-1 if created in wrong region

### DNS Validation Not Working

**Check DNS Provider**:

1. Log in to your DNS provider (CloudFlare, Route53, etc.)
2. Navigate to DNS records
3. Verify validation CNAME records exist
4. **For CloudFlare**: Ensure **Proxy status is OFF** (gray cloud, not orange)
5. **For other providers**: Verify CNAME record values match ACM exactly

**Check DNS Propagation**:

```bash
# Check from different DNS servers
dig @8.8.8.8 _xxxxx.example.com CNAME
dig @1.1.1.1 _xxxxx.example.com CNAME
```

## Certificate Renewal

ACM certificates are **automatically renewed** by AWS as long as:

1. DNS validation records remain in place
2. Domain is still owned by the same AWS account
3. Certificate is in use (attached to CloudFront, ALB, etc.)

**Important**: Do NOT delete the `_xxxxx` validation CNAME records from your DNS provider. They are needed for automatic renewal.

## Security Best Practices

1. **Use DNS Validation**: More secure than email validation
2. **Enable Certificate Transparency Logging**: Enabled by default in ACM
3. **Monitor Expiration**: Set CloudWatch alarms for certificate expiration
4. **Keep Validation Records**: Required for automatic renewal

## Cost

ACM certificates are **FREE** when used with AWS services like CloudFront, ALB, or API Gateway.

## Next Steps

After certificate is issued:

1. **Deploy Infrastructure**:

   ```bash
   # Set environment variables with your values
   export CERTIFICATE_ARN='arn:aws:acm:us-east-1:123456789012:certificate/abc123def456...'
   export DOMAIN_NAME='example.com'

   # Deploy CDK stack
   npm run infra:deploy
   ```

2. **Configure DNS** (CloudFlare recommended):
   - Follow `docs/CLOUDFLARE_SETUP.md` for complete CloudFlare setup
   - Create CNAME: `example.com` → CloudFront distribution domain (from CDK output)
   - Set SSL/TLS mode to **Full (strict)**
   - Enable Proxied status (orange cloud)

3. **Test**:

   ```bash
   curl -I https://example.com
   ```

   Should return HTTP/2 200 with CloudFlare and CloudFront headers.

## Resources

- **ACM Documentation**: https://docs.aws.amazon.com/acm/
- **CloudFront + ACM**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
- **DNS Validation**: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html

---

**Last Updated**: October 17, 2025
