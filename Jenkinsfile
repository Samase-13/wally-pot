pipeline {
    agent any

    // No necesitamos 'tools { nodejs ... }' porque wally-pot no es un proyecto Node.js

    environment {
        // ID de la credencial de Jenkins que contiene tu token de SonarQube
        SONAR_TOKEN_CRED_ID = 'sonarqube' // Asegúrate que este es el ID correcto de tu credencial

        // URL de SonarQube. Elige UNA de estas y comenta la otra:
        // Opción 1: Si tienes una red Docker personalizada y SonarQube se llama 'sonarqube' en esa red
        SONAR_HOST_URL = 'http://kubernetes.docker.internal:9000/jenkins'
        // Opción 2: Si usas Docker Desktop y SonarQube está en localhost:9000 del host
        // SONAR_HOST_URL = 'http://host.docker.internal:9000'
    }

    stages {
        stage('🔍 Environment Check') {
            steps {
                echo "=== VERIFICANDO ENTORNO ==="
                echo "Workspace: ${WORKSPACE}"
                echo "Working directory:"
                sh 'pwd'
                echo "Contenido del directorio actual (primeros 30 archivos/carpetas):"
                sh 'ls -la | head -n 30'
                echo "=== FIN VERIFICACION ENTORNO ==="
            }
        }

        stage('📥 Checkout') {
            steps {
                echo "=== INICIANDO CHECKOUT ==="
                checkout scm
                echo "Checkout completado. Verificando archivos principales:"
                sh 'ls -la Jenkinsfile sonar-project.properties index.html || echo "Algunos archivos clave no encontrados"'
                echo "Contenido de sonar-project.properties:"
                sh 'cat sonar-project.properties || echo "ERROR: sonar-project.properties no encontrado o no se pudo leer."'
                echo "=== FIN CHECKOUT ==="
            }
        }

        // Las etapas 'Install Dependencies', 'Build', 'Test' del Jenkinsfile de tu amigo
        // NO APLICAN a wally-pot porque no es un proyecto Node.js. Las omitimos.

        stage('📊 SonarQube Analysis') {
            steps {
                echo "=== INICIANDO ANALISIS SONARQUBE ==="
                script {
                    echo "Configuración para SonarQube:"
                    echo "SONAR_HOST_URL (definida en environment): ${env.SONAR_HOST_URL}"
                    // No mostramos el token directamente.

                    echo "Verificando conectividad con SonarQube en ${env.SONAR_HOST_URL}..."
                    // Aumentamos el timeout del curl también, por si acaso.
                    sh """
                        curl -sf --connect-timeout 20 ${env.SONAR_HOST_URL}/api/system/status || echo "⚠ No se puede conectar a SonarQube en ${env.SONAR_HOST_URL}. Verifica la URL, la red, y que SonarQube esté completamente iniciado y respondiendo."
                    """

                    echo "Obteniendo herramienta SonarQube Scanner..."
                    // Asegúrate que 'SonarQube-Scanner' es el nombre exacto de la herramienta en Global Tool Configuration
                    def scannerHome = tool 'SonarQube-Scanner'
                    echo "Scanner Home: ${scannerHome}"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner ejecutable encontrado.' || echo '❌ Scanner ejecutable NO encontrado. Revisa Global Tool Configuration.'"

                    // 'sonarqube' (o el valor de SONAR_TOKEN_CRED_ID) debe ser:
                    // 1. El ID de la credencial de Jenkins con el token.
                    // 2. El nombre del Servidor SonarQube configurado en Jenkins (Manage Jenkins -> Configure System).
                    //    Asegúrate que la URL de ESE servidor en la config de Jenkins coincida con env.SONAR_HOST_URL.
                    withSonarQubeEnv(env.SONAR_TOKEN_CRED_ID) {
                        echo "Ejecutando análisis de SonarQube..."
                        // El scanner leerá projectKey, projectName, sources, ws.timeout, etc., desde sonar-project.properties.
                        // withSonarQubeEnv debe inyectar SONAR_HOST_URL y SONAR_TOKEN (si la config del servidor en Jenkins está bien).
                        // Pasamos -Dsonar.host.url explícitamente para asegurar que usa la que definimos.
                        // El modo -X (debug) es muy útil.
                        sh """
                            echo "Listando contenido del workspace antes del análisis (primeros 30 items):"
                            ls -la | head -n 30
                            echo "Ejecutando sonar-scanner..."
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.host.url=${env.SONAR_HOST_URL} \
                                -Dsonar.verbose=true \
                                -X
                        """
                        // Nota: No pasamos -Dsonar.login. Si withSonarQubeEnv y la config del server en Jenkins están bien,
                        // el token se inyecta. Si no, podrías necesitar añadir -Dsonar.login=${TOKEN_DE_LA_CREDENCIAL},
                        // pero eso puede dar warnings de seguridad si no se hace con cuidado.

                        echo "✅ Comando de análisis de SonarQube lanzado."
                    }
                }
                echo "=== FIN ANALISIS SONARQUBE ==="
            }
        }

        stage('🚪 Quality Gate') {
            steps {
                echo "=== VERIFICANDO QUALITY GATE ==="
                // Aumentamos el timeout general para el Quality Gate, ya que el análisis puede tardar.
                timeout(time: 15, unit: 'MINUTES') {
                    script {
                        echo "Esperando resultado del Quality Gate..."
                        // El nombre aquí ('sonarqube' o el ID de la credencial) debe coincidir con el servidor configurado en Jenkins.
                        def qg = waitForQualityGate()
                        echo "Quality Gate Status: ${qg.status}"

                        if (qg.status != 'OK') {
                            error "Quality Gate FALLÓ: ${qg.status}"
                        } else {
                            echo "✅ Quality Gate PASÓ exitosamente."
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
            echo "Build: ${BUILD_NUMBER}, URL: ${BUILD_URL}, Workspace: ${WORKSPACE}"
            echo "Limpiando workspace..."
            cleanWs()
            echo "✅ Workspace limpio."
            echo "=== FIN POST-PROCESO ==="
        }
        success {
            echo "🎉 ¡PIPELINE COMPLETADO EXITOSAMENTE!"
        }
        failure {
            echo "💥 PIPELINE FALLÓ. Revisa los logs detallados (el scanner se ejecutó con -X)."
            echo "Verifica:"
            echo "  1. Conectividad y estado del servidor SonarQube en ${env.SONAR_HOST_URL}."
            echo "  2. Logs del contenedor SonarQube para errores internos o de recursos."
            echo "  3. Configuración de la herramienta 'SonarQube-Scanner' en Jenkins."
            echo "  4. Configuración del servidor SonarQube en Jenkins (URL y token) en 'Administrar Jenkins -> Configurar Sistema'."
            echo "  5. Contenido de 'sonar-project.properties' en tu repositorio."
        }
    }
}
