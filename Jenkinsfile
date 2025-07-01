pipeline {
    agent any

    environment {
        // --- Variables de SonarQube ---
        SONAR_HOST_URL      = 'http://sonarqube:9000' // Asumiendo que Jenkins y SonarQube están en la misma red Docker
        SONAR_TOKEN_CRED_ID = 'sonarqube' // El ID de tu credencial de SonarQube en Jenkins

        // --- Variables para AWS ECR y Docker ---
        AWS_REGION          = "us-east-1" // La región de tu repositorio ECR
        AWS_ACCOUNT_ID      = "533267168206" // Tu ID de cuenta de AWS
        ECR_REPOSITORY_NAME = "wally-pot" // El nombre de tu repositorio en ECR
        ECR_URL             = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME          = "${ECR_URL}/${ECR_REPOSITORY_NAME}:${env.BUILD_NUMBER}" // Etiqueta única por cada build

        // --- NUEVO: Variables para el Despliegue por SSH ---
        DEPLOY_SERVER_IP    = "TU_IP_PUBLICA_DEL_SERVIDOR_DE_DESPLIEGUE" // Reemplaza con la IP de tu segundo servidor
        DEPLOY_SERVER_USER  = "ubuntu" // El usuario para conectar por SSH (ej. 'ubuntu', 'ec2-user')
        SSH_CREDENTIALS_ID  = "deploy-server-key" // El ID de la credencial SSH que crearás en Jenkins
    }

    stages {
        // =================================================================
        // ETAPA 1: Checkout
        // =================================================================
        stage('1. Checkout') {
            steps {
                echo "Clonando el repositorio..."
                checkout scm
            }
        }

        // =================================================================
        // ETAPA 2: Probar Calidad de Código (Análisis)
        // =================================================================
        stage('2. SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-Scanner'
                    withSonarQubeEnv(env.SONAR_TOKEN_CRED_ID) {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        // =================================================================
        // ETAPA 3: Recibir Informe (Quality Gate)
        // =================================================================
        stage('3. Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Quality Gate FALLÓ: ${qg.status}. Abortando pipeline."
                        }
                        echo "✅ Quality Gate PASÓ exitosamente."
                    }
                }
            }
        }

        // =================================================================
        // ETAPA 4: Realizar Test (Placeholder)
        // =================================================================
        stage('4. Unit Tests') {
            steps {
                // Para un proyecto estático como wally-pot, no hay tests unitarios.
                // Si fuera un proyecto Java (mvn test) o Node.js (npm test), aquí irían los comandos.
                echo "Saltando tests unitarios (no aplicable para este proyecto)."
            }
        }

        // =================================================================
        // ETAPA 5 & 6: Construir, Empaquetar y Transferir
        // (Construir imagen Docker y subirla a ECR)
        // =================================================================
        stage('5 & 6. Build & Push Docker Image') {
            steps {
                echo "Construyendo y empaquetando la imagen: ${env.IMAGE_NAME}"
                sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_URL}"
                sh "docker build -t ${env.IMAGE_NAME} ."
                echo "Transfiriendo la imagen al registro ECR..."
                sh "docker push ${env.IMAGE_NAME}"
            }
        }

        // =================================================================
        // ETAPA 7: Inicializar Despliegue (vía SSH)
        // =================================================================
        stage('7. Deploy to Production Server') {
            steps {
                echo "Conectando al servidor de despliegue ${env.DEPLOY_SERVER_IP} por SSH..."
                // sshagent se encarga de usar la credencial SSH de forma segura
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    // El -o StrictHostKeyChecking=no evita la pregunta interactiva de si confiamos en el host
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP} '
                            echo "--- Conectado al servidor de despliegue ---"
                            
                            echo "1. Autenticando Docker con AWS ECR..."
                            aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_URL}
                            
                            echo "2. Descargando la nueva imagen: ${env.IMAGE_NAME}"
                            docker pull ${env.IMAGE_NAME}
                            
                            echo "3. Deteniendo y eliminando el contenedor antiguo (si existe)..."
                            docker stop wally-pot-app || true
                            docker rm wally-pot-app || true
                            
                            echo "4. Lanzando el nuevo contenedor..."
                            docker run -d --name wally-pot-app -p 80:80 ${env.IMAGE_NAME}
                            
                            echo "✅ ¡Despliegue completado!"
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Limpiando el workspace de Jenkins..."
            cleanWs()
        }
    }
}