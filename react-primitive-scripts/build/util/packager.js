'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var cleanUpPackager = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(projectDir) {
        var result, _ref2, packagerPid;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _promise2.default.race([_xdl.Project.stopAsync(projectDir), new _promise2.default(function (resolve, reject) {
                            return setTimeout(resolve, 1000, 'stopFailed');
                        })]);

                    case 2:
                        result = _context.sent;

                        if (!(result === 'stopFailed')) {
                            _context.next = 15;
                            break;
                        }

                        _context.prev = 4;
                        _context.next = 7;
                        return _xdl.ProjectSettings.readPackagerInfoAsync(projectDir);

                    case 7:
                        _ref2 = _context.sent;
                        packagerPid = _ref2.packagerPid;

                        process.kill(packagerPid);
                        _context.next = 15;
                        break;

                    case 12:
                        _context.prev = 12;
                        _context.t0 = _context['catch'](4);

                        process.exit(1);

                    case 15:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[4, 12]]);
    }));

    return function cleanUpPackager(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _xdl = require('xdl');

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _bunyan = require('@expo/bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installExitHooks(projectDir, isInteractive) {
    if (!isInteractive && process.platform === 'win32') {
        require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('SIGINT', function () {
            process.emit('SIGINT');
        });
    }

    process.on('SIGINT', function () {
        _log2.default.withTimestamp('Stopping packager...');
        cleanUpPackager(projectDir).then(function () {
            // TODO: this shows up after process exits, fix it
            _log2.default.withTimestamp(_chalk2.default.green('Packager stopped.'));
            process.exit();
        });
    });
}

function shouldIgnoreMsg(msg) {
    return msg.indexOf('Duplicate module name: bser') >= 0 || msg.indexOf('Duplicate module name: fb-watchman') >= 0 || msg.indexOf('Warning: React.createClass is no longer supported') >= 0 || msg.indexOf('Warning: PropTypes has been moved to a separate package') >= 0;
}

function run(onReady) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var isInteractive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var packagerReady = false;
    var needsClear = false;
    var logBuffer = '';
    var progressBar = void 0;
    var projectDir = process.cwd();

    if (process.platform !== 'win32') {
        var watchmanExists = _crossSpawn2.default.sync('which', ['watchman']).status === 0;

        if (process.platform === 'darwin' && !watchmanExists) {
            var watcherDetails = _crossSpawn2.default.sync('sysctl', ['kern.maxfiles']).stdout.toString();
            if (parseInt(watcherDetails.split(':')[1].trim()) < 5242880) {
                _log2.default.withTimestamp(_chalk2.default.red('Unable to start server') + '\nSee https://git.io/v5vcn for more information, either install watchman or run the following snippet:\n' + _chalk2.default.cyan('  sudo sysctl -w kern.maxfiles=5242880\n  sudo sysctl -w kern.maxfilesperproc=524288') + '\n        ');
                process.exit(1);
            }
        } else if (!watchmanExists) {
            var _watcherDetails = _crossSpawn2.default.sync('sysctl', ['fs.inotify.max_user_watches']).stdout.toString();
            if (parseInt(_watcherDetails.split('=')[1].trim()) < 12288) {
                _log2.default.withTimestamp(_chalk2.default.red('Unable to start server') + '\nSee https://git.io/v5vcn for more information, either install watchman or run the following snippet:\n' + _chalk2.default.cyan('  sudo sysctl -w fs.inotify.max_user_instances=1024\n  sudo sysctl -w fs.inotify.max_user_watches=12288'));
                process.exit(1);
            }
        }
    }

    var handleLogChunk = function handleLogChunk(chunk) {
        // pig, meet lipstick
        // 1. https://github.com/facebook/react-native/issues/14620
        // 2. https://github.com/facebook/react-native/issues/14610
        // 3. https://github.com/react-community/create-react-primitive-app/issues/229#issuecomment-308654303
        // @ide is investigating 3), the first two are upstream issues that will
        // likely be resolved by others
        if (shouldIgnoreMsg(chunk.msg)) {
            return;
        }

        // we don't need to print the entire manifest when loading the app
        if (chunk.msg.indexOf(' with appParams: ') >= 0) {
            if (needsClear) {
                // this is set when we previously encountered an error
                // TODO clearConsole();
            }
            var devEnabled = chunk.msg.includes('__DEV__ === true');
            _log2.default.withTimestamp('Running app on ' + chunk.deviceName + ' in ' + (devEnabled ? 'development' : 'production') + ' mode\n');
            return;
        }

        if (chunk.msg === 'Dependency graph loaded.') {
            packagerReady = true;
            onReady();
            return;
        }

        if (packagerReady) {
            var message = chunk.msg.trim() + '\n';
            if (chunk.level <= _bunyan2.default.INFO) {
                _log2.default.withTimestamp(message);
            } else if (chunk.level === _bunyan2.default.WARN) {
                _log2.default.withTimestamp(_chalk2.default.yellow(message));
            } else {
                _log2.default.withTimestamp(_chalk2.default.red(message));

                // if you run into a syntax error then we should clear log output on reload
                needsClear = message.indexOf('SyntaxError') >= 0;
            }
        } else {
            if (chunk.level >= _bunyan2.default.ERROR) {
                (0, _log2.default)(_chalk2.default.yellow('***ERROR STARTING PACKAGER***'));
                (0, _log2.default)(logBuffer);
                (0, _log2.default)(_chalk2.default.red(chunk.msg));
                logBuffer = '';
            } else {
                logBuffer += chunk.msg + '\n';
            }
        }
    };

    // Subscribe to packager/server logs
    var packagerLogsStream = new _xdl.PackagerLogsStream({
        projectRoot: projectDir,
        onStartBuildBundle: function onStartBuildBundle() {
            progressBar = new _progress2.default('Building JavaScript bundle [:bar] :percent', {
                total: 100,
                clear: true,
                complete: '=',
                incomplete: ' '
            });

            _log2.default.setBundleProgressBar(progressBar);
        },
        onProgressBuildBundle: function onProgressBuildBundle(percent) {
            if (!progressBar || progressBar.complete) return;
            var ticks = percent - progressBar.curr;
            ticks > 0 && progressBar.tick(ticks);
        },
        onFinishBuildBundle: function onFinishBuildBundle(err, startTime, endTime) {
            if (progressBar && !progressBar.complete) {
                progressBar.tick(100 - progressBar.curr);
            }

            if (progressBar) {
                _log2.default.setBundleProgressBar(null);
                progressBar = null;

                if (err) {
                    _log2.default.withTimestamp(_chalk2.default.red('Failed building JavaScript bundle'));
                } else {
                    var duration = endTime - startTime;
                    _log2.default.withTimestamp(_chalk2.default.green('Finished building JavaScript bundle in ' + duration + 'ms'));
                }
            }
        },
        updateLogs: function updateLogs(updater) {
            var newLogChunks = updater([]);

            if (progressBar) {
                // Restarting watchman causes `onFinishBuildBundle` to not fire. Until
                // this is handled upstream in xdl, reset progress bar with error here.
                newLogChunks.forEach(function (chunk) {
                    if (chunk.msg === 'Restarted watchman.') {
                        progressBar.tick(100 - progressBar.curr);
                        _log2.default.setBundleProgressBar(null);
                        progressBar = null;
                        _log2.default.withTimestamp(_chalk2.default.red('Failed building JavaScript bundle'));
                    }
                });
            }

            newLogChunks.map(handleLogChunk);
        }
    });

    // Subscribe to device updates separately from packager/server updates
    _xdl.ProjectUtils.attachLoggerStream(projectDir, {
        stream: {
            write: function write(chunk) {
                if (chunk.tag === 'device') {
                    handleLogChunk(chunk);
                }
            }
        },
        type: 'raw'
    });

    installExitHooks(projectDir, isInteractive);
    _log2.default.withTimestamp('Starting packager...');

    _xdl.Project.startAsync(projectDir, options).then(function () {}, function (reason) {
        _log2.default.withTimestamp(_chalk2.default.red('Error starting packager: ' + reason.stack));
        process.exit(1);
    });
}

exports.default = { run: run };
module.exports = exports['default'];
//# sourceMappingURL=packager.js.map