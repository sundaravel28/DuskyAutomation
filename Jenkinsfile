pipeline {
    agent any

    environment {
        // Allow Chrome to run in non-headless mode when needed
        HEADLESS = 'false'
        PWDEBUG = '1'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }

    stages {
        stage('Checkout Repository') {
            steps {
                echo '📦 Cloning repository...'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/sundaravel28/DuskyAutomation.git'
                    ]]
                ])
                echo '✅ Repository checked out successfully'
            }
        }

        stage('Copy All .env Files') {
            steps {
                echo 'Copying all .env files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                echo Copying all .env files...
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" "%WORKSPACE%\\" /Y
                echo ✅ Copy completed successfully.
                dir "%WORKSPACE%\\*.env"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node dependencies and Playwright browsers...'
                bat '''
                npm ci
                npx playwright install --with-deps
                '''
            }
        }

        stage('Run Tests Headed (Chrome Profile)') {
            steps {
                echo 'Running @addnewjob tests in headed mode (Chrome visible)...'
                bat '''
                set HEADLESS=false
                set PWDEBUG=1
                echo 🧭 Launching Playwright in headed mode...
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
            echo 'Archiving HTML & JSON reports...'
            archiveArtifacts artifacts: '**/*.json', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/*.html', allowEmptyArchive: true
        }

        success {
            echo '✅ All Cucumber tests passed successfully!'
        }

        failure {
            echo '❌ Some Cucumber tests failed. Check the Jenkins console logs for details.'
        }
    }
}
