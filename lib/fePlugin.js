var fs = require('fs');
var path = require('path');
var join = path.join;
var root = join(__dirname, '../');

var prompt = require(__dirname + '/prompt').prompt;
var grunt = require('grunt');
var gFile = grunt.file;
// var feEvent = new(require(root + '/lib/feEvent'))();
var log = require(root + '/lib/feLog');
var exeRoot;

var template = module.exports = function(cmds, exeRoute) {
    exeRoot = exeRoute || process.cwd();
    var doNothing = true;

    for (var i in cmds) {
        if (cmds[i] && _[i]) {

            _[i](cmds[i], cmds, exeRoute);
            doNothing = false;
        }
    }
    //如果什么都没做
    if (doNothing) {
        pluginHelp();
    }
}
var _ = {
    'create': function(name, cmds, root) {

        if (name !== '' && typeof name === 'string') {
            createPlugin(name);
        } else {
            pluginHelp();
        }

    },
    'help': function() {
        pluginHelp();
    }
};

function writeFile(name, content) {
    var tPath = join(root, './tasks/' + name + '.js');
    gFile.write(tPath, content, {
        encoding: 'utf-8'
    });
    log.note('[创建plugin "' + name + '" 成功，路径为：](yellow)');
    log.log(tPath);
    log.log('[PS](bold.green): 下一步，您要打开该文件并且按照task开发规范来编辑它，good luck！');
}

function createPlugin(name) {
    name = name.trim();
    if (!validName(name)) {
        nameTip();
        return;
    } else if (gFile.exists(root + '/tasks/' + name + '.js')) {
        log.error('创建失败： Plugin "' + name + '" 已经存在!');
        return;
    }
    var txt = fs.readFileSync(join(root, '/template/plugin.js'), 'utf-8').toString();
    var content = grunt.template.process(txt, {
        data: {
            name: name
        }
    });
    writeFile(name, content);
}
//判断name合法性

function validName(name) {
    return name !== '' && /^[a-z_\d+]+$/i.test(name);
}

function nameTip() {
    log.log('plugin命名规范：/^[a-z_]/i');
}

function pluginHelp() {
    log.log('Usage : fe pulgin [options] [arguments]');
    log.log(' * [fe plugin -c pluginName](green)   : 创建pluginName的task');
    log.log(' * [fe plugin -h](green)              : 获取帮助');
    log.log('[PS](bold.green): 创建的task文件，在fe安装路径的task文件夹中');
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
        action: '--create',
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

function getValue(str) {
    switch (str) {
        case 'true':
            str = true;
            break;
        case 'false':
            str = false;
            break;
    }
    return str;
}