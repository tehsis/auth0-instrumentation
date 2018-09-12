// Read configuration from .env file
const dotenv = require('dotenv');
dotenv.load({ silent: true });

// Initialize instrumentation agent
const package = require('../package.json');
const agent = require('../index');

agent.init(package, process.env);

// Test Logging Functionality
agent.logger.debug('Debugging message');
agent.logger.trace('Trace message');
agent.logger.info('Info message');
agent.logger.warn('Warning message');
agent.logger.error('Error message');
agent.logger.fatal('Fatal message');

setTimeout(() => {
    // do nothing - Sleep the process to wait until messages are sent
}, 2000);
