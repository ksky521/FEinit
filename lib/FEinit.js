//系统模块
var fs = require('fs');
var join = require('path').join;

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');
var cfgTxt = join(lib, './txt');

//非系统模块
var baidu = require(lib + 'baiduTemplate');
var prompt = require(lib + 'prompt').prompt;
var spawn = require(lib + 'spawn');
var grunt = require('grunt');
var wait = require(lib + 'wait');
wait = wait();

//文件
var templateObj = {
    'package': template + 'package.json',
    'Gruntfile': template + 'Gruntfile.js'
};


var _ = module.exports;
_.init = function(route) {
    _.route = route; //执行路径
    return this;
}
/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function(v, callback) {
    this.props = {};
    var prompts = this.prompts;
    prompt(prompts[v], function(err, props) {
        if (err) {}

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
    return prompts.filter(function(p) {
        return p;
    });
}

_.end = function() {}
_.template = function(obj, str) {
    var txt = fs.readFileSync(templateObj[str], 'utf-8').toString();
    var json = baidu.template(txt, obj);
    _[str](json);

}
_.Gruntfile = function(json) {
    console.log(json);
}
_.package = function(json) {
    json = JSON.parse(json);
    json = JSON.stringify(json, null, 4);
    fs.writeFileSync(join(_.route, './package.json'), json, 'utf-8', function(err) {
        if (err) throw err;
        console.log('Write package.json fail!');
    });
    spawn.command('cd ' + _.route + ' && npm install', [], function(){
        wait.fire('package end');
    });
}

_.start = function() {
    var p = _.prompts = {};
    wait.on('package end', function() {
        p.Gruntfile = _.parseCmd(join(cfgTxt, './Gruntfile.txt'));
        _.prompt('Gruntfile');
    });
    p.package = _.parseCmd(join(cfgTxt, './package.txt'));
    _.prompt('package');
}

// _.on('error', function(err) {

// }).on('end', function() {

// }).on('start', function() {

// })