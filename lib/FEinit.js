//系统模块
var fs = require('fs');
var path = require('path');
var join = path.join;
// var evt = new(require('events').EventEmitter)();

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');
var cfgTxt = join(lib, './txt');

//非系统模块
var prompt = require(lib + 'prompt').prompt;
var spawn = require(lib + 'spawn');
var grunt = require('grunt');
var feEvent = new(require(lib + '/feEvent'))();
var log = require(lib + 'feLog');

var config = grunt.file.readJSON(root + '/config.json');

//文件
var templateObj = {
    'package': template + 'package.json',
    'Gruntfile': template + 'Gruntfile.js'
};
var diyTemplateObj; //template路径
var isDIYTemplate = false; //是否是自定义模板路径

var _ = module.exports;

_.props = {};
_.init = function(route) {
    _.route = route; //执行路径
    return this;
}
/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function(v, callback) {

    var prompts = this.prompts;
    prompt(prompts[v], function(err, props) {
        if (err) {}
        _.props[v] = props;
        _.template(props, v);
        if (typeof callback === 'function') {
            callback()
        }
    });

    return this;
}
/**
 * 解析txt文件命令
 * @return {[type]} [description]
 */
_.parseCmd = function(file) {
    var txt = fs.readFileSync(file, 'utf-8').toString();
    var lines = txt.split(/\n/);
    var prop = {};
    var reg = /^\[\?\]\s?([^\(]+)\(([^\)]+)\)\s*\|\s([\w\d\-_\/]+)/;
    var prompts = lines.map(function(line) {
        if (!line || !/^\[\?\]/.test(line)) {
            log.log('[' + line + '](green)');
            return;
        }
        var m = line.match(reg);
        if (!m) {
            log.log('[' + line + '](green)');
            return;
        }
        var prompt = {
            message: m[1].trim(),
            default: m[2].trim(),
            name: m[3].trim()
        };
        return prompt;
    });
    return prompts.filter(function(p) {
        return p;
    });
}

_.end = function() {

}
/**
 * 复制文件
 * @return {[type]} [description]
 */
_.copy = function() {
    var file = grunt.file;
    var props = _.props.Gruntfile;
    if (config.download) {
        log.note('Download npm packages!'.green);
        spawn.command('cd ' + _.route + ' && npm install', []);
    } else {
        var moduleDir = join(root, './init/node_modules');
        if (!file.isDir(moduleDir)) {
            log.log('[Copying npm packages!](green)');

            file.recurse(moduleDir, function(abspath, rootdir, subdir, filename) {
                var dest = join(_.route, './node_modules/' + (subdir ? subdir : ''));
                if (!file.isDir(dest)) {
                    file.mkdir(dest);
                }
                if (filename) {
                    var destfile = join(dest, filename);
                    file.copy(abspath, destfile);
                } else {
                    log.log(arguments);
                }

                process.stdout.write('.');
            })
        } else {
            log.error('路径 "' + moduleDir + '" 不存在！');
        }

    }
    //开始复制config的文件
    var files = config.files;
    var keys = Object.keys(props);
    var initDir = join(root, './init/');
    for (var i in files) {
        if (keys.indexOf(i) !== -1) {
            if (/y/i.test(props[i])) {
                log.note('Add ' + props[i] + ' files..');
                //如果是需要
                files[i].forEach(function(v) {
                    var dir = path.dirname(v);
                    var basename = path.basename(v);
                    var dest;
                    if (dir) {
                        dir = join(_.route, dir);
                        if (!file.isDir(dir)) {
                            file.mkdir(dir);
                        }
                        dest = join(dir, basename);
                    } else {
                        dest = join(_.route, dir, basename);
                    }
                    file.copy(initDir + '/' + v, dest);
                });
            }
        }
    }
    log.log('[Done!](bold.green)');
}
/**
 * 末班处理
 * @param  {Object} obj
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
_.template = function(obj, str) {
    var txt = fs.readFileSync(templateObj[str], 'utf-8').toString();
    var json = grunt.template.process(txt, {
        data: obj
    });
    _[str](json);

}
/**
 * 处理Gruntfile.js程序
 * @param {[type]} json [description]
 */
_.Gruntfile = function(json) {
    grunt.file.write(join(_.route, './Gruntfile.js'), json, {
        encoding: 'utf-8'
    });
    log.note('Success: Gruntfile.js Create!');
    _.dir();
    _.copy();
}
/**
 * 创建dir程序
 * @return {[type]} [description]
 */
_.dir = function() {
    var file = grunt.file;
    var dirs = config.dirs;
    log.note('Create dirs...');
    dirs.forEach(function(v) {
        var dest = join(_.route, './' + v);
        if (!file.isDir(dest)) {
            log.note('* Create folder:' + dest);
            file.mkdir(dest);
        }
    });

}
/**
 * 创建package.json程序
 * @param  {[type]} json [description]
 * @return {[type]}      [description]
 */
_.package = function(json) {
    json = JSON.parse(json);
    //读取config默认的依赖list
    json.devDependencies = config.dependencies;
    json = JSON.stringify(json, null, 4);
    grunt.file.write(join(_.route, './package.json'), json, {
        encoding: 'utf-8'
    });

    log.note('Success: package.json Create!');
    feEvent.emit('package end');

}
/**
 * 启动
 * @return {[type]} [description]
 */
_.start = function(templateName) {
    log.logo();
    if (templateName) {
        if (config.templates && config.templates[templateName]) {
            isDIYTemplate = true;
            diyTemplateObj = config.templates[templateName];
        } else {
            prompt({
                prompt: '> "' + templateName + '" not exists, use default template ?[y/n]',
                'default': 'y',
                name: 'isDefaultTemplate'
            }, function(err, props) {
                props = props || {};
                if (err) {}
                if (/y/i.test(props.isDefaultTemplate)) {
                    _.doit();
                } else {
                    log.warn('Nothing to do!');
                }
            });
        }
    } else {
        _.doit();
    }
}
_.doit = function() {

    var p = _.prompts = {};
    //添加evt队列
    feEvent.on('package end', function() {
        p.Gruntfile = _.parseCmd(join(cfgTxt, './Gruntfile.txt'));
        _.prompt('Gruntfile');
    });
    p.package = _.parseCmd(join(cfgTxt, './package.txt'));
    _.prompt('package');
}