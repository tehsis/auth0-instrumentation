module.exports = {
  kinesisErrorHandler: function kinesisErrorHandler(err) {
    const errorMsgs = ['Error on writing logs to Kinesis'];

    if (err) {
      errorMsgs.push(JSON.stringify({
        message: err.message,
        records: err.records,
        stack: err.stack
      }));
    }

    console.error.apply(this, errorMsgs);
  },
  webErrorHandler: function webErrorHandler(err) {
    const errorMsgs = ['Error on writing logs to web url'];

    if (err) {
      errorMsgs.push(JSON.stringify({
        message: err.message,
        stack: err.stack
      }));
    }

    console.error.apply(this, errorMsgs);
  }
};
