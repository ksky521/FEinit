var fs = require('fs');
var path = require('path');
var join = path.join;
var root = join(__dirname, '../');
//默认配置文件
var config = join(root, 'config.json');

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
    if (doNothing && cmds._[0]) {
        _.list(cmds._[0]);
        doNothing = false;
    } else if (doNothing) {
        tmplTips();
    }

}
var cfgJSON = require(config);
/**
 *一个典型的模板配置如下
 */
var demo = {
    name: 'demo',
    description: '这里是描述',
    directory: '路径',
    withGrunt: true,
    withCompass: false
}

var templates = cfgJSON.templates || {};
var _ = {
    'remove': function(name, cmds, root) {
        var args = cmds._;
        if (typeof name === 'string') {

            if (name in templates) {
                if (delete templates[name]) {
                    writeConfig();
                    log.note('成功删除项目模板：' + name);
                } else {
                    log.warn('项目模板 "' + name + '" 删除失败');
                }

            } else {
                log.warn('项目模板 "' + name + '" 不存在！');
            }
        } else {
            tmplTips()
        }
    },
    'list': function(name) {
        if (typeof name === 'string') {
            var template = templates[name];
            if (template) {
                log.note('项目模板 "' + name + '" 详细配置：');
                log.log(JSON.stringify(template, null, 4));
            } else if (name in cfgJSON.build_in_templates) {
                log.note('系统默认模板 "' + name + '" 详细配置：');
                log.log(JSON.stringify(cfgJSON.build_in_templates[name], null, 4));
            } else {
                log.warn('项目模板 "' + name + '" 不存在！');
            }
        } else {
            log.note('项目模板：');
            var count = 0;
            for (var i in templates) {
                log.log(' * ' + i);
                count++;
            }
            log.note('默认模版：');
            for (var i in cfgJSON.build_in_templates) {
                log.log(' * ' + i);
                count++;
            }
            log.log('共 [' + count + '](yellow) 个模板');
            log.log('[NOTE](green): \n * 命令 "fe template templateName" 查看模板详细配置');
            log.log(' * 命令 "fe init templateName" 初始化模版');

        }

        return _;
    },
    'edit': function(name, cmds) {
        var args = cmds._;
        if (typeof name === 'string' && args.length) {

            if (name in templates) {
                var template = templates[name];
                var count = 0;
                args.forEach(function(v) {
                    var cfg = v.split('=');
                    if (cfg.length !== 2) {
                        return;
                    }
                    template[cfg[0]] = getValue(cfg[1]);
                    count++;
                });

                templates[name] = template;

                writeConfig();
                log.log('共修改 "' + name + '" [' + count + '](yellow) 个配置');
                log.log('使用命令： fe template ' + name + ' 来查看最新配置');
            } else {
                log.warn('项目模板 "' + name + '" 不存在！');
            }

        } else {
            tmplTips();
        }
    },
    'help': function() {
        tmplHelp();
    },
    'create': function(name, cmds) {
        if (typeof name === 'string') {
            var args = cmds._;

            createTemplate.apply(null, [name, args[0]]);
        } else {
            log.error('创建项目模板[失败](bold.red)，请使用命令 "fe template -c 名称 [模板路径]" 来创建模板');
        }
    }
};

function createTemplate(name, dir) {
    if (!dir) {
        prompt({
            message: '使用当前文件夹为模板？[y/n]',
            'default': 'y',
            name: 'isCurDir'
        }, function(err, props) {
            if (err) {
                // tmplTips();
                return;
            }
            if (/y/i.test(props.isCurDir.trim())) {
                createTemplate(name, exeRoot);
            } else {
                log.error('创建项目模板[失败](bold.red)，请使用命令 "fe template -c 名称 模板路径" 来创建模板');
            }
        });
    } else {
        var last = dir.charAt(dir.length - 1);
        if (last === '/' || last === '\\') {
            dir = dir.slice(0, -1);
        }
        var a = path.relative(exeRoot, dir);

        if (a !== dir) {
            dir = join(exeRoot, a);
        }
        if (!gFile.isDir(dir)) {
            log.error('创建项目模板[失败](bold.red)，"' + dir + '" 不存在！');
            return;
        }
        getInput(name, dir);
    }
}

function getInput(name, dir, isCover) {
    var ps = parsePromptFile(root + '/lib/txt/template.txt');
    if ((name in templates) && !isCover) {
        prompt({
            message: '"' + name + '" 已经存在，是否覆盖？[y/n]',
            'default': 'y',
            name: 'isCover'
        }, function(err, props) {
            if (err) {
                // tmplTips();
                return;
            }
            if (/y/i.test(props.isCover.trim())) {
                getInput(name, dir, true);
            } else {
                log.error('创建项目模板[失败](bold.red)');
            }
        });
        return;
    }
    var obj = templates[name] = {
        name: name,
        directory: dir
    }
    prompt(ps, function(err, props) {
        if (err) {
            return;
        }
        obj.description = props.description;
        obj.withGrunt = /y/i.test(props.withGrunt) ? true : false;
        obj.withCompass = /y/i.test(props.withCompass) ? true : false;
        writeConfig();
        log.log('成功添加模板：' + name);
        log.log('使用命令： fe template ' + name + ' 来查看配置');
    });
}

function parsePromptFile(file) {
    var txt = fs.readFileSync(file, 'utf-8').toString();
    var lines = txt.split(/\n/);
    var prop = {};
    var reg = /^\[\?\]\s?([^\(]+)\(([^\)]+)\)\s*\|\s([\w\d\-_\/]+)/;
    var prompts = lines.map(function(line) {
        if (!line || !/^\[\?\]/.test(line)) {
            log.log('[' + line.trim() + '](green)');
            return;
        }
        var m = line.match(reg);
        if (!m) {
            log.log('[' + line.trim() + '](green)');
            return;
        }
        var prompt = {
            message: m[1].trim(),
            'default': m[2].trim(),
            name: m[3].trim()
        };
        return prompt;
    });
    return prompts.filter(function(p) {
        return p;
    });
}

function tmplHelp() {
    log.log('Usage : fe template [options] [arguments]');
    log.log(' * [fe template tmplName](green)                : 查看模板详细配置');
    log.log(' * [fe template -l](green)                      : 所有模板');
    log.log(' * [fe template --remove tmplName](green)            : 删除某模板');
    log.log(' * [fe template -c tmplName](green)             : 创建模板');
    log.log(' * [fe template -e tmplName name=demo](green)   : 编辑模板');
    log.log(' * [fe template -h](green)                      : 获取帮助');
}

function tmplTips() {
    log.log('[ERROR](bold.red)：命令有误，请使用 "fe template --help" 获取帮助');
}

function writeConfig(json) {
    json = json || cfgJSON;
    if (typeof json === 'object') {
        json = JSON.stringify(json, null, 4);
    }
    gFile.write(config, json);
}

function getValue(a) {
    switch (a) {
        case 'true':
            return true;
        case 'false':
            return false;
    }
    return a;
}