# 🚀 Banking Microservices Application Kubernetes Deployment Project

![AWS](https://img.shields.io/badge/Cloud-AWS-orange)
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-blue)
![Docker](https://img.shields.io/badge/Containerization-Docker-blue)
![Jenkins](https://img.shields.io/badge/CI-Jenkins-red)
![ArgoCD](https://img.shields.io/badge/GitOps-Argo%20CD-purple)
![Database](https://img.shields.io/badge/Database-MySQL-lightblue)
![Status](https://img.shields.io/badge/Project-Completed-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Project Overview

This project demonstrates the deployment of a **DB-connected Banking Microservices Application** on an **AWS Kubernetes cluster created using kOps**.

The application is divided into multiple independent microservices. Each service is containerized using Docker and deployed on Kubernetes. The project includes a multi-page frontend, authentication service, account service, transaction service, notification service, MySQL database connectivity, Kubernetes manifests, NGINX Ingress routing, Jenkins CI pipeline, Argo CD GitOps deployment, GitHub webhook automation, Kubernetes RBAC, and Horizontal Pod Autoscaler.

This project represents a complete DevOps workflow from source code to automated deployment on Kubernetes.

---

## 🏗️ Architecture Flow

```text
User Browser
     |
     v
AWS Load Balancer
     |
     v
NGINX Ingress Controller
     |
     |-- /                  → Frontend Service
     |-- /auth              → Auth Service
     |-- /account           → Account Service
     |-- /transactions      → Transaction Service
     |-- /notifications     → Notification Service
                              |
                              v
                         MySQL Database
```

---

## 🧭 Architecture Diagram using Mermaid

```mermaid
flowchart TD
    User[User Browser] --> ALB[AWS Load Balancer]
    ALB --> Ingress[NGINX Ingress Controller]

    Ingress --> Frontend[Frontend Service]
    Ingress --> Auth[Auth Service]
    Ingress --> Account[Account Service]
    Ingress --> Transaction[Transaction Service]
    Ingress --> Notification[Notification Service]

    Auth --> MySQL[(MySQL Database)]
    Account --> MySQL
    Transaction --> MySQL
    Notification --> MySQL

    GitHub[GitHub Repository] --> Jenkins[Jenkins CI Pipeline]
    Jenkins --> DockerHub[DockerHub Registry]
    Jenkins --> GitOps[Updated Kubernetes YAML Files]
    GitOps --> ArgoCD[Argo CD GitOps Sync]
    ArgoCD --> Cluster[AWS kOps Kubernetes Cluster]
```

---

## 🔄 CI/CD and GitOps Flow

```text
Developer Pushes Code to GitHub
        |
        v
GitHub Webhook Triggers Jenkins
        |
        v
Jenkins Builds Docker Images
        |
        v
Jenkins Pushes Images to DockerHub
        |
        v
Jenkins Updates Kubernetes YAML Image Tags
        |
        v
Jenkins Commits Updated YAML Files to GitHub
        |
        v
Argo CD Detects GitHub Changes
        |
        v
Argo CD Syncs Kubernetes Manifests
        |
        v
Updated Application Runs on AWS kOps Kubernetes Cluster
```

---

## 📸 Architecture Diagram

<p align="center">
  <img src="./screenshots/1.Architecture-Diagram.png" width="1000">
</p>

```text
Screenshots/1.Architecture-Diagram.png
```

---

## 🧰 Tools and Technologies Used

| Category | Tools / Services |
|---|---|
| Cloud Platform | AWS |
| Kubernetes Cluster | kOps |
| Containerization | Docker |
| Image Registry | DockerHub |
| CI Tool | Jenkins |
| CD / GitOps Tool | Argo CD |
| Orchestration | Kubernetes |
| Ingress Controller | NGINX Ingress Controller |
| Database | MySQL |
| Autoscaling | Horizontal Pod Autoscaler |
| Security | Kubernetes RBAC, Secrets |
| Version Control | Git and GitHub |
| Automation | GitHub Webhook |

---

## 🧩 Microservices Overview

| Service | Folder | Port | Description |
|---|---|---:|---|
| Frontend | `Banking-App/1.frontend` | 80 | Multi-page banking web application |
| Auth Service | `Banking-App/2.auth-service` | 3001 | Handles login and authentication |
| Account Service | `Banking-App/3.account-service` | 3002 | Fetches customer account details |
| Transaction Service | `Banking-App/4.transaction-service` | 3003 | Fetches transaction history |
| Notification Service | `Banking-App/5.notification-service` | 3004 | Fetches customer notifications |
| MySQL Database | `k8s/4.mysql.yaml` | 3306 | Stores banking application data |

---

## 📁 Repository Structure

```text
Banking-App-Microservices-Kubernetes-Deployment-Project/
│
├── Banking-App/
│   ├── 1.frontend/
│   ├── 2.auth-service/
│   ├── 3.account-service/
│   ├── 4.transaction-service/
│   └── 5.notification-service/
│
├── k8s/
│   ├── 1.namespace.yaml
│   ├── 2.mysql-secret.yaml
│   ├── 3.banking-configmap.yaml
│   ├── 4.mysql.yaml
│   ├── 5.frontend.yaml
│   ├── 6.auth-service.yaml
│   ├── 7.account-service.yaml
│   ├── 8.transaction-service.yaml
│   ├── 9.notification-service.yaml
│   ├── 10.ingress-hostless.yaml
│   ├── 11.ingress-domain.yaml
│   ├── 12.rbac.yaml
│   └── 13.hpa.yaml
│
├── Screenshots/
├── Jenkinsfile
├── README.md
├── LICENSE
└── .gitignore
```

---

# 📌 Part 1: kOps Kubernetes Cluster Setup on AWS EC2

Before creating the Kubernetes cluster using kOps, an EC2 instance is launched as a management server.

This EC2 instance is used to install and run the required DevOps tools such as:

```text
AWS CLI
kubectl
kOps
Docker
Git
```

Note: The Kubernetes cluster is not created inside this EC2 instance.
This EC2 instance is used only as a control machine to run kOps commands. kOps will create separate AWS resources such as control plane nodes, worker nodes, networking resources, and load balancers.

Open AWS Console and go to:
```text
AWS Console → EC2 → Instances → Launch Instance
```

<p align="center">
  <img src="./screenshots/2.EC2-Instance.png" width="1000">
</p>


Configure Instance Settings:
Name: K8S
Ami: Amazon Linux 2023
Instance Type: c7i-flex.large
VPC: Default VPC 
Subnet: Public Subnet 
Auto-assign Public IP: Enable
Default Security Group
Storage:
Root - 20 GB Gp3

Attached IAM Role to the Instance:
```text
EC2 → Instance → Actions → Security → Modify IAM Role
```

<p align="center">
  <img src="./screenshots/3.IAM-Role.png" width="1000">
</p>


For learning/demo purposes, attach:
```AdministratorAccess```

For production, use a least-privilege IAM policy instead of full administrator access.

---

## 🌐 Setup kOps Cluster on EC2

The Kubernetes cluster is created on AWS EC2 using kOps. 
kOps provisions the required AWS resources and configures the Kubernetes control plane and worker nodes.

| Component | Configuration |
|---|---|
| Region | `ap-south-1` |
| Cluster Name | `banking.k8s.local` |
| State Store | S3 Bucket |
| Control Plane | 1 Node |
| Worker Nodes | 2 Nodes |
| Networking | Calico |

---
## 🔹 Install AWS Cli 
Installed AWS CLI V2 Using Shell Scripting
```bash
#!/bin/bash

set -e

sudo dnf install --allowerasing curl

echo "======================================"
echo " Installing AWS CLI v2"
echo "======================================"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Unable to detect OS."
    exit 1
fi

echo "Detected OS: $OS"

# Install required packages
echo "Installing required packages..."

if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    sudo apt update -y
    sudo apt install -y curl unzip
elif [[ "$OS" == "amzn" || "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "rocky" || "$OS" == "almalinux" ]]; then
    sudo yum update -y
    sudo yum install -y curl unzip
else
    echo "Unsupported OS: $OS"
    exit 1
fi

echo "Downloading AWS CLI v2..."

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

echo "Extracting AWS CLI package..."

unzip -q awscliv2.zip

echo "Installing AWS CLI..."

sudo ./aws/install --update

echo "Cleaning up temporary files..."

rm -rf aws awscliv2.zip

echo "======================================"
echo " AWS CLI Installation Completed"
echo "======================================"

aws --version

```

<p align="center">
  <img src="./screenshots/4.AWS CLI 1.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/4.AWS CLI 2.png" width="1000">
</p>

---

## 🔹 Install KubeCTL & kOps


```bash
#!/bin/bash

set -e

echo "======================================"
echo " Installing kOps and kubectl"
echo "======================================"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Unable to detect OS."
    exit 1
fi

echo "Detected OS: $OS"

# Install required packages
echo "Installing required packages..."

if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    sudo apt update -y
    sudo apt install -y curl wget unzip
elif [[ "$OS" == "amzn" || "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "rocky" || "$OS" == "almalinux" ]]; then
    sudo yum update -y
    sudo yum install -y curl wget unzip
else
    echo "Unsupported OS: $OS"
    exit 1
fi

echo "Required packages installed successfully."

# Install kubectl
echo "Installing kubectl..."

KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)

curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"

chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl

echo "kubectl installed successfully."

# Install kOps
echo "Installing kOps..."

KOPS_VERSION=$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)

if [ -z "$KOPS_VERSION" ]; then
    echo "Unable to fetch latest kOps version. Installing v1.30.0 as fallback."
    KOPS_VERSION="v1.30.0"
fi

curl -Lo kops "https://github.com/kubernetes/kops/releases/download/${KOPS_VERSION}/kops-linux-amd64"

chmod +x kops
sudo mv kops /usr/local/bin/kops

echo "kOps installed successfully."

# Verify installation
echo "======================================"
echo " Installation Completed"
echo "======================================"

echo "kubectl version:"
kubectl version --client

echo "--------------------------------------"

echo "kOps version:"
kops version

echo "======================================"
echo " kOps and kubectl are ready to use"
echo "======================================"
```
<p align="center">
  <img src="./screenshots/5.KubeCTL-kOps.png" width="1000">
</p>

### Create S3 Buket for kOps State Store

```bash
aws s3api create-bucket \
  --bucket shiivam22-kops-state-store \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
```

Enable versioning:

```bash
aws s3api put-bucket-versioning \
  --bucket shiivam22-kops-state-store \
  --versioning-configuration Status=Enabled
```
& Export 
```bash
export KOPS_STATE_STORE=s3://shiivam22-kops-state-store

echo 'export KOPS_STATE_STORE=s3://shiivam22-kops-state-store' >> ~/.bashrc
source ~/.bashrc
```

<p align="center">
  <img src="./screenshots/6.kOps-State-Store.png" width="1000">
</p>

---

## 🔹 Instakking Required Tools 

```bash
Docker
Jenkins
Helm
Argo CD
```
### Docker:
```bash
sudo dnf install docker -y
systemctl enable docker
systemctl start docker
```
<p align="center">
  <img src="./screenshots/7.Docker.png" width="1000">
</p>

```bash
systemcrl status docker 
```

<p align="center">
  <img src="./screenshots/8.Docker-Status.png" width="1000">
</p>

---

### Jenkins:
```bash
!/bin/bash

# Jenkins Installation Script for Amazon Linux 2023

sudo dnf update -y

sudo dnf install -y java-21-amazon-corretto-devel

sudo wget -O /etc/yum.repos.d/jenkins.repo \
https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

sudo dnf install -y jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins

sudo systemctl status jenkins

```

<p align="center">
  <img src="./screenshots/9.jenkins.png" width="1000">
</p>

```bash
systemctl status jenkins.service
```

<p align="center">
  <img src="./screenshots/10.jenkins-status.png" width="1000">
</p>

---

### Helm:
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

<p align="center">
  <img src="./screenshots/11.helm.png" width="1000">
</p>

---


## 🔹 Create kOps Cluster

Create Cluster:
```bash
kops create cluster --name dev.k8s.local --zones ap-south-1b --control-plane-count 1 --control-plane-size c7i-flex.large --node-count 2 --node-size t3.small --networking calico --state ${KOPS_STATE_STORE}
```
```bash
kops update cluster --name dev.k8s.local --yes --admin
```
<p align="center">
  <img src="./screenshots/12.Create-Cluster.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/13.Update-Cluster.png" width="1000">
</p>

Validate Cluster:
```bash
kops validate cluster --wait 10m
```
<p align="center">
  <img src="./screenshots/14.Validate-Cluster.png" width="1000">
</p>

---

# 📌 Part 2: Build and Push Docker Images 
## 🐳 Docker Overview

Each microservice has a separate Dockerfile and is pushed as an independent image to DockerHub.

Docker images used:

```text
shiivam22/banking-frontend
shiivam22/banking-auth-service
shiivam22/banking-account-service
shiivam22/banking-transaction-service
shiivam22/banking-notification-service
```
---

### 🔹 Build Docker Images

```bash
docker build -t shiivam22/banking-frontend:v1 ./Banking-App/1.frontend
docker build -t shiivam22/banking-auth-service:v1 ./Banking-App/2.auth-service
docker build -t shiivam22/banking-account-service:v1 ./Banking-App/3.account-service
docker build -t shiivam22/banking-transaction-service:v1 ./Banking-App/4.transaction-service
docker build -t shiivam22/banking-notification-service:v1 ./Banking-App/5.notification-service
```
<p align="center">
  <img src="./screenshots/15.DockerImg1.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/16.Docker-Images.png" width="1000">
</p>


### 🔹 Docker Login Push Docker Images To Docker Hub

```bash
docker login
```

```bash
docker push shiivam22/banking-frontend:v1
docker push shiivam22/banking-auth-service:v1
docker push shiivam22/banking-account-service:v1
docker push shiivam22/banking-transaction-service:v1
docker push shiivam22/banking-notification-service:v1
```
<p align="center">
  <img src="./screenshots/17.Docker-login-Push.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/18.Docker Hub.png" width="1000">
</p>

---

# 📌 Part 3: Kubernetes Deployment

## ⚙️ Kubernetes Resources Used

```text
Namespace
Deployment
Service
ConfigMap
Secret
PersistentVolumeClaim
Ingress
ServiceAccount
Role
RoleBinding
HorizontalPodAutoscaler
```

---

## 🔹 Create Namespace

```bash
kubectl apply -f k8s/1.namespace.yaml
```

<p align="center">
  <img src="./screenshots/19.Namespace.png" width="1000">
</p>

---

## 🔹 Apply Secret and ConfigMap

```bash
kubectl apply -f k8s/2.mysql-secret.yaml
kubectl apply -f k8s/3.banking-configmap.yaml
```

<p align="center">
  <img src="./screenshots/20.Deployments.png" width="1000">
</p>

---

## 🔹 Deploy MySQL

```bash
kubectl apply -f k8s/4.mysql.yaml
kubectl rollout status deployment/mysql -n banking --timeout=5m
```

<p align="center">
  <img src="./screenshots/21.mysql.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/22.rollout.png" width="1000">
</p>

---

## 🔹 Deploy Microservices

```bash
kubectl apply -f k8s/5.frontend.yaml
kubectl apply -f k8s/6.auth-service.yaml
kubectl apply -f k8s/7.account-service.yaml
kubectl apply -f k8s/8.transaction-service.yaml
kubectl apply -f k8s/9.notification-service.yaml
```

<p align="center">
  <img src="./screenshots/23.Deployments-2.png" width="1000">
</p>

---

## 🔹 Verify Deployment

```bash
kubectl get pods -n banking
kubectl get svc -n banking
```

### Screenshot

<p align="center">
  <img src="./screenshots/24.Get-pods.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/25.Get-svc.png" width="1000">
</p>

---

# 📌 Part 4: MySQL Database Connectivity

## 🗄️ Database Overview

The MySQL database stores application data for all banking services.

Database tables:

```text
customers
accounts
transactions
notifications
```

The backend services connect to MySQL using the internal Kubernetes service:

```text
mysql-service
```

---

## 🔹 Login to MySQL

```bash
kubectl exec -it deployment/mysql -n banking -- mysql -u securebank_user -pSecureBank@123 securebankdb
```

---

## 🔹 Verify Tables

```sql
SHOW TABLES;
SELECT * FROM customers;
SELECT * FROM transactions;
```

<p align="center">
  <img src="./screenshots/26.Verify Tables.png" width="1000">
</p>

---

## 🔹 Test DB Connection
```bash
kubectl logs deployment/auth-service -n banking
```
<p align="center">
  <img src="./screenshots/26.Test-DB.png" width="1000">
</p>

## 🔹 Test Login API

```bash
curl -X POST http://YOUR-AWS-LOAD-BALANCER-DNS/auth/login \
  -H "Content-Type: application/json" \
  -d '{"customerId":"SHIVAM001","password":"demo123"}'
```

Expected response:

```json
{
  "message": "Login successful. Welcome Shivam Ekale.",
  "customerId": "SHIVAM001",
  "fullName": "Shivam Ekale",
  "token": "secure-db-demo-token"
}
```

<p align="center">
  <img src="./screenshots/27.Test-LoginAPI.png" width="1000">
</p>

---

# 📌 Part 5: NGINX Ingress and AWS Load Balancer

## 🌐 Ingress Overview

NGINX Ingress Controller is used to expose the banking application outside the Kubernetes cluster. It provisions an AWS Load Balancer and routes incoming traffic to the correct services.

---

## 🔹 Install NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/aws/deploy.yaml
```

<p align="center">
  <img src="./screenshots/28.Install-Ingress 1.png" width="1000">
</p>

Check controller:

```bash
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

<p align="center">
  <img src="./screenshots/28.Install-Ingress 2.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/29.Ingress Svc.png" width="1000">
</p>

Application URL:
```http://YOUR-AWS-LOAD-BALANCER-DNS```

---

## 🔹 Apply Hostless Ingress

```bash
kubectl apply -f k8s/10.ingress-hostless.yaml
```

Check ingress:

```bash
kubectl get ingress -n banking
```

<p align="center">
  <img src="./screenshots/30.Hostless-Ingress.png" width="1000">
</p>

## 🔹 Ingress Domain
```bash
kubectl apply -f k8s/11.ingress-domain.yaml
kubectl describe ingress banking-ingress -n banking
```
<p align="center">
  <img src="./screenshots/screenshots/47.Ingress-Domain.png" width="1000">
</p>

### Create A DNS Record
```text
Type: CNAME
Name: bank
Value: a0d676aee740c4c1b8d26c0c29c419ff-d247b9825fc66708.elb.ap-south-1.amazonaws.com
TTL: 600
```

<p align="center">
  <img src="./screenshots/47.Dns-Record.png" width="1000">
</p

### Verify
```bash
nslookup bank.shivamekale.in
```

<p align="center">
  <img src="./screenshots/screenshots/48.nslookup.png" width="1000">
</p

---


# 📌 Part 6: Jenkins CI Pipeline

## 🔧 Jenkins Overview

Jenkins is used for Continuous Integration.

Jenkins performs:

```text
Checkout source code
Build Docker images
Push Docker images to DockerHub
Update Kubernetes YAML image tags
Commit updated YAML files back to GitHub
```

The actual Kubernetes deployment is handled by Argo CD using GitOps.

---

## 🔹 Jenkins Credentials

| Credential ID | Type | Purpose |
|---|---|---|
| `dockerhub-creds` | Username with password | DockerHub login |
| `github-creds` | Username with password | Push updated YAML files to GitHub |

<p align="center">
  <img src="./screenshots/31.Creds.png" width="1000">
</p>

---

## 🔹 DockerHub Token

Use a DockerHub access token as the password for:

```text
dockerhub-creds
```

---

## 🔹 GitHub Token

Use a fine-grained GitHub token with:

```text
Repository Access: Only selected repository
Contents: Read and write
Metadata: Read-only
```
<p align="center">
  <img src="./screenshots/33.github-2.png" width="1000">
</p>

Use this token as the password for:
```github-creds```

---

## 🔹 GitHub Webhook for Jenkins

Webhook URL:

```text
http://YOUR-JENKINS-PUBLIC-IP:8080/github-webhook/
```

Webhook settings:
<br>
```Content Type: application/json```
<br>
```Event: Just the push event```

<p align="center">
  <img src="./screenshots/34.webhooks1.png" width="1000">
</p>


Enable in Jenkins job:

```text
Build Triggers → GitHub hook trigger for GITScm polling
```
<p align="center">
  <img src="./screenshots/36.Git-SCM.png" width="1000">
</p>

To avoid a CI loop, Jenkins commits YAML changes with:

```text
[skip ci]
```

---

# 📌 Part 7: Argo CD GitOps Deployment

## 🔁 Argo CD Overview

Argo CD is used for GitOps-based Continuous Deployment.

Argo CD watches the `k8s/` directory in the GitHub repository. When Jenkins updates image tags in the Kubernetes manifests and pushes the changes to GitHub, Argo CD automatically syncs those changes to the Kubernetes cluster.

---

## 🔹 Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

<p align="center">
  <img src="./screenshots/37.Install-ArgoCD.png" width="1000">
</p>


Check pods:

```bash
kubectl get pods -n argocd
```

<p align="center">
  <img src="./screenshots/38.Get-pods-Argocd.png" width="1000">
</p>

---

## 🔹 Access Argo CD UI

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

<p align="center">
  <img src="./screenshots/39.Argocd-patch.png" width="1000">
</p>

Username:
```admin```

Get password:

```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 --decode
```

<p align="center">
  <img src="./screenshots/40.Argocd-ui.png" width="1000">
</p>

---

## 🔹 Create Argo CD Application

### Using Yaml File:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: banking-microservices-app
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/Its-Shiivam22/Banking-App-Microservices-Kubernetes-Deployment-Project.git
    targetRevision: main
    path: k8s

  destination:
    server: https://kubernetes.default.svc
    namespace: banking

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

Apply:
```kubectl apply -f argocd-banking-app.yaml```

Check:
```kubectl get applications -n argocd```

### Trough GUI:

<p align="center">
  <img src="./screenshots/41.GUI1.png" width="1000">
</p>

<p align="center">
  <img src="./screenshots/42.GUI2.png" width="1000">
</p>

```text
Argo CD --> Continious Deployments
```
<p align="center">
  <img src="./screenshots/43.GUI3.png" width="1000">
</p>


---

# 📌 Part 8: Kubernetes RBAC

## 🔐 RBAC Overview

RBAC controls access to Kubernetes resources.

This project creates:

```text
ServiceAccount: banking-reader
Role: banking-read-only-role
RoleBinding: banking-read-only-binding
```

---

## 🔹 Apply RBAC

```bash
kubectl apply -f k8s/12.rbac.yaml
```

### 🔹 Test RBAC

Allowed:

```bash
kubectl auth can-i get pods \
  --as=system:serviceaccount:banking:banking-reader \
  -n banking
```

Expected:

```text
yes
```

Denied:

```bash
kubectl auth can-i delete pods \
  --as=system:serviceaccount:banking:banking-reader \
  -n banking
```

Expected:

```text
no
```

### Screenshot

<p align="center">
  <img src="./screenshots/44.Rbac.png" width="1000">
</p>

---

# 📌 Part 9: Horizontal Pod Autoscaler

## 📈 HPA Overview

Horizontal Pod Autoscaler automatically scales pods based on CPU utilization.

---

## 🔹 Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

<p align="center">
  <img src="./screenshots/45.Install Metric-Server .png" width="1000">
</p>

---

## 🔹 Apply HPA

```bash
kubectl apply -f k8s/13.hpa.yaml
```

Check HPA:

```bash
kubectl get hpa -n banking
```

<p align="center">
  <img src="./Screenshots/46.HPA.png" width="1000">
</p>

---

# 📌 Part 10: Application Testing

## ✅ Test Website

Open:

```text
http://YOUR-AWS-LOAD-BALANCER-DNS
```

Login:

```text
Customer ID: SHIVAM001
Password: demo123
```

<p align="center">
  <img src="./screenshots/51.Home.png" width="1000">
</p>

---

## ✅ Test Health Endpoints

```bash
curl -i http://bank.shivamekale.in/auth/health
curl -i http://bank.shivamekale.in/account/health
curl -i http://bank.shivamekale.in/transactions/health
curl -i http://bank.shivamekale.in/notifications/health
```
<p align="center">
  <img src="./screenshots/screenshots/49.Verify-Apis.png" width="1000">
</p>

---

## ✅ Test Kubernetes Resources

```bash
kubectl get all -n banking
```

<p align="center">
  <img src="./screenshots/screenshots/50.Verify.png" width="1000">
</p>

---

## 🖼️ Application Screenshots

<p align="center">
  <img src="./Screenshots/51.Home.png" width="1000">
</p>

<p align="center">
  <img src="./Screenshots/52.DashBoard.png" width="1000">
</p>

<p align="center">
  <img src="./Screenshots/53.Transactions.png" width="1000">
</p>

<p align="center">
  <img src="./Screenshots/54.Notifications.png" width="1000">
</p>

<p align="center">
  <img src="./Screenshots/55.Health.png" width="1000">
</p>

---

# 🛠️ Challenges Faced

## 1. Avoiding Jenkins Webhook Loop

### Challenge

Jenkins pushes updated YAML files back to GitHub, which can trigger the webhook again.

### Solution

Added `[skip ci]` in Jenkins commit messages to prevent infinite build loops.

---

## 2. Argo CD Image Update Detection

### Challenge

Using a fixed image tag like `v1` does not always trigger a GitOps sync.

### Solution

Used dynamic image tags:

```text
v1-${BUILD_NUMBER}
```

---


# 💰 Cost Optimization

To reduce AWS cost:

- Use small EC2 instances for practice
- Stop or delete unused Jenkins EC2 instances
- Delete unused Load Balancers
- Delete unused EBS volumes
- Delete the kOps cluster after the demo
- Keep the S3 state bucket only while the cluster is needed

Cost-generating services:

```text
EC2 Instances
EBS Volumes
AWS Load Balancer
S3 State Store
CloudWatch Logs
Data Transfer
```

---

# 🎯 Learning Outcomes

This project demonstrates hands-on experience with:

- AWS kOps Kubernetes cluster creation
- Kubernetes Deployments and Services
- Kubernetes Secrets and ConfigMaps
- MySQL database deployment inside Kubernetes
- PersistentVolumeClaim for database storage
- Microservices deployment on Kubernetes
- NGINX Ingress Controller
- AWS Load Balancer integration
- Docker image creation and DockerHub push
- Jenkins CI pipeline
- GitHub webhook automation
- Argo CD GitOps deployment
- Kubernetes RBAC
- Horizontal Pod Autoscaler
- Kubernetes troubleshooting
- Complete DevOps CI/CD workflow

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

## Shivam Ekale

AWS Certified Solutions Architect – Associate  
Cloud & DevOps Engineer

### Connect With Me

- GitHub: https://github.com/Its-Shiivam22
- LinkedIn: https://www.linkedin.com/in/shiivam22
- Portfolio: https://www.shivamekale.in
- Email: shivamekale07@gmail.com

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
