#!/usr/bin/env node
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var createApp = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name, verbose, version) {
        var root, appName, packageToInstall, packageName, packageJson;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        root = _path2.default.resolve(name);
                        appName = _path2.default.basename(root);
                        packageToInstall = getInstallPackage(version);
                        packageName = getPackageName(packageToInstall);

                        checkAppName(appName, packageName);

                        _context.next = 7;
                        return (0, _pathExists2.default)(name);

                    case 7:
                        if (_context.sent) {
                            _context.next = 12;
                            break;
                        }

                        _context.next = 10;
                        return _fsExtra2.default.mkdir(root);

                    case 10:
                        _context.next = 17;
                        break;

                    case 12:
                        _context.next = 14;
                        return isSafeToCreateProjectIn(root);

                    case 14:
                        if (_context.sent) {
                            _context.next = 17;
                            break;
                        }

                        console.log('The directory `' + name + '` contains file(s) that could conflict. Aborting.');
                        process.exit(1);

                    case 17:

                        console.log('Creating a new React Primitive app in ' + root + '.');
                        console.log();

                        packageJson = {
                            name: appName,
                            version: '0.1.0',
                            private: true
                        };
                        _context.next = 22;
                        return _fsExtra2.default.writeFile(_path2.default.join(root, 'package.json'), (0, _stringify2.default)(packageJson, null, 2));

                    case 22:
                        process.chdir(root);

                        console.log('Using package manager as ' + packageManagerCmd() + ' with ' + packageManagerType() + ' interface.');
                        console.log('Installing packages. This might take a couple minutes.');
                        console.log('Installing react-primitive-scripts...');
                        console.log();

                        _context.next = 29;
                        return run(root, appName, version, verbose, packageToInstall, packageName);

                    case 29:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function createApp(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

var run = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(root, appName, version, verbose, packageToInstall, packageName) {
        var _this = this;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        install(packageToInstall, verbose, function () {
                            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(code, command, args) {
                                var scriptsPath, init;
                                return _regenerator2.default.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                if (!(code !== 0)) {
                                                    _context2.next = 3;
                                                    break;
                                                }

                                                console.error('`' + command + ' ' + args.join(' ') + '` failed');
                                                return _context2.abrupt('return');

                                            case 3:
                                                _context2.next = 5;
                                                return checkNodeVersion(packageName);

                                            case 5:
                                                scriptsPath = _path2.default.resolve(process.cwd(), 'node_modules', packageName, 'build', 'scripts', 'init.js');

                                                // $FlowFixMe (dikaiosune) maybe there's a way to convince flow this is legit?

                                                init = require(scriptsPath);
                                                _context2.next = 9;
                                                return init(root, appName, verbose, cwd);

                                            case 9:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this);
                            }));

                            return function (_x10, _x11, _x12) {
                                return _ref3.apply(this, arguments);
                            };
                        }());

                    case 1:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function run(_x4, _x5, _x6, _x7, _x8, _x9) {
        return _ref2.apply(this, arguments);
    };
}();

var checkNodeVersion = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(packageName) {
        var packageJsonPath, packageJson;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        packageJsonPath = _path2.default.resolve(process.cwd(), 'node_modules', packageName, 'package.json');
                        _context4.t0 = JSON;
                        _context4.next = 4;
                        return _fsExtra2.default.readFile(packageJsonPath);

                    case 4:
                        _context4.t1 = _context4.sent;
                        packageJson = _context4.t0.parse.call(_context4.t0, _context4.t1);

                        if (!(!packageJson.engines || !packageJson.engines.node)) {
                            _context4.next = 8;
                            break;
                        }

                        return _context4.abrupt('return');

                    case 8:

                        if (!_semver2.default.satisfies(process.version, packageJson.engines.node)) {
                            console.error(_chalk2.default.red('You are currently running Node %s but create-react-primitive-app requires %s.' + ' Please use a supported version of Node.\n'), process.version, packageJson.engines.node);
                            process.exit(1);
                        }

                    case 9:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function checkNodeVersion(_x13) {
        return _ref4.apply(this, arguments);
    };
}();

// If project only contains files generated by GH, it’s safe
var isSafeToCreateProjectIn = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(root) {
        var validFiles;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        validFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitignore', 'README.md', 'LICENSE'];
                        _context5.next = 3;
                        return _fsExtra2.default.readdir(root);

                    case 3:
                        _context5.t0 = function (file) {
                            return validFiles.indexOf(file) >= 0;
                        };

                        return _context5.abrupt('return', _context5.sent.every(_context5.t0));

                    case 5:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function isSafeToCreateProjectIn(_x14) {
        return _ref5.apply(this, arguments);
    };
}();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pathExists = require('path-exists');

