//系统模块
var events = require('events');
var util = require('util');
var fs = require('fs');
var join = require('path').join;

//
var help = join(__dirname, '../bin/help.txt'); //帮助文件
var log = require(join(__dirname, './feLog'));


var feEvent = module.exports = function() {
    events.EventEmitter.call(this);

}
util.inherits(feEvent, events.EventEmitter);


feEvent.prototype.error = function error(err) {
    err = err instanceof Error ? err : new Error(err);
    if (!this.emit('error', err)) {
        throw err;
    }
    return this;
};
feEvent.prototype.taskList = function() {
    var root = join(__dirname, '../');
    var taskDir = root + '/tasks/';
    var files = fs.readdirSync(taskDir);

    files.forEach(function(file) {
        var pathname = taskDir + file;
        var stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.js$/.test(file)) {
            log.log('[ * ' + file.slice(0, -3) + '](yellow)');
        }
    });
}