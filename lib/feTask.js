/**
 * tasks的超类
 * 每个task都继承自此类
 * @type {[type]}
 */
var color = require('colors');
var join = require('path').join;
var log = require(__dirname + '/feLog');
var Task = function(name) {}
Task.prototype.error = log.error;
Task.prototype.warn = log.warn;
Task.prototype.note = log.note;
Task.prototype.help = function() {
    log.help();
}
/**
 * 混合杂糅
 * @param  {Object} target 目标对象，以此为基础的对象
 * @param  {Object} source 来源对象
 * @param  {Boolean} ride  是否覆盖同名属性
 * @return {Object}        处理完的对象
 */
Task.prototype.mix = function mix(target, source, ride) {

    var args = [].slice.call(arguments);
    var i = 1;
    var key;
    //如果最后参数是布尔，判定是否覆写同名属性
    ride = typeof ride==='boolean' ? ride : true;

    while ((source = args[i++])) {
        //source = [{a:1},{b:3}];
        if (Array.isArray(source)) {
            for (var n = 0, len = source.length; n < len; n++) {
                mix(target, source[n], ride);
            }
            continue;
        }
        //杂糅只允许对象
        for (key in source) {
            if (ride || !(key in target)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
Task.prototype.init = function(curDir, dist, dest, opts) {
    this.root = curDir;
    this.dist = Array.isArray(dist) ? dist : dist.split(' ');
    this.dist = this.dist.map(function(v) {
        return join(curDir, v);
    });
    this.options = opts || {};
    this.dest = join(curDir, dest);
}
module.exports = Task;