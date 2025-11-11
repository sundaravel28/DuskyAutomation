pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/sundaravel28/DuskyAutomation.git'
            }
        }

       stage('Inject Environment Files') {
            steps {
                echo "🔐 Copying .env and related config files from Jenkins credentials..."
                withCredentials([
                    file(credentialsId: 'Dusky_config_file', variable: 'ENV_FILE'),
                    file(credentialsId: 'Dusky_jobdescriptionfile', variable: 'JOB_DESC_FILE'),
                    file(credentialsId: 'Dusky_jobresponsibilityfiles', variable: 'JOB_RESP_FILE')
                ]) {
                    bat '''
                        echo Copying environment and config files...
                        copy "%ENV_FILE%" .env
                        copy "%JOB_DESC_FILE%" .\\data\\jobdescription.json
                        copy "%JOB_RESP_FILE%" .\\data\\jobresponsibility.json
                        echo ✅ Environment and config files copied successfully.
                    '''
                }
            }
        }
         stage('Copy Env File') {
            steps {
                         // Copy the .env file from your local folder to workspace
                bat 'copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\.env" ".env"'
            }
        }


        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run @addnewjob Tests') {
            steps {
                bat 'npx cucumber-js --tags "@addnewjob"'
            }
        }

        stage('Run @Addthefeedbackform Tests') {
            steps {
                bat 'npx cucumber-js --tags "@Addthefeedbackform"'
            }
        }

        stage('Run @OnlineInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@OnlineInterviewSchedule"'
            }
        }

        stage('Run @OfflineInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@OfflineInterviewSchedule"'
            }
        }

        stage('Run @updateInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@updateInterviewSchedule"'
            }
        }

        stage('Run @disqualifySchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@disqualifySchedule"'
            }
        }
    }

    post {
        always {
            // Archive test results if you have cucumber reports
            archiveArtifacts artifacts: '**/*.json', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/*.html', allowEmptyArchive: true
        }
        success {
            echo 'All Cucumber tests passed successfully!'
        }
        failure {
            echo 'Some Cucumber tests failed. Check the logs for details.'
        }
    }
}