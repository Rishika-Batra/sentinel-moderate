variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-south-1"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for uploads"
  type        = string
}

variable "mongodb_uri" {
  description = "MongoDB Connection URI"
  type        = string
  sensitive   = true
}

variable "admin_email" {
  type        = string
  description = "Email address to receive high severity moderation alerts"
  default     = "admin@example.com"
}
