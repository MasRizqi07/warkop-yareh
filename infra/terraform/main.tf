terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.2"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "neon" {
  api_key = var.neon_api_key
}

# 1. Neon Serverless PostgreSQL Database
resource "neon_project" "warkop_yareh" {
  name      = "warkop-yareh"
  region_id = "aws-ap-southeast-1" # Singapore region close to East Java/Surabaya
}

# 2. Cloudflare R2 Bucket for Object Storage
resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = "warkop-yareh-assets"
  location   = "APAC"
}

# 3. Vercel Web App (Customer Frontend)
resource "vercel_project" "web_app" {
  name      = "warkop-yareh-web"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
  environment = [
    {
      key   = "DATABASE_URL"
      value = neon_project.warkop_yareh.database_url
      target = ["production", "preview", "development"]
    },
    {
      key   = "NEXT_PUBLIC_API_URL"
      value = var.production_api_url
      target = ["production"]
    }
  ]
}

# 4. Vercel Admin App (Admin Dashboard)
resource "vercel_project" "admin_app" {
  name      = "warkop-yareh-admin"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
  root_directory = "apps/admin"
  environment = [
    {
      key   = "NEXT_PUBLIC_API_URL"
      value = var.production_api_url
      target = ["production"]
    }
  ]
}

# Variables
variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type = string
}

variable "vercel_api_token" {
  type      = string
  sensitive = true
}

variable "neon_api_key" {
  type      = string
  sensitive = true
}

variable "github_repo" {
  type        = string
  description = "Format: owner/repo"
}

variable "production_api_url" {
  type = string
}
