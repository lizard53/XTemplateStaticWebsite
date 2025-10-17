#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteBucketStack } from '../lib/website-bucket-stack';

const app = new cdk.App();

// Get configuration from context or environment variables
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME || 'dharambhushan.com';
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'production';
const certificateArn = app.node.tryGetContext('certificateArn') || process.env.CERTIFICATE_ARN;
const awsAccount = process.env.CDK_DEFAULT_ACCOUNT;
// IMPORTANT: Must use us-east-1 for CloudFront + WAF
// CloudFront distribution with WAF requires WAF resources in us-east-1
const awsRegion = process.env.CDK_DEFAULT_REGION || 'us-east-1';
// Add region suffix to bucket name for uniqueness
const bucketName = app.node.tryGetContext('bucketName') || process.env.BUCKET_NAME || `dharam-personal-website-257641256327-${awsRegion}`;

// Create the website bucket stack
new WebsiteBucketStack(app, `DharamBhushanWebsite-${environment}`, {
  domainName: domainName,
  bucketName: bucketName,
  certificateArn: certificateArn,
  env: {
    account: awsAccount,
    region: awsRegion,
  },
  description: `CloudFront + S3 infrastructure for ${domainName} portfolio website`,
  tags: {
    Project: 'DharamBhushanPortfolio',
    Environment: environment,
    ManagedBy: 'AWS-CDK',
    Domain: domainName,
  },
});

app.synth();
