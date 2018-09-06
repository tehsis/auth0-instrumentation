
class TagUtils {
  /**
  * @private
  * @param {string} key - The key identifier of the tag
  * @param {string} val - The value of the tag
  * @returns {string} - A tag in string format key:value
  */
  tag(key, val) {
    return key + ':' + val;
  }

  /**
   * @private
  * @param {object} tags - An object that represents tags using property name as key
  * @returns {Array} - Returns an array of strings formatted as tags
  */
  extractTags(tags) {
    return Object.keys(tags).map(key => this.tag(key, tags[key]));
  }

  /**
   * @param {any} tags - Any element that represents a tag
   * @returns {Array} - Returns an array of strings formatted as tags
   */
  processTags(tags) {
    if (typeof tags === 'object' && !Array.isArray(tags)) {
      return this.extractTags(tags);
    }

    return Array.isArray(tags) ? tags : [];
  }
}

module.exports = new TagUtils();
