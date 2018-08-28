module.exports = function fileStream(path, logLevel) {
  return {
    name: 'file',
    level: logLevel,
    path: path
  };
};
