#!/bin/bash

# AWS Lambda Deployment Script for Video Composition Function

echo "🚀 Deploying AWS Lambda video composition function..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r function.zip . -x "*.git*" "deploy.sh" "README.md"

# Deploy to AWS Lambda (you'll need to create the function first)
echo "🚀 Deploying to AWS Lambda..."

# Create the function (run this once)
aws lambda create-function \
  --function-name video-composition \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 3008 \
  --environment Variables='{S3_BUCKET=your-video-bucket}' \
  --layers arn:aws:lambda:us-east-1:layerarn:layer:ffmpeg:1

# OR update existing function
# aws lambda update-function-code \
#   --function-name video-composition \
#   --zip-file fileb://function.zip

echo "✅ Deployment completed!"
echo "🔧 Next steps:"
echo "1. Create IAM role with S3 and Lambda permissions"
echo "2. Create S3 bucket for video storage"
echo "3. Add FFmpeg layer to Lambda function"
echo "4. Update environment variables"