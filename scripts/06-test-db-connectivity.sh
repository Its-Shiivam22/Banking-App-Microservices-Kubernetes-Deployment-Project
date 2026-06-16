#!/bin/bash
set -e

echo "Testing auth health..."
kubectl port-forward svc/auth-service 3001:3001 -n banking >/tmp/auth-port-forward.log 2>&1 &
PF_PID=$!
sleep 5

curl http://localhost:3001/auth/health
echo
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"customerId":"SHIVAM001","password":"demo123"}'
echo

kill $PF_PID || true
