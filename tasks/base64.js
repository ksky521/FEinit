/**
 * 图片base64
 * 支持css文件
 */
//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var win32 = process.platform === 'win32';

var root = join(__dirname, '../');
var name = 'base64';
//非系统模块
var feTask = require(root + '/lib/feTask');
var grunt = require('grunt');
var log = require(join(root, '/lib/feLog'));
var nopt = require('nopt');
var b64img = require(join(root, '/lib/css-b64-images'));

var mediatypes = {
    '.eot': 'application/vnd.ms-fontobject',
    '.gif': 'image/gif',
    '.ico': 'image/vnd.microsoft.icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.otf': 'application/x-font-opentype',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/x-font-ttf',
    '.webp': 'image/webp',
    '.woff': 'application/x-font-woff'
};
var Task = function() {};
util.inherits(Task, feTask);
//help是帮助函数，fe base64 -h 执行该函数
Task.prototype.help = function() {
    log.log('>>> fe base64 task 帮助');
    log.log('    * [fe base64 a.png -o a.txt](yellow) 将图片base64 输出内容到a.txt');
    log.log('    * [fe base64 a.png](yellow) 将图片base64 输出到屏幕');
    log.log('    * [fe base64 path/to/jpg -o a.txt](yellow) 将图片路径输出到a.txt');
    log.log('    * [fe base64 a.css -o a-base.css](yellow) 将a.css中<4K图片替换');
    log.log('    * [fe base64 -s 4M path.png](yellow) 图片受4M限制');
};
var imgExtensions = ['bmp', 'gif', 'jpe', 'jpg', 'jpeg', 'png', 'tif', 'tiff'];
var cssExtensions = ['css'];

//任务启动函数，this.dest是目的文件(夹)，this.dist是要处理的文件(夹)
Task.prototype.start = function() {
    var that = this;
    //*************************下面是您要开发的内容哦***************************************
    if (this.dist.length === 0) {
        //举例：执行grunt的base64任务
        that.note('[start base64 task...](yellow)');
        var child = exec('cd ' + this.root + ' && grunt base64');
        child.stderr.on('data', function(data) {
            that.error(data);
        });
        child.stdout.on('data', function(data) {
            that.note(data);
        });

    } else {
        //执行自己的base64任务
        that.note('[start base64 task...](yellow)');
        var gFile = grunt.file;

        var opts = nopt({
            help: Boolean
        }, {
            e: '--explorer', //图片打开浏览器显示base64
            o: '--output' //输出
        });

        var argv = opts.argv.cooked;
        //破除限制最大4k参数,this.options.size
        that.options.size = dealSize(that.options.size);
        argv.splice(0, 1);
        var objs = {
            input: [],
            output: [],
            dir: []
        }, t = 'input',
            isExplorer = false,
            htmlData = [];

        for (var i = 0, len = argv.length; i < len; i++) {
            var filepath = argv[i];
            if (filepath === '--output') {
                t = 'output';
                continue;
            } else if (filepath === '--explorer') {
                //图片打开浏览器显示base64
                isExplorer = true;
                continue;
            }

            if (t === 'output') {
                objs[t].push(filepath);
                continue;
            }
            if (gFile.isDir(filepath)) {
                objs.dir.push(filepath);

            } else if (gFile.exists(filepath)) {
                objs[t].push(filepath);
            }
        }

        var inputs = objs.input;
        var outputs = objs.output;
        var dir = objs.dir;
        if (inputs.length === 0 && dir.length === 0) {
            that.warn('Source file not found.');
            return false;
        }

        if (dir.length) {
            //认为是图片路径
            dir.forEach(function(v) {
                var dest = join(v, 'base64.txt');

                gFile.recurse(v, function(abspath, rootdir, subdir, filename) {
                    var ext = path.extname(filename);

                    if (ext in mediatypes) {
                        htmlData.push({
                            src: path.normalize(path.relative('A:\\', abspath)),
                            base64: pic2base64(abspath, dest, that.options.size)
                        });
                    }
                });
            });

        }

        if (inputs.length === outputs.length) {
            while (inputs.length) {
                var input = inputs.shift(),
                    output = outputs.shift();
                var ext = path.extname(input);

                if (ext in mediatypes) {
                    //图片
                    htmlData.push({
                        src: path.normalize(path.relative('A:\\', input)),
                        base64: pic2base64(input, output, that.options.size)
                    });

                } else if (ext === '.css') {
                    //css
                    b64img.fromFile(input, path.dirname(input), function(err, css) {
                        if (err) {
                            log.warn(err);
                        } else {
                            fs.writeFile(output, css, function(err) {
                                if (err) {
                                    log.warn(err);
                                    return;
                                }
                                log.log('Success: ' + output);
                            });
                        }

                    }, that.options.size);
                }

            }
        } else {
            inputs.forEach(function(filepath) {
                var ext = path.extname(filepath);

                if (ext in mediatypes) {
                    //图片
                    htmlData.push({
                        src: path.normalize(path.relative('A:\\', filepath)),
                        base64: pic2base64(filepath, '', that.options.size)
                    });

                } else if (ext === '.css') {
                    //css

                    b64img.fromFile(filepath, path.dirname(filepath), function(err, css) {
                        if (err) {
                            log.warn(err);
                        } else {
                            fs.writeFile(filepath, css, function(err) {
                                if (err) {
                                    log.warn(err);
                                    return;
                                }
                                log.log('Success: ' + filepath);
                            });
                        }
                    }, that.options.size);
                }
            });

        }
        if (isExplorer && win32) {
            var template = fs.readFileSync(path.join(root, './template/base64.html')).toString();
            var json = require(path.join(root, 'package.json'));
            var html = grunt.template.process(template, {
                data: {
                    version: json.version,
                    base64Data: htmlData
                }
            });
            var tempPath = path.join(process.env.TEMP, 'fe_base64_' + Date.now() + '.htm');
            fs.writeFile(tempPath, html, function(err) {
                if (err) {
                    log.warn(err);
                    return;
                }
                exec('start ' + tempPath);
            });

        }
        htmlData = null;
    }

};

function pic2base64(filepath, dest, size) {

    dest = dest || join(path.dirname(filepath), 'base64.txt');
    var filename = path.basename(filepath);
    var stat = fs.statSync(filepath);
    if (size !== 0 && stat.size > size) {
        return log.warn('Skip ' + filename + ' Exceed max size');
    }
    var b64 = base64(filepath);
    var content = filename + ': ' + b64 + '\n';

    fs.appendFile(dest, content, function(err) {
        if (err) {
            log.warn(err);
            return;
        }
        log.log('Success: ' + filename);
    });
    return b64;
}

function dealSize(size) {
    if (typeof size === 'number') {

    } else if (typeof size === 'string') {
        var n = parseInt(size, 10);
        size = size.replace(n, '');
        switch (size.toUpperCase()) {
            case 'M':
                size = n * 1024 * 1024;
                break;
            case 'K':
                size = n * 1024;
                break;
            default:
                size = 4096;
        }
    } else {
        size = 4096;
    }
    return size;
}

function base64(filepath) {
    var content = fs.readFileSync(filepath, 'base64');
    var ext = path.extname(filepath);
    return 'data:' + mediatypes[ext] + ';base64,' + content;
}


module.exports = new Task();
