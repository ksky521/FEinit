//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');

var root = join(__dirname, '../');
var name = path.basename(__filename, '.js');
//非系统模块
var feTask = require(root + '/lib/feTask');

var Task = function() {
    feTask.call(this, name);
};
util.inherits(Task, feTask);

Task.prototype.start = function() {
    console.log(this)
}


module.exports = new Task;