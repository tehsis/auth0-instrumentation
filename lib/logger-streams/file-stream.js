module.exports = function fileStream(path, logLevel) {
  return {
    level: logLevel,
    path: path
  };
};
