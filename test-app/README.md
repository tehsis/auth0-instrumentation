# Auth0 Instrumentation - Test App

This simple application is used to test the integration of auth0-instrumentation in an example application.

## How to use it

1. Edit the `.env` file and update the settings you need. Some settings must be left empty if you want to disable different streams. For example, to avoid using Kinesis streams, leave the LOG_TO_KINESIS settings empty.

1. Run the app!

  ```
  node index
  ```

## What does it do?

The app will send messages using different log levels, such as trace, info, debug, error, etc. Depending on your configuration settings, these messages will be visible in the streams you have chosen.
