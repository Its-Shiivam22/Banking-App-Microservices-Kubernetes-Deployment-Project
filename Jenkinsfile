pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "shiivam22"
        IMAGE_TAG = "v1-${BUILD_NUMBER}"

        APP_DIR = "Banking-App"
        K8S_DIR = "k8s"

        GIT_USER_NAME = "Jenkins CI"
        GIT_USER_EMAIL = "jenkins@local"

        GITHUB_REPO = "Its-Shiivam22/Banking-App-Microservices-Kubernetes-Deployment-Project.git"
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

                echo "Repo root files:"
                ls -la

                echo "Application folders:"
                ls -la "$APP_DIR"

                echo "Kubernetes YAML files:"
                ls -la "$K8S_DIR"
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

        stage('Update Kubernetes YAML Image Tags') {
            steps {
                sh '''
                echo "Updating image tags in Kubernetes YAML files..."

                sed -i "s|image: $DOCKERHUB_USER/banking-frontend:.*|image: $DOCKERHUB_USER/banking-frontend:$IMAGE_TAG|g" "$K8S_DIR/5.frontend.yaml"

                sed -i "s|image: $DOCKERHUB_USER/banking-auth-service:.*|image: $DOCKERHUB_USER/banking-auth-service:$IMAGE_TAG|g" "$K8S_DIR/6.auth-service.yaml"

                sed -i "s|image: $DOCKERHUB_USER/banking-account-service:.*|image: $DOCKERHUB_USER/banking-account-service:$IMAGE_TAG|g" "$K8S_DIR/7.account-service.yaml"

                sed -i "s|image: $DOCKERHUB_USER/banking-transaction-service:.*|image: $DOCKERHUB_USER/banking-transaction-service:$IMAGE_TAG|g" "$K8S_DIR/8.transaction-service.yaml"

                sed -i "s|image: $DOCKERHUB_USER/banking-notification-service:.*|image: $DOCKERHUB_USER/banking-notification-service:$IMAGE_TAG|g" "$K8S_DIR/9.notification-service.yaml"

                echo "Updated image tags:"
                grep -R "image: $DOCKERHUB_USER" "$K8S_DIR"
                '''
            }
        }

        stage('Commit Updated YAML to GitHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                    git config user.name "$GIT_USER_NAME"
                    git config user.email "$GIT_USER_EMAIL"

                    git status

                    git add "$K8S_DIR/5.frontend.yaml"
                    git add "$K8S_DIR/6.auth-service.yaml"
                    git add "$K8S_DIR/7.account-service.yaml"
                    git add "$K8S_DIR/8.transaction-service.yaml"
                    git add "$K8S_DIR/9.notification-service.yaml"

                    git commit -m "Update banking app image tags to $IMAGE_TAG" || echo "No changes to commit"

                    git push https://$GIT_USERNAME:$GIT_TOKEN@github.com/$GITHUB_REPO HEAD:main
                    '''
                }
            }
        }

        stage('Argo CD Deployment Info') {
            steps {
                sh '''
                echo "CI completed successfully."
                echo "Docker images pushed with tag: $IMAGE_TAG"
                echo "Updated Kubernetes YAML files pushed to GitHub."
                echo "Argo CD will now detect Git changes and sync them to Kubernetes."
                '''
            }
        }
    }

    post {
        success {
            echo 'Jenkins CI completed. Argo CD will handle Kubernetes deployment.'
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
