# Building Real-time Monitoring and Alert Systems with Amazon CloudWatch and AWS CDK

## Step 1: Generate Slack webhook url
![image1](/asset/7472EA7D-5E66-41D8-9C29-3DC8361372B4.png)    
![image2](/asset/B8CDFC8F-2FD1-440E-B6AC-4E9398EB3497.png) 

## Step 2: export SLACK_WEBHOOK_URL
```shell
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/1234567/89098762/12345678abcdefghi
```

## Step 3:
```shell
cd clouwatch-alarm-demo && npm run build && cdk deploy
# or
cd auto-monitor-elasticache && npm run build && cdk deploy
```