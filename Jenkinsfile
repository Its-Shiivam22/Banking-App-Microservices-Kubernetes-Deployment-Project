pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "shiivam22"
        IMAGE_TAG = "v1"
        NAMESPACE = "banking"

        APP_DIR = "Banking-App"
        K8S_DIR = "k8s"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Show Project Structure') {
            steps {
                sh '''
                echo "Current workspace:"
                pwd

                echo "Repository files:"
                ls -la

                echo "Application folders:"
                ls -la $APP_DIR

                echo "Kubernetes YAML files:"
                ls -la $K8S_DIR
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build --no-cache -t $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG "$APP_DIR/1.frontend"

                docker build --no-cache -t $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG "$APP_DIR/2.auth-service"

                docker build --no-cache -t $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG "$APP_DIR/3.account-service"

                docker build --no-cache -t $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG "$APP_DIR/4.transaction-service"

                docker build --no-cache -t $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG "$APP_DIR/5.notification-service"
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                docker push $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG

                docker push $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG

                docker push $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG

                docker push $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG

                docker push $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy Namespace, Secret, ConfigMap and MySQL') {
            steps {
                sh '''
                kubectl apply -f "$K8S_DIR/1.namespace.yaml"

                kubectl apply -f "$K8S_DIR/2.mysql-secret.yaml"

                kubectl apply -f "$K8S_DIR/3.banking-configmap.yaml"

                kubectl apply -f "$K8S_DIR/4.mysql.yaml"

                echo "Waiting for MySQL deployment..."
                kubectl rollout status deployment/mysql -n $NAMESPACE --timeout=5m
                '''
            }
        }

        stage('Deploy Banking Microservices') {
            steps {
                sh '''
                kubectl apply -f "$K8S_DIR/5.frontend.yaml"

                kubectl apply -f "$K8S_DIR/6.auth-service.yaml"

                kubectl apply -f "$K8S_DIR/7.account-service.yaml"

                kubectl apply -f "$K8S_DIR/8.transaction-service.yaml"

                kubectl apply -f "$K8S_DIR/9.notification-service.yaml"
                '''
            }
        }

        stage('Apply Ingress, RBAC and HPA') {
            steps {
                sh '''
                kubectl apply -f "$K8S_DIR/10.ingress-hostless.yaml"

                kubectl apply -f "$K8S_DIR/12.rbac.yaml"

                kubectl apply -f "$K8S_DIR/13.hpa.yaml" || true
                '''
            }
        }

        stage('Restart Deployments to Pull Latest v1 Images') {
            steps {
                sh '''
                echo "Restarting deployments because image tag is fixed as v1..."

                kubectl rollout restart deployment -n $NAMESPACE
                '''
            }
        }

        stage('Verify Rollout') {
            steps {
                sh '''
                echo "Waiting for all deployments to complete..."

                for deploy in $(kubectl get deployment -n $NAMESPACE -o name); do
                    echo "Checking rollout for $deploy"
                    kubectl rollout status $deploy -n $NAMESPACE --timeout=5m
                done

                echo "Pods:"
                kubectl get pods -n $NAMESPACE -o wide

                echo "Services:"
                kubectl get svc -n $NAMESPACE

                echo "Ingress:"
                kubectl get ingress -n $NAMESPACE

                echo "HPA:"
                kubectl get hpa -n $NAMESPACE || true
                '''
            }
        }

        stage('Test DB Connected APIs') {
            steps {
                sh '''
                echo "Testing auth-service internally..."

                kubectl run curl-test-$BUILD_NUMBER \
                  --image=curlimages/curl \
                  --rm -i \
                  --restart=Never \
                  -n $NAMESPACE \
                  -- curl -s http://auth-service:3001/auth/health || true

                echo ""
                echo "Testing account-service internally..."

                kubectl run curl-test-account-$BUILD_NUMBER \
                  --image=curlimages/curl \
                  --rm -i \
                  --restart=Never \
                  -n $NAMESPACE \
                  -- curl -s http://account-service:3002/account/health || true
                '''
            }
        }
    }

    post {
        success {
            echo 'Banking Microservices App deployed successfully using Jenkins CI/CD with image tag v1.'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }

        always {
            sh '''
            docker logout || true
            '''
        }
    }
}
