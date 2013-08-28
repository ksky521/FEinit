//系统模块
var fs = require('fs');
var path = require('path');
var join = path.join;
// var evt = new(require('events').EventEmitter)();
var win32 = process.platform === 'win32';

//路径
var root = join(__dirname, '../');
var lib = join(root, 'lib/');
var template = join(root, 'template/');
var cfgTxt = join(lib, './txt');

//非系统模块
var prompt = require(lib + 'prompt').prompt;
var spawn = require(lib + 'spawn');
var grunt = require('grunt');
var feEvent = new(require(lib + '/feEvent'))();
var log = require(lib + 'feLog');
var Queue = require(lib + 'feQueue');
var config = grunt.file.readJSON(root + '/config.json');

//文件
var templateObj = {
    'package': template + 'package.json',
    'Gruntfile': template + 'Gruntfile.js'
};
var buildInTemplateObj;
var diyTemplateObj; //template路径
var isDIYTemplate = false; //是否是自定义模板路径

var _ = module.exports;

_.props = {}; //记录用户输入的配置

_.init = function(route) {
    _.route = route; //执行路径
    return this;
};
/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function(prompts, callback) {

    prompt(prompts, function(err, props) {
        if (err) {}


        if (typeof callback === 'function') {
            callback(props);
        }
    });

    return this;
};
/**
 * 解析txt文件命令
 * @return {[type]} [description]
 */
