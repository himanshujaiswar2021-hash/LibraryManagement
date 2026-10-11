pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Build backend') {
            steps {
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh 'sh ./mvnw -B -ntp clean verify'
                        } else {
                            bat 'mvnw.cmd -B -ntp clean verify'
                        }
                    }
                }
            }
        }

        stage('Build services') {
            steps {
                script {
                    ['services/notification-service', 'services/payment-service', 'services/reservation-service'].each { service ->
                        dir(service) {
                            if (isUnix()) {
                                sh 'sh ./mvnw -B -ntp clean verify'
                            } else {
                                bat 'mvnw.cmd -B -ntp clean verify'
                            }
                        }
                    }
                }
            }
        }

        stage('Build frontend') {
            steps {
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci'
                            sh 'npm run build'
                        } else {
                            bat 'npm ci'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/TEST-*.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: '**/target/*.jar, frontend/dist/**'
        }
    }
}
