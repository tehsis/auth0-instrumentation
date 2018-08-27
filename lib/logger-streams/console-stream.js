const spawn = require('child_process').spawn;

module.exports = function consoleStream(logLevel, niceFormatting) {
  var stream;

  if (niceFormatting) {
    const bunyanFormatter = spawn(
      `${__dirname}/../node_modules/.bin/bunyan`,
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
    level: logLevel,
    stream: stream
  };
};
