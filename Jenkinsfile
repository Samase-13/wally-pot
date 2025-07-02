pipeline {
    agent any

    environment {
        // --- Variable para SonarQube ---
        // Apunta al NOMBRE de la configuración del servidor que creaste en Jenkins
        SONAR_SERVER_NAME = 'SonarQube-Server' 

        // --- Variables para el Despliegue por SSH ---
        // ¡REEMPLAZA ESTOS VALORES!
        DEPLOY_SERVER_IP    = "52.23.8.246"
        DEPLOY_SERVER_USER  = "ubuntu"
        SSH_CREDENTIALS_ID  = "jenkins_deploy_key"
        
        // --- Variables del Artefacto y Despliegue ---
        ARTIFACT_NAME       = "wally-pot-build-${env.BUILD_NUMBER}.zip"
        REMOTE_DEPLOY_PATH  = "/var/www/html"
    }

    stages {
        // =================================================================
        // ETAPA 1: Checkout (Clonar repositorio)
        // =================================================================
        stage('1. Checkout') {
            steps {
                echo "Clonando el repositorio desde GitHub..."
                checkout scm
            }
        }

        // =================================================================
        // ETAPA 2: Análisis de SonarQube
        // =================================================================
        stage('2. SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-Scanner'
                    // ¡CORRECCIÓN! Usamos el nombre del servidor, no el ID de la credencial.
                    withSonarQubeEnv(SONAR_SERVER_NAME) {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        /*

        // =================================================================
        // ETAPA 3: Quality Gate
        // =================================================================
        stage('3. Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    script {
                        // Correcto, ya usaba el nombre del servidor.
                        def qg = waitForQualityGate(server: SONAR_SERVER_NAME)
                        if (qg.status != 'OK') {
                            error "Quality Gate FALLÓ: ${qg.status}. Abortando pipeline."
                        } else {
                            echo "✅ Quality Gate PASÓ exitosamente."
                        }
                    }
                }
            }
        }
        */

        // ... (resto de las etapas son correctas) ...
        
        stage('4 & 5. Test & Build') {
            steps {
                echo "Saltando tests (no aplicable para este proyecto)."
                echo "Empaquetando el sitio web en: ${env.ARTIFACT_NAME}"
                sh "zip -r ${env.ARTIFACT_NAME} ."
            }
        }

        stage('6. Transfer Artifact') {
            steps {
                echo "Transfiriendo ${env.ARTIFACT_NAME} al servidor ${env.DEPLOY_SERVER_IP} vía SCP..."
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    sh "scp -o StrictHostKeyChecking=no ${env.ARTIFACT_NAME} ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP}:/tmp/"
                }
            }
        }

        stage('7. Deploy Website') {
            steps {
                echo "Desplegando el sitio web en el servidor remoto..."
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP} '
                            echo "--- Conectado al servidor de despliegue ---"
                            sudo rm -rf ${env.REMOTE_DEPLOY_PATH}/*
                            sudo unzip -o /tmp/${env.ARTIFACT_NAME} -d ${env.REMOTE_DEPLOY_PATH}
                            rm /tmp/${env.ARTIFACT_NAME}
                            sudo chown -R www-data:www-data ${env.REMOTE_DEPLOY_PATH}
                            echo "✅ ¡Despliegue del sitio web completado!"
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