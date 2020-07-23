import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AutoMonitorElasticache from '../lib/auto-monitor-elasticache-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AutoMonitorElasticache.AutoMonitoringElasticacheStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
