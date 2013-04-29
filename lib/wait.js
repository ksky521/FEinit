module.exports = function() {
    return new Wait;
}

var _emptyFn = function() {};
var now = Date.now();

function getUUid() {
    return 'Theo' + (now++);
}
// var _emptyArr = [];


function Wait() {
    // 强制使用new操作符
    if(!(this instanceof Wait)) {
        return new Wait();
    }
    this.init();
}

Wait.prototype = {
    constructor: Wait,
    init:function(){
        this.list = {}; //evt=>uuid array
        this.cbMap = {}; //uuid=>callback
        this.uuid2Evts = {}; //uuid=>evt array
        this._cbMap = {}; //callback=>uuid
    },
    /**
     * 绑定事件
     * @param  {Array}   evts     事件数组
     * @param  {Function} callback 回调函数
     * @param  {Object}   scope    函数作用域
     * @return {[type]}            [description]
     */
    on: function(evts, callback, scope) {
        if(typeof callback!=='function' || !evts) {
            //如果不是函数，或者evts为空，则直接返回
            //不抛出异常
            return this;
        }

        scope = scope || null; //回调作用域
        
        evts = Array.isArray(evts) ? evts : evts.split(',');

        var uuid = getUUid();
        this.cbMap[uuid] = {
            fn: callback,
            scope: scope
        };
        this._cbMap[callback] = uuid;
        var t = this;
        evts.forEach(function(e, i) {
            t.list[e] = t.list[e] || {
                handlers: [],
                //待处理的uuid
                data: '',
                state: 0
            };

            (t.uuid2Evts[uuid] = t.uuid2Evts[uuid] || []).push(e);

            t.list[e].handlers.push(uuid); //使用uuid记录
        })


        return this;
    },
    _findCanCallbacks: function(arr) {
        var back = [];
        for(var i = 0, len = arr.length; i < len; i++) {
            var uuid = arr[i];
            var evts = this.uuid2Evts[uuid];
            var doit = true;
            var args = [];
            for(var j = 0, l = evts.length; j < l; j++) {
                var tmp = this.list[evts[j]];
                if(tmp.state === 0) {
                    doit = false;
                    break;
                }
                args.push(tmp.data);
            }
            if(doit) {
                this.cbMap[uuid].args = args;
                back.push(this.cbMap[uuid]);
            }
        }
        return back;
    },
    /**
     * 触发事件
     * @param  {String} evt  事件类型
     * @param  {[type]} data 事件数据
     * @return {[type]}      this
     */
    fire: function(evt, data) {
        var list = this.list[evt];
        if(!list) {
            return this;
        }
        list.state = 1; //标注为可以fire
        list.data = data || '';
        var handlers = list.handlers;
        handlers = this._findCanCallbacks(handlers);
        while(handlers[0]) {
            var cb = handlers.shift();

            var scope = cb.scope;
            var args = cb.args;

            cb.fn.apply(scope, args)
        }

        return this;
    },
    /**
     * 移出绑定事件
     * @param  {String}   evt      事件名称
     * @param  {Function} callback 回调函数
     * @return {[type]}            [description]
     */
    un: function(evt, callback) {
        if(!evt || typeof callback!=='function') {
            return this;
        }

        var list = this.list[evt];
        if(!list) {
            return this;
        }
        var uuid = this._cbMap[callback];
        var handlers = list.handlers;
        var len = handlers.length;

        while(len--) {
            if(uuid === handlers[len]) {
                handlers.splice(len, 1);
                break;
            }
        }

        delete this._cbMap[callback];

        return this;
    },
    /**
     * 移出所有事件，重新初始化
     * @return {[type]} [description]
     */
    removeAll:function(){
        this.destroy();

        this.init();
    },
    /**
     * 销毁！
     * @return {[type]} [description]
     */
    destroy: function() {
        destroy(this);
    }
}

function destroy(obj) {
    var selfFn = arguments.callee;
    for(var a in obj) {
        if(obj.hasOwnProperty(a)) {
            if(Array.isArray(obj[a])) {
                obj[a].length = 0;
            } else if(typeof obj[a] === 'object') {
                selfFn(obj[a]);
            }
            delete obj[a];
        }
    }
}
