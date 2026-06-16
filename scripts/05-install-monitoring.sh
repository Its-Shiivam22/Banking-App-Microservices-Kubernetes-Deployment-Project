#!/bin/bash
set -e

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update

kubectl create namespace monitoring || true

helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring || true

kubectl get pods -n monitoring