_.parsePromptFile = function(file) {
    var txt = fs.readFileSync(file, 'utf-8').toString();
    var lines = txt.split(/\n/);
    var prop = {};
    var reg = /^\[\?\]\s?([^\(]+)\(([^\)]+)\)\s*\|\s([\w\d\-_\/]+)/;
    var prompts = lines.map(function(line) {
        line = line.trim();
        if (!line || !/^\[\?\]/.test(line)) {
            log.log('[' + line + '](green)');
            return;
        }
        var m = line.match(reg);
        if (!m) {
            log.log('[' + line + '](green)');
            return;
        }
        if (m[3].trim() === 'Sass' && isDIYTemplate && !diyTemplateObj.withCompass) {
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
};

_.end = function() {
    log.log('[Done!](bold.green)');
};

_.copyFromTemplate = function() {
    if (diyTemplateObj.directory) {
        _.copyDir(diyTemplateObj.directory, _.route);
    }
    if (diyTemplateObj.withGrunt) {
        spawn.command('cd ' + _.route + ' && npm install', [], function() {
            _.queue.fire();
        });
        return;
    }
    _.queue.fire();
};
_.copyBuildInTemplate = function(distDir, destDir) {
    distDir = distDir || join(root, './template/', buildInTemplateObj.directory, '/');
    destDir = destDir || _.route;
    var gFile = grunt.file;
    if (gFile.isDir(distDir)) {
        log.log('[Copying files...](green)');

        //组装模版数据
        var tData = {};
        if (_.props.Gruntfile) {

            for (var i in _.props.Gruntfile) {
                tData[i] = _.props.Gruntfile[i];
            }
        }
        if (_.props.project) {
            for (var i in _.props.project) {
                tData[i] = _.props.project[i];
            }
        }
        tData.sassCoreBase = unixifyPath(join(root, './template/_sassCore/base'));

        recurse(distDir, function(abspath, rootdir, subdir, filename, destdir, judge) {

            if (filename) {
                var destfile = join(destdir, filename);

                if (filename.indexOf('_') === 0) {
                    //是模版，需要特殊编译
                    var destname = filename.slice(1);

                    var content = _.template(abspath, tData);
                    destfile = join(destdir, destname);
                    log.note('Success: ' + destname + ' Created!');

                    gFile.write(destfile, content, {
                        encoding: 'utf-8'
                    });
                } else {
                    gFile.copy(abspath, destfile);
                }
            }

        }, '', destDir, function(filename) {
            if (!buildInTemplateObj.withCompass || (buildInTemplateObj.withCompass && tData.Sass.toUpperCase() !== 'Y')) {
                switch (filename) {
                    case 'sass':
                    case 'config.rb':
                    case 'scss':
                        return false;
                }
            }
            return true;
        });

    } else {
        log.error('路径 "' + distDir + '" 不存在！');
        _.queue.fire();
        return;
    }

    spawn.command('cd ' + destDir + ' && npm install', [], function() {
        _.queue.fire();
    });
};
/**
 * 复制文件
 * @return {[type]} [description]
 */
_.copy = function() {
    if (isDIYTemplate) {
        _.copyFromTemplate();
    } else {
        _.copyBuildInTemplate();
    }
}
_.copyDir = function(distDir, destDir) {
    var file = grunt.file;
    if (file.isDir(distDir)) {
        log.log('[Copying files...](green)');

        file.recurse(distDir, function(abspath, rootdir, subdir, filename) {
            var dest = join(destDir, (subdir ? subdir : ''));
            if (!file.isDir(dest)) {
                file.mkdir(dest);
            }
            if (filename) {
                var destfile = join(dest, filename);
                file.copy(abspath, destfile);
            } else {}

            log.ln('[.](green)');
        });
    } else {
        log.error('路径 "' + distDir + '" 不存在！');
    }
}
/**
 * 模板处理
 * @param  {Object} filepath
 * @param  {[type]} data [description]
 * @return {[type]}     [description]
 */
_.template = function(filepath, data) {
    var txt = fs.readFileSync(filepath, 'utf-8').toString();
    var json = grunt.template.process(txt, {
        data: data
    });
    return json;
}

/**
 * 启动
 * @return {[type]} [description]
 */
_.start = function(templateName) {
    log.logo();
    if (templateName) {
        if (config.templates && config.templates[templateName]) {
            isDIYTemplate = true;
            diyTemplateObj = config.templates[templateName];

        } else if (config.build_in_templates && config.build_in_templates[templateName]) {
            isDIYTemplate = false;
            buildInTemplateObj = config.build_in_templates[templateName];
        } else {
            log.warn(templateName + ' 不存在！\n 使用fe template 显示支持的模版');
            return;
        }

    } else {
        log.warn('模版名不能为空');
        return;
    }
    _.doit();
}
_.queue = new Queue('FEinit');
_.doit = function() {
    _.queue.push(feEvent.emit, ['end'], feEvent)
        .push(feEvent.emit, ['copy'], feEvent);
    var obj;
    if (isDIYTemplate) {
        obj = diyTemplateObj;
    } else {
        obj = buildInTemplateObj;
    }
    if (obj.withCompass) {
        _.queue.push(feEvent.emit, ['default project'], feEvent)
    }
    if (obj.withGrunt) {
        _.queue.push(feEvent.emit, ['gruntfile'], feEvent);
    }

    _.queue.fire();
}
//添加evt队列
feEvent.on('gruntfile', function() {
    var p = _.parsePromptFile(join(cfgTxt, './Gruntfile.txt'));

    _.prompt(p, function(props) {
        _.props.Gruntfile = props;
        //gruntfire.js
        // var gruntfile = _.template(props, 'Gruntfile');
        // _.Gruntfile(gruntfile);
        // //package.json
        // var packageJSON = _.template(props, 'package');
        // _.package(packageJSON);
        //go on
        _.queue.fire();
    });
});
feEvent.on('default project', function() {
    var p = _.parsePromptFile(join(cfgTxt, './project.txt'));
    _.prompt(p, function(props) {
        props.Sass = props.Sass || 'y';
        _.props.project = props;
        //go on
        _.queue.fire();
    });
});

feEvent.on('copy', function() {
    _.copy();
});
feEvent.on('end', function() {
    _.end();
});



var unixifyPath = function(filepath) {
    if (win32) {
        return filepath.replace(/\\/g, '/');
    } else {
        return filepath;
    }
};

function recurse(rootdir, callback, subdir, destDir, judgeFunction) {
    var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
    judgeFunction = typeof judgeFunction === 'function' ? judgeFunction : function() {
        return true;
    };
    fs.readdirSync(abspath).forEach(function(filename) {
        var filepath = path.join(abspath, filename);
        if (fs.statSync(filepath).isDirectory() && judgeFunction(filename)) {
            grunt.file.mkdir(path.join(destDir, filename));
            recurse(rootdir, callback, unixifyPath(path.join(subdir, filename)), unixifyPath(path.join(destDir, filename)), judgeFunction);
        } else {
            judgeFunction(filename) && callback(unixifyPath(filepath), rootdir, subdir, filename, destDir, judgeFunction);
        }
    });

}