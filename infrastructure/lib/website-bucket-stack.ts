import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export interface WebsiteBucketStackProps extends cdk.StackProps {
  /**
   * The domain name for the website (e.g., 'dharambhushan.com')
   */
  domainName: string;

  /**
   * The S3 bucket name (e.g., 'dharam-personal-website-257641256327')
   */
  bucketName: string;

  /**
   * ACM certificate ARN in us-east-1 region (required for CloudFront)
   * You must create this certificate manually in us-east-1 before deploying
   */
  certificateArn?: string;
}

export class WebsiteBucketStack extends cdk.Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WebsiteBucketStackProps) {
    super(scope, id, props);

    // ==========================================
    // S3 BUCKET
    // ==========================================

    // S3 bucket for website hosting (private, accessed via CloudFront OAC only)
    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: props.bucketName,
      // Block ALL public access - only CloudFront can access via OAC
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Enable versioning for rollback capability
      versioned: true,
      // Encryption at rest
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Lifecycle rules for cost optimization
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
      ],
      // CORS configuration for web fonts and assets
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      // Removal policy - retain bucket on stack deletion
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // ==========================================
    // CLOUDFLARE IP RANGES FOR WAF
    // ==========================================

    // CloudFlare IPv4 ranges
    // Source: https://www.cloudflare.com/ips-v4
    const cloudflareIPv4Ranges = [
      '173.245.48.0/20',
      '103.21.244.0/22',
      '103.22.200.0/22',
      '103.31.4.0/22',
      '141.101.64.0/18',
      '108.162.192.0/18',
      '190.93.240.0/20',
      '188.114.96.0/20',
      '197.234.240.0/22',
      '198.41.128.0/17',
      '162.158.0.0/15',
      '104.16.0.0/13',
      '104.24.0.0/14',
      '172.64.0.0/13',
      '131.0.72.0/22',
    ];

    // CloudFlare IPv6 ranges
    // Source: https://www.cloudflare.com/ips-v6
    const cloudflareIPv6Ranges = [
      '2400:cb00::/32',
      '2606:4700::/32',
      '2803:f800::/32',
      '2405:b500::/32',
      '2405:8100::/32',
      '2a06:98c0::/29',
      '2c0f:f248::/32',
    ];

    // ==========================================
    // AWS WAF WEB ACL
    // ==========================================

    // Create IP Set for CloudFlare IPv4 ranges
    const cloudflareIPv4Set = new wafv2.CfnIPSet(this, 'CloudFlareIPv4Set', {
      name: 'CloudFlareIPv4Ranges',
      scope: 'CLOUDFRONT', // Must be CLOUDFRONT for CloudFront distributions
      ipAddressVersion: 'IPV4',
      addresses: cloudflareIPv4Ranges,
      description: 'CloudFlare IPv4 IP ranges for WAF allow rule',
    });

    // Create IP Set for CloudFlare IPv6 ranges
    const cloudflareIPv6Set = new wafv2.CfnIPSet(this, 'CloudFlareIPv6Set', {
      name: 'CloudFlareIPv6Ranges',
      scope: 'CLOUDFRONT',
      ipAddressVersion: 'IPV6',
      addresses: cloudflareIPv6Ranges,
      description: 'CloudFlare IPv6 IP ranges for WAF allow rule',
    });

    // Create Web ACL with CloudFlare IP allow rule and default block
    this.webAcl = new wafv2.CfnWebACL(this, 'CloudFrontWebACL', {
      name: 'DharamBhushanCloudFrontWAF',
      scope: 'CLOUDFRONT',
      defaultAction: {
        block: {}, // Block all traffic by default
      },
      description: 'WAF for CloudFront - Allow only CloudFlare IPs',
      rules: [
        {
          name: 'AllowCloudFlareIPv4',
          priority: 1,
          statement: {
            ipSetReferenceStatement: {
              arn: cloudflareIPv4Set.attrArn,
            },
          },
          action: {
            allow: {},
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'AllowCloudFlareIPv4',
          },
        },
        {
          name: 'AllowCloudFlareIPv6',
          priority: 2,
          statement: {
            ipSetReferenceStatement: {
              arn: cloudflareIPv6Set.attrArn,
            },
          },
          action: {
            allow: {},
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'AllowCloudFlareIPv6',
          },
        },
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'DharamBhushanCloudFrontWAF',
      },
    });

    // ==========================================
    // CLOUDFRONT DISTRIBUTION
    // ==========================================

    // Import ACM certificate if ARN provided
    let certificate: acm.ICertificate | undefined;
    if (props.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        props.certificateArn
      );
    }

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'CloudFront distribution for dharambhushan.com',
      defaultRootObject: 'index.html',
      // Domain names
      domainNames: certificate ? [props.domainName, `www.${props.domainName}`] : undefined,
      certificate: certificate,
      // S3 origin with OAC
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
          cachePolicyName: 'DharamBhushanCachePolicy',
          comment: 'Cache policy for website assets',
          defaultTtl: cdk.Duration.hours(24),
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.days(365),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          headerBehavior: cloudfront.CacheHeaderBehavior.none(),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        }),
      },
      // Additional behaviors for different content types
      additionalBehaviors: {
        // Cache HTML files with shorter TTL
        '*.html': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'HTMLCachePolicy', {
            cachePolicyName: 'DharamBhushanHTMLCache',
            defaultTtl: cdk.Duration.hours(1),
            minTtl: cdk.Duration.seconds(0),
            maxTtl: cdk.Duration.hours(24),
          }),
        },
        // Cache static assets aggressively
        '/assets/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'AssetsCachePolicy', {
            cachePolicyName: 'DharamBhushanAssetsCache',
            defaultTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.days(1),
            maxTtl: cdk.Duration.days(365),
          }),
        },
      },
      // Error responses
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      // Enable IPv6
      enableIpv6: true,
      // Price class
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
      // HTTP version
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      // Attach WAF
      webAclId: this.webAcl.attrArn,
    });

    // Grant CloudFront OAC access to S3 bucket (bucket policy)
    const cloudfrontOacPolicyStatement = new cdk.aws_iam.PolicyStatement({
      sid: 'AllowCloudFrontOAC',
      effect: cdk.aws_iam.Effect.ALLOW,
      principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [`${this.websiteBucket.bucketArn}/*`],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
        },
      },
    });

    this.websiteBucket.addToResourcePolicy(cloudfrontOacPolicyStatement);

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.websiteBucket.bucketName,
      description: 'S3 bucket name',
      exportName: `${this.stackName}-BucketName`,
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.websiteBucket.bucketArn,
      description: 'S3 bucket ARN',
      exportName: `${this.stackName}-BucketArn`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `${this.stackName}-DistributionId`,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name (use this as CNAME target in CloudFlare)',
      exportName: `${this.stackName}-DistributionDomain`,
    });

    new cdk.CfnOutput(this, 'WebACLArn', {
      value: this.webAcl.attrArn,
      description: 'WAF Web ACL ARN',
      exportName: `${this.stackName}-WebACLArn`,
    });

    if (certificate) {
      new cdk.CfnOutput(this, 'WebsiteURL', {
        value: `https://${props.domainName}`,
        description: 'Website URL',
      });
    } else {
      new cdk.CfnOutput(this, 'CloudFrontURL', {
        value: `https://${this.distribution.distributionDomainName}`,
        description: 'CloudFront URL (use this until ACM certificate is configured)',
      });
    }
  }
}
