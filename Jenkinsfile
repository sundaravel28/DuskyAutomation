// Jenkinsfile for Dusky Job and Schedule Flow
// Repository: https://github.com/sundaravel28/DuskyAutomation.git
// Branch: master
pipeline {
    agent {
        label 'Window Visible Agent'
    }
    
    options {
        timeout(time: 2, unit: 'HOURS')
    }

    environment {
        // Allow Chrome to run in non-headless mode when needed
        HEADLESS = 'false'
        PWDEBUG = '1'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }

    stages {
        stage('Pipeline Start') {
            steps {
                echo '🚀 Pipeline started successfully'
                echo "Agent: ${env.NODE_NAME}"
                echo "Workspace: ${env.WORKSPACE}"
            }
        }
        
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
        
        stage('Copy All .env and .pdf Files') {
            steps {
                echo '📁 Copying all .env and .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"
                
                echo Checking for .env files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .env files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.env" "%WORKSPACE%\\" /Y
                    echo Listing copied .env files:
                    dir "%WORKSPACE%\\*.env" 2>nul
                ) else (
                    echo No .env files found, skipping...
                )

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo Listing copied .pdf files:
                    dir "%WORKSPACE%\\*.pdf" 2>nul
                ) else (
                    echo No .pdf files found, skipping...
                )

                echo ✅ Stage completed. If no files were found, stage passed.
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

        stage('Run @updatepdf Testsone') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF One') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
                '''
            }
        }

        stage('Run @OnlineInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@OnlineInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Teststwo') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF Two') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
                '''
            }
        }


        stage('Run @OfflineInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@OfflineInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Teststhree') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF Three') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
                '''
            }
        }

        stage('Run @updateInterviewSchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@updateInterviewSchedule"'
            }
        }

        stage('Run @updatepdf Testsfour') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF Four') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
                '''
            }
        }

        stage('Run @disqualifySchedule Tests') {
            steps {
                bat 'npx cucumber-js --tags "@disqualifySchedule"'
            }
        }

        stage('Run @updatepdf Testsfive') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF Five') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
                '''
            }
        }

        stage('Run @noshow Tests') {
            steps {
                bat 'npx cucumber-js --tags "@noshow"'
            }
        }


        stage('Run @updatepdf Testssix') {
            steps {
                bat 'npx cucumber-js --tags "@updatepdf"'
            }
        }

        stage('Copy All .pdf Files - After UpdatePDF six') {
            steps {
                echo '📁 Copying all .pdf files from local system to Jenkins workspace...'
                bat '''
                if not exist "%WORKSPACE%" mkdir "%WORKSPACE%"

                echo Checking for .pdf files...
                dir "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" >nul 2>&1
                if not errorlevel 1 (
                    echo Copying all .pdf files...
                    copy "C:\\Users\\sundaravel.v\\Documents\\Dusky Automation\\*.pdf" "%WORKSPACE%\\" /Y
                    echo ✅ Copy completed successfully.
                    echo Listing copied files:
                    dir "%WORKSPACE%\\*.pdf"
                ) else (
                    echo ℹ️ No .pdf files found. Stage passed.
                )
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
            echo '✅ All Cucumber tests passed successfully!'
        }

        failure {
            echo '❌ Some Cucumber tests failed. Check the Jenkins console logs for details.'
        }
    }
}
