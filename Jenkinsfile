pipeline {
    agent any

    // No necesitamos NodeJS tools si no estamos usando npm
    // tools {
    //     nodejs 'NodeJS-18'
    // }

    environment {
        SONAR_TOKEN = credentials('sonarqube') // Tu credencial de SonarQube en Jenkins
        SONAR_HOST_URL = 'http://docker.sonar:9000' // URL de tu SonarQube
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

        // NO NECESITAMOS 'Install Dependencies', 'Build', 'Test' para un proyecto HTML/CSS/JS simple
        // a menos que tengas herramientas específicas que requieran npm.

        stage('📊 SonarQube Analysis') {
            steps {
                echo "=== INICIANDO ANALISIS SONARQUBE ==="
                script {
                    echo "Verificando configuración de SonarQube..."
                    echo "SONAR_HOST_URL: ${SONAR_HOST_URL}"
                    echo "SONAR_TOKEN está configurado: ${SONAR_TOKEN ? '✅ SÍ' : '❌ NO'}"

                    echo "Verificando conectividad con SonarQube:"
                    sh """
                        curl -sf --connect-timeout 5 ${SONAR_HOST_URL}/api/system/status || echo "⚠ No se puede conectar a SonarQube en ${SONAR_HOST_URL}."
                    """

                    echo "Verificando archivo sonar-project.properties:"
                    sh 'test -f sonar-project.properties && echo "✅ sonar-project.properties existe." || echo "❌ ERROR: sonar-project.properties no existe."'
                    sh 'echo "Contenido de sonar-project.properties:"; cat sonar-project.properties || echo "No se pudo leer sonar-project.properties"'

                    echo "Obteniendo herramienta SonarQube Scanner..."
                    // 'SonarQube-Scanner' debe ser el nombre de tu herramienta en Jenkins -> Global Tool Configuration
                    def scannerHome = tool 'SonarQube-Scanner'
                    echo "Scanner Home: ${scannerHome}"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner ejecutable encontrado' || echo '❌ Scanner NO encontrado.'"

                    // 'sonarqube' debe ser el nombre de tu servidor SonarQube en Jenkins -> Configure System
                    withSonarQubeEnv('sonarqube') {
                        echo "Ejecutando análisis de SonarQube..."
                        // El scanner leerá sonar.projectKey, sonar.projectName, sonar.sources, sonar.exclusions, etc.,
                        // directamente desde el archivo sonar-project.properties en el workspace.
                        sh """
                            echo "Listando archivos en el directorio actual antes del análisis:"
                            find . -type f -print | head -30 # Mostrar algunos archivos para confirmar

                            echo "Ejecutando sonar-scanner..."
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONAR_TOKEN} \
                                -Dsonar.verbose=true
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
                        // 'sonarqube' debe ser el nombre de tu servidor SonarQube en Jenkins -> Configure System
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
            echo "💥 PIPELINE FALLÓ. Revisa los logs."
        }
    }
}