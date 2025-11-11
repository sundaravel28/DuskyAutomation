pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/sundaravel28/DuskyAutomation.git'
            }
        }

        stage('Copy All ENV Files') {
            steps {
                bat '''
                echo Copying all .env files...
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" "%WORKSPACE%\\" /Y
                echo Copy completed successfully.
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install --with-deps'
            }
        }

        // 👇 Add this stage before your normal test runs
        stage('Run Tests Headed (Chrome Profile)') {
            steps {
                bat '''
                echo Running @addnewjob tests in headed mode using Chrome profile...
                set PWDEBUG=1
                npx cucumber-js --tags "@addnewjob"
                '''
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
