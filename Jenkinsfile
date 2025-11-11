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

        stage('Run SuperAdmin Test') {
            steps {
                bat 'npx playwright test tests/superadmin.spec.ts'
            }
        }

        stage('Run Recruiter Test') {
            steps {
                bat 'npx playwright test tests/recruiter.spec.ts'
            }
        }

        stage('Run Hiring Manager Test') {
            steps {
                bat 'npx playwright test tests/hiringmanager.spec.ts'
            }
        }

         stage('Run Interviewer Test') {
            steps {
                bat 'npx playwright test tests/interviewer.spec.ts'
            }
        }
    }
}