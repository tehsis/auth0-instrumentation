exports.decorateLogger = function (logger) {
  const createChildLoggerFactory = function (logger) {
    return function child(childOptions, simple) {
      return exports.decorateLogger(logger.child(childOptions, simple));
    };
  };
  const createLogFormatter = function (logger, lvl) {
    return function formatLog() {
      const args = Array.from(arguments);
      if (typeof args[0] === 'string' && typeof args[1] !== 'string') {
        const swap = args[0];
        args[0] = args[1] || {};
        args[1] = swap;
      }
      return logger[lvl].apply(logger, args);
    };
  };

  return {
    child: createChildLoggerFactory(logger),
    trace: createLogFormatter(logger, 'trace'),
    debug: createLogFormatter(logger, 'debug'),
    info: createLogFormatter(logger, 'info'),
    warn: createLogFormatter(logger, 'warn'),
    error: createLogFormatter(logger, 'error'),
    fatal: createLogFormatter(logger, 'fatal'),
    reopenFileStreams: () => {
      if (!logger || !logger.reopenFileStreams) { return; }
      logger.reopenFileStreams();
    }
  };
};
