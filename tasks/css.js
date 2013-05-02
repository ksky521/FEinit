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
var color = require('colors');

var Task = function() {};
util.inherits(Task, feTask);
//task依赖模块
var CleanCSS = require('clean-css');
var options = {
    report: false
};
Task.prototype.help = function(log){
    log.log('>>> fe css task 帮助');
    log.log('    * [fe css a.css b.css to ab.css](yellow) 将a和b合并为ab');
    log.log('    * [fe css -c a.css b.css to ab.min.css](yellow) 合并成ab并压缩');
    log.log(' [PS](green) 本命令会自动解析文件中import的语法并合并');
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
            } else {
                return true;
            }
        });

        dist = dist.concat(files);

        var content = dist.map(function(v) {
            var content = gFile.read(v);
            content = CleanCSS._inlineImports(content, {
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
        }
        gFile.write(that.dest, content);
        that.note('File "' + that.dest + '" created.');
    }
}

module.exports = new Task;

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
    var firstCharset = match ? match[0] : null;
    if (!firstCharset) return data;

    // reattach first charset and remove all subsequent
    data = firstCharset + data.replace(new RegExp('@charset [^;]+;(' + lineBreak + ')?', 'g'), '');
    return data;
}