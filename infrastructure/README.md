# Infrastructure - AWS CDK for dharambhushan.com

This directory contains the AWS CDK infrastructure code for deploying the S3 bucket that hosts the dharambhushan.com portfolio website.

## Overview

The infrastructure stack creates:

- **S3 Bucket**: Versioned S3 bucket for static website hosting
- **Bucket Policy**: Configured to allow CloudFlare IP ranges to access objects
- **Encryption**: S3-managed encryption at rest
- **Lifecycle Rules**: Automatic deletion of old versions after 90 days
- **CORS Configuration**: Enabled for web fonts and cross-origin assets

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+ and npm installed
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Setup

1. Install dependencies:

   ```bash
   cd infrastructure
   npm install
   ```

2. Bootstrap your AWS environment (first time only):

   ```bash
   npm run bootstrap
   ```

   This creates the necessary CDK toolkit resources in your AWS account.

## Deployment

### Deploy the infrastructure

```bash
# From infrastructure/ directory
npm run deploy
```

This will:

- Build the TypeScript code
- Synthesize CloudFormation template
- Deploy the S3 bucket stack to AWS

### Preview changes before deployment

```bash
npm run diff
```

### Synthesize CloudFormation template

```bash
npm run synth
```

The generated template will be in `cdk.out/` directory.

## Configuration

### Bucket Name

The default bucket name is `dharam-personal-website-257641256327`. To override:

```bash
# Via context
cdk deploy -c domainName=your-bucket-name

# Via environment variable
export DOMAIN_NAME=your-bucket-name
npm run deploy
```

**Note**: The bucket name is used as the identifier. The actual domain `dharambhushan.com` is configured separately in CloudFlare DNS.

### Environment

```bash
# Deploy to staging
cdk deploy -c environment=staging

# Deploy to production (default)
cdk deploy -c environment=production
```

### AWS Region

The default region is `us-west-2`. To use a different region:

```bash
export CDK_DEFAULT_REGION=us-east-1
npm run deploy
```

## Stack Outputs

After deployment, the stack outputs:

- **BucketName**: S3 bucket name (e.g., `dharam-personal-website-257641256327`)
- **BucketArn**: Full ARN of the S3 bucket
- **BucketWebsiteUrl**: S3 website endpoint (e.g., `http://dharam-personal-website-257641256327.s3-website-us-west-2.amazonaws.com`)
- **BucketDomainName**: S3 bucket domain name (use as CloudFlare origin)

To view outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name DharamBhushanWebsite-production \
  --query 'Stacks[0].Outputs'
```

## CloudFlare Integration

The bucket policy is configured to allow CloudFlare IP ranges. To use CloudFlare as CDN:

1. Add the **BucketDomainName** as the origin in CloudFlare
2. Configure CloudFlare DNS to point to CloudFlare's proxy
3. See `../docs/CLOUDFLARE_SETUP.md` for detailed instructions

## Security Considerations

- **Public Access**: The bucket blocks all public access by default
- **CloudFlare IPs**: Only CloudFlare IP ranges can access objects (update periodically)
- **Encryption**: All objects are encrypted at rest with S3-managed keys
- **Versioning**: Enabled for rollback capability
- **Retention**: Stack uses `RETAIN` removal policy - bucket won't be deleted on stack deletion

## Maintenance

### Update CloudFlare IP Ranges

CloudFlare's IP ranges change occasionally. Update the list in `lib/website-bucket-stack.ts`:

```typescript
conditions: {
  IpAddress: {
    'aws:SourceIp': [
      // Get latest from: https://www.cloudflare.com/ips/
      '173.245.48.0/20',
      // ... add more ranges
    ],
  },
}
```

### Destroy Infrastructure

**WARNING**: This will destroy the S3 bucket and all its contents.

```bash
npm run destroy
```

## Troubleshooting

### CDK Bootstrap Issues

If you encounter bootstrap errors:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Permission Errors

Ensure your AWS credentials have permissions to:

- Create S3 buckets
- Create IAM policies
- Create CloudFormation stacks

### Bucket Name Conflicts

S3 bucket names are globally unique. If `dharam-personal-website-257641256327` conflicts, modify the bucket name in `bin/s3-stack.ts` or set the `DOMAIN_NAME` environment variable before deployment.

## CDK Commands

```bash
npm run build      # Compile TypeScript
npm run watch      # Watch for changes
npm run cdk        # Run CDK CLI commands
npm run deploy     # Deploy infrastructure
npm run synth      # Synthesize CloudFormation
npm run diff       # Show differences
npm run destroy    # Destroy infrastructure
npm run bootstrap  # Bootstrap CDK environment
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CloudFlare CDN                    │
│           (Global Edge Cache + SSL/TLS)             │
│              dharambhushan.com                      │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTPS (CloudFlare IPs only)
                     ▼
         ┌───────────────────────────────────────────┐
         │      S3 Bucket (us-west-2)                │
         │  dharam-personal-website-257641256327     │
         │                                           │
         │  - Static website hosting enabled         │
         │  - Versioned                              │
         │  - S3-managed encryption                  │
         │  - CloudFlare IP filter via bucket policy │
         │  - CORS enabled                           │
         └───────────────────────────────────────────┘
```

## Support

For issues or questions about the infrastructure:

- Check AWS CloudFormation console for stack events
- Review CDK documentation: https://docs.aws.amazon.com/cdk/
- Check CloudWatch logs for deployment issues
