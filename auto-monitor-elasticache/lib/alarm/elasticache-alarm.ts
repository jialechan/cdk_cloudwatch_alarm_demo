import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import sns = require('@aws-cdk/aws-sns');
import actions = require('@aws-cdk/aws-cloudwatch-actions');
import AWS = require('aws-sdk');

// Reference: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html
export class AutoMonitor {

  public static setup(scope: cdk.Construct, topic: sns.Topic) {

    new AWS.ElastiCache().describeCacheClusters(function (err: Error, data: AWS.ElastiCache.Types.CacheClusterMessage) {

      if (err) {
        console.log(err, err.stack);
        return
      }

      if (!data || !data.CacheClusters) {
        console.log("Something wrong with data");
        return
      }

      data.CacheClusters.forEach(function (element: AWS.ElastiCache.CacheCluster) {
        if (!element || !element.CacheClusterId) {
          return
        }
        CpuAlarm.setup(scope, element).addAlarmAction(new actions.SnsAction(topic));
        SwapUsageAlarm.setup(scope, element).addAlarmAction(new actions.SnsAction(topic));
        EvictionsAlarm.setup(scope, element).addAlarmAction(new actions.SnsAction(topic));
        NewConnectionsAlarm.setup(scope, element).addAlarmAction(new actions.SnsAction(topic));
        FreeableMemoryAlarm.setup(scope, element).addAlarmAction(new actions.SnsAction(topic));
      });

    });

  }
}

// Reference: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html#metrics-cpu-utilization
class CpuAlarm {
  public static setup(scope: cdk.Construct, element: AWS.ElastiCache.CacheCluster) {

    const cacheClusterId = element.CacheClusterId;

    let threshold = 90;
    let metricName = "EngineCPUUtilization";

    if (element.CacheNodeType && vcpus[element.CacheNodeType] && vcpus[element.CacheNodeType] <= 2) {
      metricName = "CPUUtilization";
      threshold = (90 / vcpus[element.CacheNodeType].valueOf());
    }

    return new cloudwatch.Alarm(scope, 'alarm-elastc-cache-' + cacheClusterId + '-' + metricName, {
      alarmName: 'elasticCache-CPU-load-alarm[' + cacheClusterId + ']',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName,
        dimensions: { CacheClusterId: cacheClusterId },
        statistic: 'avg',
      }),
      threshold,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: 'The average CPU load(' + metricName + ') is greater than' + threshold + '%',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    });
  }
}

// Reference: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html#metrics-swap-usage
class SwapUsageAlarm {
  public static setup(scope: cdk.Construct, element: AWS.ElastiCache.CacheCluster) {

    const cacheClusterId = element.CacheClusterId;

    return new cloudwatch.Alarm(scope, 'alarm-elastc-cache-' + cacheClusterId + '-SwapUsage', {
      alarmName: 'elasticCache-swapUsage-alarm[' + cacheClusterId + ']',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'SwapUsage',
        dimensions: { CacheClusterId: cacheClusterId },
        statistic: 'max',
      }),
      threshold: 50000000,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: 'The maximum value of the swapUsage within one minute is higher than 50M',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    });
  }
}

// Reference: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html#metrics-evictions
class EvictionsAlarm {

  public static setup(scope: cdk.Construct, element: AWS.ElastiCache.CacheCluster) {

    const cacheClusterId = element.CacheClusterId;

    return new cloudwatch.Alarm(scope, 'alarm-elastc-cache-' + cacheClusterId + '-Evictions', {
      alarmName: 'elasticCache-evictions-alarm[' + cacheClusterId + ']',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'Evictions',
        dimensions: { CacheClusterId: cacheClusterId },
        statistic: 'max',
      }),
      threshold: 1,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: 'Data evicted within one minute(We recommend that you determine your own alarm threshold for this metric based on your application needs)',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    });
  }
}

// Reference: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html#metrics-curr-connections
class NewConnectionsAlarm {
  public static setup(scope: cdk.Construct, element: AWS.ElastiCache.CacheCluster) {

    const cacheClusterId = element.CacheClusterId;

    // According to business needs
    const minutes = 30;
    const threshold = 200;

    return new cloudwatch.Alarm(scope, 'alarm-elastc-cache-' + cacheClusterId + '-NewConnections', {
      alarmName: 'elasticCache-newConnections-alarm[' + cacheClusterId + ']',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'NewConnections',
        dimensions: { CacheClusterId: cacheClusterId },
        statistic: 'avg',
      }),
      threshold,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: 'The connection constant in ' + minutes + 'minute(s) is greater than' + threshold,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    });
  }
}

// According to business needs
class FreeableMemoryAlarm {
  public static setup(scope: cdk.Construct, element: AWS.ElastiCache.CacheCluster) {

    const cacheClusterId = element.CacheClusterId;

    return new cloudwatch.Alarm(scope, 'alarm-elastc-cache-' + cacheClusterId + '-FreeableMemory', {
      alarmName: 'elasticCache-freeableMemory-alarm[' + cacheClusterId + ']',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'FreeableMemory',
        dimensions: { CacheClusterId: cacheClusterId },
        statistic: 'min',
      }),
      threshold: 2000000000,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: 'The minimum value is less than 2G in one minute',
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    });
  }
}

const vcpus: { [key: string]: Number } = {
  'cache.t2.micro': 1,
  'cache.t2.small': 1,
  'cache.t2.medium': 2,
  'cache.t3.micro': 2,
  'cache.t3.small': 2,
  'cache.t3.medium': 2,
  'cache.m4.large': 2,
  'cache.m4.xlarge': 4,
  'cache.m4.2xlarge': 8,
  'cache.m4.4xlarge': 16,
  'cache.m4.10xlarge': 40,
  'cache.m5.large': 2,
  'cache.m5.xlarge': 4,
  'cache.m5.2xlarge': 8,
  'cache.m5.4xlarge': 16,
  'cache.m5.12xlarge': 48,
  'cache.m5.24xlarge': 96,
  'cache.r4.large': 2,
  'cache.r4.xlarge': 4,
  'cache.r4.2xlarge': 8,
  'cache.r4.4xlarge': 16,
  'cache.r4.8xlarge': 32,
  'cache.r4.16xlarge': 64,
  'cache.r5.large': 2,
  'cache.r5.xlarge': 4,
  'cache.r5.2xlarge': 8,
  'cache.r5.4xlarge': 16,
  'cache.r5.12xlarge': 48,
  'cache.r5.24xlarge': 96
};
