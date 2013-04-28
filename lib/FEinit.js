//系统模块
var fs = require('fs');
var join = require('path').join;

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');

//非系统模块
var baidu = require(lib + 'baiduTemplate');
var prompt = require(lib + 'prompt').prompt;

var _ = module.exports;

/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function() {

    prompt(this.prompts, function(err, props) {
        if(err){
            this.emit('error', err);
        }
        _.props = props;
    });
}
/**
 * 解析txt文件命令
 * @return {[type]} [description]
 */
_.parseCmd = function() {
    var txt = fs.readFileSync(lib + 'prompts.txt', 'utf-8').toString();
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
_.template = function() {}
_.project = function() {}