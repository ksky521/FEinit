/**
 * 合并任务
 * 
 */

//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var root = join(__dirname, '../');
// var name = path.basename(__filename, '.js');
//非系统模块
var feTask = require(root + '/lib/feTask');
var grunt = require('grunt');
var color = require('colors');

var Task = function() {};
util.inherits(Task, feTask);
Task.prototype.help = function(log){
    log.log('>>> fe concat task 帮助');
    log.log('    * [fe concat a.js b.js to dest.js](yellow) 将a.js和b.js合并为dest.js');
}
Task.prototype.start = function() {
    var that = this;
    if (this.dist.length === 0) {
        //执行grunt的concat任务
        that.note('开始grunt concat任务...'.yellow);
        var child = exec('cd ' + this.root + ' && grunt concat');
        child.stderr.on('data', function(data) {
            that.error(data);
        });
        child.stdout.on('data', function(data) {
            that.note(data);
        });

    } else {
        //执行自己的concat任务
        that.note('开始执行合并任务...'.yellow);
        var gFile = grunt.file;
        var content = this.dist.filter(function(filepath) {
            if (!gFile.exists(filepath)) {
                that.warn('Source file "' + filepath + '" not found.');
                return false;
            } else {
                return true;
            }
        }).map(gFile.read).join('\n');
        gFile.write(that.dest, content);
        that.note('File "' + that.dest + '" created.');
    }
}


module.exports = new Task;