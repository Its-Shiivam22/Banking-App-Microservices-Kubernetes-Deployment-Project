#!/bin/bash
set -e

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/aws/deploy.yaml

echo "Waiting for ingress controller..."
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
