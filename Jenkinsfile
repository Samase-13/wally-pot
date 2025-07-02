pipeline {
    // Definimos el agente y las herramientas que necesita
    agent any
    
    tools {
        nodejs 'NodeJS-18' 
    }

    environment {
        // --- Variables para SonarQube ---
        SONAR_SERVER_NAME = 'SonarQube-Server' 

        // --- Variables para el Despliegue por SSH ---
        DEPLOY_SERVER_IP    = "44.202.29.163"
        DEPLOY_SERVER_USER  = "ubuntu"
        SSH_CREDENTIALS_ID  = "jenkins_deploy_key"
        
        // --- Variables del Proyecto y Despliegue ---
        SITE_NAME           = "wally-pot" // Nombre para directorios y configs
        ARTIFACT_NAME       = "${SITE_NAME}-build-${env.BUILD_NUMBER}.zip"
        REMOTE_DEPLOY_PATH  = "/var/www/${SITE_NAME}" // Directorio de despliegue dedicado
        NGINX_SITES_AVAILABLE = "/etc/nginx/sites-available"
        NGINX_SITES_ENABLED   = "/etc/nginx/sites-enabled"
    }

    stages {
        // =================================================================
        // ETAPA PREPARATORIA: Instalar dependencias
        // =================================================================
        stage('0. Install Dependencies') {
            steps {
                echo "Instalando dependencias necesarias (zip)..."
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
                    def scannerHome = tool 'SonarQube-Scanner'
                    withSonarQubeEnv(SONAR_SERVER_NAME) {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        
        // =================================================================
        // ETAPA 3. Build (Empaquetar)
        // =================================================================
        stage('3. Build') {
            steps {
                echo "Empaquetando el sitio web y la configuración de Nginx en: ${env.ARTIFACT_NAME}"
                // Empaquetamos todo el contenido del proyecto en un zip
                sh "zip -r ${env.ARTIFACT_NAME} ."
            }
        }
        
        // =================================================================
        // ETAPA 4. Transferir Artefacto
        // =================================================================
        stage('4. Transfer Artifact') {
            steps {
                echo "Transfiriendo ${env.ARTIFACT_NAME} al servidor ${env.DEPLOY_SERVER_IP} vía SCP..."
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    sh "scp -o StrictHostKeyChecking=no ${env.ARTIFACT_NAME} ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP}:/tmp/"
                }
            }
        }

        // =================================================================
        // ETAPA 5. Despliegue y Configuración de Nginx
        // =================================================================
        stage('5. Deploy & Configure Nginx') {
            steps {
                echo "Desplegando el sitio web y configurando Nginx en el servidor remoto..."
                sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.DEPLOY_SERVER_USER}@${env.DEPLOY_SERVER_IP} '
                            echo "--- 1. Preparando directorio de despliegue ---"
                            sudo mkdir -p ${env.REMOTE_DEPLOY_PATH}
                            
                            echo "--- 2. Descomprimiendo nuevo sitio web ---"
                            # Descomprime el artefacto en el directorio, sobrescribiendo todo
                            sudo unzip -o /tmp/${env.ARTIFACT_NAME} -d ${env.REMOTE_DEPLOY_PATH}
                            
                            echo "--- 3. Configurando Nginx ---"
                            # Mueve el archivo de configuración al lugar correcto
                            sudo mv ${env.REMOTE_DEPLOY_PATH}/nginx/${env.SITE_NAME}.conf ${env.NGINX_SITES_AVAILABLE}/${env.SITE_NAME}
                            
                            echo "--- 4. Creando enlace simbólico ---"
                            # Elimina el enlace por defecto para evitar conflictos
                            sudo rm -f ${env.NGINX_SITES_ENABLED}/default
                            # Crea el nuevo enlace simbólico, forzando la sobreescritura si ya existía
                            sudo ln -sf ${env.NGINX_SITES_AVAILABLE}/${env.SITE_NAME} ${env.NGINX_SITES_ENABLED}/${env.SITE_NAME}
                            
                            echo "--- 5. Ajustando permisos de los archivos web ---"
                            sudo chown -R www-data:www-data ${env.REMOTE_DEPLOY_PATH}
                            sudo chmod -R 755 ${env.REMOTE_DEPLOY_PATH}
                            
                            echo "--- 6. Validando y recargando Nginx ---"
                            # Prueba que la sintaxis de la configuración es correcta antes de recargar
                            sudo nginx -t
                            # Recarga Nginx para aplicar la nueva configuración sin downtime
                            sudo systemctl reload nginx
                            
                            echo "--- 7. Limpiando artefacto temporal ---"
                            rm /tmp/${env.ARTIFACT_NAME}
                            
                            echo "✅ ¡Despliegue completado con éxito!"
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