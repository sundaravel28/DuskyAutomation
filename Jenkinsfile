// Jenkinsfile for Dusky Job and Schedule Flow
pipeline {
    agent {
        label 'Window Visible Agent'
    }

    environment {
        HEADLESS = 'false'
        PWDEBUG = '1'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }

    stages {

        stage('Checkout Repository') {
            steps {
                echo 'Cloning repository...'
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
                echo 'Repository checked out successfully'
            }
        }

        stage('Copy .env & .pdf Files') {
            steps {
                echo 'Copying .env and .pdf files...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .env files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" >nul 2>&1
                if not errorlevel 1 (
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" "%WORKSPACE%\\" /Y
                ) else (
                    echo No .env files found.
                )

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                ) else (
                    echo No .pdf files found.
                )
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node packages & Playwright browsers...'
                bat '''
                npm ci
                npx playwright install --with-deps
                '''
            }
        }

        stage('Run Tests - Headed') {
            steps {
                echo 'Running @addnewjob tests headed (Chrome)...'
                bat '''
                set HEADLESS=false
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

        stage('Run @updatepdf Tests One') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF One') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @OnlineInterviewSchedule Tests') {
            steps {
                echo 'Running online schedule tests...'
                bat 'npx cucumber-js --tags "@OnlineInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Tests Two') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF Two') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @OfflineInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@OfflineInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Tests Three') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF Three') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @updateInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@updateInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Tests Four') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF Four') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @disqualifySchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@disqualifySchedule"'
            }
        }

        stage('Run @updatepdf Tests Five') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF Five') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @noshow Tests') {
            steps {
                bat 'npx cucumber-js --tags "@noshow"'
            }
        }

        stage('Run @updatepdf Tests Six') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy PDF - After UpdatePDF Six') {
            steps {
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                '''
            }
        }

        stage('Run @cancelevent Tests') {
            steps {
                bat 'npx cucumber-js --tags "@cancelevent"'
            }
        }

        stage('Run @deletepdf Tests') {
            steps {
                bat 'npx cucumber-js --tags "@deletepdf"'
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
            echo 'All Cucumber tests passed successfully!'
        }
        failure {
            echo 'Some Cucumber tests failed. Check the Jenkins logs.'
        }
    }
}
