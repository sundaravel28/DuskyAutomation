pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/sundaravel28/DuskyAutomation.git'
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