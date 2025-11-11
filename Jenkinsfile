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

        stage('Run AddJob Feature') {
            steps {
                bat 'npm run bdd:addjob'
            }
        }

        stage('Run ScheduleJob Feature') {
            steps {
                bat 'npm run bdd:schedulejob'
            }
        }

        stage('Run AddJob & ScheduleJob Combined Feature') {
            steps {
                bat 'npm run bdd:addjob-schedulejob'
            }
        }
        
        // Alternative: Uncomment below to run all features in one stage instead of individually
        // stage('Run All Cucumber Tests') {
        //     steps {
        //         bat 'npm run bdd'
        //     }
        // }
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