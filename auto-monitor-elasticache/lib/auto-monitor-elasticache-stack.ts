import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import sns = require('@aws-cdk/aws-sns');
import sns_sub = require('@aws-cdk/aws-sns-subscriptions');
import elasticache = require('./alarm/elasticache-alarm')

export class AutoMonitoringElasticacheStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

    if (SLACK_WEBHOOK_URL) {
      console.log('Get SLACK_WEBHOOK_URL success!');
    } else {
      throw new Error('Get SLACK_WEBHOOK_URL fail. Please export SLACK_WEBHOOK_URL first');
    }

    const fn = new lambda.Function(this, 'alarm-to-slack', {
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("./asset/lambda"),
      environment: {
        SLACK_WEBHOOK_URL,
      }
    });

    const topic = new sns.Topic(this, 'alarm-topic');
    topic.addSubscription(new sns_sub.LambdaSubscription(fn));

    elasticache.AutoMonitor.setup(this, topic);

  }
}
