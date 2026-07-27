output "s3_bucket_id" {
  value = data.aws_s3_bucket.uploads.id
}
output "sqs_queue_url" {
  value = data.aws_sqs_queue.moderation_queue.url
}
