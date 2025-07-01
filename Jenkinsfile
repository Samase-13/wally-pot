pipeline {
    agent any

    stages {
        stage('📥 Checkout') {
            steps {
                git 'https://github.com/Samase-13/wally-pot.git'
            }
        }

        stage('🐳 Build Docker image') {
            steps {
                sh 'docker build -t wally-pot .'
            }
        }

        stage('🔐 Login to AWS ECR') {
            steps {
                sh '''
                    docker run --rm -i amazon/aws-cli \
                      ecr get-login-password --region us-east-1 | \
                      docker login --username AWS --password-stdin 533267168206.dkr.ecr.us-east-1.amazonaws.com/wally-pot
                '''
            }
        }

        stage('🚚 Push image to ECR') {
            steps {
                sh 'docker push 533267168206.dkr.ecr.us-east-1.amazonaws.com/wally-pot'
            }
        }
    }

    post {
        failure {
            echo '💥 Error en pipeline. Revisa los logs.'
        }
    }
}
