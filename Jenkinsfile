pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "shiivam22"
        IMAGE_TAG = "v2-${BUILD_NUMBER}"
        NAMESPACE = "banking"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG ./frontend
                docker build -t $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG ./auth-service
                docker build -t $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG ./account-service
                docker build -t $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG ./transaction-service
                docker build -t $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG ./notification-service
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

        stage('Apply Base Kubernetes Files') {
            steps {
                sh '''
                kubectl apply -f k8s/00-namespace.yaml
                kubectl apply -f k8s/01-mysql-secret.yaml
                kubectl apply -f k8s/02-banking-configmap.yaml
                kubectl apply -f k8s/03-mysql.yaml
                kubectl apply -f k8s/30-rbac.yaml
                '''
            }
        }

        stage('Deploy App') {
            steps {
                sh '''
                kubectl apply -f k8s/10-frontend.yaml
                kubectl apply -f k8s/11-auth-service.yaml
                kubectl apply -f k8s/12-account-service.yaml
                kubectl apply -f k8s/13-transaction-service.yaml
                kubectl apply -f k8s/14-notification-service.yaml

                kubectl set image deployment/banking-frontend banking-frontend=$DOCKERHUB_USER/banking-frontend:$IMAGE_TAG -n $NAMESPACE
                kubectl set image deployment/auth-service auth-service=$DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG -n $NAMESPACE
                kubectl set image deployment/account-service account-service=$DOCKERHUB_USER/banking-account-service:$IMAGE_TAG -n $NAMESPACE
                kubectl set image deployment/transaction-service transaction-service=$DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG -n $NAMESPACE
                kubectl set image deployment/notification-service notification-service=$DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG -n $NAMESPACE
                '''
            }
        }

        stage('Apply Ingress and HPA') {
            steps {
                sh '''
                kubectl apply -f k8s/20-ingress-hostless.yaml
                kubectl apply -f k8s/40-hpa.yaml || true
                '''
            }
        }

        stage('Verify Rollout') {
            steps {
                sh '''
                kubectl rollout status deployment/mysql -n $NAMESPACE
                kubectl rollout status deployment/banking-frontend -n $NAMESPACE
                kubectl rollout status deployment/auth-service -n $NAMESPACE
                kubectl rollout status deployment/account-service -n $NAMESPACE
                kubectl rollout status deployment/transaction-service -n $NAMESPACE
                kubectl rollout status deployment/notification-service -n $NAMESPACE
                kubectl get pods -n $NAMESPACE
                kubectl get svc -n $NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo 'Banking Microservices App with MySQL DB connectivity deployed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }
    }
}
