# 🚀 AWS Lambda + FFmpeg Setup Guide

## What We Built

✅ **AWS Lambda Function** - Handles FFmpeg video composition (2-5¢ per video)
✅ **Vercel Integration** - Your app stays on Vercel, calls Lambda for video processing
✅ **Cost Effective** - 100 videos = $2-5 instead of $50

## 🔧 Setup Steps

### 1. AWS Account Setup

1. **Create AWS Account** (if you don't have one)
2. **Create IAM User** with these permissions:
   - `AWSLambdaFullAccess`
   - `AmazonS3FullAccess`
   - `CloudWatchLogsFullAccess`

3. **Get AWS Credentials**:
   - Access Key ID
   - Secret Access Key

### 2. Create S3 Bucket

```bash
# Create bucket for video storage
aws s3 mb s3://your-video-bucket-name --region us-east-1
```

### 3. Deploy Lambda Function

```bash
cd aws-lambda
npm install

# Create the function
aws lambda create-function \
  --function-name video-composition \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 3008 \
  --environment Variables='{S3_BUCKET=your-video-bucket-name}'
```

### 4. Add FFmpeg Layer

**Option A: Use Public Layer**
```bash
aws lambda update-function-configuration \
  --function-name video-composition \
  --layers arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:25
```

**Option B: Create Custom Layer** (recommended)
- Download FFmpeg binary for Lambda
- Create layer with FFmpeg
- Attach to function

### 5. Vercel Environment Variables

Add these to your Vercel project settings:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_LAMBDA_FUNCTION_NAME=video-composition
S3_BUCKET=your-video-bucket-name
```

## 🧪 Testing

1. **Test Lambda Function**:
```bash
aws lambda invoke \
  --function-name video-composition \
  --payload '{"body": "{\"test\": true}"}' \
  output.json
```

2. **Test from Vercel**:
   - Deploy your updated code
   - Try video personalization
   - Check logs for Lambda calls

## 📊 Expected Costs

- **Lambda**: $0.20 per 1M requests + $0.0000166667 per GB-second
- **S3**: $0.023 per GB storage + $0.0004 per 1K requests
- **Typical 30s video**: ~$0.02-0.05 per video

## 🔍 Troubleshooting

**Lambda Timeout**: Increase timeout to 300 seconds
**Memory Issues**: Increase memory to 3008 MB
**FFmpeg Not Found**: Ensure FFmpeg layer is attached
**S3 Permissions**: Check bucket policy allows Lambda access

## 🎯 Next Steps

1. Set up AWS account and credentials
2. Deploy Lambda function with FFmpeg layer
3. Create S3 bucket
4. Add environment variables to Vercel
5. Test the integration

**Cost savings**: $0.02-0.05 per video vs $0.50 with other solutions!