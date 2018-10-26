const blocked = require('blocked');
const pusage = require('pidusage');
const uuid = require('uuid');
const utils = require('./tags');
const stubs = require('./stubs').metrics;

class MetricsAgent {
  constructor(type, metrics, options) {
    this.metrics = metrics;
    this.defaultTags = [];
    this.isActive = true;
    this.trackIds = {};
    this.type = type;
    this.options = options;
  }

  /**
   * Returns an array of tags merged with the specified default tags
   * @param {any} tags List of tags to be aggregated with the existing default tags
   * @returns {Array} Array of tags
   * @memberof MetricsAgent
   */
  getTags(tags) {
    return this.defaultTags.concat(utils.processTags(tags));
  }

  /**
   * Allows specifying the default tags to add on each metric
   *
   * @param {*} tags Tags to be added as default
   * @memberof MetricsAgent
   */
  setDefaultTags(tags) {
    this.defaultTags = utils.processTags(tags);
  }

  /**
   * Gauges measure the value of a particular thing over time
   *
   * @param {string} name Name of the metric
   * @param {number} value Value to record
   * @param {*} tags List of tags to add to the metric
   * @param {function} [callback] Callback function to invoke after the exeuction is completed
   * @returns
   * @memberof MetricsAgent
   */
  gauge(name, value, tags, callback) {
    callback = callback || stubs.callback;
    return this.metrics.gauge(name, value, this.getTags(tags), callback);
  }

  /**
   * Increment counts how many times something happened by specifying the amount
   *
   * @param {string} name Name of the metric
   * @param {number} value Value to record
   * @param {*} tags List of tags to add to the metric
   * @param {function} [callback] Callback function to invoke after the exeuction is completed
   * @returns
   * @memberof MetricsAgent
   */
  increment(name, value, tags, callback) {
    callback = callback || stubs.callback;
    if (Array.isArray(value)) {
      tags = value;
      value = 1;
    }

    return this.metrics.increment(name, value, this.getTags(tags), callback);
  }

  /**
   * Increments a single time the counter to track how many times something happened
   *
   * @param {string} name Name of the metric
   * @param {*} tags List of tags to add to the metric
   * @param {function} [callback] Callback function to invoke after the exeuction is completed
   * @returns
   * @memberof MetricsAgent
   */
  incrementOne(name, tags, callback) {
    return this.increment(name, 1, tags, callback);
  }

  /**
   * Observe a value, and increment a counter with tags that
   * correspond to the values given in `buckets`. This generates
   * metrics similar to a prometheus histogram, and is useful for
   * measuring latency values.
   * For example, given a set of buckets [10, 100, 250], a value
   * of 55 would increment a counter metric with tags le:100 and le:250,
   * since it is less than (or equal to) both of those values, along
   * with a special 'le:Inf' tag, which is present even for values that
   * exceed the largest specified bucket. Since it is greater than
   * 10, a le:10 tag would not be added.
   *
   * @param {string} name Name of the metric
   * @param {number} value Value to record
   * @param {*} buckets The list of buckets to observe
   * @param {*} tags List of tags to add to the metric
   * @param {function} [callback] Callback function to invoke after the exeuction is completed
   * @returns
   * @memberof MetricsAgent
   */
  observeBucketed(name, value, buckets, tags, callback) {
    const tagsArray = this.getTags(tags);
    tagsArray.push('le:Inf');
    buckets.forEach(bucket => {
      if (value <= bucket) {
        tagsArray.push(`le:${bucket}`);
      }
    });

    return this.metrics.increment(name, 1, tagsArray, callback);
  }

  /**
   * Histograms calculate the statistical distribution of any kind of value
   *
   * @param {string} name Name of the metric
   * @param {number} value Value to record
   * @param {*} tags List of tags to add to the metric
   * @param {function} [callback] Callback function to invoke after the exeuction is completed
   * @returns
   * @memberof MetricsAgent
   */
  histogram(name, value, tags, callback) {
    callback = callback || stubs.callback;
    return this.metrics.histogram(name, value, this.getTags(tags), callback);
  }

  /**
   * When using the DataDog Web URL, force flushing metrics to their API
   *
   * @memberof MetricsAgent
   */
  flush() {
    // STATSD does not require flush.
    if (this.type === 'datadog') {
      this.metrics.flush();
    }
  }

  /**
   * Starts the timer to track the time of an occurrence. Use endTime() to complete the tracking.
   *
   * @param {string} metricName Name of the metric
   * @param {*} tags List of tags to add to the metric
   * @returns {string} The tracking ID to be used with endTime()
   * @memberof MetricsAgent
   */
  time(metricName, tags) {
    const id = uuid.v4();
    this.increment(`${metricName}.started`, 1, tags);
    this.trackIds[id] = { date: Date.now(), metricName: metricName };
    return id;
  }

  /**
   * Finishes tracking a timer for an occurrence. Used in conjunction with the time() function
   *
   * @param {*} id The tracking ID to complete the timer
   * @param {*} tags List of tags to add to the metric
   * @returns {number} The amount of time that the tracking took
   * @memberof MetricsAgent
   */
  endTime(id, tags) {
    if (!this.trackIds[id]) {
      return;
    }

    const metricName = this.trackIds[id].metricName;
    var time = Date.now() - this.trackIds[id].date;
    delete this.trackIds[id];
    this.increment(`${metricName}.ended`, 1, tags);
    this.histogram(`${metricName}.time`, time, tags);
    return time;
  }

  /**
   * Initiates the process resource collection
   *
   * @param {*} tags List of tags to add to the resource metrics
   * @returns
   * @memberof MetricsAgent
   */
  startResourceCollection(tags) {
    if (!this.collectResourceUsage) {
      return;
    }

    const agent = this;

    tags = tags || {};

    // Collect resources on intervals
    setInterval(function() {
      const memUsage = process.memoryUsage();
      agent.gauge('resources.memory.heapTotal', memUsage.heapTotal, tags);
      agent.gauge('resources.memory.heapUsed', memUsage.heapUsed, tags);

      pusage.stat(process.pid, function(err, stat) {
        if (err) {
          return;
        }

        agent.gauge('resources.memory.usage', stat.memory, tags);
        agent.gauge('resources.cpu.usage', stat.cpu, tags);
      });
    }, this.options.collectResourceInterval);

    blocked(function(ms) {
      agent.histogram('event_loop.blocked', ms, tags);
    });
  }
}

module.exports = MetricsAgent;
