//系统模块
var fs = require('fs');
var path = require('path');
var join = path.join;
// var evt = new(require('events').EventEmitter)();

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
var diyTemplateObj; //template路径
var isDIYTemplate = false; //是否是自定义模板路径

var _ = module.exports;

_.props = {};
_.init = function(route) {
    _.route = route; //执行路径
    return this;
}
/**
 * 输入内容
 * @return {[type]} [description]
 */
_.prompt = function(v, callback) {

    var prompts = this.prompts;
    prompt(prompts[v], function(err, props) {
        if (err) {}
        _.props[v] = props;
        _.template(props, v);
        if (typeof callback === 'function') {
            callback()
        }
    });

    return this;
}
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
            default: m[2].trim(),
            name: m[3].trim()
        };
        return prompt;
    });
    return prompts.filter(function(p) {
        return p;
    });
}

_.end = function() {
    log.log('[Done!](bold.green)');
}
/**
 * 复制文件
 * @return {[type]} [description]
 */
_.copy = function() {
    var file = grunt.file;
    var props = _.props.Gruntfile;
    if ((!isDIYTemplate && config.download) || (isDIYTemplate && diyTemplateObj.withGrunt)) {
        log.note('Download npm packages!'.green);
        if (isDIYTemplate) {
            _.queue.push(function(){
                _.copyDir(diyTemplateObj.dir, _.route);
                _.queue.fire();
            });
        }
        spawn.command('cd ' + _.route + ' && npm install', [], function() {
            _.queue.fire();
        });
        return;
    } else if (isDIYTemplate) {
        _.copyDir(diyTemplateObj.dir, _.route);
    } else {
        var moduleDir = join(root, './init/node_modules');
        _.copyDir(moduleDir, _.route + '/node_modules/');
        //开始复制config的文件
        var files = config.files;
        var keys = Object.keys(props);
        var initDir = join(root, './init/');
        for (var i in files) {
            if (keys.indexOf(i) !== -1) {
                if (/y/i.test(props[i])) {
                    log.note('Add ' + props[i] + ' files..');
                    //如果是需要
                    files[i].forEach(function(v) {
                        var dir = path.dirname(v);
                        var basename = path.basename(v);
                        var dest;
                        if (dir) {
                            dir = join(_.route, dir);
                            if (!file.isDir(dir)) {
                                file.mkdir(dir);
                            }
                            dest = join(dir, basename);
                        } else {
                            dest = join(_.route, dir, basename);
                        }
                        file.copy(initDir + '/' + v, dest);
                    });
                }
            }
        }

    }
    _.queue.fire();

}
_.copyDir = function(distDir, destDir) {
    var file = grunt.file;
    if (!file.isDir(distDir)) {
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
        })
    } else {
        log.error('路径 "' + moduleDir + '" 不存在！');
    }
}
/**
 * 模板处理
 * @param  {Object} obj
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
_.template = function(obj, str) {
    var txt = fs.readFileSync(templateObj[str], 'utf-8').toString();
    obj.Sass = obj.Sass || 'n';
    var json = grunt.template.process(txt, {
        data: obj
    });
    _[str](json);

}
/**
 * 处理Gruntfile.js程序
 * @param {[type]} json [description]
 */
_.Gruntfile = function(json) {
    grunt.file.write(join(_.route, './Gruntfile.js'), json, {
        encoding: 'utf-8'
    });
    log.note('Success: Gruntfile.js Create!');
    _.queue.fire();
}
/**
 * 创建dir程序
 * @return {[type]} [description]
 */
_.dir = function() {
    var file = grunt.file;
    var dirs = config.dirs;
    log.note('Create dirs...');
    dirs.forEach(function(v) {
        var dest = join(_.route, './' + v);
        if (!file.isDir(dest)) {
            log.note('* Create folder:' + dest);
            file.mkdir(dest);
        }
    });
    _.queue.fire();
}
/**
 * 创建package.json程序
 * @param  {[type]} json [description]
 * @return {[type]}      [description]
 */
_.package = function(json) {
    json = JSON.parse(json);
    //读取config默认的依赖list
    json.devDependencies = config.dependencies;
    json = JSON.stringify(json, null, 4);
    grunt.file.write(join(_.route, './package.json'), json, {
        encoding: 'utf-8'
    });

    log.note('Success: package.json Create!');
    _.queue.fire();

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

        } else {
            prompt({
                message: '> "' + templateName + '" 不存在, 是否使用默认模板 ?[y/n]',
                'default': 'y',
                name: 'isDefaultTemplate'
            }, function(err, props) {
                props = props || {};
                if (err) {}
                if (/y/i.test(props.isDefaultTemplate)) {
                    _.doit();
                } else {
                    log.warn('啥事也没干!');
                }
            });
            return;
        }

    }
    _.doit();
}
_.queue = new Queue('FEinit');
_.doit = function() {
    _.queue.push(feEvent.emit, ['end'], feEvent)
        .push(feEvent.emit, ['copy'], feEvent);
    if (isDIYTemplate) {

        if (diyTemplateObj.withGrunt) {
            _.queue.push(feEvent.emit, ['gruntfile'], feEvent)
                .push(feEvent.emit, ['package'], feEvent)
        }
    } else {

        _.queue.push(feEvent.emit, ['dir'], feEvent)
            .push(feEvent.emit, ['gruntfile'], feEvent)
            .push(feEvent.emit, ['package'], feEvent)
    }

    _.queue.fire();
}
//添加evt队列
feEvent.on('gruntfile', function() {
    var p = (_.prompts = {});
    p.Gruntfile = _.parsePromptFile(join(cfgTxt, './Gruntfile.txt'));
    _.prompt('Gruntfile');
});
feEvent.on('package', function() {
    var p = (_.prompts = {});
    p.package = _.parsePromptFile(join(cfgTxt, './package.txt'));
    _.prompt('package');
});
feEvent.on('dir', function() {
    _.dir();
});
feEvent.on('copy', function() {
    _.copy();
});
feEvent.on('end', function() {
    _.end();
});