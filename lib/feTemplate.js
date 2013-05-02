var fs = require('fs');
var nopt = require('nopt');
var path = require('path');
var join = path.join;
var root = join(__dirname, '../');
var config = join(root, 'config.json'); //默认配置文件

var grunt = require('grunt');
var gFile = grunt.file;
// var feEvent = new(require(root + '/lib/feEvent'))();
var log = require(root + '/lib/feLog');
var exeRoot;

var template = module.exports = function(cmds, exeRoute) {
    var obj = parseArgs(cmds);
    init(obj);
    exeRoot = exeRoute || process.cwd();
}
var cfgJSON = require(config);
/*
一个典型的模板配置如下
var template = {
    name:'demo',
    description:'这里是描述',
    directory:'路径',
    withGrunt:true,
    withCompass:false
}
 */
var templates = cfgJSON.templates || {};
var _ = {
    '--remove': function(args) {
        if (args.length === 0) {
            log.tips();
        } else if (Array.isArray(args)) {
            var count = 0;
            var doArr = [];
            args.forEach(function(v) {
                if (v in templates) {
                    delete templates[v];
                    doArr.push(v);
                    count++;
                } else {
                    log.warn('项目模板 "' + v + '" 不存在！');
                }
            });
            if(count>0){
                writeConfig();
                log.note('成功删除项目模板：'+ doArr.join(' '));
            }
        } else {
            log.tips();
        }
    },
    '--list': function(args) {
        if (args.length === 0) {
            log.note('项目模板列表如下：');
            var count = 0;
            for (var i in templates) {
                log.log(' * ' + i);
                count++;
            }
            log.log('共 [' + count + '](yellow) 个项目模板');
            log.log('[NOTE](green): 使用命令 "fe template templateName" 查看模板详细配置');
        } else if (Array.isArray(args)) {
            args.forEach(function(v) {
                var template = templates[v];
                if (template) {
                    log.note('项目模板 "' + v + '" 详细配置如下：');
                    log.log(JSON.stringify(template, null, 4));
                } else {
                    log.warn('项目模板 "' + v + '" 不存在！');
                }
            })
        } else {
            log.tips();
        }

        return _;
    },
    '--edit': function(args) {

    },
    '--create': function(args) {

    }
};

function writeConfig(json) {
    json = json || cfgJSON;
    if (typeof json === 'object') {
        json = JSON.stringify(json, null, 4);
    }
    gFile.write(config, json);
}

function init(obj) {
    if (obj.action && _[obj.action]) {
        _[obj.action](obj.args || []);
    } else {
        log.tips();
    }
}

function parseArgs(cmds) {
    var obj = {
        action: '--list',
        args: []
    }
    cmds.forEach(function(v) {
        if (v.indexOf('--') === 0) {
            obj.action = v;
        } else {
            obj.args.push(v);
        }
    });
    return obj;
}