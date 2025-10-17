import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface WebsiteBucketStackProps extends cdk.StackProps {
  /**
   * The domain name for the website (e.g., 'dharambhushan.com')
   */
  domainName: string;

  /**
   * Whether to enable automatic deployment from src/ directory
   * @default false
   */
  enableAutoDeployment?: boolean;
}

export class WebsiteBucketStack extends cdk.Stack {
  public readonly websiteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: WebsiteBucketStackProps) {
    super(scope, id, props);

    // S3 bucket for website hosting
    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: props.domainName,
      // Block public access - only allow via bucket policy (CloudFlare IPs)
      publicReadAccess: false,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false, // Allow bucket policy to work
        ignorePublicAcls: true,
        restrictPublicBuckets: false, // Allow policy-based access
      }),
      // Enable versioning for rollback capability
      versioned: true,
      // Encryption at rest
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Website configuration
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA fallback to index.html
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
          allowedOrigins: ['*'], // Allow all origins since CloudFlare will handle CORS
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      // Removal policy - be careful with this in production
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // Bucket policy to allow CloudFlare access
    // Note: You'll need to update this with CloudFlare IP ranges or use signed URLs
    const bucketPolicy = new iam.PolicyStatement({
      sid: 'AllowCloudFlareAccess',
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [`${this.websiteBucket.bucketArn}/*`],
      conditions: {
        IpAddress: {
          'aws:SourceIp': [
            // CloudFlare IPv4 ranges (you should update this list periodically)
            // See: https://www.cloudflare.com/ips/
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
          ],
        },
      },
    });

    this.websiteBucket.addToResourcePolicy(bucketPolicy);

    // Optional: Auto-deployment from src/ directory
    if (props.enableAutoDeployment) {
      new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        sources: [s3deploy.Source.asset('../src')],
        destinationBucket: this.websiteBucket,
        // Cache control headers
        cacheControl: [
          s3deploy.CacheControl.setPublic(),
          s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
        ],
        // Prune old files
        prune: true,
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.websiteBucket.bucketName,
      description: 'S3 bucket name for website hosting',
      exportName: `${this.stackName}-BucketName`,
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.websiteBucket.bucketArn,
      description: 'S3 bucket ARN',
      exportName: `${this.stackName}-BucketArn`,
    });

    new cdk.CfnOutput(this, 'BucketWebsiteUrl', {
      value: this.websiteBucket.bucketWebsiteUrl,
      description: 'S3 bucket website URL (for testing)',
      exportName: `${this.stackName}-WebsiteUrl`,
    });

    new cdk.CfnOutput(this, 'BucketDomainName', {
      value: this.websiteBucket.bucketDomainName,
      description: 'S3 bucket domain name for CloudFlare origin',
      exportName: `${this.stackName}-DomainName`,
    });
  }
}
