const os = require('os');
const ms = require('ms');
const fs = require('fs');
const moment = require('moment');
const GcStats = require('gc-stats');
const v8Profiler = require('v8-profiler-node8');
const debounce = require('lodash.debounce');

function Profiler(agent, pkg, env) {
  this.huntMemoryLeaks = env.HUNT_MEMORY_LEAKS;
  this.agent = agent;
  this.heapshotDir = env.HEAPDUMP_DIR || '/tmp';
  this.serviceName = pkg.name;

  if (env.HUNT_MEMORY_LEAKS) {
    this.debouncedSnapshot = debounce(createSnapshot(this.serviceName, this.heapshotDir), ms('5m'), { leading: true, trailing: false });
    this.createSnapshot = this.debouncedSnapshot;
    this.setupProcessListener();
  }

  if (env.PROFILE_GC) {
    this.setupGCReporter();
  }
}

Profiler.prototype.setupProcessListener = function setupProcessListener() {
  process.on('message', (msg) => {
    var message;

    try {
      message = JSON.parse(msg);
    } catch (err) {
      return;
    }

    if (!message || message.msg !== 'mem_high' || !this.huntMemoryLeaks) {
      return;
    }

    this.createDebouncedSnapshot('HIGH_MEMORY');
  });

  process.on('SIGUSR2', () => {
    this.createDebouncedSnapshot('SIGUSR2');
  });
};

Profiler.prototype.createProfile = function(timeout, callback) {
  if (typeof timeout === 'function') {
    callback = timeout;
    timeout = 10000;
  }

  const path = `${this.heapshotDir}/${this.serviceName}-profile-${moment().unix().toString()}.cpuprofile`;

  process.send(JSON.stringify({ msg: 'pause_monitoring' }));
  v8Profiler.startProfiling(path, true);

  setTimeout(() => {
    const profile = v8Profiler.stopProfiling(path);
    profile.export((err, result) => {
      if (err) {
        return callback(err);
      }
      fs.writeFileSync(path, result);
      profile.delete();
      setTimeout(function () {
        process.send(JSON.stringify({ msg: 'resume_monitoring' }));
      }, ms('5s'));
      return callback(null, path);
    });
  }, timeout);
};

Profiler.prototype.createDebouncedSnapshot = function createDebouncedSnapshot(reason) {
  this.debouncedSnapshot && this.debouncedSnapshot((err, path) => {
    if (err) {
      return this.agent.logger.error(err);
    }
    this.report(path, reason);
  });
};

function createSnapshot(name, dir) {
  return function(callback) {
    const path = `${dir}/${name}-heap-${moment().unix().toString()}.heapsnapshot`;
    const snapshot = v8Profiler.takeSnapshot();

    process.send(JSON.stringify({ msg: 'pause_monitoring' }));

    snapshot.export()
      .pipe(fs.createWriteStream(path))
      .on('finish', () => {
        snapshot.delete();
        setTimeout(() => {
          process.send(JSON.stringify({ msg: 'resume_monitoring' }));
        }, ms('5s'));
        //change the owner of the file to root.
        fs.chmodSync(path, '0400');
        callback(null, path);
      }).on('error', callback);
  };
}

Profiler.prototype.report = function report(path, reason) {
  const cmd = `rsync -rzvvhP ${os.hostname()}:${path} ~/Downloads/ --rsync-path="sudo rsync"`;
  const msg = `Snapshot has been taken due to ${reason}.
Download it with the following command: ${cmd}`;
  this.agent.logger.info(msg, { path, reason });
};

Profiler.prototype.setupGCReporter = function setupGCReporter() {
  const stats = GcStats();
  const gcType = new Map([
    [1,  'Scavenge'],
    [2,  'MarkSweepCompact'],
    [4,  'IncrementalMarking'],
    [8,  'WeakPhantomCallbackProcessing'],
    [15, 'All']
  ]);

  stats.on('stats', (info) => {
    this.agent.metrics.histogram('gc.time', info.pauseMS, {
      type: gcType.get(info.gctype) || info.gctype,
    });

    if (info && info.pauseMS > 500) {
      const startedAt = new Date(Date.now() - info.pauseMS);

      setTimeout(() => {
        this.createDebouncedSnapshot('LONG_GC_PAUSE');
      }, ms('5s'));

      this.agent.logger.info('long GC pause', {
        time: startedAt.toISOString(),
        gc_info: {
          startedAt: startedAt,
          finishedAt: new Date(),
          duration:  info.pauseMS,
          type:      gcType.get(info.gctype) || info.gctype,
          before:    info.before,
          after:     info.after,
          diff:      info.diff
        }
      });
    }
  });
};

module.exports = Profiler;