var _pathExists2 = _interopRequireDefault(_pathExists);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = (0, _minimist2.default)(process.argv.slice(2));

/**
 * Arguments:
 *   --version - to print current version
 *   --verbose - to print npm logs during init
 *   --scripts-version <alternative package>
 *   --package-manager <package manager name or path>
 *     Example of valid values:
 *     - a specific npm version: "0.22.0-rc1"
 *     - a .tgz archive from npm: "https://registry.npmjs.org/react-primitive-scripts/-/react-primitive-scripts-0.20.0.tgz"
 *     - a package from `tasks/clean_pack.sh`: "/home/adam/create-react-primitive-app/react-primitive-scripts-0.22.0.tgz"
 */


// DON'T MODIFY THIS FILE
// IF AT ALL POSSIBLE, MAKE ANY CHANGES IN THE SCRIPTS PACKAGE

var commands = argv._;
var cwd = process.cwd();
var packageManager = argv['package-manager'];

if (commands.length === 0) {
    if (argv.version) {
        var version = require('../package.json').version;
        console.log('create-react-primitive-app version: ' + version);
        process.exit();
    }
    console.error('Usage: create-react-primitive-app <project-directory> [--verbose]');
    process.exit(1);
}

createApp(commands[0], !!argv.verbose, argv['scripts-version']).then(function () {});

function userHasYarn() {
    try {
        var result = _crossSpawn2.default.sync('yarnpkg', ['--version'], {
            stdio: 'ignore'
        });
        if (result.error || result.status !== 0) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

// This decides the 'interface' of the package managing command.
// Ex: If it guesses the type of package manager as 'yarn',
//     then it executes '(yarn) add' command instead of '(npm) install'.
function packageManagerType() {
    var defaultType = 'npm';
    var supportedTypes = ['yarn', 'npm'];

    if (packageManager) {
        var t = supportedTypes.find(function (type) {
            return packageManager.indexOf(type) > -1;
        });
        return t ? t : defaultType;
    }

    return userHasYarn() ? 'yarn' : defaultType;
}

function packageManagerCmd() {
    if (packageManager) {
        return packageManager;
    } else {
        return packageManagerType() === 'yarn' ? 'yarnpkg' : 'npm';
    }
}

function install(packageToInstall, verbose, callback) {
    var type = packageManagerType();
    var args = void 0,
        result = void 0;
    var cmd = packageManagerCmd();

    if (type === 'yarn') {
        args = ['add'];

        if (verbose) {
            args.push('--verbose');
        }

        args = args.concat(['--dev', '--exact', '--ignore-optional', packageToInstall]);
        result = _crossSpawn2.default.sync(cmd, args, { stdio: 'inherit' });
    } else {
        args = ['install'];

        if (verbose) {
            args.push('--verbose');
        }
        args = args.concat(['--save-dev', '--save-exact', packageToInstall]);

        result = _crossSpawn2.default.sync(cmd, args, { stdio: 'inherit' });
    }

    callback(result.status, cmd, args).then(function () {}, function (e) {
        throw e;
    });
}

function getInstallPackage(version) {
    var packageToInstall = 'react-primitive-scripts';
    var validSemver = _semver2.default.valid(version);
    if (validSemver) {
        packageToInstall += '@' + validSemver;
    } else if (version) {
        // for tar.gz or alternative paths
        packageToInstall = version;
    }
    return packageToInstall;
}

// Extract package name from tarball url or path.
function getPackageName(installPackage) {
    if (installPackage.indexOf('.tgz') > -1) {
        // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
        // However, this function returns package name only wihout semver version.
        var matches = installPackage.match(/^.+[\/\\](.+?)(?:-\d+.+)?\.tgz$/);
        if (matches && matches.length >= 2) {
            return matches[1];
        } else {
            throw new Error('Provided scripts package (' + installPackage + ') doesn\'t have a valid filename.');
        }
    } else if (installPackage.indexOf('@') > 0) {
        // Do not match @scope/ when stripping off @version or @tag
        return installPackage.charAt(0) + installPackage.substr(1).split('@')[0];
    }
    return installPackage;
}

function checkAppName(appName, packageName) {
    var allDependencies = ['react-primitive-scripts', 'exponent', 'expo', 'vector-icons', 'react', 'react-native'];

    if (allDependencies.indexOf(appName) >= 0) {
        console.error(_chalk2.default.red('We cannot create a project called `' + appName + '` because a dependency with the same name exists.\n' + 'Due to the way npm works, the following names are not allowed:\n\n') + _chalk2.default.cyan(allDependencies.map(function (depName) {
            return '  ' + depName;
        }).join('\n')) + _chalk2.default.red('\n\nPlease choose a different project name.'));
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map