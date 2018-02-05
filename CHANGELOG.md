# Changelog
<a name="v2.11.4"></a>
# v2.11.4
### Infrastructure Changes
* Introduced `CONSOLE_NICE_FORMAT`
* Replaced `debounce` with `lodash.throttle@4.1.1`
* https://github.com/auth0/auth0-instrumentation/compare/v2.11.3...v2.11.4

<a name="v2.11.3"></a>
# v2.11.3
### Infrastructure Changes
* Support for full credentials object to Kinesis
* Upgrade `kinesis-writable` to `v4.1.3`

<a name="v2.11.2"></a>
# v2.11.2
### Bug Fix
* Force a partitionKey
* Fix `gc-stats` to `v1.0.2`

<a name="v2.11.1"></a>
# v2.11.1
### Bug Fix
* Upgrade `kinesis-writable` to `v4.1.2`

<a name="v2.11.0"></a>
# v2.11.0 - BROKEN
### Bug Fix
* Avoid caching wrong HTTP(s) agent

<a name="v2.10.2"></a>
# v2.10.2 - BROKEN
### Infrastructure Changes
* Bumped the version of `kinesis-writable` to `v4.1.0`.
* Support for STS Session Token on Kinesis instantiation.

<a name="v2.10.1"></a>
# v2.10.1 - BROKEN
### Infrastructure Changes
* Bumped the version of `kinesis-writable` to `v4.0.2`, which prevent undefined calls when writing records to Kinesis.

<a name="v2.10.0"></a>
# v2.10.0 - BROKEN
### Infrastructure Changes
* `init()` is now idempotent. [#77](https://github.com/auth0/auth0-instrumentation/pull/77)
* Support for Bunyan child loggers added [#76](https://github.com/auth0/auth0-instrumentation/pull/76)
* Added a `createProfile()` method on `Profile` [#72](https://github.com/auth0/auth0-instrumentation/pull/72)
* Fixed an issue in which agents could be leaked [#78](https://github.com/auth0/auth0-instrumentation/pull/78)

<a name="v2.9.2"></a>
# v2.9.2
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
