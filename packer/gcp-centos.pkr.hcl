packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

# Define variables
variable "gcp_project_id" {
  type    = string
  default = "spring-outlet-406505"
}

variable "source_image" {
  type    = string
  default = "centos-stream-8-v20240110"
}

variable "service_account_email" {
  type    = string
  default = "dev-sa@spring-outlet-406505.iam.gserviceaccount.com"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}

variable "ssh_username" {
  type    = string
  default = "csye6225"
}

variable "machine_type" {
  type    = string
  default = "n1-standard-1"
}

# Define builders
source "googlecompute" "webapp_ami" {
  project_id            = var.gcp_project_id
  source_image          = var.source_image
  machine_type          = var.machine_type
  zone                  = var.zone
  ssh_username          = var.ssh_username
  service_account_email = var.service_account_email

  image_name = "webappami-${formatdate("YYYYMMDDHHmmss", timestamp())}"
}

# Build custom image
build {
  sources = ["source.googlecompute.webapp_ami"]

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/home/csye6225/webapp.zip"
  }

  provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    script = "./webapp.sh"
  }

  provisioner "shell" {
    inline = [
      "sudo yum clean all",
      "sudo rm -rf /var/cache/yum"
    ]
  }

}
