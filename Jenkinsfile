pipeline {
    agent any

    environment {
        // --- Variables de SonarQube (las mantenemos como estaban) ---
        SONAR_TOKEN_CRED_ID = 'sonarqube'
        SONAR_HOST_URL      = 'http://kubernetes.docker.internal:9000' // Asegúrate que esto es accesible desde tu agente Jenkins

        // --- NUEVAS: Variables para AWS ECR y Docker ---
        // Cambia estos valores por los tuyos
        AWS_REGION          = "us-east-1" // La región de tu repositorio ECR
        AWS_ACCOUNT_ID      = "533267168206" // Tu ID de cuenta de AWS
        ECR_REPOSITORY_NAME = "wally-pot" // El nombre de tu repositorio en ECR

        // Variables generadas automáticamente
        ECR_URL             = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME          = "${ECR_URL}/${ECR_REPOSITORY_NAME}:${env.BUILD_NUMBER}" // Usamos el número de build como tag para unicidad
    }

    stages {
        // --- Etapas de SonarQube (se mantienen igual) ---
        stage('📥 Checkout') {
            steps {
                checkout scm
            }
        }

        stage('📊 SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-Scanner'
                    withSonarQubeEnv(env.SONAR_TOKEN_CRED_ID) {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.host.url=${env.SONAR_HOST_URL} \
                                -Dsonar.verbose=true \
                                -X
                        """
                    }
                }
            }
        }

        stage('🚪 Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Quality Gate FALLÓ: ${qg.status}. No se construirá la imagen Docker."
                        } else {
                            echo "✅ Quality Gate PASÓ exitosamente. Procediendo a construir la imagen."
                        }
                    }
                }
            }
        }

        // --- NUEVAS: Etapas para Docker y ECR ---
        // Estas etapas solo se ejecutarán si el Quality Gate fue exitoso.

        stage('🐳 Build Docker image') {
            steps {
                echo "Construyendo la imagen Docker: ${env.IMAGE_NAME}"
                // El comando 'docker build' usa el Dockerfile en la raíz del proyecto
                sh "docker build -t ${env.IMAGE_NAME} ."
            }
        }

        stage('🔐 Login to AWS ECR') {
            steps {
                echo "Iniciando sesión en el registro de ECR en la región ${env.AWS_REGION}"
                // Este comando obtiene una contraseña temporal y la usa para el login.
                // Requiere que AWS CLI esté instalado y configurado en el agente.
                sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_URL}"
            }
        }

        stage('🚚 Push image to ECR') {
            steps {
                echo "Subiendo la imagen ${env.IMAGE_NAME} a ECR."
                sh "docker push ${env.IMAGE_NAME}"
            }
        }
    }

    post {
        always {
            echo "Limpiando..."
            // Limpia la imagen Docker del agente para no ocupar espacio en disco.
            // '|| true' evita que el pipeline falle si la imagen no existe por algún error previo.
            sh "docker rmi ${env.IMAGE_NAME} || true"
            cleanWs()
        }
        success {
            echo "🎉 ¡PIPELINE COMPLETADO EXITOSAMENTE! La imagen está en ECR."
        }
        failure {
            echo "💥 PIPELINE FALLÓ. Revisa los logs."
        }
    }
}