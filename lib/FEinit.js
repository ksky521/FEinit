//系统模块
var fs = require('fs');
var path = require('path');
var join = path.join;

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');
var cfgTxt = join(lib, './txt');

//非系统模块
var prompt = require(lib + 'prompt').prompt;
var spawn = require(lib + 'spawn');
var grunt = require('grunt');
var wait = require(lib + 'wait');
var config = grunt.file.readJSON(root + '/config.json');
wait = wait();

//文件
var templateObj = {
    'package': template + 'package.json',
    'Gruntfile': template + 'Gruntfile.js'
};


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
            console.log(line);
            return;
        }
        var m = line.match(reg);
        if (!m) {
            console.log(line);
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
    var props = _.props.Gruntfile;
    if (config.download) {
        spawn.command('cd ' + _.route + ' && npm install', []);
    } else {

        var file = grunt.file;
        file.recurse(join(root, './init/node_modules'), function(abspath, rootdir, subdir, filename) {
            var dest = join(_.route, './node_modules/' + (subdir ? subdir : ''));
            if (!file.isDir(dest)) {
                file.mkdir(dest);
            }
            if (filename) {
                var destfile = join(dest, filename);
                file.copy(abspath, destfile);
            } else {
                console.log(arguments);
            }

        })
    }
    //开始复制config的文件
    var files = config.files;
    var keys = Object.keys(props);
    var initDir = join(root, './init/');
    for (var i in files) {
        if (keys.indexOf(i) !== -1) {
            if (/y/i.test(props[i])) {
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
    dirs.forEach(function(v) {
        var dest = join(_.route, './' + v);
        if (!file.isDir(dest)) {
            console.log('Create folder:' + dest);
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
    

    wait.fire('package end');

}
/**
 * 启动
 * @return {[type]} [description]
 */
_.start = function() {
    var p = _.prompts = {};
    //添加wait队列
    wait.on('package end', function() {
        p.Gruntfile = _.parseCmd(join(cfgTxt, './Gruntfile.txt'));
        _.prompt('Gruntfile');
    });
    p.package = _.parseCmd(join(cfgTxt, './package.txt'));
    _.prompt('package');
}

