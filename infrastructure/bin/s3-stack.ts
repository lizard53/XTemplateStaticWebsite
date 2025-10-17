#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteBucketStack } from '../lib/website-bucket-stack';

const app = new cdk.App();

// Get configuration from context or environment variables
const bucketName = app.node.tryGetContext('bucketName') || process.env.BUCKET_NAME || 'dharam-personal-website-257641256327';
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME || 'dharambhushan.com';
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'production';
const certificateArn = app.node.tryGetContext('certificateArn') || process.env.CERTIFICATE_ARN;
const awsAccount = process.env.CDK_DEFAULT_ACCOUNT;
const awsRegion = process.env.CDK_DEFAULT_REGION || 'us-west-2';

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
