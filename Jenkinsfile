pipeline {
    agent any

    tools {
        // VERIFICACION: Asegúrate de que 'NodeJS-18' esté configurado en Jenkins -> Global Tool Configuration
        nodejs 'NodeJS-18'
    }

    environment {
        // VERIFICACION: Confirma que la credencial 'sonarqube' (con tu token de SonarQube) existe en Jenkins
        SONAR_TOKEN = credentials('sonarqube')
        // VERIFICACION: Verifica que SonarQube esté corriendo en esta URL y sea accesible desde el agente Jenkins
        // Si Jenkins y SonarQube están en la misma red Docker y el contenedor de SonarQube se llama 'sonarqube',
        // podrías usar 'http://sonarqube:9000'. 'docker.sonar:9000' asume una configuración específica.
        SONAR_HOST_URL = 'http://docker.sonar:9000'
    }

    stages {
        stage('🔍 Environment Check') {
            steps {
                echo "=== VERIFICANDO ENTORNO ==="
                echo "Workspace: ${WORKSPACE}"
                echo "Node version verificada:"
                sh 'node --version'
                echo "NPM version verificada:"
                sh 'npm --version'
                echo "Working directory:"
                sh 'pwd'
                echo "Contenido del directorio actual:"
                sh 'ls -la'
                echo "Git status:"
                sh 'git status || echo "No es un repo git o git no disponible"'
                echo "=== FIN VERIFICACION ENTORNO ==="
            }
        }

        stage('📥 Checkout') {
            steps {
                echo "=== INICIANDO CHECKOUT ==="
                checkout scm
                echo "Checkout completado. Verificando archivos descargados:"
                sh 'ls -la'
                echo "Verificando que package.json existe:"
                sh 'test -f package.json && cat package.json | head -20 || echo "ERROR: package.json no encontrado"'
                echo "Verificando que sonar-project.properties existe:"
                sh 'test -f sonar-project.properties && cat sonar-project.properties || echo "ERROR: sonar-project.properties no encontrado. Este archivo es crucial."'
                echo "=== FIN CHECKOUT ==="
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo "=== INSTALANDO DEPENDENCIAS ==="
                echo "Verificando package.json antes de instalar:"
                sh 'test -f package.json && echo "✅ package.json existe" || echo "❌ package.json NO existe"'
                echo "Verificando package-lock.json (o yarn.lock):"
                sh 'test -f package-lock.json && echo "✅ package-lock.json existe" || echo "⚠ package-lock.json NO existe, se creará (o usa yarn.lock si es Yarn)"'

                echo "Ejecutando npm ci (o yarn install si usas Yarn)..."
                sh 'npm ci' // Usa 'yarn install --frozen-lockfile' si tu proyecto usa Yarn

                echo "Verificando instalación:"
                sh 'test -d node_modules && echo "✅ node_modules creado correctamente" || echo "❌ FALLO: node_modules no existe"'
                sh 'ls node_modules | head -10'
                echo "=== FIN INSTALACION DEPENDENCIAS ==="
            }
        }

        stage('🏗 Build') {
            steps {
                echo "=== EJECUTANDO BUILD ==="
                echo "Verificando script build en package.json:"
                sh 'grep -A1 -B1 "\\"build\\"" package.json || echo "⚠ Script build no encontrado o no definido en package.json"'

                echo "Verificando que src/ existe (o tu directorio de fuentes principal):"
                // Ajusta 'src' si tu código fuente está en otra carpeta (ej. 'app', 'lib')
                sh 'test -d src && echo "✅ Directorio src/ existe" || echo "⚠ Directorio src/ no existe. Revisa la configuración de sonar.sources en sonar-project.properties."'
                sh 'ls -la src/ || echo "No se puede listar src/"'

                echo "Ejecutando build (npm run build)..."
                // Asegúrate que 'wally-pot' tenga un script 'build' en su package.json si es necesario
                sh 'npm run build'

                echo "Verificando que dist/ fue creado (o tu directorio de salida del build):"
                // Ajusta 'dist' si tu build genera los artefactos en otra carpeta
                sh 'test -d dist && echo "✅ Build exitoso - dist/ creado" || echo "⚠ FALLO: dist/ no fue creado (o tu script de build no genera una carpeta dist)."'
                sh 'ls -la dist/ || echo "No se puede listar dist/"'
                echo "=== FIN BUILD ==="
            }
        }

        stage('🧪 Test') {
            steps {
                echo "=== EJECUTANDO TESTS ==="
                echo "Verificando script test en package.json:"
                sh 'grep -A1 -B1 "\\"test\\"" package.json || echo "⚠ Script test no encontrado o no definido en package.json"'

                echo "Verificando archivos de configuración de test (ej. Jest):"
                sh 'test -f jest.config.js && echo "✅ jest.config.js existe" || echo "⚠ jest.config.js no existe (si usas Jest)"'

                echo "Ejecutando tests (npm test)..."
                // Este comando debe ejecutar tus tests. Si genera cobertura, asegúrate que la ruta
                // del reporte (ej. coverage/lcov.info) coincida con lo definido en sonar-project.properties
                // (ej. sonar.javascript.lcov.reportPaths o sonar.typescript.lcov.reportPaths)
                sh 'npm test' // O, por ejemplo, 'npm test -- --coverage' si usas Jest y quieres generar cobertura

                echo "✅ Comando de tests ejecutado. El resultado de la etapa dependerá del código de salida de 'npm test'."
                echo "=== FIN TESTS ==="
            }
        }

        stage('📊 SonarQube Analysis') {
            steps {
                echo "=== INICIANDO ANALISIS SONARQUBE ==="
                script {
                    echo "Verificando configuración de SonarQube..."
                    echo "SONAR_HOST_URL: ${SONAR_HOST_URL}"
                    echo "SONAR_TOKEN está configurado: ${SONAR_TOKEN ? '✅ SÍ' : '❌ NO'}"

                    echo "Verificando conectividad con SonarQube:"
                    // El '-f' hace que curl falle si el HTTP status code es >= 400
                    // '--connect-timeout 5' para no esperar indefinidamente
                    sh """
                        curl -sf --connect-timeout 5 ${SONAR_HOST_URL}/api/system/status || echo "⚠ No se puede conectar a SonarQube en ${SONAR_HOST_URL}. Verifica la URL y la red."
                    """

                    echo "Verificando archivo sonar-project.properties:"
                    sh 'test -f sonar-project.properties && echo "✅ sonar-project.properties existe y será utilizado por el scanner." || echo "❌ ERROR CRÍTICO: sonar-project.properties no existe. El análisis fallará o usará valores por defecto incorrectos."'
                    sh 'echo "Contenido de sonar-project.properties:"; cat sonar-project.properties || echo "No se pudo leer sonar-project.properties"'

                    echo "Obteniendo herramienta SonarQube Scanner..."
                    // VERIFICACION: 'SonarQube-Scanner' debe ser el nombre de tu herramienta SonarQube Scanner en Jenkins -> Global Tool Configuration
                    def scannerHome = tool 'SonarQube-Scanner'
                    echo "Scanner Home: ${scannerHome}"

                    echo "Verificando que el scanner ejecutable existe:"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner ejecutable encontrado en ${scannerHome}/bin/sonar-scanner' || echo '❌ Scanner ejecutable NO encontrado. Verifica la configuración de la herramienta SonarQube-Scanner en Jenkins.'"

                    // VERIFICACION: 'sonarqube' debe ser el nombre de tu servidor SonarQube configurado en Jenkins -> Configure System
                    withSonarQubeEnv('sonarqube') {
                        echo "Ejecutando análisis de SonarQube..."
                        echo "El scanner usará las propiedades definidas en sonar-project.properties (projectKey, projectName, sources, exclusions, etc.)."
                        echo "Se pasarán explícitamente: sonar.host.url, sonar.login, sonar.verbose."

                        // El scanner leerá sonar.projectKey, sonar.projectName, sonar.sources, sonar.exclusions, etc.,
                        // directamente desde el archivo sonar-project.properties en el workspace.
                        sh """
                            echo "Contenido del directorio de fuentes (definido en sonar-project.properties como sonar.sources) antes del análisis:"
                            # Intenta leer sonar.sources de sonar-project.properties para mostrar el contenido correcto
                            SOURCES_DIR=\$(grep '^sonar.sources=' sonar-project.properties | cut -d'=' -f2)
                            if [ -n "\$SOURCES_DIR" ] && [ -d "\$SOURCES_DIR" ]; then
                                echo "Listando contenido de \$SOURCES_DIR:"
                                find \$SOURCES_DIR -type f -print | head -20
                            else
                                echo "No se pudo determinar o encontrar el directorio sonar.sources desde sonar-project.properties, o 'src' no existe."
                                echo "Listando contenido de 'src/' como fallback:"
                                find src -type f -print | head -20 || echo "No hay archivos en src/ o src/ no existe"
                            fi

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
                echo "Esperando resultado del Quality Gate (puede tomar unos minutos después de que el análisis se complete en SonarQube)..."
                timeout(time: 10, unit: 'MINUTES') { // Aumenta el timeout si es necesario
                    script {
                        // VERIFICACION: 'sonarqube' debe ser el nombre de tu servidor SonarQube configurado en Jenkins -> Configure System
                        // El parámetro 'abortPipeline: true' (por defecto) hará fallar el pipeline si el Quality Gate no pasa.
                        def qg = waitForQualityGate()
                        echo "Quality Gate Status: ${qg.status}"

                        if (qg.status != 'OK') {
                            echo "❌ Quality Gate FALLÓ: ${qg.status}"
                            // 'error' es implícitamente llamado por waitForQualityGate si abortPipeline es true (default)
                            // Si quieres un mensaje personalizado: error "Pipeline aborted due to Quality Gate failure: ${qg.status}"
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
            echo "Información del build:"
            echo "- Build Number: ${BUILD_NUMBER}"
            echo "- Build URL: ${BUILD_URL}"
            echo "- Workspace: ${WORKSPACE}"

            echo "Estado final del workspace:"
            sh 'ls -la || echo "No se puede listar el workspace"'

            echo "Limpiando workspace..."
            cleanWs()
            echo "✅ Workspace limpio"
            echo "=== FIN POST-PROCESO ==="
        }
        success {
            echo "🎉 ¡PIPELINE COMPLETADO EXITOSAMENTE!"
            echo "✅ Todas las etapas pasaron correctamente."
            echo "✅ Código analizado en SonarQube."
            echo "✅ Quality Gate aprobado."
        }
        failure {
            echo "💥 PIPELINE FALLÓ"
            echo "❌ Revisa los logs de la etapa fallida para identificar el problema."
            echo "❌ Verifica la configuración de herramientas (NodeJS, SonarQube Scanner) en Jenkins."
            echo "❌ Confirma que SonarQube esté funcionando y sea accesible desde el agente Jenkins en ${SONAR_HOST_URL}."
            echo "❌ Revisa el archivo sonar-project.properties en tu repositorio para 'wally-pot'."
            echo "❌ Asegúrate que los scripts 'npm build' y 'npm test' funcionan localmente para 'wally-pot'."
        }
        unstable {
            echo "⚠ PIPELINE INESTABLE"
            echo "⚠ Usualmente indica que los tests fallaron pero no detuvieron el pipeline, o el Quality Gate tiene advertencias."
        }
    }
}