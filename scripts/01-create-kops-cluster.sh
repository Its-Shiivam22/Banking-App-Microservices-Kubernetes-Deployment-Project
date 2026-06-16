#!/bin/bash
set -e

export AWS_REGION=ap-south-1
export CLUSTER_NAME=banking.k8s.local
export KOPS_STATE_STORE=s3://shivam-kops-state-store-banking

aws s3api create-bucket \
  --bucket shivam-kops-state-store-banking \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1 || true

aws s3api put-bucket-versioning \
  --bucket shivam-kops-state-store-banking \
  --versioning-configuration Status=Enabled

ssh-keygen -t rsa -b 4096 -f ~/.ssh/kops-key -N "" || true

kops create cluster \
  --name ${CLUSTER_NAME} \
  --state ${KOPS_STATE_STORE} \
  --zones ap-south-1b \
  --node-count 2 \
  --node-size t3.small \
  --control-plane-count 1 \
  --control-plane-size c7i-flex.large \
  --ssh-public-key ~/.ssh/kops-key.pub \
  --networking calico \
  --yes

kops export kubecfg \
  --name ${CLUSTER_NAME} \
  --state ${KOPS_STATE_STORE} \
  --admin

kops validate cluster \
  --name ${CLUSTER_NAME} \
  --state ${KOPS_STATE_STORE} \
  --wait 10m

kubectl get nodes
