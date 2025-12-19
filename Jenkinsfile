pipeline {
  agent { label 'hust-projects' }

  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    COMPOSE_PROJECT_NAME = "mini-ecommerce"
  }

  stages {

    stage('Checkout source') {
      steps {
        git branch: 'develop',
            credentialsId: 'github-https',
            url: 'https://github.com/ThaiMX-hust/mini-ecommerce'
      }
    }

    stage('Build & Restart API') {
      when {
        anyOf {
          changeset "server/**"
        }
      }
      steps {
        sh '''
          docker compose build api
          docker compose up -d api
        '''
      }
    }

    stage('Build & Restart FE') {
      when {
        anyOf {
          changeset "client/**"
        }
      }
      steps {
        sh '''
          docker build -t mini-ecommerce-client .
          docker run mini-ecommerce-client
        '''
      }
    }
  }


  post {
    success {
      echo 'Build api successfully'
    }
    failure {
      echo 'Build api failed'
    }
  }
}
