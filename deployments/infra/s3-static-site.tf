# ----------------------------
# Terraform Configuration
# ----------------------------
terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# ----------------------------
# AWS Provider
# ----------------------------
provider "aws" {
  region = var.aws_region
}

# ----------------------------
# Variables
# ----------------------------
variable "project_name" {
  description = "My Pass Vault Application"
  type        = string
  default     = "static-site"
}

variable "bucket_name" {
  description = "My Pass Vault Application"
  type        = string
  default     = "h3yzack-my-pass-vault-app"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

# ----------------------------
# Resources
# ----------------------------

# Create S3 bucket
resource "aws_s3_bucket" "website_bucket" {
  bucket = var.bucket_name

  force_destroy = true  # remove all objects when deleting the bucket

  tags = {
    Name        = var.project_name
    Environment = "Production"
  }
}

# Allow public access at the bucket level
resource "aws_s3_bucket_public_access_block" "allow_public_access" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Enable static website hosting
resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.website_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Public read access bucket policy
resource "aws_s3_bucket_policy" "public_read_policy" {
  bucket = aws_s3_bucket.website_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website_bucket.arn}/*"
      }
    ]
  })
}

# ----------------------------
# Outputs
# ----------------------------
output "bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.website_bucket.id
}

output "website_endpoint" {
  description = "The S3 static website endpoint"
  value       = aws_s3_bucket_website_configuration.website_config.website_endpoint
}
