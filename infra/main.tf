provider "aws" {
  region  = var.aws_region
  profile = "sentinel-moderate"
}

# Reference EXISTING S3 bucket (created manually in console)
data "aws_s3_bucket" "uploads" {
  bucket = var.s3_bucket_name
}

# Reference EXISTING SQS queue (created manually in console)
data "aws_sqs_queue" "moderation_queue" {
  name = "sentinel-moderate-jobs"
}

# Reference EXISTING SNS topic (created manually in console, subscription already confirmed)
data "aws_sns_topic" "high_severity_alerts" {
  name = "sentinel-moderate-alerts"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "content_moderation_lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda to access SQS, S3, Rekognition, Comprehend, SNS, CloudWatch Logs
resource "aws_iam_role_policy" "lambda_policy" {
  name = "content_moderation_lambda_policy"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = data.aws_sqs_queue.moderation_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "rekognition:DetectModerationLabels"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${data.aws_s3_bucket.uploads.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "comprehend:DetectSentiment",
          "comprehend:DetectPiiEntities"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = data.aws_sns_topic.high_severity_alerts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "moderator" {
  filename         = "../lambda/function.zip"
  function_name    = "contentModerationProcessor"
  role             = aws_iam_role.lambda_role.arn
  handler          = "moderationProcessor.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  source_code_hash = filebase64sha256("../lambda/function.zip")

  environment {
    variables = {
      MONGODB_URI   = var.mongodb_uri
      SNS_TOPIC_ARN = data.aws_sns_topic.high_severity_alerts.arn
    }
  }
}

# SQS to Lambda Event Source Mapping
resource "aws_lambda_event_source_mapping" "sqs_mapping" {
  event_source_arn = data.aws_sqs_queue.moderation_queue.arn
  function_name    = aws_lambda_function.moderator.arn
  batch_size       = 10
}
