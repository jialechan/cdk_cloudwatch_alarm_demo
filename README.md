# Building Real-time Monitoring and Alert Systems with Amazon CloudWatch and AWS CDK
## Introduction
* [cloudwatch-alarm-demo](https://github.com/jialechan/cdk_cloudwatch_alarm_demo/tree/master/cloudwatch-alarm-demo): This is a simple example using cdk to deploy a vpc, alb, cloudwatch alarm, lambda. It demonstrates that when a 4XX error occurs in alb, cloudwatch will check in real time and send a notification to lambda, and lambda will notify slack through webhook .
* [auto-monitor-elasticache](https://github.com/jialechan/cdk_cloudwatch_alarm_demo/tree/master/auto-monitor-elasticache): Demonstrated how to use aws cdk + aws sdk to add monitoring to an existing redis cluster and notify slack when there is an alarm.

## Quick start
### Step 0: Clone repository
```shell
git clone https://github.com/jialechan/cdk_cloudwatch_alarm_demo.git
```
### Step 1: Generate Slack webhook url
* Access 'Incoming WebHooks' form [Here](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)
![image1](/asset/B8CDFC8F-2FD1-440E-B6AC-4E9398EB3497.png)   

* Follow the prompts to get url
![image2](/asset/7472EA7D-5E66-41D8-9C29-3DC8361372B4.png)    

### Step 2: export SLACK_WEBHOOK_URL
```shell
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/1234567/89098762/12345678abcdefghi
```

### Step 3: Compile and run the demo
```shell
cd clouwatch-alarm-demo && npm run build && cdk deploy
# or
cd auto-monitor-elasticache && npm run build && cdk deploy
```
