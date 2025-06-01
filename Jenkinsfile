pipeline {
    agent any

    environment {
        // ID de la credencial de Jenkins que contiene tu token de SonarQube
        SONAR_TOKEN_CRED_ID = 'sonarqube'

        // URL de tu SonarQube, accediendo a través del host Docker.
        // Esto es para Docker Desktop donde SonarQube corre en un contenedor
        // y está mapeado al puerto 9000 de tu localhost.
        SONAR_HOST_URL = 'http://host.docker.internal:9000'
    }

    stages {
        stage('🔍 Environment Check') {
            steps {
                echo "=== VERIFICANDO ENTORNO ==="
                echo "Workspace: ${WORKSPACE}"
                echo "Working directory:"
                sh 'pwd'
                echo "Contenido del directorio actual:"
                sh 'ls -la'
                echo "=== FIN VERIFICACION ENTORNO ==="
            }
        }

        stage('📥 Checkout') {
            steps {
                echo "=== INICIANDO CHECKOUT ==="
                checkout scm
                echo "Checkout completado. Verificando archivos descargados:"
                sh 'ls -la'
                echo "Verificando que sonar-project.properties existe:"
                sh 'test -f sonar-project.properties && cat sonar-project.properties || echo "ERROR: sonar-project.properties no encontrado. Este archivo es crucial."'
                echo "=== FIN CHECKOUT ==="
            }
        }

        stage('📊 SonarQube Analysis') {
            steps {
                echo "=== INICIANDO ANALISIS SONARQUBE ==="
                script {
                    echo "Verificando configuración de SonarQube..."
                    echo "SONAR_HOST_URL (desde environment): ${env.SONAR_HOST_URL}"

                    echo "Verificando conectividad con SonarQube en ${env.SONAR_HOST_URL}:"
                    sh """
                        curl -sf --connect-timeout 15 ${env.SONAR_HOST_URL}/api/system/status || echo "⚠ No se puede conectar a SonarQube en ${env.SONAR_HOST_URL}. Verifica que SonarQube esté completamente iniciado y accesible en localhost:9000 desde tu host."
                    """

                    echo "Verificando archivo sonar-project.properties:"
                    sh 'test -f sonar-project.properties && echo "✅ sonar-project.properties existe." || echo "❌ ERROR: sonar-project.properties no existe."'
                    sh 'echo "Contenido de sonar-project.properties:"; cat sonar-project.properties || echo "No se pudo leer sonar-project.properties"'

                    echo "Obteniendo herramienta SonarQube Scanner..."
                    def scannerHome = tool 'SonarQube-Scanner' // Nombre de la herramienta en Global Tool Config
                    echo "Scanner Home: ${scannerHome}"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner ejecutable encontrado' || echo '❌ Scanner NO encontrado.'"

                    // 'sonarqube' (o el valor de SONAR_TOKEN_CRED_ID) es el ID de la credencial que contiene el token,
                    // y también el nombre del servidor SonarQube configurado en Jenkins (Manage Jenkins -> Configure System) si los hiciste coincidir.
                    withSonarQubeEnv(env.SONAR_TOKEN_CRED_ID) {
                        echo "Ejecutando análisis de SonarQube..."
                        echo "SonarQube environment variables inyectadas. SONAR_HOST_URL (para el scanner) debería ser: ${SONAR_HOST_URL}, SONAR_TOKEN debería estar disponible para el scanner."

                        sh """
                            echo "Listando archivos en el directorio actual antes del análisis:"
                            find . -type f -print | head -30

                            echo "Ejecutando sonar-scanner con modo debug (-X)..."
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.host.url=${env.SONAR_HOST_URL} \
                                -Dsonar.verbose=true \
                                -X
                        """
                        echo "✅ Comando de análisis de SonarQube ejecutado."
                    }
                }
                echo "=== FIN ANALISIS SONARQUBE ==="
            }
        }

        stage('🚪 Quality Gate') {
            steps {
                echo "=== VERIFICANDO QUALITY GATE ==="
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        // 'sonarqube' (o el valor de SONAR_TOKEN_CRED_ID) debe ser el nombre de tu servidor SonarQube configurado en Jenkins
                        def qg = waitForQualityGate()
                        echo "Quality Gate Status: ${qg.status}"
                        if (qg.status != 'OK') {
                            error "Quality Gate failed: ${qg.status}"
                        } else {
                            echo "✅ Quality Gate PASÓ exitosamente"
                        }
                    }
                }
                echo "=== FIN QUALITY GATE ==="
            }
        }
    }

    post {
        always {
            echo "=== POST-PROCESO SIEMPRE ==="
            echo "Build Number: ${BUILD_NUMBER}, Build URL: ${BUILD_URL}"
            cleanWs()
            echo "✅ Workspace limpio"
            echo "=== FIN POST-PROCESO ==="
        }
        success {
            echo "🎉 ¡PIPELINE COMPLETADO EXITOSAMENTE!"
        }
        failure {
            echo "💥 PIPELINE FALLÓ. Revisa los logs detallados (con -X en el scanner)."
        }
    }
}