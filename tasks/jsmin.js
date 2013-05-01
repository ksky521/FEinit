/**
 * js压缩任务
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

//task依赖模块

Task.prototype.start = function() {
    var that = this;
    if (this.dist.length === 0) {
        

    } else {
        
    }
}


module.exports = new Task;