pipeline {
  agent {
    label 'crew-brokkr'
  }

  tools {
    nodejs '6.10.3'
  }

  environment {
    NPM_TOKEN = credentials('auth0npm-npm-token')
  }

  options {
    timeout(time: 10, unit: 'MINUTES')
  }

  parameters {
    string(name: 'SlackTarget', defaultValue: '#domain-obs-build', description: 'Target Slack Channel for notifications')
  }

  stages {
    stage('SharedLibs') { // Required. Stage to load the Auth0 shared library for Jenkinsfile
      steps {
        library identifier: 'auth0-jenkins-pipelines-library@master', retriever: modernSCM(
          [$class: 'GitSCMSource',
          remote: 'git@github.com:auth0/auth0-jenkins-pipelines-library.git',
          credentialsId: 'auth0extensions-ssh-key'])
      }
    }
    stage('Build') {
      steps {
        sh 'yarn --ignore-engines'
      }
    }
    stage('Publish') {
      steps {
        sh 'tools/npm.sh'
      }
    }
  }

  post {
    always {
      notifySlack(params.SlackTarget);
      deleteDir()
    }
  }
}
