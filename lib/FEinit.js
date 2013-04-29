//系统模块
var fs = require('fs');
var join = require('path').join;
var spawn = require('child_process').spawn;

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');

//非系统模块
var baidu = require(lib + 'baiduTemplate');
var prompt = require(lib + 'prompt').prompt;
var lodash = require('lodash');

//文件
var filePackageJSON = template + 'package.json';
var filePrompts = lib + 'prompts.txt';

var win32 = process.platform === 'win32';

var _ = module.exports;
_.init = function(route) {
    _.route = route; //执行路径
    return this;
}
/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function() {
    this.props = {};
    prompt(this.prompts, function(err, props) {
        if (err) {
            this.emit('error', err);
        }
        console.log(props);
        _.props = props;
        _.template();
    });
    return this;
}
/**
 * 解析txt文件命令
 * @return {[type]} [description]
 */
_.parseCmd = function() {
    var txt = fs.readFileSync(filePrompts, 'utf-8').toString();
    var lines = txt.split(/\n/);
    var prop = {};
    var reg = /^\[\?\]\s?([^\(]+)\(([^\)]+)\)\s*\|\s([\w\d\-_\/]+)/;
    var prompts = lines.map(function(line) {
        if (!line || !/^\[\?\]/.test(line)) return;
        var m = line.match(reg);
        if (!m) {
            return;
        }
        var prompt = {
            message: m[1].trim(),
            default: m[2].trim(),
            name: m[3].trim()
        };
        return prompt;
    });
    _.prompts = prompts.filter(function(p) {
        return p;
    });
    return this;
}
_.end = function() {}
_.template = function() {
    var txt = fs.readFileSync(filePackageJSON, 'utf-8').toString();
    var json = baidu.template(txt, _.props);
    _.project(json);
    return this;
}
_.project = function(json) {
    json = JSON.parse(json);
    json = JSON.stringify(json, null, 4);
    fs.writeFileSync(join(_.route, './package.json'), json, 'utf-8', function(err) {
        if (err) throw err;
        console.log('Write package.json fail!');
    });
    spawnCommand('cd ', [_.route]);
    runInstall('npm', './');
    
}
_.copy = function() {

}
_.start = function() {
    _.parseCmd();
    _.prompt();
}

function spawnCommand(command, args, cb) {
    var winCommand = win32 ? 'cmd' : command;
    var winArgs = win32 ? ['/c ' + command + ' ' + args.join(' ')] : args;

    return spawn(winCommand, winArgs, { stdio: 'inherit' });
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