/** @typedef {import('../configuration/logger-settings').FileStreamSetting} Settings  */

/**
 *
 * @param {Settings} settings
 * @returns {object} Bunyan Stream
 */
module.exports = function fileStream(settings) {
  return {
    name: 'file',
    level: settings.level,
    path: settings.file
  };
};
