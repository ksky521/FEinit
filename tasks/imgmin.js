/**
 * smushit图片压缩
 * fe imgmin file1 file2 [-c压缩]
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
var nopt = require('nopt');

var Task = function() {};
util.inherits(Task, feTask);

//task依赖模块
var smushit = require('node-smushit');
var options = {
    report: false
};
Task.prototype.help = function(log) {
    log.log('>>> fe imgmin task 帮助');
    log.log('    * [fe imgmin file1 file2](yellow) 压缩并覆盖');
    log.log('    * [fe imgmin file.jpg -o file.out.jpg](yellow) 将file压缩为file.out');
    log.log('    * [fe imgmin filepath](yellow) 压缩filepath所有图片');
    log.log(' [PS](green) 1.会自动解析文件中import的语法并合并');
    log.log('    2.默认会美化，使用-u参数来取消美化');
}
Task.prototype.start = function() {
    var that = this;
    if (this.dist.length === 0) {
        that.error('Source files is empty!');

    } else {
        that.note('Start smushit task...');
        var gFile = grunt.file;

        var opts = nopt({
            help: Boolean
        }, {
            o: '--output' //输出
        });

        var argv = opts.argv.cooked;
        argv.splice(0, 1);

        var objs = {
            input: [],
            output: [],
            dir: []
        }, t = 'input';

        for (var i = 0, len = argv.length; i < len; i++) {
            var filepath = argv[i];
            if (filepath === '--output') {
                t = 'output';
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
            smushit.smushit(dir, {
                onComplete: function() {
                    that.note('File "' + dir.join(',') + '" created.');
                }
            });
        }

        if (inputs.length === outputs.length) {
            while (inputs.length) {
                var input = inputs.shift(),
                    output = outputs.shift();
                smushit.smushit(input, {
                    output: output,
                    onComplete: function(reports) {
                        that.note('Success saving!');
                    }
                });
            }
        } else {
            smushit.smushit(inputs, {
                onComplete: function() {
                    that.note('Success saving!');
                }
            });
        }

    }
}

module.exports = new Task();