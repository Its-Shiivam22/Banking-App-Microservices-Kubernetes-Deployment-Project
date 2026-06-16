#!/bin/bash
set -e

export DOCKERHUB_USER=shiivam22
export IMAGE_TAG=v2

docker build -t $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG ./frontend
docker build -t $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG ./auth-service
docker build -t $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG ./account-service
docker build -t $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG ./transaction-service
docker build -t $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG ./notification-service

docker push $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG
docker push $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG
docker push $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG
docker push $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG
docker push $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG
