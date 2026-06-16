#!/bin/bash
set -e

kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-mysql-secret.yaml
kubectl apply -f k8s/02-banking-configmap.yaml
kubectl apply -f k8s/03-mysql.yaml

echo "Waiting for MySQL rollout..."
kubectl rollout status deployment/mysql -n banking --timeout=5m

kubectl apply -f k8s/10-frontend.yaml
kubectl apply -f k8s/11-auth-service.yaml
kubectl apply -f k8s/12-account-service.yaml
kubectl apply -f k8s/13-transaction-service.yaml
kubectl apply -f k8s/14-notification-service.yaml
kubectl apply -f k8s/20-ingress-hostless.yaml
kubectl apply -f k8s/30-rbac.yaml

kubectl get pods -n banking
kubectl get svc -n banking
kubectl get ingress -n banking
