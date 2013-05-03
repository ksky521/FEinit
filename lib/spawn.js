var lodash = require('lodash');
var spawn = require('child_process').spawn;
var win32 = process.platform === 'win32';

var _ = module.exports;
_.command = spawnCommand;
_.run = runInstall;
function spawnCommand(command, args, cb) {
    var winCommand = win32 ? 'cmd' : command;
    var winArgs = win32 ? ['/c ' + command + ' ' + args.join(' ')] : args;

    return spawn(winCommand, winArgs, { stdio: 'inherit' }).on('err', cb)
    .on('exit', function (err) {
      if (err === 127) {
      }
      cb(err);
    });;
}

function runInstall(installer, paths, options, cb) {
  if (!cb) {
    cb = options;
    options = {};
  }

  cb = cb || function () {};
  paths = Array.isArray(paths) ? paths : (paths && paths.split(' ') || []);

  var args = ['install'].concat(paths).concat(optsToArgs(options));

  spawnCommand(installer, args, cb)
    .on('err', cb)
    .on('exit', function (err) {
      if (err === 127) {
      }
      cb(err);
    });

}

// Convert an object to an array of CLI arguments
function optsToArgs(options) {
  var args = [];

  Object.keys(options).forEach(function (flag) {
    var val = options[flag];

    flag = flag.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });

    if (val === true) {
      args.push('--' + flag);
    }

    if (lodash.isString(val)) {
      args.push('--' + flag, val);
    }

    if (lodash.isNumber(val)) {
      args.push('--' + flag, '' + val);
    }

    if (lodash.isArray(val)) {
      val.forEach(function (arrVal) {
        args.push('--' + flag, arrVal);
      });
    }
  });

  return args;
}