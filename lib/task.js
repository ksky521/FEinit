//系统模块
var fs = require('fs');
var util = require('util');
var path = require('path');
//路径
var lib = __dirname;
var root = path.join(__dirname, '../');
var taskDir = path.join(root, './tasks/');
//非系统模块
var feEvent = require(lib + '/feEvent');
var colors = require('colors');


//统一对事件进行管理
feEvent = new feEvent();
var showHelp = feEvent.help;
var showTaskList = feEvent.taskList;
feEvent.on('task undefined', function() {
    console.log('出错误啦'.bold.red + ': task没有定义！目前定义的task如下');
    this.taskList();
});


var Task = module.exports = function(root, args) {
    this.list = [];
    this.root = root; //当前目录

    this.files = []; //要操作的文件
    this.isInit = false;
    this.args = Array.isArray(args) ? args : args.split(' ');
    this.todo = ''; //要做的task
    this.targetFile = ''; //目标文件（夹）
    this.init();
};
Task.prototype.init = function() {
    if (this.isInit) {
        return this;
    }
    this.isInit = true;
    this.parseArgs();
    return this;
}
Task.prototype.parseArgs = function() {
    var args = this.args;

    this.todo = args.slice(0, 1).toString();
    var index = args.indexOf('to');
    this.files = args.slice(1, index);
    this.targetFile = args.slice(index + 1, index + 2).toString();
    return this;
}
Task.prototype.run = function() {
    this.loadTask(this.todo);
    return this;
}
Task.prototype.loadTask = function(task) {
    task = task || this.todo;
    if (this.isIn(task)) {
        var taskFn = require(taskDir + task);
        taskFn.init(this.root, this.files, this.targetFile);
        taskFn.start();//开始
    } else {
        feEvent.emit('task undefined');
    }
    return this;
}
Task.prototype.isIn = function(task) {
    if (this.list.length === 0) {
        this.getList();
    }
    return this.list.indexOf(task) !== -1;
}
Task.prototype.getList = function() {
    var files = fs.readdirSync(taskDir);
    var t = this;
    files.forEach(function(file) {
        var pathname = path.join(taskDir + file),
            stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.js$/.test(file)) {
            t.list.push(file.slice(0, -3));
        }
    });
    return this;
}