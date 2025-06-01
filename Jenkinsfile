pipeline {
    agent any

    environment {
        // VERIFICACION: Tu credencial de SonarQube en Jenkins con el token
        SONAR_TOKEN_CRED_ID = 'sonarqube' // Mantenemos el ID de la credencial aquí
        // VERIFICACION: URL de tu SonarQube.
        // CAMBIADO: Asume que Jenkins y SonarQube están en la misma red Docker y SonarQube se llama 'sonarqube'.
        // Si tu contenedor SonarQube tiene otro nombre en la red Docker, cámbialo aquí.
        // Si usas 'docker.sonar:9000' y estás seguro que es accesible, puedes revertir.
        SONAR_HOST_URL = 'http://sonarqube:9000'
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
                    // No imprimimos el token directamente. withSonarQubeEnv lo maneja.

                    echo "Verificando conectividad con SonarQube en ${env.SONAR_HOST_URL}:"
                    // Usamos env.SONAR_HOST_URL para asegurar que estamos usando el valor del bloque environment
                    sh """
                        curl -sf --connect-timeout 10 ${env.SONAR_HOST_URL}/api/system/status || echo "⚠ No se puede conectar a SonarQube en ${env.SONAR_HOST_URL}. Verifica la red y que SonarQube esté completamente iniciado."
                    """

                    echo "Verificando archivo sonar-project.properties:"
                    sh 'test -f sonar-project.properties && echo "✅ sonar-project.properties existe." || echo "❌ ERROR: sonar-project.properties no existe."'
                    sh 'echo "Contenido de sonar-project.properties:"; cat sonar-project.properties || echo "No se pudo leer sonar-project.properties"'

                    echo "Obteniendo herramienta SonarQube Scanner..."
                    def scannerHome = tool 'SonarQube-Scanner' // Nombre de la herramienta en Global Tool Config
                    echo "Scanner Home: ${scannerHome}"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner ejecutable encontrado' || echo '❌ Scanner NO encontrado.'"

                    // 'sonarqube' es el nombre de tu servidor SonarQube configurado en Jenkins (Manage Jenkins -> Configure System)
                    // y también el ID de la credencial que contiene el token.
                    withSonarQubeEnv(env.SONAR_TOKEN_CRED_ID) {
                        echo "Ejecutando análisis de SonarQube..."
                        echo "SonarQube environment variables inyectadas. SONAR_HOST_URL debería ser: ${SONAR_HOST_URL}, SONAR_TOKEN debería estar disponible para el scanner."

                        // El scanner leerá sonar.projectKey, sonar.projectName, sonar.sources, etc., de sonar-project.properties.
                        // withSonarQubeEnv establece SONAR_HOST_URL y SONAR_TOKEN como variables de entorno,
                        // por lo que el scanner debería recogerlas si no se anulan con -D.
                        // Si aún necesitas pasar explícitamente la URL (a veces necesario si la variable de entorno no la toma bien el scanner):
                        // -Dsonar.host.url=${env.SONAR_HOST_URL} \
                        // Quitamos -Dsonar.login=${SONAR_TOKEN} porque withSonarQubeEnv lo debe gestionar.
                        sh """
                            echo "Listando archivos en el directorio actual antes del análisis:"
                            find . -type f -print | head -30

                            echo "Ejecutando sonar-scanner con modo debug (-X)..."
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.host.url=${env.SONAR_HOST_URL} \
                                -Dsonar.verbose=true \
                                -X 
                        """
                        // Si el scanner no toma SONAR_TOKEN automáticamente, podrías necesitar añadir:
                        // -Dsonar.login=${SONAR_TOKEN} // Pero esto podría traer de vuelta la advertencia de seguridad.
                        // Es mejor asegurarse que withSonarQubeEnv y la configuración del servidor SonarQube en Jenkins
                        // estén configurados para que el token se inyecte correctamente.

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
                        // 'sonarqube' es el nombre de tu servidor SonarQube configurado en Jenkins
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