var color = require('colors');
var join = require('path').join;

var Task = function(name) {}
Task.prototype.error = function(msg) {
    if (msg) {

        console.log('>>> '.bold.red + msg);
    }
}
Task.prototype.warn = function(msg) {
    if (msg) {
        console.log('>>> '.red + msg);
    }
}
Task.prototype.note = function(msg) {
    if (msg) {

        console.log('>>> '.green + msg)
    }
}

Task.prototype.init = function(curDir, dist, dest) {
    this.root = curDir;
    this.dist = Array.isArray(dist) ? dist : dist.split(' ');
    this.dist = this.dist.map(function(v) {
        return join(curDir, v);
    });
    this.dest = join(curDir, dest);
}
module.exports = Task;