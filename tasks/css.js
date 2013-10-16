/**
 * css合并任务
 * fe css a.css b.css to ab.css [-c压缩]
 */

//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var root = join(__dirname, '../');
// var name = path.basename(__filename, '.js');
//非系统模块
var feTask = require(root + '/lib/feTask');
var grunt = require('grunt');

var Task = function() {};
util.inherits(Task, feTask);
//task依赖模块
var CleanCSS = require('clean-css');
var cssbeautify = require('js-beautify').css;
var options = {
    report: false
};
Task.prototype.help = function(log) {
    log.log('>>> fe css task 帮助');
    log.log('    * [fe css a.css b.css -o ab.css](yellow) 将a和b合并为ab');
    log.log('    * [fe css -b a.css b.css -o ab.css](yellow) 将a和b合并为ab，格式化');
    log.log('    * [fe css -c a.css b.css -o ab.min.css](yellow) 合并成ab并压缩');
    log.log(' [PS](green) 1.会自动解析文件中import的语法并合并');
    log.log('    2.默认会美化，使用-u参数来取消美化');
}
Task.prototype.start = function() {
    var that = this;
    if (this.dist.length === 0) {
        that.error('Source files is empty!');

    } else {
        that.note('Start css task...');
        var gFile = grunt.file;
        var files = [];
        var dist = this.dist.filter(function(filepath) {
            if (gFile.isDir(filepath)) {
                that.note('Recurse "' + filepath + '"...');
                //这个是folder，需要遍历
                gFile.recurse(filepath, function(abspath, rootdir, subdir, filename) {
                    if (/\.css$/.test(filename)) {
                        files.push(abspath);
                    }
                });
                return false;
            } else if (!gFile.exists(filepath)) {
                that.warn('Source file "' + filepath + '" not found.');
                return false;
            } else if (!/\.css$/.test(filepath)) {
                that.warn('Source file "' + filepath + '" not a .css file.');
                return false;
            } else {
                return true;
            }
        });

        dist = dist.concat(files);

        var content = dist.map(function(v) {
            var content = gFile.read(v);
            content = CleanCSS._inlineImports(content, {
                processImport: true,
                root: that.root || process.cwd(),
                relativeTo: path.relative(that.root, path.dirname(v))
            });
            return content;
        }).join('\n');

        if (that.options.c) {
            //压缩

            content = minifyCSS(content, options);
        } else {
            //charset往前走
            content = moveCharset(content);
            if (that.options.beautify || that.options.b) {
                content = cssbeautify(content);
            }
        }

        if (this.dist.length === 1 && this.dest === '') {
            var dist = this.dist[0];
            var dirname = path.dirname(dist);

            var extname = '.css';
            var basename = path.basename(dist, extname);
            var dest = basename + '.min' + extname;
            dest = join(dirname, dest);

            gFile.write(dest, content);
            that.note('File "' + dest + '" created.');
            return;
        }

        if (Array.isArray(that.dest) && that.dest.length > 1) {
            console.log('result:\n', content);
        } else {
            var dest = that.dest;
            if (Array.isArray(that.dest)) {
                dest = that.dest[0];
            }

            gFile.write(dest, content);
            that.note('File "' + dest + '" created.');
        }

    }
}

module.exports = new Task();

function minifyCSS(source, options) {
    try {
        return CleanCSS.process(source, options);
    } catch (e) {
        grunt.log.error(e);
        grunt.fail.warn('css minification failed.');
    }
}

function moveCharset(data) {
    var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
    // get first charset in stylesheet
    var match = data.match(/@charset [^;]+;/);
    var firstCharset = match ? (match[0] + '\n') : null;
    if (!firstCharset) return data;

    // reattach first charset and remove all subsequent
    data = firstCharset + data.replace(new RegExp('@charset [^;]+;(' + lineBreak + ')?', 'g'), '');
    return data;
}
