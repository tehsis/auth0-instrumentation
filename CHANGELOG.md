# Changelog
## v2.8.0
### Infrastructure Changes
* Updated the `v8-profiler` library to `v8-profiler-node8` [#113](https://github.com/node-inspector/v8-profiler/pull/113) to regain compatibility with Node 8.

## v2.7.0

FEATURES:
* Underlying kinesis lib performs retries on failed calls.

## v2.6.0

FEATURES:
* Added Profiler which allows to take heap dumps on demand and produces GC metrics.

NOTES:
* If you already have a `profiler` in your service, you should remove it to avoid having duplicates.
