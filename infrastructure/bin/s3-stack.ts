#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteBucketStack } from '../lib/website-bucket-stack';

const app = new cdk.App();

// Get configuration from context or environment variables
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME || 'dharam-personal-website-257641256327';
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'production';
const awsAccount = process.env.CDK_DEFAULT_ACCOUNT;
const awsRegion = process.env.CDK_DEFAULT_REGION || 'us-west-2';

// Create the website bucket stack
new WebsiteBucketStack(app, `DharamBhushanWebsite-${environment}`, {
  domainName: domainName,
  enableAutoDeployment: false, // We'll deploy manually via scripts
  env: {
    account: awsAccount,
    region: awsRegion,
  },
  description: `S3 bucket infrastructure for ${domainName} portfolio website`,
  tags: {
    Project: 'DharamBhushanPortfolio',
    Environment: environment,
    ManagedBy: 'AWS-CDK',
    Domain: domainName,
  },
});

app.synth();
