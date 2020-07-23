#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AutoMonitoringElasticacheStack } from '../lib/auto-monitor-elasticache-stack';
import AWS = require('aws-sdk');

const app = new cdk.App();

const env = {
  region: app.node.tryGetContext('region') || process.env.CDK_INTEG_REGION || process.env.CDK_DEFAULT_REGION,
  account: app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
};

AWS.config.update({ region: env.region });

new AutoMonitoringElasticacheStack(app, 'AutoMonitorElasticacheStack', { env });
