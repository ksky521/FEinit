var _emptyArr = [];
var _arrSlice = _emptyArr.slice;

/**
 * 一个简单队列
 * @param {[type]} id [description]
 */

function Queue(id) {
    this.id = id;
    this.taskList = [];
}
/**
 * 推入
 * @param  {Function} fn    [description]
 * @param  {[type]}   args  [description]
 * @param  {[type]}   scope [description]
 * @return {[type]}         [description]
 */
Queue.prototype.push = function(fn, args, scope) {
    return this._add(fn, args, scope, 'push');
}
/**
 * 插队
 * @param  {Function} fn    [description]
 * @param  {[type]}   args  [description]
 * @param  {[type]}   scope [description]
 * @return {[type]}         [description]
 */
Queue.prototype.unshift = function(fn, args, scope) {
    return this._add(fn, args, scope, 'unshift');
}

Queue.prototype._add = function(fn, args, scope, type) {
    if (!type) {
        return this;
    }
    args = _arrSlice.call(arguments, 0, -1);
    if (args.length === 0) {
        return this;
    }

    this.taskList[type](args);
    return this;
}
/**
 * 从尾部弹出, LIFO
 * @return {[type]} [description]
 */
Queue.prototype.fire = function(type) {

    switch (type || 'LIFO') {
        case 'FIFO':
            type = 'shift';
            break;
        default:
            //默认是后入先出
            type = 'pop';
    }
    if (this._canIDo()) {
        var fn = this.taskList[type]();

        var args = Array.isArray(fn[1]) ? fn[1] : [];
        scope = fn[2] || null;
        fn = fn[0];

        typeof fn === 'function' && fn.apply(scope, args);
    }
    return this;
}

Queue.prototype._canIDo = function() {
    return this.taskList.length !== 0;
}

module.exports = Queue;