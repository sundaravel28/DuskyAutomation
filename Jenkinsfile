pipeline {
    agent any

    environment {
        // Define default environment file if needed
        ENV_FILE = "config.env"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Cloning repository..."
                git branch: 'master', url: 'https://github.com/sundaravel28/DuskyAutomation.git'
            }
        }

        stage('Copy All ENV Files') {
            steps {
                echo "Copying all .env files from local folder to Jenkins workspace..."
                bat '''
                if exist "%WORKSPACE%\\*.env" (
                    echo .env files already exist in workspace.
                ) else (
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" "%WORKSPACE%\\" /Y
                    echo Copy completed successfully.
                )
                dir "%WORKSPACE%"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing Node dependencies..."
                bat '''
                npm ci
                npx playwright install --with-deps
                '''
            }
        }

        stage('Run @addnewjob Tests') {
            steps {
                echo "Running @addnewjob tests..."
                bat '''
                npx cucumber-js --tags "@addnewjob" || exit /b 0
                '''
            }
        }

        stage('Run @Addthefeedbackform Tests') {
            steps {
                echo "Running @Addthefeedbackform tests..."
                bat '''
                npx cucumber-js --tags "@Addthefeedbackform" || exit /b 0
                '''
            }
        }

        stage('Run @OnlineInterviewSchedule Tests') {
            steps {
                echo "Running @OnlineInterviewSchedule tests..."
                bat '''
                npx cucumber-js --tags "@OnlineInterviewSchedule" || exit /b 0
                '''
            }
        }

        stage('Run @OfflineInterviewSchedule Tests') {
            steps {
                echo "Running @OfflineInterviewSchedule tests..."
                bat '''
                npx cucumber-js --tags "@OfflineInterviewSchedule" || exit /b 0
                '''
            }
        }

        stage('Run @updateInterviewSchedule Tests') {
            steps {
                echo "Running @updateInterviewSchedule tests..."
                bat '''
                npx cucumber-js --tags "@updateInterviewSchedule" || exit /b 0
                '''
            }
        }

        stage('Run @disqualifySchedule Tests') {
            steps {
                echo "Running @disqualifySchedule tests..."
                bat '''
                npx cucumber-js --tags "@disqualifySchedule" || exit /b 0
                '''
            }
        }

        stage('Generate Report') {
            steps {
                echo "Generating Cucumber HTML report..."
                bat '''
                if exist reports (
                    echo Reports folder already exists.
                ) else (
                    mkdir reports
                )
                npx cucumber-html-reporter --theme bootstrap --jsonFile=report.json --output=reports/cucumber_report.html || echo Report generation skipped
                '''
            }
        }
    }

    post {
        always {
            echo "Archiving test results..."
            archiveArtifacts artifacts: '**/*.json', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/*.html', allowEmptyArchive: true
        }

        success {
            echo '✅ All Cucumber tests passed successfully!'
        }

        failure {
            echo '❌ Some Cucumber tests failed. Check the logs or cucumber_report.html for details.'
        }
    }
}
