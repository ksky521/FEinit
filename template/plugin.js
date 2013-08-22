//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var root = join(__dirname, '../');
var name = '<%= name %>';
//非系统模块
var feTask = require(root + '/lib/feTask');
var grunt = require('grunt');
var log = require(join(root, '/lib/feLog'));

var Task = function() {};
util.inherits(Task, feTask);
//help是帮助函数，fe <%= name %> -h 执行该函数
Task.prototype.help = function() {
    log.log('>>> fe <%= name %> task 帮助');
    log.log('    * [这里是帮助内容](yellow) : 前面[]内字体颜色是黄色的哦');
};

//任务启动函数，this.dest是目的文件(夹)，this.dist是要处理的文件(夹)
Task.prototype.start = function() {
    var that = this;
    //*************************下面是您要开发的内容哦***************************************
    if (this.dist.length === 0) {
        //举例：执行grunt的<%= name %>任务
        that.note('[开始 <%= name %>任务...](yellow)');
        var child = exec('cd ' + this.root + ' && grunt <%= name %>');
        child.stderr.on('data', function(data) {
            that.error(data);
        });
        child.stdout.on('data', function(data) {
            that.note(data);
        });

    } else {
        //执行自己的<%= name %>任务

    }
};


module.exports = new Task();