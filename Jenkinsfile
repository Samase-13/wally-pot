pipeline {
    agent any

    environment {
        // --- Variables de SonarQube ---
        SONAR_HOST_URL      = 'http://sonarqube:9000'
        SONAR_TOKEN_CRED_ID = 'Sonarqube'

        // --- Variables para el Despliegue por SSH ---
        // ¡REEMPLAZA ESTOS VALORES!
        DEPLOY_SERVER_IP    = "44.206.239.73"
        DEPLOY_SERVER_USER  = "ubuntu" // Usuario para conectar por SSH (ej. 'ubuntu', 'ec2-user')
        SSH_CREDENTIALS_ID  = "jenkins_deploy_key" // El ID de tu credencial SSH en Jenkins
        
        // --- Variables del Artefacto y Despliegue ---
        ARTIFACT_NAME       = "wally-pot-build-${env.BUILD_NUMBER}.zip" // Nombre único para el paquete
        REMOTE_DEPLOY_PATH  = "/var/www/html" // Directorio raíz de Nginx/Apache en el servidor de despliegue
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
        // ETAPA 2 & 3: Análisis de Calidad y Quality Gate
        // =================================================================
                // =================================================================
        // ETAPA 2: Probar Calidad de Código (Análisis)
        // =================================================================
        stage('2. SonarQube Analysis') {
            steps {
                script {
                    // Llama a la herramienta que acabamos de configurar
                    def scannerHome = tool 'SonarQube-Scanner'
                    // withSonarQubeEnv usa las credenciales y la URL del servidor SonarQube configurado en Jenkins
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
                // Esta etapa ahora espera a que el análisis anterior termine
                timeout(time: 15, unit: 'MINUTES') {
                    // El Quality Gate usa la información del análisis que se acaba de completar
                    def qg = waitForQualityGate()
                    if (qg.status != 'OK') {
                        error "Quality Gate FALLÓ: ${qg.status}. Abortando pipeline."
                    }
                    echo "✅ Quality Gate PASÓ exitosamente."
                }
            }
        }

        // =================================================================
        // ETAPA 4 & 5: Tests y Construcción
        // (Para un sitio estático, "construir" es empaquetar los archivos)
        // =================================================================
        stage('4 & 5. Test & Build') {
            steps {
                echo "Saltando tests (no aplicable para este proyecto)."
                echo "Empaquetando el sitio web en: ${env.ARTIFACT_NAME}"
                // El comando 'zip' crea un archivo comprimido con todo el contenido del workspace
                sh "zip -r ${env.ARTIFACT_NAME} ."
            }
        }

        // =================================================================
        // ETAPA 6: Transferir al Servidor de Despliegue
        // =================================================================
        stage('6. Transfer Artifact') {
            steps {
                echo "Transfiriendo ${env.ARTIFACT_NAME} al servidor ${env.DEPLOY_SERVER_IP} vía SCP..."
                // sshagent gestiona la autenticación con la clave privada de forma segura
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    // Usamos scp para copiar el .zip al directorio /tmp/ del servidor remoto.
                    // Es una buena práctica usar /tmp/ para archivos temporales.
                    sh "scp -o StrictHostKeyChecking=no ${env.ARTIFACT_NAME} ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP}:/tmp/"
                }
            }
        }

        // =================================================================
        // ETAPA 7: Inicializar Despliegue
        // =================================================================
        stage('7. Deploy Website') {
            steps {
                echo "Desplegando el sitio web en el servidor remoto..."
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    // Nos conectamos por SSH para ejecutar los comandos de despliegue en el servidor remoto
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP} '
                            echo "--- Conectado al servidor de despliegue ---"
                            
                            echo "1. Limpiando el contenido antiguo del sitio web..."
                            sudo rm -rf ${env.REMOTE_DEPLOY_PATH}/*
                            
                            echo "2. Descomprimiendo el nuevo sitio web en su lugar..."
                            # Descomprime el .zip desde /tmp/ directamente en la carpeta del servidor web
                            sudo unzip -o /tmp/${env.ARTIFACT_NAME} -d ${env.REMOTE_DEPLOY_PATH}
                            
                            echo "3. Limpiando el archivo .zip transferido..."
                            rm /tmp/${env.ARTIFACT_NAME}
                            
                            echo "4. Verificando los permisos de los archivos..."
                            # Asegura que el usuario del servidor web (ej. www-data) pueda leer los archivos
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
            // Esta sección se ejecuta siempre, falle o no el pipeline
            echo "Limpiando el workspace de Jenkins..."
            cleanWs() // Borra los archivos del workspace para mantener limpio el servidor de Jenkins
        }
    }
}