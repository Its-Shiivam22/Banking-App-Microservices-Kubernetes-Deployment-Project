#!/bin/bash
set -e

export CLUSTER_NAME=banking.k8s.local
export KOPS_STATE_STORE=s3://shivam-kops-state-store-banking

helm uninstall monitoring -n monitoring || true
kubectl delete namespace monitoring || true
kubectl delete namespace banking || true

kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/aws/deploy.yaml || true

kops delete cluster \
  --name ${CLUSTER_NAME} \
  --state ${KOPS_STATE_STORE} \
  --yes

aws s3 rm s3://shivam-kops-state-store-banking --recursive || true
aws s3api delete-bucket --bucket shivam-kops-state-store-banking --region ap-south-1 || true
