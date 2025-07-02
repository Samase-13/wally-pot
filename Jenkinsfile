pipeline {
    // Definimos el agente y las herramientas que necesita
    agent any
    
    tools {
        // Asegura que Node.js esté disponible en el PATH
        // El nombre 'NodeJS-18' debe coincidir con el que configuraste en Global Tool Configuration
        nodejs 'NodeJS-18' 
    }

    environment {
        // --- Variables para SonarQube ---
        SONAR_SERVER_NAME = 'SonarQube-Server' 

        // --- Variables para el Despliegue por SSH ---
        DEPLOY_SERVER_IP    = "52.23.8.246"
        DEPLOY_SERVER_USER  = "ubuntu"
        SSH_CREDENTIALS_ID  = "jenkins_deploy_key"
        
        // --- Variables del Artefacto y Despliegue ---
        ARTIFACT_NAME       = "wally-pot-build-${env.BUILD_NUMBER}.zip"
        REMOTE_DEPLOY_PATH  = "/var/www/html"
    }

    stages {
        // =================================================================
        // ETAPA PREPARATORIA: Instalar dependencias
        // =================================================================
        stage('0. Install Dependencies') {
            steps {
                echo "Instalando dependencias necesarias (zip)..."
                // Comando para sistemas basados en Debian/Ubuntu (como el contenedor de Jenkins por defecto)
                sh 'apt-get update && apt-get install -y zip'
            }
        }

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
                    // Node.js ya está en el PATH gracias a la sección 'tools'
                    def scannerHome = tool 'SonarQube-Scanner'
                    withSonarQubeEnv(SONAR_SERVER_NAME) {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        // ETAPA 3: Quality Gate (COMENTADA PARA NO ESPERAR)
        /*
        stage('3. Quality Gate') { ... }
        */
        
        // =================================================================
        // ETAPA 4 & 5. Test & Build
        // =================================================================
        stage('4 & 5. Test & Build') {
            steps {
                echo "Saltando tests (no aplicable para este proyecto)."
                echo "Empaquetando el sitio web en: ${env.ARTIFACT_NAME}"
                // Este comando ahora funcionará porque instalamos 'zip'
                sh "zip -r ${env.ARTIFACT_NAME} ."
            }
        }

        // ... (el resto de las etapas no necesitan cambios) ...
        
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