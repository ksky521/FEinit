var color = require('colors');


var Task = function(name) {
    this.name = name;
}
Task.prototype.error = function(msg) {
    if (msg) {

        console.log(('Task ' + this.name + ' ERROR').bold.red + ': ' + msg);
    }
}
Task.prototype.note = function(msg) {
    if (msg) {

        console.log(('Task ' + this.name + ' NOTE').bold.green + ': ' + msg)
    }
}

Task.prototype.init = function(curDir, dist, dest) {
    this.root = curDir;
    this.dist = Array.isArray(dist) ? dist : dist.split(' ');
    this.dest = dest;
}
module.exports = Task;