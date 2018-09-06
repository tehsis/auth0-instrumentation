/** @typedef {import('../configuration/logger-settings').ConsoleStreamSetting} Settings  */
const spawn = require('child_process').spawn;

/**
 *
 * @param {Settings} settings
 * @returns {object} Bunyan Stream
 */
module.exports = function consoleStream(settings) {
  var stream;

  if (settings.niceFormat) {
    const bunyanFormatter = spawn(
      `${__dirname}/../../node_modules/.bin/bunyan`,
      ['--color'],
      {
        stdio: ['pipe', 'inherit', 'inherit']
      }
    );

    stream = bunyanFormatter.stdin;
  } else {
    stream = process.stdout;
  }

  return {
    name: 'console',
    level: settings.level,
    stream: stream
  };
};
